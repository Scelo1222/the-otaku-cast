# The Otaku Cast – Local SQLite + Realtime App

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

---

# Legacy notes

## Project info

**URL**: https://lovable.dev/projects/0aa896c6-e5b4-4aa5-a4a2-8cf5ad8d72a2

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/0aa896c6-e5b4-4aa5-a4a2-8cf5ad8d72a2) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/0aa896c6-e5b4-4aa5-a4a2-8cf5ad8d72a2) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
