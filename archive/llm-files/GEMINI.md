
# Project Overview

This is an RSVP application built with Next.js, Prisma, and Tailwind CSS. It allows users to RSVP to events and administrators to manage RSVPs. The application includes features like email notifications using Resend, data validation with Zod, and a database managed with Prisma.

## Technology Stack

- **Next.js 14.2.2**: Framework for frontend and backend.
- **React 18**: UI library for building components.
- **Tailwind CSS 3.4.1**: Utility-first CSS for responsive design.
- **Prisma 5.12.1**: ORM for database access.
- **Zod 3.22.4**: Schema validation for forms and API payloads.
- **Resend 3.2.0**: For sending emails.
- **React Hook Form 7.51.3**: For managing forms.

# Building and Running

- **Development:** `npm run dev`
- **Build:** `npm run build`
- **Start:** `npm run start`
- **Lint:** `npm run lint`
- **Prisma Migrate:** `npx prisma migrate dev`
- **Prisma Studio:** `npx prisma studio`

# Development Conventions

- **Project Structure:**
    - `src/app`: Next.js App Router pages and API routes.
    - `src/components`: Reusable UI components.
    - `src/lib`: Cross-cutting utilities like Prisma client and Zod schemas.
    - `prisma/`: Prisma schema and local SQLite database.
- **Coding Style:** TypeScript with 2-space indentation. Functional, server-first components are preferred.
- **Testing:** Jest and React Testing Library for UI testing. Vitest or Prisma Test Utils for library testing.
- **Commits:** Use Conventional Commits format (e.g., `feat(admin): add RSVP status filter`).
- **Environment:** Copy `.env.example` to `.env` and provide necessary secrets.
