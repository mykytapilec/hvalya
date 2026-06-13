# ── Stage 1: Builder ─────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
COPY turbo.json ./

COPY packages/types/package*.json ./packages/types/
COPY apps/api/package*.json ./apps/api/

RUN npm ci

COPY packages/types/ ./packages/types/
COPY apps/api/ ./apps/api/

# Build shared types
RUN npm run build --workspace=packages/types

# Sync built types into node_modules symlink target
RUN cp -r packages/types/dist node_modules/@hvalya/types/dist

# Generate Prisma client for linux-musl (Alpine)
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Build API
RUN npm run build --workspace=apps/api

# ── Stage 2: Runner ──────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl

COPY package*.json ./
COPY turbo.json ./

COPY packages/types/package*.json ./packages/types/
COPY apps/api/package*.json ./apps/api/

RUN npm ci --omit=dev

COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

EXPOSE 3001

CMD ["node", "apps/api/dist/main"]