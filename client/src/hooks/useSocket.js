import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || window.location.origin;

export function useSocket(token) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [error, setError] = useState(null);
  
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (!token) return;

    const newSocket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      setConnected(true);
      setError(null);
      // Authenticate immediately after connecting
      newSocket.emit('authenticate', token);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      setAuthenticated(false);
    });

    newSocket.on('authenticated', (data) => {
      if (data.success) {
        setAuthenticated(true);
        newSocket.emit('get-online-users');
      } else {
        setError(data.error);
        setAuthenticated(false);
      }
    });

    newSocket.on('online-users', (data) => {
      setOnlineUsers(data.users || []);
    });

    newSocket.on('user-online', ({ username }) => {
      setOnlineUsers(prev => 
        prev.map(u => u.username === username ? { ...u, isOnline: true } : u)
      );
    });

    newSocket.on('user-offline', ({ username }) => {
      setOnlineUsers(prev => 
        prev.map(u => u.username === username ? { ...u, isOnline: false } : u)
      );
    });

    newSocket.on('chat-started', (data) => {
      if (data.success) {
        setCurrentChat({
          partner: data.partner,
          roomId: data.roomId,
          isOnline: data.isOnline
        });
        setMessages(data.messages || []);
      } else {
        setError(data.error);
      }
    });

    newSocket.on('new-message', ({ message }) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
    });

    newSocket.on('user-typing', ({ username, isTyping }) => {
      if (isTyping) {
        setTypingUser(username);
        // Clear typing indicator after 3 seconds
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUser(null);
        }, 3000);
      } else {
        setTypingUser(null);
      }
    });

    newSocket.on('error', ({ message }) => {
      setError(message);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    });

    newSocket.on('session-expired', () => {
      setAuthenticated(false);
      setError('Session expired. Please login again.');
    });

    setSocket(newSocket);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      newSocket.close();
    };
  }, [token]);

  // Start a chat with a user
  const startChat = useCallback((username) => {
    if (socket && authenticated) {
      setMessages([]);
      setTypingUser(null);
      socket.emit('start-chat', { username });
    }
  }, [socket, authenticated]);

  // Send a message
  const sendMessage = useCallback((text) => {
    if (socket && authenticated && currentChat) {
      socket.emit('send-message', { to: currentChat.partner, text });
    }
  }, [socket, authenticated, currentChat]);

  // Send typing indicator
  const sendTyping = useCallback((isTyping) => {
    if (socket && authenticated && currentChat) {
      socket.emit('typing', { to: currentChat.partner, isTyping });
    }
  }, [socket, authenticated, currentChat]);

  // Close current chat
  const closeChat = useCallback(() => {
    setCurrentChat(null);
    setMessages([]);
    setTypingUser(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    socket,
    connected,
    authenticated,
    onlineUsers,
    currentChat,
    messages,
    typingUser,
    error,
    startChat,
    sendMessage,
    sendTyping,
    closeChat,
    clearError
  };
}

