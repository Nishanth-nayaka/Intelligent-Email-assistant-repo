# Intelligent Email Assistant — Complete Specification

## 1. Project Overview

### Project Name

Intelligent Email Assistant

### Project Purpose

Build a full-stack AI-powered email management application that connects to a real email service such as Gmail using OAuth.

The application must provide a familiar email experience similar to Gmail while adding an intelligent AI layer that helps users understand, prioritize, summarize, search, organize, and respond to emails more efficiently.

The system must reduce the amount of manual effort required to process email by identifying useful information such as priorities, action items, deadlines, OTPs, and upcoming activities from email content.

The application must never require users to provide their Gmail password directly. Gmail access must be performed through the official Google OAuth consent flow and Gmail API.

### Primary User

The primary user is an individual professional, student, or general email user who receives a significant number of emails and wants an intelligent assistant to help understand and manage them.

### Main Product Behavior

The application combines a familiar email interface with an intelligent AI-powered dashboard.

After authentication and Gmail connection, the user can:

1. Access a familiar inbox-style email interface.
2. View and read emails and email threads.
3. Search and organize emails.
4. Perform normal email-management actions.
5. Ask AI to summarize long or important emails.
6. Generate and edit AI-powered replies.
7. Compose and send emails.
8. View email activity and history.
9. See intelligent daily priorities derived from email content.
10. See summaries of previous email activity.
11. See upcoming activities, deadlines, meetings, and action items extracted from emails.
12. Quickly access detected OTP emails through a dedicated OTP section.
13. Optionally connect calendar services in a later implementation phase.

The core email-management experience must remain familiar and simple. The intelligent dashboard is the primary differentiating feature of the product.

---

# 2. Tech Stack

## Frontend

- Next.js
- React
- Tailwind CSS
- Axios
- Lucide React icons
- Responsive web design

The frontend must communicate with the backend through REST APIs.

## Backend

- Node.js
- Express.js
- JSON Web Tokens (JWT)
- bcryptjs
- express-validator
- helmet
- CORS
- Morgan or equivalent request logging

## Database

- Supabase
- PostgreSQL database provided by Supabase

Supabase will be the primary persistent database for application data.

The application must use Supabase through a controlled backend/service layer.

## AI

- Google Gemini API
- Gemini must be accessed only from the backend.
- AI functionality must be isolated inside backend services so that API keys are never exposed to the browser.

## Email Integration

- Gmail API
- Google OAuth 2.0
- Google OAuth access and refresh tokens
- Gmail API for reading, searching, organizing, and sending email

## Optional Later Integration

- Google Calendar API
- Local/device calendar integration may be considered if technically practical, but Google Calendar integration is the primary planned calendar option.

## Deployment

- GitHub — source code repository
- Vercel — frontend deployment
- Render — backend deployment
- Supabase — database

The deployment architecture is:

GitHub
   ├──> Vercel
   │     └── Frontend
   │
   └──> Render
         └── Backend API
                │
                └──> Supabase
                      └── PostgreSQL Database

## Configuration

All secrets and environment-specific configuration must be stored in environment variables.

Example variables include:

- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- JWT_SECRET
- GEMINI_API_KEY
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI
- CLIENT_URL
- SERVER_URL

The Supabase service-role key, if used by the backend, must remain server-side only.

---

# 3. Core Features

## 3.1 Email Account Connection

Users must be able to connect their Gmail account using Google OAuth.

The system must:

- Start the OAuth flow.
- Display Google's permission/consent screen.
- Receive the OAuth callback.
- Store required credentials securely.
- Establish the Gmail connection.
- Show the connection status to the user.
- Allow reconnection if credentials expire or become invalid.

The application must never ask users to enter their Gmail password.

## 3.2 Secure Authentication

Users must be able to:

- Register.
- Log in.
- Log out.
- Maintain an authenticated session.
- Access protected application pages.

Passwords must be securely hashed before storage.

## 3.3 Email Dashboard / Inbox

The application must provide a familiar email interface.

The inbox should display:

- Sender name
- Sender information where available
- Subject
- Short message preview
- Timestamp
- Read/unread state
- Starred state
- Important state where available
- Relevant labels

The interface should feel familiar to users who already understand Gmail.

## 3.4 Email Navigation

The sidebar should provide familiar email sections including:

