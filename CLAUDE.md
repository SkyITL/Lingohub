### Claude Code Development Principles (从荣八耻)
**IMPORTANT - Follow these principles strictly:**
1. ❌ Never guess API interfaces → ✅ Always verify by reading code
2. ❌ Never execute vaguely → ✅ Always seek confirmation when unclear
3. ❌ Never assume business logic → ✅ Always confirm with humans
4. ❌ Never create new interfaces → ✅ Always reuse existing ones
5. ❌ Never skip validation → ✅ Always test proactively
6. ❌ Never break architecture → ✅ Always follow established patterns
7. ❌ Never pretend to understand → ✅ Always admit when uncertain
8. ❌ Never blindly refactor → ✅ Always refactor cautiously

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Quick Start
- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Frontend only (Next.js on port 3000)
- `npm run dev:backend` - Backend only (Express API on port 4000)

### Build and Test
- `npm run build` - Build all packages in order: shared → frontend → backend
  - Builds shared types package first (required for frontend/backend)
  - Then builds frontend and backend in parallel
- `npm test` - Run all tests across frontend and backend
- `cd frontend && npm run lint` - Lint frontend code
- `cd backend && npm run build` - Build backend (Prisma generate only)
- `cd backend && npm run vercel-build` - Full backend build (Prisma + TypeScript compile)

### Database Operations
- `cd backend && npm run migrate` - Create new migration from schema changes
- `cd backend && npm run migrate:deploy` - Deploy migrations to production
- `cd backend && npm run db:generate` - Generate Prisma client after schema changes
- `cd backend && npm run db:seed` - Seed database with sample data
- `cd backend && npm run db:push` - Push schema changes without migration (dev only)

### Frontend-Specific
- `cd frontend && npm run generate-problems` - Generate static problem pages from problems.json
  - Reads `frontend/src/data/problems.json`
  - Creates page components in `frontend/src/app/problems/[number]/page.tsx`
  - Uses `ProblemPageTemplate` component for rendering

## Architecture Overview

