# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo for Glo, an AI-powered chat assistant integrated into Mastermind.com. The project consists of two main applications:

- **Glo** (Frontend): Next.js 13 application with Prisma, Chakra UI, and real-time chat functionality
- **glo-backend** (Backend): Node.js/Express server with Socket.io for WebSocket support and OpenAI integration

## Architecture

### Frontend (Glo/)
- **Framework**: Next.js 13.2.4 with React 18.2.0
- **Database ORM**: Prisma with MySQL
- **Authentication**: NextAuth with JWT tokens (15-min access, 30-day refresh)
- **UI Components**: Chakra UI + Tailwind CSS
- **Real-time**: Socket.io client
- **Key directories**:
  - `pages/` - Next.js pages including API routes
  - `src/components/` - Reusable React components
  - `prisma/` - Database schema and migrations
  - `providers/auth/` - Authentication context and hooks

### Backend (glo-backend/)
- **Server**: Express with Socket.io
- **Main files**:
  - `server/server.js` - Main server entry point
  - `server/chatStream.js` - OpenAI streaming chat implementation
- **Real-time**: Socket.io server for chat functionality

## Development Commands

### Frontend (Glo/)
```bash
cd Glo
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npx prisma generate  # Generate Prisma client
npx prisma migrate deploy  # Apply database migrations
npx prisma db seed   # Seed database with initial data
```

### Backend (glo-backend/)
```bash
cd glo-backend
npm install     # Install dependencies
npm run dev     # Start with nodemon (auto-reload)
npm start       # Start production server
```

### Artillery Load Testing (Backend)
```bash
npm i -g artillery
artillery run test.yaml --output result.json
artillery report result.json
```

## Database Management

The project uses Prisma with MySQL. Key models include:
- User (with Role: ADMIN/USER)
- Conversation
- Message
- Prompt (system prompts)
- UserPrompt (user-defined prompts)
- Account (OAuth providers)

Database commands:
```bash
npx prisma generate          # Generate Prisma client
npx prisma migrate reset     # Reset database (dev only)
npx prisma migrate deploy    # Deploy migrations
npx prisma db seed          # Run seeder (required for initial prompts)
```

## Authentication Flow

1. User submits email/password to `/api/login`
2. Server generates JWT access token (15 min) and refresh token (30 days)
3. Two-factor authentication via email OTP
4. User validates OTP at `/api/two-factor?token=<token>`
5. Access token stored in "token" cookie
6. Auto-refresh handled by `useAuth` hook

## Environment Variables

Both applications require `.env` files with:
- `DATABASE_URL` - MySQL connection string
- `APP_URL` - Application URL for JWT issuer
- OpenAI API credentials
- NextAuth configuration
- SMTP settings for email

## Deployment Notes

For Heroku deployment:
```bash
heroku features:enable http-session-affinity -a glo
heroku builds:cache:purge --app glo  # If build issues occur
```

Post-deployment database setup is required (see Database Management section).

## Key Considerations

- Node.js LTS version 18.16.x is required
- The app requires seeded prompt data to function properly
- JWT tokens include user information for validation
- Middleware protects routes by checking access token cookies
- Two-factor authentication is mandatory for login completion