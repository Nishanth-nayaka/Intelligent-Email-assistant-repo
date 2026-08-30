# Intelligent Email Assistant

An AI-powered email-management application that pairs a familiar email interface with an intelligent dashboard. Gmail is authorised exclusively through official Google OAuth 2.0; users never provide their Gmail password to this application.

## Current status

**Phases 1–4 are implemented and operational:**

- **Phase 1 — Project Foundation**: Client and server foundation, Supabase PostgreSQL user persistence, JWT authentication, protected routes, and responsive layout.
- **Phase 2 — Gmail OAuth and Email Integration**: Google OAuth 2.0 flow, server-side AES-256-GCM token encryption, real-time Gmail inbox retrieval, email details, conversation threads, keyword search, and email management (mark read/unread, star/unstar, archive, delete).
- **Phase 3 — Core AI Features**: Google Gemini integration for on-demand email summarization, explanation ("Explain this email"), category classification, and context-aware editable reply drafting with validation.
- **Phase 4 — Intelligent Dashboard & OTP Detection**: AI-extracted today's priorities with dynamic urgency indicators (High/Urgent, Medium/Approaching, Low/Future), action item extraction, date/deadline detection with traceable links to source emails, yesterday's email summary, upcoming activities (tomorrow and day after tomorrow), and dedicated OTP / verification code detection section (`/otp`).

Phases 5 (Email composition, sending, activity history), 6 (Optional calendar integration), and 7 (Production deployment) represent the remaining development roadmap.

## Technology stack

- **Frontend**: Next.js, React, Tailwind CSS, Axios, Lucide React
- **Backend**: Node.js, Express, JSON Web Tokens (JWT), bcryptjs, express-validator, Helmet, CORS, Morgan
- **Database**: Supabase PostgreSQL, accessed through the backend service layer
- **Email Integration (Implemented)**: Gmail API via `googleapis` with Google OAuth 2.0; tokens encrypted at rest via Node `crypto` (AES-256-GCM)
- **AI Integration (Implemented)**: Google Gemini API (Interactions/GenerateContent) for priority detection, summarization, explanation, action extraction, and daily summaries
- **Planned deployment**: Vercel (client), Render (server), Supabase (database)

## Architecture overview

The repository uses a layered architecture split between `client/` and `server/`:

```
Next.js Frontend (Pages & Modular Components)
       │
       ▼ (REST API / JWT Bearer)
Express.js Routes & Middleware (Auth, Validation, Helmet, CORS)
       │
       ▼
Controllers (Thin HTTP Request/Response Handlers)
       │
       ▼
Services Layer
 ├── authService ──────────> Supabase PostgreSQL (users)
 ├── integrationService ───> Supabase PostgreSQL (gmail_connections with AES-256-GCM tokens)
 ├── gmailService ─────────> Google Gmail API (Messages, Threads, Labels, Trash)
 ├── priorityService ──────> Urgency scoring, priority ranking, upcoming activity filtering
 └── aiService ────────────> AI Agent Layer ───> Google Gemini API
                              ├── emailUnderstandingAgent
                              ├── priorityActionAgent
                              ├── responseAgent
                              └── validationAgent
```

All sensitive credentials, API keys, OAuth secrets, and database service-role keys remain strictly server-side. The frontend only receives an application JWT after authentication.

## Prerequisites

- Node.js 18.17 or later
- npm
- A Supabase project with its PostgreSQL database enabled
- A Google Cloud project with Gmail API enabled and OAuth 2.0 Web Client credentials
- A Google Gemini API key

Apply the required database schemas in Supabase using the SQL scripts located in `server/supabase/`:

1. `server/supabase/phase1_auth_schema.sql` (creates `public.users` table)
2. `server/supabase/phase2_gmail_connections.sql` (creates `public.gmail_connections` table)

## Setup

1. Configure the server environment variables in `server/.env` based on `server/.env.example`:
   - `PORT`
   - `NODE_ENV`
   - `CLIENT_URL`
   - `SERVER_URL`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`
   - `GMAIL_TOKEN_ENCRYPTION_KEY`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL`

2. Configure the client environment in `client/.env.local`:
   - `NEXT_PUBLIC_API_URL`

3. Install dependencies:

   ```bash
   npm install --prefix server
   npm install --prefix client
   ```

4. Start the backend server:

   ```bash
   npm run dev --prefix server
   ```

5. In a separate terminal, start the frontend client:

   ```bash
   npm run dev --prefix client
   ```

The frontend runs on `http://localhost:3000` by default and the backend on `http://localhost:5000`.

## Development phases

1. **Phase 1 — Project Foundation** *(Implemented)*: Setup, user registration/login, JWT authentication, protected routes, and layout.
2. **Phase 2 — Gmail OAuth and Email Integration** *(Implemented)*: Google OAuth connection, encrypted token handling, inbox message list, thread viewer, email search, read/unread, star, archive, and delete actions.
3. **Phase 3 — Core AI Features** *(Implemented)*: AI email summarization, explanation ("Explain this email"), category classification, and context-aware editable reply drafting.
4. **Phase 4 — Intelligent Dashboard & OTP** *(Implemented)*: Today's priorities, dynamic urgency scoring, action item extraction, date/deadline extraction, yesterday's email summary, upcoming activities (tomorrow/in 2 days), direct source-email navigation, and dedicated OTP/verification code section (`/otp`).
5. **Phase 5 — Email Composition and Activity** *(Upcoming)*: Email composition, email and reply sending via Gmail API, activity logging, and error/empty/loading UI states.
6. **Phase 6 — Optional Advanced Features** *(Upcoming)*: Google Calendar integration, task confirmation workflows, and tone controls.
7. **Phase 7 — Security, Testing and Deployment** *(Upcoming)*: Production configuration and deployment to Vercel, Render, and Supabase.

## Security notes

- **No Plaintext Passwords or OAuth Tokens**: Passwords are securely hashed with `bcryptjs`. Gmail OAuth access and refresh tokens are encrypted server-side using AES-256-GCM before persistence in Supabase.
- **Gmail Password Safety**: The application never requests or stores Gmail passwords. All Gmail access is authorized through Google's official OAuth 2.0 consent flow.
- **Secret Isolation**: All API keys, OAuth secrets, database credentials, and signing keys are isolated in server-side environment variables and are never committed to version control or exposed to the frontend.
