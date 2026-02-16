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

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:24-alpine AS builder
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .

# Set environment for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN pnpm run build

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
