# ReachInbox Hiring Assignment – Full-stack Email Job Scheduler

## Architecture Overview
This is a production-grade full-stack Email Scheduling System that simulates how a cold email platform queues, schedules, and sends emails reliably.
- **Frontend**: Next.js (App router), Tailwind CSS, React.
- **Backend**: Express.js, TypeScript.
- **Database**: PostgreSQL (using Prisma ORM).
- **Queue/Workers**: BullMQ with Redis for persistence, delayed jobs, and reliable queuing without cron jobs.
- **Email Delivery**: Ethereal Email for fake SMTP testing.
- **Auth**: Google OAuth using Passport.js and express-session.

## Persistence Strategy
The system handles restarts gracefully by:
1. **Database-first storage**: Every scheduled email is stored as an `EmailJob` in PostgreSQL.
2. **Redis-backed Queues**: BullMQ delayed jobs are persistent in Redis.
3. **Idempotency**: When a job is added to the queue, the `jobId` from the DB is passed as the BullMQ jobId to prevent duplicates.
4. **Resiliency**: If the server crashes, Redis holds the delayed jobs and processes them at the exact intended time when the worker restarts. No emails are re-sent from scratch.

## Concurrency Strategy
- Concurrency is configurable via `WORKER_CONCURRENCY` in `.env` (e.g., 5).
- BullMQ naturally supports parallel processing. We instantiate the Worker with the specified concurrency level, allowing multiple Ethereal SMTP transactions simultaneously while maintaining isolation.

## Rate Limiting Strategy
We implement a two-layer throttling mechanism to mimic SMTP providers:
1. **Minimum Delay**: Artificial `MIN_DELAY_BETWEEN_EMAILS` (e.g., 2000ms) within the worker using a standard Promise timeout.
2. **Hourly Limit**: Handled via Redis atomic counters (`INCR`, `EXPIRE`). We key the counter by the current hour. If the worker encounters a job that exceeds `MAX_EMAILS_PER_HOUR`, it intercepts the execution, decrements the counter, and uses BullMQ's `job.moveToDelayed()` to reschedule the job safely to the next hour window without dropping it or permanently failing it.

## Features Implemented
### Backend
- Scheduler API using BullMQ delayed jobs.
- PostgreSQL database integration via Prisma.
- Robust persistence avoiding cron jobs completely.
- Concurrency and precise hourly rate-limiting with Redis.
- Real Google OAuth authentication.

### Frontend
- Clean Google Auth Login Page.
- Dashboard with clear tabs for Scheduled and Sent Emails.
- Modal to Compose Campaigns.
- CSV Upload functionality to parse recipients.
- Inputs for scheduling time, delay, and limits.

---

## How to Run

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose (for PostgreSQL and Redis)
- Google OAuth Credentials (Client ID & Secret)

### 1. Setup Infrastructure
Start the Redis and PostgreSQL containers:
```bash
docker-compose up -d
```

### 2. Backend Setup
1. Open terminal and navigate to backend:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the `.env` file (A sample is provided inside the `backend` folder). You **MUST** fill in:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - Create an Ethereal account (https://ethereal.email/create) and update `ETHEREAL_USER` and `ETHEREAL_PASS`.
4. Apply Database migrations:
   ```bash
   npx prisma db push
   ```
5. Start the backend server & worker:
   ```bash
   npm run dev
   ```
   (The server will run on `http://localhost:5000` and start processing BullMQ jobs).

### 3. Frontend Setup
1. Open a new terminal and navigate to frontend:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Next.js app:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` in your browser.

## Assumptions & Trade-offs
- Rate limiting is currently implemented globally per hour using Redis for demonstration, though the logic is easily adjustable per sender by adding `senderId` to the Redis key.
- Since we are using Next.js with Client Components (`use client`), API calls rely on direct fetches.
