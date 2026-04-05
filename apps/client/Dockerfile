# Stage 1: Dependances
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/client/package.json ./apps/client/
COPY packages/database/package.json ./packages/database/
RUN npm install

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generer le client Prisma
RUN npm run db:generate -w @pocket-maps/database

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build -w @pocket-maps/client

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Note : en mode standalone Next.js, server.js est a la racine du dossier standalone
COPY --from=builder /app/apps/client/public ./apps/client/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/client/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/client/.next/static ./apps/client/.next/static

USER nextjs

EXPOSE 8888
ENV PORT 8888
ENV HOSTNAME "0.0.0.0"

CMD ["node", "apps/client/server.js"]
