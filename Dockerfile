# Multi-stage build for Next.js wishlist app

# Stage 1: Dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Install dependencies needed for native modules (sharp, better-sqlite3)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application files
COPY . .

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Install su-exec for user switching (standard approach)
RUN apk add --no-cache su-exec

# Create nextjs user and group (for compatibility with systems that expect it)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port
EXPOSE 3000

# Ensure we run as root so entrypoint can manage users
USER root

# Use entrypoint to handle PUID/PGID (LinuxServer.io pattern)
ENTRYPOINT ["/entrypoint.sh"]

# Start the application
CMD ["node", "server.js"]
