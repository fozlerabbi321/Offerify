# Multi-stage Production Dockerfile for NestJS Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Install ALL dependencies (dev deps needed for build)
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built assets and migrations
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src/migrations ./src/migrations
COPY --from=builder /app/typeorm.config.ts ./typeorm.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Install production dependencies + ts-node for migrations
RUN npm ci --only=production && \
    npm install ts-node typescript tsconfig-paths && \
    npm cache clean --force

# Create startup script that runs migrations then starts app
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "Running migrations..."' >> /app/start.sh && \
    echo 'npm run migration:run || echo "Migration failed or already up to date"' >> /app/start.sh && \
    echo 'echo "Starting application..."' >> /app/start.sh && \
    echo 'node dist/main' >> /app/start.sh && \
    chmod +x /app/start.sh

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start with migrations
CMD ["/bin/sh", "/app/start.sh"]
