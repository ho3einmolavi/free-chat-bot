# Private Chatroom

A real-time private messaging application built with Node.js, Express, Socket.io, and React.

---

## How It Works

Private Chatroom is a secure, real-time messaging app that lets users chat one-on-one. Messages are delivered instantly via WebSockets and stored in memory for the session.

### Key Features

- **Real-time messaging** — Messages appear instantly using Socket.io
- **User authentication** — Register/login with username and password
- **Online status** — See when your contacts are online or offline
- **Typing indicators** — Know when someone is typing a response
- **Image sharing** — Send images up to 5MB
- **Message history** — Conversations are grouped by date
- **Mobile responsive** — Works seamlessly on desktop and mobile

---

## User Journey

### 1. Registration / Login

When you first open the app, you'll see the login screen. New users can create an account by clicking "Create one" and entering a username and password. Existing users simply sign in.

### 2. Chat Dashboard

After logging in, you land on the main chat dashboard:
- **Left sidebar** — Shows your chat partners and their online/offline status
- **Main area** — Displays the selected conversation (or a prompt to start chatting)

### 3. Starting a New Chat

Click the **"+ New Chat"** button in the sidebar to start a conversation:
- Enter the username of the person you want to chat with
- The chat window opens and loads any previous message history

### 4. Sending Messages

- Type your message in the input field at the bottom
- Press **Enter** to send (or **Shift+Enter** for a new line)
- Click the image icon to share a photo (max 5MB)
- Messages are limited to 1000 characters

### 5. Real-time Features

- **Typing indicator** — When the other person is typing, you'll see animated dots
- **Online status** — A green dot indicates the user is online
- **Instant delivery** — Messages appear immediately on both sides

### 6. Logout

Click the logout icon in the sidebar header to sign out securely.

---

## Prerequisites

- Node.js 18+ and npm 9+ (for local development)
- Docker and Docker Compose (for containerized deployment)

---

## Local Development

### 1. Clone the repository

```bash
git clone <repository-url>
cd free-chat-bot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start development servers

```bash
npm run dev
```

- **Server:** `http://localhost:3001`
- **Client:** `http://localhost:5173`

---

## Docker Deployment

Run these commands on the machine where you'll build the Docker images.

### 1. Install dependencies (bypass npm workspaces)

```bash
mv package.json package.json.bak
cd server && npm install && cd ..
cd client && npm install && cd ..
mv package.json.bak package.json
```

### 2. Build client

```bash
cd client && npm run build && cd ..
```

### 3. Build and run Docker

```bash
docker compose up -d --build
```

### Access the application

Open `http://localhost:3000` in your browser.

### Stop containers

```bash
docker compose down
```