- Dashboard
- Inbox
- Starred
- Important
- Sent
- Drafts
- Spam
- Trash
- Labels/custom organization where practical
- OTP
- Calendar / Tasks (optional later feature)

## 3.5 View and Read Emails

Users must be able to open an email and view:

- Sender
- Recipients
- Subject
- Timestamp
- Full email content
- Attachments or attachment information where supported
- Email thread context

## 3.6 Email Threads

Related emails belonging to the same conversation should be presented as a thread where supported by the Gmail API.

Users should be able to understand the conversation history without manually opening separate messages.

## 3.7 Email Search

Users must be able to search their email.

The initial implementation should support normal Gmail-style search/filtering where practical.

AI-powered semantic search may be implemented as an additional bonus feature if time permits.

## 3.8 Basic Email Management

Users must be able to:

- Mark emails as read/unread.
- Star/unstar emails.
- Archive emails.
- Delete emails.
- Open relevant labels/folders.

These actions must update the actual connected Gmail account through the backend.

## 3.9 AI Email Summarization

Users must be able to request an AI summary of an email.

For a long email, the assistant should produce a concise summary containing the most useful information.

The summary should prioritize:

- Main purpose
- Important information
- Requests made to the user
- Deadlines
- Meetings/events
- Required actions
- Important links where available

The user must be able to distinguish the AI-generated summary from the original email.

## 3.10 AI-Generated Replies

Users must be able to request an AI-generated reply to an email.

The AI should use the email and relevant thread context to generate a contextually appropriate response.

The generated reply must not be sent automatically without user confirmation.

## 3.11 Reply Editing

Before sending an AI-generated reply, the user must be able to:

- Read the generated response.
- Edit the response.
- Rewrite the response if needed.
- Cancel the response.
- Send the final version.

## 3.12 Email Composition

Users must be able to compose an email with:

- Recipient
- CC/BCC where supported
- Subject
- Message body

The user must be able to send the composed email through Gmail.

## 3.13 Email History / Activity

The application must provide an activity/history view showing relevant email actions performed through the application.

Examples include:

- Email summarized
- Reply generated
- Reply edited
- Email sent
- Email archived
- Email deleted
- Email marked read/unread

---

# 4. Intelligent AI Features

## 4.1 AI Email Classification

The assistant should classify emails into useful categories where possible.

Possible categories include:

- Work
- Personal
- Education
- Finance
- Notifications
- Security
- Promotions
- Other

Classification should assist the user and must not destroy or modify the user's original Gmail organization.

## 4.2 Automatic Priority Detection

The assistant should analyze email content and identify urgency.

Priority levels:

### High Priority

Used for:

- Deadlines today
- Urgent requests
- Important security notifications
- Time-sensitive tasks
- Meetings happening today
- Other strongly urgent content

### Medium Priority

Used for:

- Upcoming deadlines
- Meetings occurring soon
- Important tasks that do not require immediate action

### Low Priority

Used for:

- Non-urgent tasks
- Future activities
- Informational messages
- Emails with sufficient time before action is required

Priority must be based on email content and available timestamps rather than only the sender.

## 4.3 Action Item Extraction

The AI should identify explicit actions requested from the user.

For example:

"Submit the assignment by Friday."

The assistant should extract:

- Action: Submit assignment
- Deadline: Friday
- Source: Original email

## 4.4 Date and Deadline Extraction

The AI should detect:

- Deadlines
- Meetings
- Appointments
- Events
- Submission dates
- Important dates

Extracted dates must retain a reference to the source email.

## 4.5 Explain This Email

The user may request a simplified explanation of a complicated email.

The assistant should explain:

- What the sender is saying.
- Why the email matters.
- What the user may need to do.
- Important deadlines or requests.

## 4.6 Email Rewriting and Tone

The assistant may provide reply-writing options such as:

- Professional
- Friendly
- Formal
- Concise

The user must remain in control of the final message.

## 4.7 OTP Detection

The AI/system should detect likely OTP or verification-code emails.

Detected OTP messages should be available through a dedicated OTP section in the sidebar.

The OTP section should allow the user to quickly find relevant verification emails without manually searching the inbox.

The system should not expose or store OTP values unnecessarily beyond what is required to display the source email.

---

# 5. Intelligent Dashboard

The dashboard is the primary unique interface of the application.

The normal inbox should remain familiar, while the dashboard acts as the user's intelligent email assistant.

## 5.1 Today's Priorities

The dashboard must show tasks and activities derived from email content that require attention today.

