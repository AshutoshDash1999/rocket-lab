# Rocket Lab

> Build it, launch it, crash it, try again.

Rocket Lab is a playful web app where you design a rocket from a catalog of parts on a blueprint canvas, launch it, and watch the flight with live telemetry. Save your blueprints and share them with others.

<!-- Screenshot: replace the placeholder below with a real image, e.g. docs/screenshot.png -->
<img width="2520" height="1414" alt="image" src="https://github.com/user-attachments/assets/caf27a03-0615-44df-ac43-85987549fd0d" />

## Features

- **Build** – drag parts onto a blueprint canvas, with zoom controls.
- **Launch** – countdown, flight view, gauges, telemetry, parachute control, and crash/success outcomes with sound.
- **Blueprints** – save your designs and manage them from one place.
- **Share** – public blueprint pages (`/b/[id]`) with generated Open Graph images.
- **Auth** – Google sign-in via Neon Auth (Managed Better Auth), with onboarding for new users.

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router) with React 19 and the React Compiler
- [Tailwind CSS](https://tailwindcss.com) 4
- [Neon](https://neon.com) Postgres (`@neondatabase/serverless`) and Neon Auth
- [Zustand](https://zustand.docs.pmnd.rs) for client state
- [Biome](https://biomejs.dev) for linting and formatting

## Getting Started

### Prerequisites

- Node.js 20+
- A Neon project (database + auth)

### Setup

```bash
npm install
cp .env.example .env.local   # then fill in the values
```

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL`, `DATABASE_URL_POOLED`, `DATABASE_URL_UNPOOLED` | Postgres connection strings |
| `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET` | Neon Managed Better Auth |
| `NEON_BRANCH`, `NEON_BRANCH_ID`, `NEON_FUNCTION_HOST_SUFFIX` | Neon branch / functions |
| `NEXT_PUBLIC_APP_URL` | Public URL of the app |

Apply the SQL migrations in [db/migrations](db/migrations) to your database.

### Run

```bash
npm run dev          # http://localhost:3000
npm run dev:https    # with local HTTPS (needed for some auth flows)
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | Lint with Biome |
| `npm run format` | Format with Biome |

## Project Structure

```
src/
  app/
    page.tsx        # sign-in landing
    onboarding/     # first-time user setup
    blueprints/     # saved designs
    build/[id]/     # rocket builder
    launch/         # flight simulation
    b/[id]/         # shared blueprint page + OG image
    api/auth/       # auth routes
  components/       # shared UI
  lib/              # users, helpers
db/migrations/      # SQL migrations
```
