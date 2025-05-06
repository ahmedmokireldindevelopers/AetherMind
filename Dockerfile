# Use Node.js 20 as the base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all project files
COPY . .

# Set environment variables for production build
ENV NODE_ENV production

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy prompts directory
COPY --from=builder --chown=nextjs:nodejs /app/prompts ./prompts

# Copy AI source files needed for Genkit
COPY --from=builder --chown=nextjs:nodejs /app/src/ai ./src/ai

# User for security
USER nextjs

# Expose the port the app runs on
EXPOSE 9002

# Create a script to start both Next.js and Genkit
RUN echo '#!/bin/sh\nnpm run genkit:dev & npm start' > /app/start.sh && chmod +x /app/start.sh

# Command to run the application
CMD ["/app/start.sh"]