### Monorepo Structure
This is a monorepo with three main packages:
- **frontend/**: Next.js 15 app with TypeScript and Tailwind CSS
- **backend/**: Express.js API server with Prisma ORM
- **shared/**: Common TypeScript types used by both frontend and backend
  - **CRITICAL**: `shared/types.ts` must stay in sync between frontend/backend
  - Contains all interface definitions (User, Problem, Solution, Discussion, etc.)
  - Both packages import from `shared/types` for type safety
  - Any API contract changes require updating shared types first

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, Radix UI, React Query
- **Backend**: Express.js, TypeScript, Prisma ORM, PostgreSQL, JWT authentication
- **Database**: PostgreSQL with Prisma schema

### Database Schema
Key models include:
- `User` - User accounts with rating system (default 1200)
- `Problem` - Linguistics olympiad problems with difficulty ratings (1-5 stars, 1000-2400 complexity)
- `Solution` - User-submitted solutions with voting system
- `Discussion` - Problem-specific discussion threads
- `UserProgress` - Tracks user's progress on problems
- `SolutionVote`, `DiscussionReply` - Supporting models for community features

### API Architecture
RESTful API with routes organized by feature:
- `/api/auth/*` - Authentication endpoints (login, register, refresh, logout)
- `/api/problems/*` - Problem CRUD and filtering
- `/api/users/*` - User profiles and progress tracking
- `/api/solutions/*` - Solution submissions and voting
- `/api/seed` - Database seeding endpoint
- `/api/admin/*` - Admin operations (delete all solutions, etc.)

### Frontend Architecture
Next.js App Router with:
- Page components in `src/app/*/page.tsx`
- Reusable UI components in `src/components/`
- API client in `src/lib/api.ts` using axios with interceptors
  - Automatic token injection from localStorage (`lingohub_token`)
  - Auto-redirect to login on 401 errors
  - Smart API URL detection (env var → production → localhost:4000)
  - Comprehensive request/response logging via logger
- Auth context in `src/contexts/AuthContext.tsx`
- React Query provider in `src/providers/QueryProvider.tsx`
- Static problem pages generated via script (optional performance optimization)

## Key Features

### Linguistics-Specific Requirements
- IPA (International Phonetic Alphabet) font support using Charis SIL
- Complex table handling for linguistic data structures
- Problem difficulty rating system (1-5 stars visual, 1000-2400 complexity rating)
- Specialized filtering by linguistic subfields (phonology, morphology, syntax, etc.)
- Markdown support for problem content with linguistic symbols

### Performance Optimizations
- Sub-1 second page load target
- Server-side rendering for SEO
- React Query for API response caching
- Responsive design with mobile-first approach
- TypeScript build errors ignored in production for faster builds

## Development Guidelines

### Working with Problems
Problems have a specific format:
- Unique number (LH-XXX format, e.g., LH-001)
- Source (IOL, APLO, NACLO, UKLO)
- Year and difficulty ratings
- Markdown content with IPA support
- Official solutions (spoiler-protected)

### Authentication Flow
- JWT-based authentication with access and refresh tokens
- User registration/login via `/api/auth/*`
- Protected routes use middleware in `backend/src/middleware/auth.ts`
- Frontend auth state managed via AuthContext
- Token stored in localStorage as `lingohub_token`

### Database Migrations and Prisma Workflow
**IMPORTANT**: Follow this exact workflow when changing the database schema:

1. **Edit schema**: Modify `backend/prisma/schema.prisma`
2. **Generate client**: `cd backend && npm run db:generate` (regenerates Prisma Client)
3. **Create migration** (production path):
   - `cd backend && npm run migrate` (creates migration file)
   - Commit the migration file to git
   - Deploy with `npm run migrate:deploy`
4. **Or push directly** (dev only):
   - `cd backend && npm run db:push` (skips migration files)
   - **Never use in production** - no migration history

**After schema changes:**
- Always run `db:generate` to update TypeScript types
- Backend will have type errors until you regenerate
- Frontend uses `shared/types.ts`, not Prisma types directly

**Seeding:**
- `cd backend && npm run db:seed` - runs `src/scripts/seed.ts`
- Idempotent - safe to run multiple times
- Creates/updates problems from `src/data/problems.ts`

## Admin Operations

### Delete All Solutions
To delete all solutions from the production database:
```bash
# You need to be logged in and have a valid token
curl -X DELETE https://lingohub-backend.vercel.app/api/admin/solutions/all \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Reseed Production Database
The seed endpoint is **idempotent** - safe to run multiple times. It will:
- Create new problems that don't exist
- Update existing problems with latest data
- Never create duplicates

**When to run:**
- After adding new problems to `backend/src/data/problems.ts`
- When problems are missing from production (like LH-006)
- To update problem content or metadata

**How to run:**
```bash
# Using curl
curl -X POST https://lingohub-backend.vercel.app/api/seed/run

# Response will show:
# {
#   "success": true,
#   "message": "Database seeded successfully!",
#   "problems": {
#     "total": 10,
#     "created": 2,    # newly added problems
#     "updated": 8     # existing problems updated
#   }
# }
```

**Important:** All problem data is centralized in `backend/src/data/problems.ts`. When you add a new problem:
1. Add it to this file with the proper format (number, title, content, source, year, difficulty, rating, officialSolution)
2. Run the seed endpoint (production) or `npm run db:seed` (local)
3. Update `frontend/src/data/problems.json` manually (if using static pages)
4. Regenerate problem pages with `cd frontend && npm run generate-problems` (creates static page components)

**Problem Data Workflow:**
- `backend/src/data/problems.ts` is the **single source of truth**
- Problems are stored in PostgreSQL database via seeding
- Frontend can fetch from API (dynamic) or use static pages (faster)
- Static pages require manual regeneration when problems change

### Problem Scraping and Data Collection
The `olympiad-problems/` directory contains scraped problem data from various linguistics olympiads:
- **Sources**: IOL (ioling.org), NACLO (naclo.org), UKLO (uklo.org), APLO (aplo.asia)
- **Purpose**: Collect and parse problems to import into the LingoHub database
- **Scripts**: May include download and parsing scripts (e.g., `download-problems.sh`, `download-naclo.sh`)
- **Workflow**:
  1. Run scraping scripts to download problems from olympiad websites
  2. Parse the downloaded content (often HTML or PDF) into structured format
  3. Manually review and format problems into `backend/src/data/problems.ts`
  4. Run seeding script to import into database
- **Important**: This directory is untracked in git to avoid copyright issues

## Important Notes

- PostgreSQL database required (default: "lingohub" database on port 5432)
- Frontend expects API at http://localhost:4000 (configurable via NEXT_PUBLIC_API_URL)
- Shared types in `shared/types.ts` must be kept in sync between frontend/backend
  - The shared package is built separately and imported by both frontend and backend
  - Any changes to shared types require rebuilding the shared package
  - Run `npm run build:shared` from the root when types change
- IPA content requires proper font loading for correct rendering (Charis SIL font)
- Environment variables needed in backend/.env:
  - DATABASE_URL="postgresql://user:password@localhost:5432/lingohub"
  - JWT_SECRET (for access tokens)
  - JWT_REFRESH_SECRET (for refresh tokens)
- CORS is configured to allow credentials from localhost:3000
- ESLint and TypeScript errors are ignored during builds (see next.config.ts)
- `olympiad-problems/` directory contains scraped problem data from various olympiads (untracked in git)
  - Used for data collection and importing problems into the system
  - Scripts may exist for downloading and parsing problems from IOL, NACLO, UKLO, APLO

## Deployment Notes (Vercel)

### Known Issues
- **Solution Submission Error**: When deployed on Vercel, users may see "Failed to submit solution. The backend API may not be running" error
  - This occurs when the backend API is not properly deployed or configured
  - The frontend tries to call `/api/solutions` endpoint (see `solutionsApi.submit` in `frontend/src/lib/api.ts:76`)
  - Error handling is in `frontend/src/components/ProblemPageTemplate.tsx:284` and `frontend/src/app/problems/[id]/page.tsx:220`

### Vercel Configuration Requirements

#### Frontend Deployment
- **Platform**: Vercel (Next.js app)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Environment Variables** (set in Vercel dashboard):
  - `NEXT_PUBLIC_API_URL=https://lingohub-backend.vercel.app`

#### Backend Deployment
- **Platform**: Vercel (Serverless Functions)
- **Root Directory**: `backend`
- **Entry Point**: `backend/api/index.ts` (handler that wraps `src/server.ts`)
  - **CRITICAL**: The entry point MUST be at `backend/api/index.ts` for Vercel's serverless architecture
  - `api/index.ts` is the Vercel serverless function handler
  - It imports and wraps the Express app from `src/server.ts`
  - The Express app is exported as a default module from `src/server.ts`
  - Vercel automatically converts all Express routes to serverless functions
- **Build Command**: `npm run vercel-build` (runs `npx prisma generate && tsc`)
  - Generates Prisma Client from schema
  - Compiles TypeScript to JavaScript
  - Output goes to `dist/` directory
- **Environment Variables** (set in Vercel dashboard):
  - `DATABASE_URL`: PostgreSQL connection string (must use connection pooling for serverless, e.g., Supabase pooler or Neon)
  - `JWT_SECRET`: Secret for access tokens
  - `JWT_REFRESH_SECRET`: Secret for refresh tokens
  - `NODE_ENV`: production

#### Local Development Setup
For local development against production backend:
1. Create `frontend/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://lingohub-backend.vercel.app
   ```
2. Create `backend/.env` with database credentials and JWT secrets

### Debugging Production Issues
- **Login/API Errors**: Check browser console for API URL (debug logging in `frontend/src/lib/api.ts:8-10`)
- **"localhost:4000" errors**: Frontend is missing `NEXT_PUBLIC_API_URL` environment variable
- **404 errors**: Backend routes may not be deployed (check `backend/api/index.ts` imports full server)
- **CORS errors**: Verify CORS settings allow requests from frontend domain