# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (runs client + server + gateway concurrently)
npm run dev

# Individual services
npm run dev -w @pocket-maps/client    # Next.js on :8888
npm run dev -w @pocket-maps/server    # Express API on :8882
npm run dev -w @pocket-maps/gateway   # Proxy on :8881

# Docker dev environment
task up          # docker compose -f docker-compose.dev.yml up -d --build
task down        # stop (keep volumes)
task down:clean  # stop + delete volumes

# Database (all via packages/database)
task db:generate   # prisma generate — run after schema changes
task db:migrate    # prisma migrate dev (pass NAME=migration_name)
task db:push       # prisma db push (no migration file, for rapid iteration)
task db:seed       # seed
task db:studio     # Prisma Studio

# Tests (server only — vitest)
npm run test -w @pocket-maps/server

# Lint
npm run lint -w @pocket-maps/client
```

## Architecture

### Service topology

```
Browser → :8881 Gateway (Express proxy)
              ├── /api/* (except /api/auth) → :8882 Express Server
              └── everything else           → :8888 Next.js Client
```

The gateway is the single entry point in dev. The Next.js client handles `/api/auth/*` itself via Better Auth's catch-all route (`src/app/api/auth/[...better-auth]/route.js`).

### Monorepo structure

| Path                | Package                 | Role                        |
| ------------------- | ----------------------- | --------------------------- |
| `apps/client`       | `@pocket-maps/client`   | Next.js 16 frontend         |
| `apps/server`       | `@pocket-maps/server`   | Express 5 REST API          |
| `apps/gateway`      | `@pocket-maps/gateway`  | HTTP proxy only             |
| `packages/database` | `@pocket-maps/database` | Prisma client, schema, seed |

`packages/database` exports a singleton `prisma` instance (CommonJS). Both client and server import it via `require("@pocket-maps/database")`.

### Server — Clean Architecture layers

```
domain/       — TypeScript interfaces (IScoreRepository, IMachineRepository, …) + entity types
use-cases/    — Business logic classes (RegisterScore, SubmitPendingScore, ClaimScore, …)
                Each use-case validates input with Zod and throws typed domain errors.
interface/    — Express controllers + CronJob (thin: parse req → call use-case → send res)
infrastructure/ — Prisma implementations of domain interfaces + swagger spec
```

New features follow this order: domain interface → use-case → infrastructure implementation → controller → wire in `index.ts`.

### Auth model

- **User auth**: Better Auth (`better-auth` + `@better-auth/prisma-adapter`). Session cookie managed by Next.js. The client uses `authClient` from `src/lib/auth-client.js`.
- **Borne (machine) auth**: `x-api-key` header checked against `BORNE_API_KEY` env var in Express controllers.
- **Claim flow**: borne POSTs to `/api/pending-scores` → gets a 6-char `claimCode` back → user scans QR code → `/claim/[code]` page → user logs in if needed → POSTs to `/api/pending-scores/claim` with session cookie.

### Database schema summary

PostreSQL + PostGIS. Key models: `User`, `Session`, `Account`, `Verification` (Better Auth managed), `Checkpoint` (physical venue with lat/lng), `Machine` (pinball machine belonging to a checkpoint), `Score` (claimed score linked to user+machine), `PendingScore` (buffer between borne and user account, expires after 24h), `Visit`, `Badge`/`UserBadge`.

Spatial columns use `geography(Point, 4326)` (PostGIS). Prisma marks them `Unsupported(...)` — cannot query them directly via Prisma client; use raw SQL for spatial queries.

### Swagger / API docs

Available at `http://localhost:8882/api-docs` in dev only. Schema is defined statically in `apps/server/src/infrastructure/swagger.ts` (no JSDoc annotations). Update that file whenever the API contract changes.

### Environment

All services read `../../.env` from their own directory (i.e., the root `.env`). Required vars: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BORNE_API_KEY`. Optional: `ALLOWED_ORIGINS` (comma-separated, defaults to localhost:8881,8882,8888), `NEXT_PUBLIC_SERVER_URL`.

---

## Agents & Skills

### Skills (`/skill-name`)

| Trigger                                                          | Skill                                  | When to use                                                                     |
| ---------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------- |
| Any UI work (pages, components, maps, modals)                    | `/ui-ux-pro-max`                       | Design decisions: layout, color, typography, spacing, animations, accessibility |
| Building a new page or component                                 | `/frontend-design`                     | Generating polished, production-grade UI code                                   |
| Touching `src/lib/auth.js`, `auth-client.js`, Better Auth config | `/better-auth-best-practices`          | Auth setup, sessions, OAuth providers, plugins                                  |
| Hardening auth (rate limiting, CSRF, cookies)                    | `/better-auth-security-best-practices` | Security config for Better Auth                                                 |
| Next.js patterns (`params`, `searchParams`, server actions)      | `/next-best-practices`                 | Async params, data fetching patterns, bundling                                  |
| Committing changes                                               | `/git-commit`                          | Generates conventional commit messages from the diff                            |
| Looking up library docs (Prisma, Next.js, Better Auth…)          | `/context7`                            | Fetch up-to-date API docs instead of relying on training data                   |

### Agents (`Agent` tool)

| Task                                                     | Agent                    | Notes                                                         |
| -------------------------------------------------------- | ------------------------ | ------------------------------------------------------------- |
| Exploring unfamiliar parts of the codebase               | `Explore`                | Use for open-ended searches across multiple dirs              |
| Planning a non-trivial feature (new use-case, new route) | `Plan`                   | Design the domain → use-case → controller chain before coding |
| Full-stack feature spanning client + server + DB         | `fullstack-engineer`     | Score submission flow, claim flow, new checkpoint features    |
| Reviewing a PR or changed file for correctness           | `code-reviewer`          | After implementing a use-case or refactor                     |
| Docker, CI/CD, deployment, Dockerfile changes            | `devops-engineer`        | docker-compose, Dockerfile, gateway config                    |
| npm audit, updating deps, lockfile issues                | `dependency-manager`     | Keep `package-lock.json` and Prisma client in sync            |
| Tracking down a runtime error or 500 from the server     | `error-detective`        | Stack traces, Prisma errors, Express middleware issues        |
| OWASP review, secrets detection, auth hardening          | `security-auditor`       | Before shipping auth flows or public API endpoints            |
| Dead code removal, restructuring use-cases               | `refactoring-specialist` | When a use-case or controller grows beyond its responsibility |
| Updating Swagger / OpenAPI docs                          | `documentation-engineer` | Keep `swagger.ts` in sync with actual routes                  |
