# Task Tracker

A full-stack task management app with secure authentication and a dev-tool-inspired dark UI. Users sign up, log in, and manage their own private task list. Every request is authenticated and every task is scoped to its owner.

**Live demo:** https://task-tracker-xi-livid.vercel.app

> The backend runs on Render's free tier, so the first request after a period of inactivity can take 30-60 seconds while the server wakes up.

<!-- Add a screenshot here:
![Task Tracker dashboard](./screenshot.png)
-->

## Features

- Sign up and log in with email and password (auto-login after signup)
- Passwords hashed with bcrypt, never stored in plain text
- Stateless authentication with JSON Web Tokens (1 hour expiry)
- Create, read, update (toggle complete) and delete tasks
- Ownership checks on every task route, so users can only access their own data
- Persistent sessions across page refreshes
- Protected routes: logged-out visitors are redirected to the login page
- Responsive dark UI built with Tailwind CSS

## Tech Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | React (Vite), React Router, Context API, Tailwind CSS v4 |
| Backend  | Node.js, Express                                |
| Database | PostgreSQL (hosted on Supabase)                 |
| Auth     | bcrypt, jsonwebtoken                            |
| Hosting  | Vercel (frontend), Render (backend)             |

## Architecture

```
task-tracker/
├── client/                  # React frontend
│   └── src/
│       ├── context/         # AuthContext (token state + localStorage persistence)
│       ├── pages/           # Login, Signup, Dashboard
│       └── App.jsx          # Route definitions
└── server/                  # Express API
    └── index.js             # Routes, auth middleware, DB connection
```

**Request flow:** the React app stores the JWT after login and sends it in an `Authorization: Bearer <token>` header. Express middleware verifies the token, attaches the user's id to the request, and each task query filters by that id.

## Database Schema

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Deleting a user cascades to their tasks.

## API Reference

| Method | Endpoint      | Auth | Description                          |
| ------ | ------------- | ---- | ------------------------------------ |
| GET    | `/health`     | No   | Health check                         |
| POST   | `/signup`     | No   | Create an account, returns a JWT     |
| POST   | `/login`      | No   | Log in, returns a JWT                |
| GET    | `/tasks`      | Yes  | List the current user's tasks        |
| POST   | `/tasks`      | Yes  | Create a task                        |
| PATCH  | `/tasks/:id`  | Yes  | Update a task's completed status     |
| DELETE | `/tasks/:id`  | Yes  | Delete a task                        |

## Security Decisions

- **Password hashing:** bcrypt with 10 salt rounds.
- **Parameterized queries:** all SQL uses `$1, $2` placeholders to prevent SQL injection.
- **IDOR prevention:** task queries filter by `user_id` from the verified token, never from client input. A request for another user's task returns 404, which avoids confirming the task exists.
- **Generic login errors:** wrong email and wrong password return the same message, so the API can't be used to discover registered emails.
- **CORS:** restricted to the deployed frontend origin in production.
- **Secrets:** database URL and JWT secret live in environment variables and are excluded from git.

## Running Locally

**Prerequisites:** Node.js (LTS) and a PostgreSQL database (a free Supabase or Neon project works).

1. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/aspectZA27/task-tracker.git
   cd task-tracker
   cd server && npm install
   cd ../client && npm install
   ```

2. Create the tables by running the SQL from the schema section above in your database's SQL editor.

3. Create `server/.env`:
   ```
   DATABASE_URL=your_postgres_connection_string
   JWT_SECRET=a_long_random_string
   FRONTEND_URL=http://localhost:5173
   ```

4. Create `client/.env`:
   ```
   VITE_API_URL=http://localhost:3001
   ```

5. Start both servers in separate terminals:
   ```bash
   # terminal 1
   cd server && node index.js

   # terminal 2
   cd client && npm run dev
   ```

6. Open http://localhost:5173.

## Deployment

- **Backend (Render):** root directory `server`, build command `npm install`, start command `node index.js`. Environment variables: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`.
- **Frontend (Vercel):** root directory `client`, environment variable `VITE_API_URL` set to the Render URL. A `vercel.json` rewrite sends all paths to `index.html` so client-side routing works on refresh.

## Known Limitations and Future Work

- Tokens live in `localStorage`, which is readable by any script on the page. An httpOnly cookie would be safer.
- An expired token is not detected automatically; the user has to log in again.
- Duplicate-email signups show a generic error instead of "email already registered".
- Task titles can't be edited after creation.
- No loading states, pagination or automated tests yet.

## What I Learned

Built as a learning project to understand full-stack fundamentals end to end: designing a relational schema, implementing authentication from scratch (hashing, JWT issuing and verification, middleware), enforcing authorization on every route, managing shared state with React Context, debugging CORS, and deploying a split frontend/backend.

## License

MIT
