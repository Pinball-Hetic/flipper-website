# Stage 1: Dependances
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/server/package.json ./apps/server/
COPY packages/database/package.json ./packages/database/
RUN npm install

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
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
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/packages/database ./packages/database

WORKDIR /app/apps/server

EXPOSE 8882
CMD ["node", "dist/src/index.js"]
