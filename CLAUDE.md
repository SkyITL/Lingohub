### Claude Code 从荣八耻
以瞎猜接口为耻，以认真查询为荣
以模糊执行为耻，以寻求确认为荣
以臆想业务为耻，以人类确认为荣
以创造接口为耻，以复用现有为荣
以跳过验证为耻，以主动测试为荣
以破坏架构为耻，以遵循规范为荣
以假装理解为耻，以诚实无知为荣
以盲目修改为耻，以谨慎重构为荣

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Quick Start
- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Frontend only (Next.js on port 3000)
- `npm run dev:backend` - Backend only (Express API on port 4000)

### Build and Test
- `npm run build` - Build all packages (shared, frontend, backend)
- `npm test` - Run all tests
- `npm run lint` - Lint frontend code (run from frontend directory)
- `npm run type-check` - Check TypeScript types (doesn't exist, use tsc in respective dirs)

### Database Operations
- `cd backend && npm run migrate` - Create new migration from schema changes
- `cd backend && npm run migrate:deploy` - Deploy migrations to production
- `cd backend && npm run db:generate` - Generate Prisma client after schema changes
- `cd backend && npm run db:seed` - Seed database with sample data
- `cd backend && npm run db:push` - Push schema changes without migration (dev only)

### Frontend-Specific
- `cd frontend && npm run generate-problems` - Generate problem pages

## Architecture Overview

### Monorepo Structure
This is a monorepo with three main packages:
- **frontend/**: Next.js 15 app with TypeScript and Tailwind CSS
- **backend/**: Express.js API server with Prisma ORM
- **shared/**: Common TypeScript types used by both frontend and backend

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

### Frontend Architecture
Next.js App Router with:
- Page components in `src/app/*/page.tsx`
- Reusable UI components in `src/components/`
- API client in `src/lib/api.ts` using axios with interceptors
- Auth context in `src/contexts/AuthContext.tsx`
- React Query provider in `src/providers/QueryProvider.tsx`
- Static problem pages generated via script

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

### Database Migrations
- Always use `npm run db:generate` after modifying schema.prisma
- Use `npm run migrate` for development migrations
- Use `npm run migrate:deploy` for production deployments
- Seed data available via `npm run db:seed` script

## Important Notes

- PostgreSQL database required (default: "lingohub" database on port 5432)
- Frontend expects API at http://localhost:4000 (configurable via NEXT_PUBLIC_API_URL)
- Shared types in `shared/types.ts` must be kept in sync between frontend/backend
- IPA content requires proper font loading for correct rendering
- Environment variables needed in backend/.env:
  - DATABASE_URL="postgresql://user:password@localhost:5432/lingohub"
  - JWT_SECRET (for access tokens)
  - JWT_REFRESH_SECRET (for refresh tokens)
- CORS is configured to allow credentials from localhost:3000
- ESLint and TypeScript errors are ignored during builds (see next.config.ts)

## Deployment Notes (Vercel)

### Known Issues
- **Solution Submission Error**: When deployed on Vercel, users may see "Failed to submit solution. The backend API may not be running" error
  - This occurs when the backend API is not properly deployed or configured
  - The frontend tries to call `/api/solutions` endpoint (see `solutionsApi.submit` in `frontend/src/lib/api.ts:76`)
  - Error handling is in `frontend/src/components/ProblemPageTemplate.tsx:284` and `frontend/src/app/problems/[id]/page.tsx:220`

### Vercel Configuration Requirements
- **Frontend**: Deployed as a Next.js app on Vercel
- **Backend**: Needs separate deployment (Vercel Functions or separate service)
- **Environment Variables** (must be set in Vercel dashboard):
  - `NEXT_PUBLIC_API_URL`: Backend API URL (e.g., `https://your-backend-url.vercel.app`)
  - `DATABASE_URL`: PostgreSQL connection string (Vercel Postgres or external DB)
  - `JWT_SECRET` and `JWT_REFRESH_SECRET`: Authentication secrets

### Debugging Production Issues
- Check browser console for API URL being used (debug logging in `frontend/src/lib/api.ts:8-10`)
- Verify backend is deployed and accessible at the configured URL
- Ensure CORS settings allow requests from production frontend domain