The dashboard should provide compact priority indicators.

Example:

- Red: 2 urgent/today items
- Yellow: 3 approaching items
- Blue: 8 future/non-urgent items

The number represents the number of detected items in each priority level.

Clicking a priority indicator must take the user directly to the relevant task/activity view.

The user should not have to manually search through emails again.

## 5.2 Dynamic Urgency

Priority presentation should become visually more urgent as a deadline approaches.

For example:

- Deadline today → strong red
- Deadline tomorrow → red/yellow intermediate state
- Deadline several days away → yellow
- Future/non-urgent → blue

The purpose is to communicate urgency quickly without overwhelming the user.

## 5.3 Yesterday's Email Summary

The dashboard should provide an AI-generated summary of the previous day's email activity.

The summary should cover the user's emails from the previous day and present meaningful events rather than simply reporting the number of emails received.

Where useful, the summary should display:

- Sender name
- Timestamp
- Important event/message
- Short AI-generated description
- Source email reference

Example:

Google — 10:32 AM
Security-related message detected.

Google — 2:14 PM
A new login/security event was reported.

The user should be able to open the original email from the summary.

## 5.4 Upcoming Activities

The dashboard should show activities detected from emails for:

- Tomorrow
- The day after tomorrow

Examples:

- Meeting
- Assignment deadline
- Workshop
- Submission
- Appointment
- Required response
- Other time-sensitive activity

Each item should provide a short, direct description of what the user needs to do.

Where the source email contains a useful hyperlink, the relevant link should be available from the activity item.

## 5.5 Direct Action Navigation

When the user clicks an activity from the dashboard, the application should directly open the corresponding task/activity detail rather than forcing the user to manually search for the source email.

The activity detail should explain:

- What needs to be done.
- When it needs to be done.
- Why it was detected.
- Which email it came from.
- Relevant source link if available.

---

# 6. Calendar / Task Integration — Optional Later Feature

Calendar integration is intentionally not required for the initial implementation.

After all mandatory features are completed and working, the project may add calendar functionality.

The planned behavior is:

1. AI extracts dates, meetings, and deadlines from emails.
2. The extracted activity appears in the dashboard.
3. The user opens the Calendar/Tasks section.
4. The user reviews the detected activity.
5. The user confirms the activity.
6. The system adds the event to Google Calendar or another supported calendar.

Calendar events must require user confirmation before creation.

The system must not automatically fill the user's calendar based solely on AI inference.

---

# 7. Authentication

The application authentication system must support:

- User registration.
- User login.
- JWT-based session handling.
- Protected application routes.
- Logout.
- Current-user/profile retrieval.
- Secure password hashing using bcrypt.
- Persistent authenticated state where appropriate.

The application must separate application authentication from Gmail authentication.

Application login authenticates the user to the Intelligent Email Assistant.

Google OAuth separately authorizes Gmail access.

Supabase is used as the application's database and does not require the application to replace its JWT authentication unless explicitly chosen during implementation.

---

# 8. Frontend Pages

## /

Landing page

Purpose:

- Explain the Intelligent Email Assistant.
- Show the main value proposition.
- Provide Login and Register actions.
- Present the AI-assisted email concept.

## /login

Provides:

- Email/password login.
- Validation.
- Error states.
- Session creation.

## /register

Provides:

- User registration.
- Password validation.
- Error handling.

## /dashboard

Primary intelligent interface.

Must contain:

- Today's priority indicators.
- Yesterday's email summary.
- Upcoming activities.
- Relevant AI insights.
- Quick actions.
- Gmail connection status where appropriate.

## /inbox

Gmail-style inbox interface.

Must support:

- Email list.
- Search.
- Read/unread state.
- Star.
- Archive.
- Delete.
- Opening email threads.

## /email/[id]

Email/thread detail page.

Must provide:

- Full email content.
- Thread context.
- AI summary.
- Generate reply.
- Edit reply.
- Send reply.
- Relevant source links.

## /compose

Email composition interface.

Must support:

- Recipient.
- Subject.
- Message.
- Send.

## /sent

Sent email history.

## /drafts

Draft emails where supported.

## /starred

Starred emails.

## /important

Important emails.

## /spam

Spam emails.

## /trash

Deleted emails.

## /otp

Detected OTP/verification emails.

## /activity

Email and AI activity/history.

## /integrations

Integration management.

Must show:

