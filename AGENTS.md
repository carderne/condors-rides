# AGENTS.md

- App: web app for a cycling club to organise rides.
- Stack: Next.js 16 + React 19 + TypeScript, pnpm, Drizzle ORM/Postgres, Tailwind CSS 4, Vitest.
- Local dev: add `.env`, then `pnpm install`, `pnpm run db:dev`, `pnpm run dev` (http://localhost:5210).
- Before handing off, run:
  - Format: `pnpm run fmt`
  - Lint/fix: `pnpm run lint`
  - Typecheck: `pnpm run check`
- Combined check: `pnpm run all` (also runs tests).
