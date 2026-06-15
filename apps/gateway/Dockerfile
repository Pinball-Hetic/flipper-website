# Stage 1: Dependances
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/gateway/package.json ./apps/gateway/
RUN npm install

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
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
