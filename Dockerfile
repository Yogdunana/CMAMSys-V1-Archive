# Multi-stage build for optimized production image

# Stage 1: Dependencies
FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install pnpm
RUN npm install -g pnpm

# Install dependencies (include devDependencies for build)
RUN pnpm install --frozen-lockfile

# Set DATABASE_URL for Prisma client generation during dependency installation
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/cmamsys}

# Generate Prisma Client
RUN npx prisma generate

# Stage 2: Builder
FROM node:24-alpine AS builder
RUN apk add --no-cache libc6-compat python3 make g++ bash
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .

# Set environment for build
ENV NEXT_TELEMETRY_DISABLED 1

# Generate Prisma client (use dummy URL for build time)
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/cmamsys}

RUN npx prisma generate

# Set required environment variables for build
ENV JWT_SECRET="test-jwt-secret-for-ci-build-only-32-char"
ENV REFRESH_TOKEN_SECRET="test-refresh-token-secret-for-ci-build-32"
ENV ENCRYPTION_KEY="test-encryption-key-for-ci-build-only-32-chars"
ENV CSRF_SECRET="test-csrf-secret-for-ci-build-only-32-chars"
ENV SESSION_SECRET="test-session-secret-for-ci-build-only-32-chars"
ENV LOG_FILE_PATH="/tmp/app.log"

# Build the application (NODE_ENV is not set yet to allow devDependencies)
RUN pnpm run build

# Set production environment after build
ENV NODE_ENV production

# Stage 3: Runner
FROM node:24-alpine AS runner
RUN apk add --no-cache libc6-compat python3 chromium \
    --repository=https://dl-cdn.alpinelinux.org/alpine/edge/community
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 5000

# Set up a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create necessary directories
RUN mkdir -p /app/uploads /app/logs /app/temp && \
    chown -R nextjs:nodejs /app/uploads /app/logs /app/temp

# Set permissions
USER nextjs

EXPOSE 5000

ENV PORT 5000
ENV HOSTNAME "0.0.0.0"

# Start the application
CMD ["node", "server.js"]
