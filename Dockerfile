# Multi-stage build for Next.js wishlist app

# Stage 1: Dependencies
FROM node:20-alpine AS deps

WORKDIR /app

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

# Create user/group compatible with Unraid (nobody:users)
# UID 99 = nobody, GID 100 = users (standard in Unraid)
RUN addgroup -g 100 -S users 2>/dev/null || true && \
    adduser -S -u 99 -G users -h /app nobody 2>/dev/null || true

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Set umask to ensure files are created with proper permissions
ENV UMASK=0002

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create data directory structure with proper permissions
RUN mkdir -p /app/data/db /app/data/uploads && \
    chown -R 99:100 /app && \
    chmod -R 775 /app/data

# Switch to nobody user (Unraid standard)
USER nobody

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
