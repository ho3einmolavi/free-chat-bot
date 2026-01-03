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
- 🐳 Docker support for easy deployment

## Tech Stack

- **Backend:** Node.js + Express + Socket.io
- **Frontend:** React (Vite) + Socket.io-client
- **Styling:** Tailwind CSS
- **Storage:** In-memory (messages) + JSON file (users)
- **Deployment:** Docker + Nginx

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+ (for local development)
- Docker and Docker Compose (for containerized deployment)

---

## Option 1: Local Development

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

This starts both the server and client concurrently:
- **Server:** `http://localhost:3001`
- **Client:** `http://localhost:5173`

### Environment Variables (Optional)

Create `.env` files for custom configuration:

**Server (`server/.env`):**
```env
PORT=3001
CLIENT_URL=http://localhost:5173
SESSION_SECRET=your-random-secret-key
```

**Client (`client/.env`):**
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

---

## Option 2: Docker Deployment

### Local Docker Setup

#### 1. Build and run containers

```bash
docker-compose up -d --build
```

#### 2. Access the application

Open `http://localhost` in your browser.

#### 3. View logs

```bash
docker-compose logs -f
```

#### 4. Stop containers

```bash
docker-compose down
```

---

### Production Server Deployment

#### 1. Clone the repository on your server

```bash
git clone <repository-url>
cd free-chat-bot
```

#### 2. Configure for production (optional)

If you need to use a custom domain, update `client/nginx.conf`:

```nginx
server_name yourdomain.com;
```

And update `docker-compose.yml` environment:

```yaml
environment:
  - PORT=3001
  - CLIENT_URL=https://yourdomain.com
```

#### 3. Build and start containers

```bash
docker-compose up -d --build
```

#### 4. Verify deployment

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f
```

#### 5. Common operations

```bash
# Restart services
docker-compose restart

# Rebuild and restart (after code changes)
docker-compose up -d --build

# Stop all services
docker-compose down

# Stop and remove volumes (clears all data)
docker-compose down -v
```

---

### Docker Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Host Machine                      │
│                                                      │
│  ┌──────────────────┐     ┌──────────────────────┐  │
│  │   chatbot-client │     │   chatbot-server     │  │
│  │   (Nginx)        │────▶│   (Node.js)          │  │
│  │   Port: 80       │     │   Port: 3001         │  │
│  └──────────────────┘     └──────────────────────┘  │
│           │                         │               │
│           │                         ▼               │
│           │               ┌──────────────────────┐  │
│           │               │   server-data        │  │
│           │               │   (Docker Volume)    │  │
│           │               └──────────────────────┘  │
│           ▼                                         │
│    External Access                                  │
│    http://localhost:80                              │
└─────────────────────────────────────────────────────┘
```

- **chatbot-client:** Nginx serves the React build and proxies API/WebSocket requests
- **chatbot-server:** Node.js handles API and WebSocket connections
- **server-data:** Persistent volume for user data

---

## Project Structure

```
/free-chat-bot
├── docker-compose.yml      # Container orchestration
├── package.json            # Root monorepo config
│
├── /server
│   ├── Dockerfile          # Server container build
│   ├── package.json
│   ├── index.js            # Express + Socket.io setup
│   ├── /data               # User data storage
│   └── /src
│       ├── socket.js       # WebSocket event handlers
│       ├── auth.js         # Session management
│       ├── storage.js      # In-memory message store
│       └── users.js        # User file operations
│
└── /client
    ├── Dockerfile          # Client container build
    ├── nginx.conf          # Nginx reverse proxy config
    ├── package.json
    ├── vite.config.js
    └── /src
        ├── App.jsx
        ├── /components     # React components
        ├── /hooks          # Custom hooks
        └── /context        # React context
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login/register with username |
| POST | `/api/auth/logout` | Invalidate session |
| GET | `/api/users/check/:username` | Check if user exists |
| GET | `/api/health` | Server health check |

---

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

---

## Security Features

- Rate limiting (10 messages per 10 seconds)
- Input validation and sanitization
- XSS prevention
- CORS whitelist
- Session-based authentication

---

## Troubleshooting

### Port 80 already in use
```bash
# Find the process using port 80
sudo lsof -i :80

# Or use a different port in docker-compose.yml
ports:
  - "8080:80"
```

### Permission denied on server
```bash
# Run docker commands with sudo
sudo docker-compose up -d --build
```

### Container not starting
```bash
# Check container logs
docker-compose logs server
docker-compose logs client
```

### Clear all data and rebuild
```bash
docker-compose down -v
docker-compose up -d --build
```

---

## License

MIT
