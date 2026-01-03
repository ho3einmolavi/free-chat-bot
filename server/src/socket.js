import { getUsernameFromToken } from './auth.js';
import { userExists } from './users.js';
import {
  storeMessage,
  storeImageMessage,
  getMessages,
  getRoomId,
  setUserOnline,
  removeUserSocket,
  getOnlineUsers,
  getChatPartners,
  getUserSockets,
  isUserOnline,
  sanitizeText
} from './storage.js';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB in base64 is roughly 6.6MB string

// Rate limiting: track message counts per user
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 10 * 1000; // 10 seconds
const RATE_LIMIT_MAX = 10; // 10 messages

function checkRateLimit(username) {
  const now = Date.now();
  const userLimit = rateLimits.get(username);
  
  if (!userLimit || now - userLimit.windowStart > RATE_LIMIT_WINDOW) {
    rateLimits.set(username, { windowStart: now, count: 1 });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    let authenticatedUser = null;
    let currentChatPartner = null;
    
    console.log(`[Socket] New connection: ${socket.id}`);
    
    // Authentication
    socket.on('authenticate', async (token) => {
      const username = getUsernameFromToken(token);
      
      if (!username) {
        socket.emit('authenticated', { success: false, error: 'Invalid or expired session' });
        return;
      }
      
      authenticatedUser = username;
      setUserOnline(username, socket.id);
      
      // Join personal room for direct messages
      socket.join(`user:${username}`);
      
      socket.emit('authenticated', { success: true, username });
      
      // Notify others that user is online
      socket.broadcast.emit('user-online', { username });
      
      console.log(`[Socket] User authenticated: ${username}`);
    });
    
    // Get chat partners (users we've chatted with before, with their online status)
    socket.on('get-online-users', () => {
      if (!authenticatedUser) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }
      
      const chatPartners = getChatPartners(authenticatedUser);
      const users = chatPartners.map(username => ({
        username,
        isOnline: isUserOnline(username)
      }));
      socket.emit('online-users', { users });
    });
    
    // Start a chat with another user
    socket.on('start-chat', async ({ username: targetUsername }) => {
      if (!authenticatedUser) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }
      
      const targetLower = targetUsername?.toLowerCase()?.trim();
      
      if (!targetLower) {
        socket.emit('error', { message: 'Username is required' });
        return;
      }
      
      if (targetLower === authenticatedUser) {
        socket.emit('error', { message: 'Cannot chat with yourself' });
        return;
      }
      
      // Check if target user exists
      const exists = await userExists(targetLower);
      if (!exists) {
        socket.emit('error', { message: 'User not found' });
        return;
      }
      
      currentChatPartner = targetLower;
      const roomId = getRoomId(authenticatedUser, targetLower);
      
      // Join the chat room
      socket.join(`chat:${roomId}`);
      
      // Get message history
      const history = getMessages(authenticatedUser, targetLower);
      
      socket.emit('chat-started', {
        success: true,
        partner: targetLower,
        roomId,
        messages: history,
        isOnline: isUserOnline(targetLower)
      });
      
      console.log(`[Socket] Chat started: ${authenticatedUser} -> ${targetLower}`);
    });
    
    // Send a message
    socket.on('send-message', async ({ to, text }) => {
      if (!authenticatedUser) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }
      
      const targetUsername = to?.toLowerCase()?.trim();
      const messageText = text?.trim();
      
      if (!targetUsername || !messageText) {
        socket.emit('error', { message: 'Recipient and message are required' });
        return;
      }
      
      if (messageText.length > 1000) {
        socket.emit('error', { message: 'Message too long (max 1000 characters)' });
        return;
      }
      
      // Rate limit check
      if (!checkRateLimit(authenticatedUser)) {
        socket.emit('error', { message: 'Too many messages. Please wait a moment.' });
        return;
      }
      
      // Check if target user exists
      const exists = await userExists(targetUsername);
      if (!exists) {
        socket.emit('error', { message: 'User not found' });
        return;
      }
      
      const roomId = getRoomId(authenticatedUser, targetUsername);
      
      // Check if this is a new conversation (first message)
      const existingMessages = getMessages(authenticatedUser, targetUsername);
      const isNewConversation = existingMessages.length === 0;
      
      // Store the message
      const message = storeMessage(authenticatedUser, targetUsername, messageText);
      
      // Send to all sockets in the chat room
      io.to(`chat:${roomId}`).emit('new-message', { message });
      
      // Also send to recipient's personal room if they're not in the chat room
      const recipientSockets = getUserSockets(targetUsername);
      recipientSockets.forEach(socketId => {
        io.to(socketId).emit('new-message', { message, roomId });
      });
      
      // If this is a new conversation, update both users' chat partner lists
      if (isNewConversation) {
        // Update sender's list
        const senderPartners = getChatPartners(authenticatedUser);
        const senderUsers = senderPartners.map(username => ({
          username,
          isOnline: isUserOnline(username)
        }));
        io.to(`user:${authenticatedUser}`).emit('online-users', { users: senderUsers });
        
        // Update recipient's list
        const recipientPartners = getChatPartners(targetUsername);
        const recipientUsers = recipientPartners.map(username => ({
          username,
          isOnline: isUserOnline(username)
        }));
        io.to(`user:${targetUsername}`).emit('online-users', { users: recipientUsers });
      }
      
      console.log(`[Socket] Message sent: ${authenticatedUser} -> ${targetUsername}`);
    });
    
    // Send an image
    socket.on('send-image', async ({ to, imageData, mimeType }) => {
      if (!authenticatedUser) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }
      
      const targetUsername = to?.toLowerCase()?.trim();
      
      if (!targetUsername || !imageData) {
        socket.emit('error', { message: 'Recipient and image are required' });
        return;
      }
      
      // Validate image data
      if (!imageData.startsWith('data:image/')) {
        socket.emit('error', { message: 'Invalid image data' });
        return;
      }
      
      // Check size (base64 string length)
      if (imageData.length > MAX_IMAGE_SIZE * 1.4) {
        socket.emit('error', { message: 'Image too large. Maximum size is 5MB' });
        return;
      }
      
      // Rate limit check
      if (!checkRateLimit(authenticatedUser)) {
        socket.emit('error', { message: 'Too many messages. Please wait a moment.' });
        return;
      }
      
      // Check if target user exists
      const exists = await userExists(targetUsername);
      if (!exists) {
        socket.emit('error', { message: 'User not found' });
        return;
      }
      
      const roomId = getRoomId(authenticatedUser, targetUsername);
      
      // Check if this is a new conversation
      const existingMessages = getMessages(authenticatedUser, targetUsername);
      const isNewConversation = existingMessages.length === 0;
      
      // Store the image message
      const message = storeImageMessage(authenticatedUser, targetUsername, imageData, mimeType);
      
      // Send to all sockets in the chat room
      io.to(`chat:${roomId}`).emit('new-message', { message });
      
      // Also send to recipient's personal room
      const recipientSockets = getUserSockets(targetUsername);
      recipientSockets.forEach(socketId => {
        io.to(socketId).emit('new-message', { message, roomId });
      });
      
      // If this is a new conversation, update both users' chat partner lists
      if (isNewConversation) {
        const senderPartners = getChatPartners(authenticatedUser);
        const senderUsers = senderPartners.map(username => ({
          username,
          isOnline: isUserOnline(username)
        }));
        io.to(`user:${authenticatedUser}`).emit('online-users', { users: senderUsers });
        
        const recipientPartners = getChatPartners(targetUsername);
        const recipientUsers = recipientPartners.map(username => ({
          username,
          isOnline: isUserOnline(username)
        }));
        io.to(`user:${targetUsername}`).emit('online-users', { users: recipientUsers });
      }
      
      console.log(`[Socket] Image sent: ${authenticatedUser} -> ${targetUsername}`);
    });
    
    // Typing indicator
    socket.on('typing', ({ to, isTyping }) => {
      if (!authenticatedUser) return;
      
      const targetUsername = to?.toLowerCase()?.trim();
      if (!targetUsername) return;
      
      const roomId = getRoomId(authenticatedUser, targetUsername);
      
      socket.to(`chat:${roomId}`).emit('user-typing', {
        username: authenticatedUser,
        isTyping
      });
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      if (authenticatedUser) {
        const { isFullyOffline } = removeUserSocket(socket.id);
        
        if (isFullyOffline) {
          socket.broadcast.emit('user-offline', { username: authenticatedUser });
          console.log(`[Socket] User offline: ${authenticatedUser}`);
        }
      }
      
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });
}

