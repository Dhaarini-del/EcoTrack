# EcoTrack — Environmental Project Intelligence Platform

A full-stack MERN application for managing environmental projects, recording field activities, tracking impact, and auditing changes.

## Stack
- React + Vite, React Router, Axios, Recharts
- Node.js + Express, Mongoose
- MongoDB Atlas, JWT, bcrypt, Zod
- Tailwind CSS + Lucide React

## Core behaviour
- Admin, Manager and Field Officer roles.
- Projects and field activities are persisted in MongoDB.
- Project progress is calculated from activity records; it is not duplicated as a manually edited number.
- Activity corrections create audit-log entries.
- Backend middleware enforces permissions.
- Dashboard metrics and charts are calculated from the database.

## Run locally
Requirements: Node.js 20+, npm, MongoDB Atlas URI or local MongoDB.

1. Copy `server/.env.example` to `server/.env` and set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`.
2. Copy `client/.env.example` to `client/.env`.
3. In one terminal:
   ```bash
   cd server
   npm install
   npm run seed
   npm run dev
   ```
4. In another terminal:
   ```bash
   cd client
   npm install
   npm run dev
   ```
5. Open http://localhost:5173

## Demo accounts
The seed script creates:
- Admin: `admin@ecotrack.demo` / `EcoTrack@123`
- Manager: `manager@ecotrack.demo` / `EcoTrack@123`
- Field Officer: `field@ecotrack.demo` / `EcoTrack@123`

Change these credentials before exposing a deployed instance. Seed data is for demonstration only.

## API overview
- `POST /api/auth/login`, `GET /api/auth/me`
- `GET/POST /api/projects`, `GET/PATCH/DELETE /api/projects/:id`
- `GET/POST /api/activities`, `PATCH/DELETE /api/activities/:id`
- `GET /api/dashboard/summary`
- `GET /api/audit-logs`

All protected endpoints require `Authorization: Bearer <token>`.

## Deployment
### Backend (Render)
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Add environment variables from `.env.example`.
- Set `CLIENT_URL` to the deployed frontend URL.

### Frontend (Vercel)
- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_URL` to the deployed backend URL, e.g. `https://your-api.onrender.com/api`.

## Important implementation notes
- `activities.quantity` is the source of truth for impact totals.
- Dashboard totals aggregate activity records. Updating an activity therefore changes the project progress and dashboard on the next API request.
- A correction stores before/after snapshots in `auditLogs`.
- Managers can manage projects and activities. Field Officers can create activities and edit/delete only their own activity records. Admins have full access.
- For production, add rate limiting, email verification, password reset, stronger operational logging, automated tests, backups, and file storage (S3/Cloudinary) for evidence uploads.