- Gmail connection status.
- Connect Gmail.
- Reconnect Gmail.
- Disconnect Gmail where supported.

## /calendar

Reserved for the optional calendar/task feature.

The page may initially display a planned/coming-later state if calendar integration is not implemented during the core build.

## /settings

Must provide appropriate user and application settings.

---

# 9. Backend Architecture

The backend must use a layered architecture.

## Routes

Routes define HTTP endpoints and connect requests to controllers.

Routes must handle appropriate middleware such as:

- Authentication.
- Validation.
- Error handling.

## Controllers

Controllers must remain thin.

Controllers are responsible for:

- Reading request information.
- Calling the appropriate service.
- Returning responses.

Controllers must not contain large business-logic implementations.

Controllers must not directly perform database operations.

## Services

Services contain the application's business logic.

Important services include:

- authService
- gmailService
- emailService
- aiService
- dashboardService
- priorityService
- activityService
- integrationService

Services are responsible for communicating with Supabase when database operations are required.

## Database Access

All Supabase database operations should be centralized through appropriate services/data-access functions.

The application should use Supabase PostgreSQL tables rather than MongoDB collections.

The backend must not expose the Supabase service-role key to the frontend.

## AI / Agent Layer

The AI processing layer should separate major responsibilities rather than placing all AI logic inside one function.

The initial agentic design should include:

### Email Understanding Agent

Understands the content and context of an email.

Responsibilities:

- Summarization.
- Important information extraction.
- Context understanding.

### Priority and Action Agent

Identifies:

- Priority.
- Action items.
- Deadlines.
- Upcoming activities.
- Potential OTP messages.

### Response Agent

Generates contextually appropriate email replies.

### Validation Agent

Checks generated AI output before presenting it to the user.

It should verify that:

- The response relates to the source email.
- Required information is not obviously missing.
- The generated response is suitable for user review.

### Monitoring / Activity Layer

Records important AI and email actions for the activity history.

Agents must not directly handle HTTP requests.

Agents should not directly perform database operations when the appropriate service can perform them.

---

# 10. Gmail Integration Architecture

All Gmail operations must go through a dedicated Gmail integration/service layer.

The frontend must never directly call Gmail APIs using secret credentials.

The backend must handle:

- OAuth start.
- OAuth callback.
- Token management.
- Gmail API calls.
- Email retrieval.
- Thread retrieval.
- Search.
- Email modification.
- Sending email.

The integration layer should expose reusable functions for:

- Fetch messages.
- Fetch threads.
- Search messages.
- Mark read/unread.
- Star/unstar.
- Archive.
- Delete.
- Send email.

Expired credentials must result in a clear authentication/integration error.

OAuth tokens stored in Supabase must be encrypted or otherwise securely protected before persistence.

---

# 11. Database Structure — Supabase PostgreSQL

Supabase PostgreSQL is the application's persistent database.

## Users Table

Stores application users.

Possible fields:

- id
- name
- email
- password_hash
- created_at
- updated_at
- last_login

Passwords must never be stored in plain text.

## Gmail Connections Table

Stores Gmail connection information for each application user.

Possible fields:

- id
- user_id
- provider
- encrypted_access_token
- encrypted_refresh_token
- token_expiry
- scopes
- connected_at
- updated_at

Sensitive credentials must not be exposed to the frontend.

## Email Metadata Table

Stores only the application data required for efficient operation and AI features.

Possible fields:

- id
- user_id
- gmail_message_id
- thread_id
- sender
- subject
- timestamp
- labels
- read_state
- starred_state
- summary
- priority
- extracted_actions
- extracted_dates
- detected_category
- otp_detected
- created_at
- updated_at

The system should avoid unnecessarily duplicating entire email contents when Gmail remains the source of truth.

## Email Activities Table

Stores important application activity.

Examples:

- summarized
- reply generated
- reply sent
- email archived
- email deleted
- priority detected
- action extracted

Possible fields:

- id
- user_id
- email_id
- activity_type
- description
- metadata
- created_at

## Calendar Tasks Table

Reserved for the optional calendar/task feature.

Possible fields:

- id
- user_id
- source_email_id
- title
- description
- date
- time
- source_link
- calendar_provider
- status
- user_confirmed
- created_at
- updated_at

## Database Requirements

The database must provide:

