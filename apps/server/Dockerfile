# Stage 1: Dependances
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/client/package.json ./apps/client/
COPY apps/server/package.json ./apps/server/
COPY apps/gateway/package.json ./apps/gateway/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
RUN npm install

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
# Copie l'arbre node_modules COMPLET (racine + node_modules imbriqués par workspace,
# ex. apps/server/node_modules/zod@3) — sinon résolution sur la mauvaise version.
COPY --from=deps /app/ ./
COPY . .

# Generer le client Prisma
RUN npm run db:generate -w @pocket-maps/database

# Compiler le serveur TypeScript
RUN npx tsc -p apps/server/tsconfig.json

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/packages/database ./packages/database

WORKDIR /app/apps/server

EXPOSE 8882
CMD ["node", "dist/src/index.js"]
