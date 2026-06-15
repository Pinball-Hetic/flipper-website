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
# Copie l'arbre node_modules COMPLET (racine + node_modules imbriqués par workspace)
COPY --from=deps /app/ ./
COPY . .

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/gateway ./apps/gateway

WORKDIR /app/apps/gateway

EXPOSE 8881
CMD ["node", "index.js"]
