# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Priorité de lecture au démarrage de session

1. `Pinball-website-brain/02_Architecture/` — contexte humain, décisions de design
2. `graphify-out/GRAPH_REPORT.md` — structure du code, god nodes, communautés
3. Ce fichier — commandes, conventions, règles

---

## Hard rules

- Ne jamais modifier le schéma Prisma sans créer une migration (`task db:migrate`)
- Ne jamais appeler `prisma` directement dans un controller — passer par un repository
- Ne jamais commiter `.env`
- Ne jamais instancier un repository dans un use-case — injection via constructeur uniquement
- Toujours suivre l'ordre : domain interface → use-case → infrastructure → controller → `index.ts`
- Les colonnes spatiales PostGIS ne peuvent pas être requêtées via Prisma client — utiliser raw SQL
- 1 commit = 1 fonction ou 1 changement atomique — jamais grouper plusieurs features dans un commit
- Ne jamais faire `git push` — le push est réservé à l'humain
- Ne jamais ajouter de `Co-Authored-By` dans les messages de commit

---

## Déclencheurs automatiques

### Skills — invoquer sans attendre que l'utilisateur le demande

| Situation détectée                                         | Skill à invoquer                         |
| ---------------------------------------------------------- | ---------------------------------------- |
| Modification d'un composant UI, page, modal, map, style    | `/ui-ux-pro-max` puis `/frontend-design` |
| Touche `auth.js`, `auth-client.js`, Better Auth            | `/better-auth-best-practices`            |
| Touche auth + mention sécurité, rate limit, CSRF           | `/better-auth-security-best-practices`   |
| Patterns Next.js, `params`, `searchParams`, server actions | `/next-best-practices`                   |
| Fin de session, commit demandé                             | `/git-commit`                            |
| Doute sur une API Prisma, Next.js, Better Auth             | `/context7`                              |

### Agents — invoquer sans attendre que l'utilisateur le demande

| Situation détectée                                       | Agent à invoquer                   |
| -------------------------------------------------------- | ---------------------------------- |
| "code review", "review et commit", "c'est bon on commit" | `code-reviewer` puis `/git-commit` |
| "erreur", "crash", "500", "undefined", stack trace       | `error-detective`                  |
| "nouvelle feature", "nouvelle route", "nouveau use-case" | `Plan` puis `fullstack-engineer`   |
| "sécurité", "audit", "hardening", "OWASP"                | `security-auditor`                 |
| "refacto", "trop gros", "dead code", "restructurer"      | `refactoring-specialist`           |
| "deps", "npm audit", "mise à jour packages"              | `dependency-manager`               |
| "docker", "CI", "déploiement", "Dockerfile"              | `devops-engineer`                  |
| "swagger", "doc api", "route non documentée"             | `documentation-engineer`           |
| Exploration d'une partie inconnue du codebase            | `Explore`                          |

---

## Workflow fin de session

Quand l'utilisateur dit "code review", "review et commit", "c'est bon on commit" :

1. Invoquer l'agent `code-reviewer` sur les fichiers modifiés
2. Corriger ce que l'agent signale
3. Mettre à jour le knowledge graph : `graphify update .`
4. Mettre à jour `Pinball-website-brain/03_Journal_de_Bord/` avec une entrée de session
5. Si bug corrigé (3+ fichiers) → créer une entrée dans `Pinball-website-brain/05_Bugs_Resolus/`
6. Si nouvelle décision d'architecture → mettre à jour `Pinball-website-brain/02_Architecture/`
7. Invoquer le skill `/git-commit` pour chaque changement atomique
8. Ne pas pusher

---

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

---

## Architecture

### Service topology

Browser → :8881 Gateway (Express proxy)
├── /api/\* (except /api/auth) → :8882 Express Server
└── everything else → :8888 Next.js Client

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

domain/ — TypeScript interfaces (IScoreRepository, IMachineRepository, …) + entity types
use-cases/ — Business logic classes (RegisterScore, SubmitPendingScore, ClaimScore, …)
Each use-case validates input with Zod and throws typed domain errors.
interface/ — Express controllers + CronJob (thin: parse req → call use-case → send res)
infrastructure/ — Prisma implementations of domain interfaces + swagger spec

New features follow this order: domain interface → use-case → infrastructure implementation → controller → wire in `index.ts`.

### Auth model

