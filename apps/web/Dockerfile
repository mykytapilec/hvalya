# ── Stage 1: Builder ─────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY turbo.json ./
COPY packages/types/package*.json ./packages/types/
COPY packages/typescript-config/ ./packages/typescript-config/
COPY apps/web/package*.json ./apps/web/
RUN npm ci

COPY packages/types/ ./packages/types/
COPY apps/web/ ./apps/web/

# Build shared types
RUN npm run build --workspace=packages/types
RUN mkdir -p node_modules/@hvalya/types/dist && \
    find packages/types/dist -maxdepth 1 -type f -exec cp {} node_modules/@hvalya/types/dist/ \;

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build --workspace=apps/web

# ── Stage 2: Runner ──────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY turbo.json ./
COPY packages/types/package*.json ./packages/types/
COPY apps/web/package*.json ./apps/web/
RUN npm ci --omit=dev

COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/next.config.js ./apps/web/next.config.js

EXPOSE 3002
CMD ["sh", "-c", "cd apps/web && npx next start -p 3002"]
