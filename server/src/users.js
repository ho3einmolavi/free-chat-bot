import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.join(__dirname, '../data/users.json');

const SALT_ROUNDS = 10;

// Validate username: alphanumeric, 3-20 characters
export function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Username is required' };
  }
  
  const trimmed = username.trim();
  
  if (trimmed.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  
  if (trimmed.length > 20) {
    return { valid: false, error: 'Username must be at most 20 characters' };
  }
  
  if (!/^[a-zA-Z0-9]+$/.test(trimmed)) {
    return { valid: false, error: 'Username must be alphanumeric only' };
  }
  
  return { valid: true, username: trimmed.toLowerCase() };
}

// Validate password: at least 4 characters
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }
  
  if (password.length < 4) {
    return { valid: false, error: 'Password must be at least 4 characters' };
  }
  
  if (password.length > 100) {
    return { valid: false, error: 'Password is too long' };
  }
  
  return { valid: true };
}

// Load users from file
async function loadUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    
    // Handle migration from old format (array of strings) to new format (object with passwords)
    if (Array.isArray(parsed.users)) {
      return { users: {} };
    }
    
    return parsed;
  } catch (error) {
    return { users: {} };
  }
}

// Save users to file
async function saveUsers(data) {
  await fs.writeFile(USERS_FILE, JSON.stringify(data, null, 2));
}

// Check if username exists
export async function userExists(username) {
  const data = await loadUsers();
  return username.toLowerCase() in data.users;
}

// Get all usernames
export async function getAllUsers() {
  const data = await loadUsers();
  return Object.keys(data.users);
}

// Register a new user with password
export async function registerUser(username, password) {
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.valid) {
    return { success: false, error: usernameValidation.error };
  }
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return { success: false, error: passwordValidation.error };
  }
  
  const data = await loadUsers();
  const lowerUsername = usernameValidation.username;
  
  if (lowerUsername in data.users) {
    return { success: false, error: 'Username already exists' };
  }
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  
  data.users[lowerUsername] = {
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };
  
  await saveUsers(data);
  
  return { success: true, username: lowerUsername };
}

// Login user with password
export async function loginUser(username, password) {
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.valid) {
    return { success: false, error: usernameValidation.error };
  }
  
  if (!password) {
    return { success: false, error: 'Password is required' };
  }
  
  const data = await loadUsers();
  const lowerUsername = usernameValidation.username;
  
  const user = data.users[lowerUsername];
  
  if (!user) {
    return { success: false, error: 'Invalid username or password' };
  }
  
  // Compare password
  const isValid = await bcrypt.compare(password, user.password);
  
  if (!isValid) {
    return { success: false, error: 'Invalid username or password' };
  }
  
  return { success: true, username: lowerUsername };
}