- **User auth**: Better Auth (`better-auth` + `@better-auth/prisma-adapter`). Session cookie managed by Next.js. The client uses `authClient` from `src/lib/auth-client.js`.
- **Borne (machine) auth**: `x-api-key` header checked against `BORNE_API_KEY` env var in Express controllers.
- **Claim flow**: borne POSTs to `/api/pending-scores` → gets a 6-char `claimCode` back → user scans QR code → `/claim/[code]` page → user logs in if needed → POSTs to `/api/pending-scores/claim` with session cookie.

### Database schema summary

PostgreSQL + PostGIS. Key models: `User`, `Session`, `Account`, `Verification` (Better Auth managed), `Checkpoint` (physical venue with lat/lng), `Machine` (pinball machine belonging to a checkpoint), `Score` (claimed score linked to user+machine), `PendingScore` (buffer between borne and user account, expires after 24h), `Visit`, `Badge`/`UserBadge`.

Spatial columns use `geography(Point, 4326)` (PostGIS). Prisma marks them `Unsupported(...)` — cannot query them directly via Prisma client; use raw SQL for spatial queries.

### Swagger / API docs

Available at `http://localhost:8882/api-docs` in dev only. Schema is defined statically in `apps/server/src/infrastructure/swagger.ts` (no JSDoc annotations). Update that file whenever the API contract changes.

### Environment

All services read `../../.env` from their own directory (i.e., the root `.env`). Required vars: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BORNE_API_KEY`. Optional: `ALLOWED_ORIGINS` (comma-separated, defaults to localhost:8881,8882,8888), `NEXT_PUBLIC_SERVER_URL`.

---

## Agents & Skills — référence complète

### Skills (`/skill-name`)

| Trigger                                                          | Skill                                  | When to use                                                                                                         |
| ---------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Any UI work (pages, components, maps, modals)                    | `/ui-ux-pro-max`                       | Design decisions: layout, color, typography, spacing, animations, accessibility                                     |
| Building a new page or component                                 | `/frontend-design`                     | Generating polished, production-grade UI code                                                                       |
| Touching `src/lib/auth.js`, `auth-client.js`, Better Auth config | `/better-auth-best-practices`          | Auth setup, sessions, OAuth providers, plugins                                                                      |
| Hardening auth (rate limiting, CSRF, cookies)                    | `/better-auth-security-best-practices` | Security config for Better Auth                                                                                     |
| Next.js patterns (`params`, `searchParams`, server actions)      | `/next-best-practices`                 | Async params, data fetching patterns, bundling                                                                      |
| Committing changes                                               | `/git-commit`                          | Generates conventional commit messages from the diff — 1 commit par changement atomique, no push, no Co-Authored-By |
| Looking up library docs (Prisma, Next.js, Better Auth…)          | `/context7`                            | Fetch up-to-date API docs instead of relying on training data                                                       |

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

---

## graphify

This project has a graphify knowledge graph at `graphify-out/`.

Rules:

- Before answering architecture or codebase questions, read `graphify-out/GRAPH_REPORT.md`
- If `graphify-out/wiki/index.md` exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)

---

## Knowledge Base (Obsidian vault)

Human-authored documentation lives in `Pinball-website-brain/`.

### Read before acting

- Architecture question or new feature → read `Pinball-website-brain/02_Architecture/`
- Auth or security → read `Pinball-website-brain/02_Architecture/Securite_Infra.md`
- Conventions → read `Pinball-website-brain/04_Conventions/`
- Debugging → check `Pinball-website-brain/05_Bugs_Resolus/` first

### Write when relevant

- Plus de 3 fichiers modifiés pour corriger un seul bug → créer une entrée dans `Pinball-website-brain/05_Bugs_Resolus/`
- Un nouveau fichier créé dans `domain/` ou `use-cases/` → mettre à jour `Pinball-website-brain/02_Architecture/`
- Un pattern répété 2+ fois dans la session → ajouter à `Pinball-website-brain/04_Conventions/`
- Fin de session (quand l'utilisateur dit "c'est bon", "commit", ou "on s'arrête") → append dans `Pinball-website-brain/03_Journal_de_Bord/`

### Format bug entry

## [date] — [titre court]

**Symptôme** :
**Cause** :
**Fix** :
**À ne pas refaire** :

### Format journal entry

## [date] — [titre de session]

**Ce qui a été fait** :
**Décisions prises** :
**Ce qui reste** :
