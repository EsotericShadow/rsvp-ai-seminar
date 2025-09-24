# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js App Router pages and API routes; `admin`, `rsvp`, and nested `api` directories manage dashboards, RSVP flows, and webhook endpoints. `layout.tsx` and `globals.css` define shared shell and styles.
- `src/components`: Reusable UI composites built with Tailwind; keep them prop-driven and stateless where possible.
- `src/lib`: Cross-cutting utilities such as `prisma.ts` (Prisma client singleton) and `validators.ts` (Zod schemas).
- `prisma/`: `schema.prisma` and the local SQLite `dev.db`; avoid committing regenerated databases.
- `public/`: Static assets surfaced by Next.js; optimize images before landing them here.
- `middleware.ts`: Edge middleware that guards admin flows; update alongside route changes.

## Build, Test, and Development Commands
- `npm run dev`: Start the Next.js dev server with hot reload; requires a populated `.env`.
- `npm run build`: Create a production bundle and run type checks.
- `npm run start`: Serve the last build in production mode (run `build` first).
- `npm run lint`: Run `next lint`; fix or justify warnings before pushing.
- `npx prisma migrate dev`: Apply schema changes locally and regenerate the Prisma client.
- `npx prisma studio`: Inspect and edit RSVP data through a browser UI while debugging.

## Coding Style & Naming Conventions
- Use TypeScript with 2-space indentation; avoid `any` by leaning on Zod and Prisma types.
- Prefer functional, server-first components in `app` routes; export React components in PascalCase and helpers in camelCase.
- Tailwind class groupings should follow layout → spacing → typography for readability.
- ESLint extends `next/core-web-vitals`; respect accessibility and performance warnings.
- Keep Zod schemas close to the inputs they guard, exporting shared schemas in SCREAMING_SNAKE_CASE (`RSVP_SCHEMA`).

## Testing Guidelines
- Introduce tests with Jest + React Testing Library (UI) and Vitest or Prisma Test Utils (lib); name files `*.test.ts(x)`.
- Co-locate quick unit tests with components; place integration suites under `src/__tests__`.
- Mock Prisma via the singleton in `src/lib/prisma.ts` when testing to avoid mutating `dev.db`.
- Target >80% coverage for shared libs; snapshot dynamic emails and generated ICS files.

## Commit & Pull Request Guidelines
- If history is unavailable locally, default to Conventional Commits (`feat(admin): add RSVP status filter`); keep the subject ≤72 chars.
- Each PR must describe the change, link to the issue/ticket, and attach before/after screenshots for UI work.
- Note schema updates in the PR body and include the migration filename.
- Request review from another agent when altering `middleware` or database access layers.

## Environment & Secrets
- Copy `.env.example` to `.env`; provide `DATABASE_URL`, `RESEND_API_KEY`, analytics tokens, and RSVP pixel secrets.
- Never commit populated `.env` or `prisma/dev.db`; add new keys to the example file and document expected defaults.
- For production, run `npx prisma migrate deploy` during release workflows and seed using a dedicated script under `src/lib`.