- Proper table structure.
- Appropriate primary keys.
- Foreign-key relationships where required.
- Data validation.
- CRUD operations where applicable.
- User-data isolation.
- Appropriate indexes for frequently queried fields.

Supabase Row Level Security should be considered where appropriate, especially for data that may be accessed through Supabase client-side functionality.

---

# 12. API Endpoints

## Health

GET /api/health

Returns backend health information.

## Authentication

POST /api/auth/register

Register a user.

POST /api/auth/login

Authenticate a user.

POST /api/auth/logout

End the application session where applicable.

GET /api/auth/me

Return the authenticated user's profile.

## Gmail OAuth

GET /api/integrations/gmail/oauth/start

Start Gmail OAuth.

GET /api/integrations/gmail/oauth/callback

Handle Google's OAuth callback.

GET /api/integrations/gmail/status

Return Gmail connection status.

POST /api/integrations/gmail/reconnect

Initiate reconnection when appropriate.

## Emails

GET /api/emails

Return emails for the authenticated user.

GET /api/emails/:id

Return an email and relevant thread information.

GET /api/emails/search

Search emails.

POST /api/emails/:id/read

Mark an email as read.

POST /api/emails/:id/unread

Mark an email as unread.

POST /api/emails/:id/star

Star an email.

POST /api/emails/:id/unstar

Remove star.

POST /api/emails/:id/archive

Archive an email.

DELETE /api/emails/:id

Delete an email.

## AI

POST /api/ai/summarize/:emailId

Generate an AI summary.

POST /api/ai/reply/:emailId

Generate an AI reply.

POST /api/ai/explain/:emailId

Explain an email.

POST /api/ai/rewrite

Rewrite an email using the requested tone.

## Sending

POST /api/emails/send

Send a composed email.

POST /api/emails/:id/reply

Send a reply to an email.

## Dashboard

GET /api/dashboard

Return dashboard information including:

- Today's priorities.
- Yesterday's summary.
- Upcoming activities.
- Relevant counts.

GET /api/dashboard/priorities

Return detected priority items.

GET /api/dashboard/summary

Return the previous day's AI-generated summary.

GET /api/dashboard/upcoming

Return upcoming activities.

## OTP

GET /api/emails/otp

Return emails detected as OTP/verification messages.

## Activity

GET /api/activity

Return email and AI activity history.

## Calendar — Optional

GET /api/calendar/tasks

Return extracted calendar/task items.

POST /api/calendar/tasks/:id/confirm

Confirm an extracted activity.

POST /api/calendar/tasks/:id/create

Create the confirmed calendar event.

---

# 13. Folder Structure

The implementation should use a clear separation between frontend and backend.

## Frontend

client/
└── src/
    ├── components/
    │   ├── Layout/
    │   ├── Sidebar/
    │   ├── Header/
    │   ├── Dashboard/
    │   ├── PriorityPanel/
    │   ├── DailySummary/
    │   ├── UpcomingActivities/
    │   ├── EmailList/
    │   ├── EmailItem/
    │   ├── EmailThread/
    │   ├── EmailViewer/
    │   ├── ReplyComposer/
    │   ├── ComposeEmail/
    │   ├── OTPSection/
    │   └── ProtectedRoute/
    │
    ├── pages/
    │   ├── index.js
    │   ├── login.js
    │   ├── register.js
    │   ├── dashboard.js
    │   ├── inbox.js
    │   ├── compose.js
    │   ├── sent.js
    │   ├── drafts.js
    │   ├── starred.js
    │   ├── important.js
    │   ├── spam.js
    │   ├── trash.js
    │   ├── otp.js
    │   ├── activity.js
    │   ├── integrations.js
    │   ├── calendar.js
    │   ├── settings.js
    │   └── email/
    │       └── [id].js
    │
    ├── store/
    │   ├── authStore.js
    │   └── emailStore.js
    │
    ├── services/
    │   └── api.js
    │
    └── utils/

## Backend

