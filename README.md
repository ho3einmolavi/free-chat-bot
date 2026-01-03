# Private Chatroom

A real-time private messaging application built with Node.js, Express, Socket.io, and React.

## Features

- 🔐 Username-only authentication (no passwords)
- 💬 Private 1-on-1 messaging
- ⚡ Real-time communication via WebSocket
- 👥 Online users list with live status updates
- ⌨️ Typing indicators
- 🕐 Auto-clearing messages every 12 hours
- 📱 Responsive design

## Tech Stack

- **Backend:** Node.js + Express + Socket.io
- **Frontend:** React (Vite) + Socket.io-client
- **Styling:** Tailwind CSS
- **Storage:** In-memory (messages) + JSON file (users)

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install all dependencies
npm install

# Start both server and client in development mode
npm run dev
```

The server will run on `http://localhost:3001` and the client on `http://localhost:5173`.

### Production Build

```bash
# Build the client
npm run build

# Start the server
npm start
```

## Project Structure

```
/private-chatroom
├── /server
│   ├── package.json
│   ├── index.js           # Express + Socket.io setup
│   └── /src
│       ├── socket.js      # WebSocket event handlers
│       ├── auth.js        # Session management
│       ├── storage.js     # In-memory message store
│       └── users.js       # User file operations
│
├── /client
│   ├── package.json
│   ├── vite.config.js
│   └── /src
│       ├── App.jsx
│       ├── /components    # React components
│       ├── /hooks         # Custom hooks
│       └── /context       # React context
│
└── package.json           # Root monorepo config
```

## Environment Variables

### Server (.env)
```
PORT=3001
CLIENT_URL=http://localhost:5173
SESSION_SECRET=your-random-secret-key
```

### Client (.env)
```
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login/register with username |
| POST | `/api/auth/logout` | Invalidate session |
| GET | `/api/users/check/:username` | Check if user exists |
| GET | `/api/health` | Server health check |

## WebSocket Events

### Client → Server
- `authenticate` - Verify session token
- `start-chat` - Open conversation with user
- `send-message` - Send private message
- `typing` - Typing indicator
- `get-online-users` - Request online users

### Server → Client
- `authenticated` - Auth confirmation
- `chat-started` - Conversation ready
- `new-message` - Incoming message
- `user-typing` - Typing indicator
- `online-users` - Online users list
- `user-online` / `user-offline` - Status updates
- `error` - Error messages

## Security Features

- Rate limiting (10 messages per 10 seconds)
- Input validation and sanitization
- XSS prevention
- CORS whitelist
- Session-based authentication

## License

MIT

