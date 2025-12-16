# Multi-stage Production Dockerfile for NestJS Backend
# Build context is repo root, Dockerfile is in /backend

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files from backend folder
COPY backend/package*.json ./

# Install all dependencies (need dev deps for build)
RUN npm install

# Copy source code from backend folder
COPY backend/src ./src
COPY backend/tsconfig*.json ./
COPY backend/nest-cli.json ./

# Build the application
RUN npm run build

# Debug: list the dist folder
RUN ls -la dist/ || echo "dist folder missing!"

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev && npm cache clean --force

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/main.js"]