server/
└── src/
    ├── config/
    │   ├── env.js
    │   └── supabase.js
    │
    ├── routes/
    │   ├── authRoutes.js
    │   ├── emailRoutes.js
    │   ├── aiRoutes.js
    │   ├── dashboardRoutes.js
    │   ├── integrationRoutes.js
    │   ├── activityRoutes.js
    │   └── calendarRoutes.js
    │
    ├── controllers/
    │   ├── authController.js
    │   ├── emailController.js
    │   ├── aiController.js
    │   ├── dashboardController.js
    │   ├── integrationController.js
    │   └── activityController.js
    │
    ├── services/
    │   ├── authService.js
    │   ├── gmailService.js
    │   ├── emailService.js
    │   ├── aiService.js
    │   ├── dashboardService.js
    │   ├── priorityService.js
    │   ├── activityService.js
    │   └── integrationService.js
    │
    ├── agents/
    │   ├── emailUnderstandingAgent.js
    │   ├── priorityActionAgent.js
    │   ├── responseAgent.js
    │   ├── validationAgent.js
    │   └── monitoringAgent.js
    │
    ├── integrations/
    │   ├── baseIntegration.js
    │   └── gmailIntegration.js
    │
    ├── middleware/
    │   ├── auth.js
    │   ├── validation.js
    │   └── errorHandler.js
    │
    └── app.js

---

# 14. Development Phases

The project must be developed incrementally.

## Phase 1 — Project Foundation

Implement:

- Frontend setup.
- Backend setup.
- Environment configuration.
- Supabase project/database connection.
- Basic application layout.
- Authentication.
- Protected routes.
- Basic dashboard shell.

At the end of this phase, the application should start correctly and users should be able to register and log in.

## Phase 2 — Gmail OAuth and Email Integration

Implement:

- Google OAuth.
- Gmail connection.
- Token handling.
- Gmail API integration.
- Inbox.
- Email list.
- Email viewer.
- Threads.
- Search.
- Basic email management.

At the end of this phase, the application must be able to display and manage real Gmail data.

## Phase 3 — Core AI Features

Implement:

- AI summarization.
- AI-generated replies.
- Reply editing.
- Email explanation.
- AI email classification where practical.
- AI processing service.

At the end of this phase, the assistant must provide useful AI functionality on real emails.

## Phase 4 — Intelligent Dashboard

Implement:

- Today's priorities.
- Priority detection.
- Action-item extraction.
- Date/deadline extraction.
- Yesterday's email summary.
- Upcoming activities.
- Direct navigation from dashboard items.
- Relevant source-email links.
- OTP detection and OTP section.

At the end of this phase, the application should feel like an intelligent assistant rather than only a Gmail clone.

## Phase 5 — Email Composition and Activity

Implement:

- Compose email.
- Send email.
- Reply sending.
- Email activity/history.
- AI activity tracking.
- Error states.
- Loading states.
- Empty states.

## Phase 6 — Optional Advanced Features

Only after all mandatory features are working:

- Google Calendar integration.
- Calendar/task confirmation workflow.
- Smart AI email search.
- Additional AI categorization.
- Tone controls.
- Bulk email management.
- Other selected bonus features if time permits.

## Phase 7 — Security, Testing and Deployment

Implement and verify:

- Production environment variables.
- OAuth configuration.
- Secret protection.
- Authentication security.
- API validation.
- Error handling.
- Frontend/backend production configuration.
- Vercel frontend deployment.
- Render backend deployment.
- Supabase production database configuration.
- End-to-end testing.

The final application must be deployed and functional.

---

# 15. UI and UX Requirements

## Design Principle

The application should feel immediately familiar to users who already know Gmail.

The application should not unnecessarily redesign the standard email experience.

The primary innovation should come from the intelligent dashboard and AI-assisted features.

## Layout

The main application layout should contain:

- Left sidebar for navigation.
- Top header/search area.
- Main content area.
- Responsive behavior for smaller screens.

## Dashboard

The dashboard should prioritize information rather than visual decoration.

It should contain:

1. Today's priorities.
2. Yesterday's email summary.
3. Upcoming activities.

The dashboard should avoid overwhelming the user with too much information at once.

## Priority Colors

Priority indicators should communicate urgency:

- Red = urgent/today.
- Yellow = approaching.
- Blue = future/non-urgent.

The visual urgency may become more intense as deadlines approach.

## Familiar Email Interface

Inbox and email pages should follow familiar email UI patterns:

- Sender-focused email list.
- Clear timestamps.
- Read/unread distinction.
- Familiar navigation.
- Search.
- Thread view.
- Action controls.

## AI Transparency

AI-generated content must be clearly identified.

The user must know when content is:

- AI-generated.
- AI-summarized.
- AI-extracted.
- User-written.

AI-generated replies must always be editable before sending.

## Loading and Error States

The frontend must provide clear:

