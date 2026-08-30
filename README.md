# Intelligent Email Assistant

An AI-powered email-management application that pairs a familiar email interface with an intelligent dashboard. Gmail is authorised only through Google OAuth; users never provide a Gmail password to this application.

## Current status

**Phase 1 — Project Foundation** is implemented. It provides the client and server foundations, Supabase-backed application authentication, protected client routes, and a dashboard shell. Gmail, AI, inbox data, and calendar features are intentionally deferred to later phases.

## Technology stack

- Frontend: Next.js, React, Tailwind CSS, Axios, Lucide React
- Backend: Node.js, Express, JWT, bcryptjs, express-validator, Helmet, CORS, Morgan
- Database: Supabase PostgreSQL, accessed through the backend service layer
- Planned integrations: Gmail API and Google OAuth 2.0; Google Gemini API
- Planned deployment: Vercel (client), Render (server), Supabase (database)

## Architecture overview

The repository is split into `client/` and `server/`. The Next.js frontend communicates only with REST endpoints on the Express backend. Routes call thin controllers, controllers call services, and services own database access. This phase implements the authentication path as:

`Next.js pages → Axios REST client → Express route/controller → auth service → Supabase PostgreSQL`

Secrets, JWT signing, and Supabase service credentials remain server-side. The frontend only receives a JWT after a successful application login or registration.

## Prerequisites

- Node.js 18.17 or later
- npm
- A Supabase project with its PostgreSQL API enabled

Create the required `users` table in Supabase before using registration:

```sql
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login timestamptz
);
```

## Setup

1. Copy `server/.env.example` to `server/.env` and set the Supabase and JWT values.
2. Copy `client/.env.example` to `client/.env.local` and set `NEXT_PUBLIC_API_URL`.
3. Install dependencies:

   ```bash
   npm install --prefix server
   npm install --prefix client
   ```

4. Start the backend:

   ```bash
   npm run dev --prefix server
   ```

5. In another terminal, start the frontend:

   ```bash
   npm run dev --prefix client
   ```

The frontend runs on `http://localhost:3000` by default and the backend on `http://localhost:5000`.

## Development phases

1. **Project Foundation** — setup, authentication, protected routes, and dashboard shell.
2. **Gmail OAuth and Email Integration** — real Gmail connection, inbox, threads, search, and email management.
3. **Core AI Features** — summaries, reply generation and editing, explanations, and AI services.
4. **Intelligent Dashboard** — priorities, activities, daily summary, and OTP detection.
5. **Email Composition and Activity** — sending, replies, history, and complete UI states.
6. **Optional Advanced Features** — calendar confirmation workflow and selected enhancements.
7. **Security, Testing and Deployment** — production verification and deployment to Vercel, Render, and Supabase.

## Security notes

Never commit `.env` files or place API keys, OAuth secrets, JWT secrets, Gmail tokens, or Supabase service-role credentials in client code. Gmail access will use Google OAuth in Phase 2.
