import { v4 as uuidv4 } from 'uuid';

// In-memory session storage
const sessions = new Map();

// Session duration: 12 hours
const SESSION_DURATION = 12 * 60 * 60 * 1000;

// Create a new session for a user
export function createSession(username) {
  const token = uuidv4();
  const expiresAt = Date.now() + SESSION_DURATION;
  
  sessions.set(token, {
    username,
    expiresAt,
    createdAt: Date.now()
  });
  
  return token;
}

// Validate a session token
export function validateSession(token) {
  if (!token) return null;
  
  const session = sessions.get(token);
  
  if (!session) return null;
  
  // Check if session has expired
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  
  return session;
}

// Get username from token
export function getUsernameFromToken(token) {
  const session = validateSession(token);
  return session ? session.username : null;
}

// Invalidate a session
export function invalidateSession(token) {
  return sessions.delete(token);
}

// Invalidate all sessions for a user
export function invalidateUserSessions(username) {
  for (const [token, session] of sessions.entries()) {
    if (session.username === username) {
      sessions.delete(token);
    }
  }
}

// Clear all sessions
export function clearAllSessions() {
  sessions.clear();
  console.log(`[${new Date().toISOString()}] All sessions cleared`);
}

// Get session count (for debugging)
export function getSessionCount() {
  return sessions.size;
}

// Clean up expired sessions
export function cleanupExpiredSessions() {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [token, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(token);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`[${new Date().toISOString()}] Cleaned up ${cleaned} expired sessions`);
  }
}

export { sessions };