- Loading states.
- Empty states.
- Error states.
- OAuth connection errors.
- AI generation errors.
- Expired-session states.

## Responsive Design

The application must work across:

- Desktop.
- Tablet.
- Mobile-sized screens.

---

# 16. Security Requirements

Security is a mandatory part of the project.

## Gmail Password

The application must NEVER ask users for their Gmail password.

Gmail authentication and access must use Google OAuth.

## Secrets

The following must never be exposed in frontend code:

- Gmail OAuth client secret.
- Gemini API key.
- JWT secret.
- Database credentials.
- OAuth access tokens.
- OAuth refresh tokens.
- Supabase service-role key.

## Environment Variables

All sensitive credentials must be stored in environment variables.

A `.env` file must never be committed to GitHub.

A `.env.example` file may contain variable names but must never contain real credentials.

## Supabase

The Supabase URL and public/anon key may be used where appropriate for client-side Supabase functionality.

The Supabase service-role key is sensitive and must remain on the backend only.

The frontend must never receive or expose the service-role key.

## OAuth Tokens

Access and refresh tokens must be protected on the backend.

Tokens must never be returned unnecessarily to the frontend.

OAuth credentials stored in Supabase must be encrypted or otherwise securely protected.

## Passwords

Application passwords must be hashed using bcrypt before storage.

Plain-text passwords must never be stored.

## Authentication

Protected API endpoints must verify the authenticated user.

A user must only be able to access their own email-related application data.

## Input Validation

API request inputs must be validated before processing.

## HTTP Security

The backend should use:

- Helmet.
- Appropriate CORS configuration.
- Secure session/token practices.
- Rate limiting for authentication endpoints where practical.

## Logging

Logs must never contain:

- Passwords.
- API keys.
- OAuth client secrets.
- Access tokens.
- Refresh tokens.
- Supabase service-role keys.

## AI Privacy

Email content sent to the AI provider should be limited to what is required for the requested AI operation.

The application should not expose another user's email content to an AI request.

## GitHub Safety

Before every Git commit:

- Verify `.gitignore`.
- Verify no `.env` file is included.
- Verify no API keys exist in source code.
- Verify no OAuth secrets exist in source code.
- Verify no Supabase service-role key exists in source code.

---

# 17. Deployment Requirements

## Source Code

The project must be maintained in a GitHub repository.

The repository should contain:

- frontend/
- backend/
- README.md
- .gitignore

The repository must not contain:

- Database passwords.
- API keys.
- Secret keys.
- `.env` files.
- Authentication secrets.
- OAuth private credentials.
- Supabase service-role keys.

## Frontend Deployment

The frontend must be deployed using Vercel.

The frontend must communicate with the deployed Render backend using an environment variable such as:

NEXT_PUBLIC_API_URL

The backend URL must not be hardcoded throughout the application.

## Backend Deployment

The backend must be deployed using Render.

The backend must use the port supplied by Render:

process.env.PORT || 5000

The backend must contain all required production environment variables in Render's environment-variable configuration.

## Database

Supabase must host the production PostgreSQL database.

The backend must connect to Supabase using secure environment variables.

## CORS

The backend must allow requests from the deployed Vercel frontend.

The allowed frontend origin should be configured through an environment variable such as:

CLIENT_URL

Production CORS should not unnecessarily allow all origins.

## Deployment Verification

After deployment:

1. Test the Render backend.
2. Verify Supabase database connectivity.
3. Verify authentication.
4. Verify Gmail OAuth.
5. Verify Vercel frontend communication with Render.
6. Verify AI functionality.
7. Verify email retrieval.
8. Verify email sending.
9. Verify no secrets are exposed.

---

# 18. Final Expected Outcome

The completed Intelligent Email Assistant must provide a working deployed application that:

1. Allows a user to create an application account.
2. Allows the user to securely connect Gmail through OAuth.
3. Displays a familiar Gmail-style inbox.
4. Allows users to view and read emails.
5. Supports email threads.
6. Supports email search.
7. Supports basic email management.
8. Summarizes emails using AI.
9. Generates AI-powered replies.
10. Allows users to edit AI-generated replies.
11. Allows users to compose emails.
12. Allows users to send emails.
13. Maintains relevant email/activity history.
14. Detects useful priorities from email content.
15. Shows today's important activities.
16. Generates a useful summary of yesterday's email activity.
17. Detects upcoming activities, deadlines, and action items.
18. Provides direct navigation from detected activities to relevant information.
19. Detects OTP/verification emails and provides a dedicated OTP view.
20. Protects user credentials and Gmail OAuth credentials.
21. Keeps all sensitive configuration outside frontend code and source control.
22. Uses Supabase PostgreSQL for persistent application data.
23. Uses Vercel for frontend deployment.
24. Uses Render for backend deployment.
25. Provides a responsive and familiar user interface.
26. Provides proper frontend/backend/database integration.
27. Is tested and deployed as a working application.

