import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from 'dotenv';
import { registerUser, loginUser, userExists, validateUsername } from './src/users.js';
import { createSession, invalidateSession, validateSession, clearAllSessions, cleanupExpiredSessions } from './src/auth.js';
import { clearAllMessages } from './src/storage.js';
import { setupSocketHandlers } from './src/socket.js';

// Load environment variables
config();

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const app = express();
const server = createServer(app);

// CORS configuration
const corsOptions = {
  origin: CLIENT_URL,
  methods: ['GET', 'POST'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.io setup
const io = new Server(server, {
  cors: corsOptions
});

// Setup socket handlers
setupSocketHandlers(io);

// ==================== REST API Routes ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await registerUser(username, password);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    const token = createSession(result.username);
    
    res.json({
      token,
      username: result.username
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await loginUser(username, password);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    const token = createSession(result.username);
    
    res.json({
      token,
      username: result.username
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token) {
    invalidateSession(token);
  }
  
  res.json({ success: true });
});

// Validate session
app.get('/api/auth/validate', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ valid: false });
  }
  
  const session = validateSession(token);
  
  if (!session) {
    return res.status(401).json({ valid: false });
  }
  
  res.json({
    valid: true,
    username: session.username
  });
});

// Check if username exists
app.get('/api/users/check/:username', async (req, res) => {
  const { username } = req.params;
  
  const validation = validateUsername(username);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }
  
  const exists = await userExists(validation.username);
  
  res.json({ exists, username: validation.username });
});

// ==================== Memory Cleanup ====================

// Clear all data every 12 hours
const TWELVE_HOURS = 12 * 60 * 60 * 1000;

setInterval(() => {
  console.log(`[Cleanup] Running scheduled cleanup...`);
  clearAllMessages();
  clearAllSessions();
  
  // Disconnect all sockets to force re-authentication
  io.emit('session-expired', { message: 'Session expired. Please login again.' });
  io.disconnectSockets();
}, TWELVE_HOURS);

// Clean up expired sessions every hour
setInterval(() => {
  cleanupExpiredSessions();
}, 60 * 60 * 1000);

// ==================== Start Server ====================

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║     Private Chatroom Server Started        ║
╠════════════════════════════════════════════╣
║  🌐 Server: http://localhost:${PORT}          ║
║  🔌 WebSocket: ws://localhost:${PORT}         ║
║  💻 Client: ${CLIENT_URL}        ║
╚════════════════════════════════════════════╝
  `);
});
