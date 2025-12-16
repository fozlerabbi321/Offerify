# Multi-stage Production Dockerfile for NestJS Backend
# NOTE: This Dockerfile is designed to be run from the repo root with:
#       docker build -f backend/Dockerfile .

FROM node:20-alpine AS builder

WORKDIR /app

# Install ALL dependencies (dev deps needed for build)
# Copy from backend folder since context is repo root
COPY backend/package*.json ./
RUN npm install && npm cache clean --force

# Copy source code from backend folder
COPY backend/ .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --only=production && npm cache clean --force

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/main"]
