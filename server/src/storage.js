// In-memory message storage
const messages = new Map();

// Online users: Map<username, Set<socketId>>
const onlineUsers = new Map();

// Socket to user mapping
const socketToUser = new Map();

// Generate room ID from two usernames (sorted for consistency)
export function getRoomId(user1, user2) {
  return [user1, user2].sort().join('_');
}

// Store a message
export function storeMessage(from, to, text) {
  const roomId = getRoomId(from, to);
  const message = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    from,
    to,
    text: sanitizeText(text),
    timestamp: new Date().toISOString()
  };
  
  if (!messages.has(roomId)) {
    messages.set(roomId, []);
  }
  
  messages.get(roomId).push(message);
  
  return message;
}

// Get messages for a conversation (last 50)
export function getMessages(user1, user2, limit = 50) {
  const roomId = getRoomId(user1, user2);
  const roomMessages = messages.get(roomId) || [];
  
  return roomMessages.slice(-limit);
}

// Clear all messages
export function clearAllMessages() {
  messages.clear();
  console.log(`[${new Date().toISOString()}] All messages cleared`);
}

// Sanitize text to prevent XSS
export function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .slice(0, 1000); // Max 1000 characters
}

// Add user as online
export function setUserOnline(username, socketId) {
  if (!onlineUsers.has(username)) {
    onlineUsers.set(username, new Set());
  }
  onlineUsers.get(username).add(socketId);
  socketToUser.set(socketId, username);
}

// Remove user socket
export function removeUserSocket(socketId) {
  const username = socketToUser.get(socketId);
  
  if (username && onlineUsers.has(username)) {
    onlineUsers.get(username).delete(socketId);
    
    // If no more sockets, user is fully offline
    if (onlineUsers.get(username).size === 0) {
      onlineUsers.delete(username);
      socketToUser.delete(socketId);
      return { username, isFullyOffline: true };
    }
  }
  
  socketToUser.delete(socketId);
  return { username, isFullyOffline: false };
}

// Check if user is online
export function isUserOnline(username) {
  return onlineUsers.has(username) && onlineUsers.get(username).size > 0;
}

// Get all online usernames
export function getOnlineUsers() {
  return Array.from(onlineUsers.keys());
}

// Get users that a specific user has chatted with
export function getChatPartners(username) {
  const partners = new Set();
  
  for (const roomId of messages.keys()) {
    const [user1, user2] = roomId.split('_');
    if (user1 === username) {
      partners.add(user2);
    } else if (user2 === username) {
      partners.add(user1);
    }
  }
  
  return Array.from(partners);
}

// Get username by socket ID
export function getUserBySocket(socketId) {
  return socketToUser.get(socketId);
}

// Get all socket IDs for a user
export function getUserSockets(username) {
  return onlineUsers.get(username) || new Set();
}

export { messages, onlineUsers, socketToUser };

