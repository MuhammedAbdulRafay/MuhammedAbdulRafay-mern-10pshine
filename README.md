# Notes App — 10P Shine MERN Internship

A full-stack notes application built as the core deliverable for the 10P Shine MERN Internship. Authenticated users can create, edit, and delete notes with a Notion-style rich text editor.

**Intern:** Muhammed Abdul Rafay — Szabist Islamabad

---

## Features

- **User Authentication** — Sign up, log in, and log out with JWT-based sessions (token persistent in local storage)
- **Forgot & Reset Password** — Request password reset links via email (Nodemailer) and reset password with secure tokens
- **Notes Dashboard** — Live client-side note search, toggleable Grid/List views, and note management
- **Rich Text Editor** — Tiptap-powered editor with headings (H1, H2, H3), lists (bullet, numbered), text alignment (left, center, right, justify), placeholders, highlights, and underlines
- **Note Management** — Create, edit, and delete notes, with user ownership checks enforced on the backend
- **Theme Customization** — Toggle between Dark and Light modes (backed by a React context)
- **User Profile** — View and update account profile details
- **Application Logging** — Pino structured logging throughout the backend (requests, events, and errors)
- **Exception Handling** — Global error middleware with meaningful HTTP responses and structured logs

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express 5 |
| Database | MongoDB + Mongoose |
| Logging | Pino + pino-http + pino-pretty |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Rich Text | Tiptap 2 |
| Backend Tests | Mocha + Chai + nyc (Coverage) |
| Frontend Tests | Vitest + React Testing Library + jsdom |
| Code Quality | SonarQube |

---

## Prerequisites

- **Node.js** 18 or later
- **MongoDB** running locally (default port `27017`)
  - Windows: `net start MongoDB`
  - macOS/Linux: `mongod` or `brew services start mongodb-community`
- **Git**

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd MuhammedAbdulRafay-mern-10pshine
```

### 2. Set up the backend

```bash
cd backend
# Create your configuration file
cp .env.example .env
```

Edit `backend/.env` and fill in your values (example defaults matching your configuration):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/notes_app
LOG_LEVEL=info
JWT_SECRET=your_strong_secret_here
JWT_EXPIRES_IN=7d
APP_NAME="Notes App"

# Email Configuration (for Forgot Password feature)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
FRONTEND_URL=http://localhost:5173
```

Install dependencies and start:

```bash
npm install
npm run dev
```

The backend runs at **http://localhost:5000**.

### 3. Set up the frontend

```bash
cd ../frontend
```

> [!NOTE]
> The frontend is configured to directly connect to `http://localhost:5000/api` (backend server default port) inside `src/services/api.js`. No separate environment file is required.

Install dependencies and start:

```bash
npm install
npm run dev
```

The frontend runs at **http://localhost:5173**.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Port the Express server listens on |
| `NODE_ENV` | `development` | Environment (`development` / `production`) |
| `MONGODB_URI` | `mongodb://localhost:27017/notes_app` | MongoDB connection string |
| `LOG_LEVEL` | `info` | Pino log level (`trace`, `debug`, `info`, `warn`, `error`) |
| `JWT_SECRET` | — | Secret key for signing JWT tokens (required) |
| `JWT_EXPIRES_IN` | `7d` | JWT expiry duration |
| `EMAIL_USER` | — | Gmail account used to send password reset links |
| `EMAIL_PASSWORD` | — | App-specific password for the Gmail account |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed CORS origin and redirect URL for the frontend |

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register a new user |
| `POST` | `/api/auth/login` | No | Log in and receive a JWT |
| `POST` | `/api/auth/logout` | Bearer JWT | Log out the user |
| `POST` | `/api/auth/forgot-password` | No | Request a password reset link email |
| `POST` | `/api/auth/reset-password` | No | Reset password using token |

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users/me` | Bearer JWT | Get current user's profile details |
| `PUT` | `/api/users/profile` | Bearer JWT | Update user's profile details |

### Notes

All notes endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notes` | List all notes for the current user |
| `POST` | `/api/notes` | Create a new note |
| `PUT` | `/api/notes/:id` | Update a note by ID |
| `DELETE` | `/api/notes/:id` | Delete a note by ID |

---

## Running Tests

### Backend (Mocha + Chai)

```bash
cd backend
npm test
```

Runs **34 passing tests** covering user registration, login, logout, JWT authentication middleware, and full notes service CRUD behaviors with ownership checks.

To generate a coverage report for SonarQube:
```bash
npm run test:coverage
```
This generates a backend coverage directory (`backend/coverage/lcov.info`).

### Frontend (Vitest + React Testing Library)

```bash
cd frontend
npm test
```

Runs **45 passing tests** across 6 files covering:
- Login and Register form behaviors (render, validation, submission, redirect, alert feedback).
- Dashboard and notes management (list render, count display, delete triggers, search filtering, and Grid/List toggle layout).
- TipTap-powered `NoteEditor` rendering and lifecycle states.
- `ThemeContext` and `UserContext` state/action behavior.

To run tests with code coverage:
```bash
npm run test:coverage
```
This generates a frontend coverage report (`frontend/coverage/lcov.info`).

---

## SonarQube Analysis

Requires a running SonarQube server and `sonar-scanner` on your `PATH`.

```bash
# From repo root
sonar-scanner
```

Configuration is defined in `sonar-project.properties`. Make sure all blocker and critical issues are resolved.

---

## Project Structure

```
MuhammedAbdulRafay-mern-10pshine/
├── backend/
│   ├── config/           # database.js
│   ├── controllers/      # authController.js, notesController.js, userController.js
│   ├── middleware/       # authMiddleware.js, errorHandler.js, notFound.js
│   ├── models/           # User.js, Note.js
│   ├── routes/           # authRoutes.js, notesRoutes.js, userRoutes.js, forgotPasswordRoutes.js
│   ├── services/         # authService.js, notesService.js, emailService.js, userService.js
│   ├── tests/            # authService.test.js, authMiddleware.test.js, notesService.test.js, setup.js
│   ├── utils/            # logger.js
│   ├── .env
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── auth/     # Auth.css, Login.jsx, Register.jsx, ProtectedRoute.jsx
│   │   │   │   └── __tests__/ # Login.test.jsx, Register.test.jsx, NoteEditor.test.jsx
│   │   │   └── Dashboard/ # Dashboard.css, Dashboard.jsx (contains NoteEditor component)
│   │   │       └── __tests__/ # Dashboard.test.jsx
│   │   ├── context/      # ThemeContext.jsx, UserContext.jsx
│   │   │   └── __tests__/ # ThemeContext.test.jsx, UserContext.test.jsx
│   │   ├── services/     # api.js (Axios setup)
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── eslint.config.js
│   ├── package.json
│   ├── vite.config.js
│   └── vitest.config.js
├── sonar-project.properties
└── README.md
```

---

## Git Workflow

This project follows the 10P Shine branching strategy. The mentor reviews and merges all PRs into `develop`.

- **Never push directly to `main` or `develop`**
- Branch naming: `feature/backend/<name>`, `feature/frontend/<name>`, `bugfix/...`
- PRs always target `develop`, maximum 15 files per PR
- Commit messages in imperative form: `Add user auth middleware`

---

## License

Built for educational purposes as part of the 10P Shine MERN Internship program.