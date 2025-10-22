# The Otaku Cast – Local SQLite + Realtime App

## Hosting on GitHub Pages (static-only)

This project supports a dual mode:

- When a backend is available (e.g., `npm start` locally or Docker), the frontend calls REST APIs and listens to WebSocket updates.
- When hosted as static files (GitHub Pages), the frontend automatically falls back to fully client-side mode using `sql.js` with localStorage persistence and realtime across tabs via BroadcastChannel/storage events.

Steps for GitHub Pages:

- Push the repository to GitHub.
- Configure GitHub Pages to serve from the `static/` folder (e.g., via Repository Settings → Pages → Build and deployment → Source: Deploy from a branch, Branch: `main`, Folder: `/static`).
- Open the site URL. The app will operate in local-only mode in the browser.

Note: GitHub Pages cannot run the Node backend. For a full multi-user backend, deploy `server/` to a host that supports Node (Render, Railway, Fly.io, etc.) and serve `static/` from the same origin or configure CORS.

This app provides a local portal backed by a SQLite database on disk with realtime updates across clients.

- Backend: Node.js (Express) + better-sqlite3 + WebSocket.
- Frontend: Static HTML/CSS/JS served by the backend.
- Persistence: SQLite file at `server/data/otaku_cast.db`.
- Realtime: Server broadcasts DB change events; clients auto-refresh lists.

## Quick start (Local, Windows)

1) Install and start the backend

```bash
cd server
npm install
npm start
```

2) Open the app

```
http://localhost:3000
```

## Quick start (Docker)

```bash
docker compose up --build
```

Open: `http://localhost:3000`

The SQLite file is persisted on your host at `./server/data/otaku_cast.db`.

## Seeded logins

- admin / admin123 (Admin)
- thewalkingghost / member123 (Admin)

Passwords are stored hashed via bcrypt.

## API overview

- POST `/api/login` – body: `{ username, password }` → returns user object
- GET `/api/members`
- GET `/api/suggestions`
- POST `/api/suggestions`
- DELETE `/api/suggestions/:id`
- GET `/api/meetings`
- POST `/api/meetings`
- DELETE `/api/meetings/:id`
- GET `/api/users` – admin only
- POST `/api/users` – admin only
- DELETE `/api/users/:id` – admin only

Admin routes are guarded server-side with a simple header `x-role: admin` (sent automatically by the frontend after login). For production, consider replacing with sessions/JWT.

## Realtime updates

The server broadcasts `{ type: "db_changed", resource }` via WebSocket on any mutation. The frontend listens and reloads UI lists automatically.

## Project structure

- `static/` – frontend assets and app logic
- `server/` – Express server, database access, WebSocket
  - `server/index.js` – API and WS server, serves `static/`
  - `server/db.js` – SQLite schema, seeding, and helpers
  - `server/data/otaku_cast.db` – SQLite database file (created on first run)
  - `server/Dockerfile` – Container for Node server
- `docker-compose.yml` – Runs the server with a persistent volume

