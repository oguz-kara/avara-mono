## Stage 1: Build
FROM node:18-alpine AS builder

# Install pnpm and TypeScript
RUN npm install -g pnpm typescript

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml tsconfig.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the app
RUN pnpm run build

## Stage 2: Production
FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built files from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/package.json ./

# Expose port
EXPOSE 3000

CMD ["pnpm", "start"]