The application should feel like:

"Familiar Gmail + an intelligent AI assistant that understands what matters."

---

# 19. Codex Implementation Instructions

Codex must implement the application phase by phase.

The coding agent must:

1. Read and follow this specification before implementing features.
2. Build only the current development phase unless explicitly instructed to continue.
3. Preserve the defined architecture and folder structure.
4. Keep controllers thin.
5. Keep business logic inside services.
6. Keep AI responsibilities separated into appropriate agents/services.
7. Keep Gmail API access inside the Gmail integration/service layer.
8. Keep Supabase database access inside appropriate backend services/data-access functions.
9. Never expose secrets to frontend code.
10. Never hardcode API keys, OAuth secrets, JWT secrets, database credentials, or Supabase service-role keys.
11. Use environment variables for all secrets.
12. Never request or store a user's Gmail password.
13. Use Gmail OAuth for Gmail authorization.
14. Validate API inputs.
15. Handle Gmail authentication failures clearly.
16. Handle AI API failures clearly.
17. Keep user data isolated between accounts.
18. Avoid unnecessary duplication of Gmail data.
19. Make AI-generated replies editable before sending.
20. Preserve source-email references for AI-generated summaries and extracted activities.
21. Make dashboard insights traceable to their source emails.
22. Do not implement optional calendar functionality before the core mandatory features are complete.
23. Do not introduce unnecessary third-party packages when existing dependencies are sufficient.
24. Keep the application runnable after every development phase.
25. Test the current phase before moving to the next phase.
26. Never introduce MongoDB or Mongoose into the project.
27. Use Supabase PostgreSQL as the project's database.
28. At the end of every phase, report:
    - Files created.
    - Files modified.
    - Features implemented.
    - Tests/checks performed.
    - Known limitations.
    - Environment variables required.

Codex must not silently remove, replace, or weaken a required feature.

If a requirement is technically blocked by an external service configuration such as Gmail OAuth credentials, Codex must clearly report the blocker instead of replacing the required functionality with a fake implementation.

---

# 20. Requirement Priority

## Mandatory

All Must-Have features from the Intelligent Email Assistant project requirements:

- Gmail/email OAuth connection.
- Secure authentication.
- Email dashboard/inbox.
- View/read emails.
- Email threads.
- Email search.
- Mark read/unread.
- Star.
- Archive.
- Delete.
- AI email summarization.
- AI-generated replies.
- Reply editing.
- Email composition.
- Email sending.
- Email history/activity.
- Backend API integration.
- Environment variable configuration.
- Proper security practices.
- Working frontend-backend integration.
- Supabase database integration.
- Working deployed application.

## Selected Bonus Features

- AI email classification.
- Automatic priority detection.
- Important email detection where practical.
- Tone selection.
- Grammar correction/email rewriting.
- Explain This Email.
- Extract action items.
- Extract dates and deadlines.
- Calendar integration.
- Smart AI email search.
- AI-based email categorization.
- Daily email summary.
- AI-powered inbox prioritization.
- OTP detection and dedicated OTP section.

## Deferred / Optional

Calendar integration and additional advanced features must not delay completion of the mandatory requirements.

---

# 21. Definition of Done

The project is considered complete only when:

- The application runs successfully.
- Authentication works.
- Gmail OAuth works.
- Real Gmail data can be retrieved.
- Emails can be viewed and managed.
- AI summarization works.
- AI reply generation works.
- AI replies can be edited before sending.
- Emails can be composed and sent.
- Dashboard intelligence works.
- Email activity/history works.
- OTP detection/view works if included in the selected bonus scope.
- Required security practices are implemented.
- No secrets are committed to GitHub.
- Supabase database integration works.
- Frontend and backend communicate correctly.
- Frontend is deployed on Vercel.
- Backend is deployed on Render.
- Database is hosted on Supabase.
- The deployed application can demonstrate the core workflow end-to-end.