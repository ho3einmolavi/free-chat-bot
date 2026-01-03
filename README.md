# Private Chatroom

A real-time private messaging application built with Node.js, Express, Socket.io, and React.

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

### Build and run

```bash
docker-compose up -d --build
```

### Access the application

Open `http://localhost` in your browser.

### Stop containers

```bash
docker-compose down
```
