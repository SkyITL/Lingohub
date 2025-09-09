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
- `npm run lint` - Lint frontend code (in frontend directory)
- `npm run type-check` - Check TypeScript types (in frontend directory)

### Database Operations
- `cd backend && npm run migrate` - Run Prisma migrations
- `cd backend && npm run migrate:dev` - Create new migration from schema changes
- `cd backend && npm run db:generate` - Generate Prisma client
- `cd backend && npm run db:seed` - Seed database with sample data
- `cd backend && npm run db:push` - Push schema changes without migration (dev only)

## Architecture Overview

### Monorepo Structure
This is a monorepo with three main packages:
- **frontend/**: Next.js 14 app with TypeScript and Tailwind CSS
- **backend/**: Express.js API server with Prisma ORM
- **shared/**: Common TypeScript types used by both frontend and backend

### Technology Stack
- **Frontend**: Next.js 14, React 19, TypeScript, Tailwind CSS, Radix UI, React Query
- **Backend**: Express.js, TypeScript, Prisma ORM, PostgreSQL, JWT authentication
- **Database**: PostgreSQL with Prisma schema

### Database Schema
Key models include:
- `User` - User accounts with rating system
- `Problem` - Linguistics olympiad problems with difficulty ratings
- `Solution` - User-submitted solutions with voting
- `Discussion` - Problem-specific discussion threads
- `UserProgress` - Tracks user's progress on problems

### API Architecture
RESTful API with routes organized by feature:
- `/api/auth/*` - Authentication (login, register)
- `/api/problems/*` - Problem CRUD and filtering
- `/api/users/*` - User profiles and progress
- `/api/solutions/*` - Solution submissions and voting
- `/api/discussions/*` - Discussion threads

### Frontend Architecture
Next.js App Router with:
- Page components in `src/app/*/page.tsx`
- Reusable UI components in `src/components/`
- API client in `src/lib/api.ts`
- Auth context in `src/contexts/AuthContext.tsx`
- React Query for server state management
- Static export configuration in `next.config.mjs`

## Key Features

### Linguistics-Specific Requirements
- IPA (International Phonetic Alphabet) font support using Charis SIL
- Complex table handling for linguistic data
- Problem difficulty rating system (1-5 stars, 1000-2400 complexity)
- Specialized filtering by linguistic subfields (phonology, morphology, etc.)

### Performance Optimizations
- Sub-1 second page load target
- Server-side rendering for SEO
- React Query for API caching
- Responsive design with mobile-first approach

## Development Guidelines

### Working with Problems
Problems have a specific format:
- Unique number (LH-001 format)
- Source (IOL, APLO, NACLO, UKLO)
- Year and difficulty ratings
- Markdown content with IPA support
- Official solutions (spoiler-protected)

### Authentication Flow
- JWT-based authentication
- User registration/login via `/api/auth/*`
- Protected routes use middleware in `backend/src/middleware/auth.ts`
- Frontend auth state managed via AuthContext

### Database Migrations
- Use `prisma migrate dev` for schema changes
- Always generate client after schema updates
- Seed data available via `db:seed` script

## Important Notes

- PostgreSQL database required (default: "lingohub" database)
- Frontend expects API at http://localhost:4000
- Shared types in `shared/types.ts` must be kept in sync between frontend/backend
- IPA content requires proper font loading for correct rendering
- Environment variables needed in backend/.env:
  - DATABASE_URL="postgresql://user:password@localhost:5432/lingohub"
  - JWT_SECRET and JWT_REFRESH_SECRET for authentication
- CORS is configured to allow credentials from localhost:3000