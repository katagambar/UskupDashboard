# Dashboard Uskup - Development Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies for Prisma and native modules
RUN apk add --no-cache libc6-compat openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (using npm install since package-lock.json may not be present)
RUN npm install --legacy-peer-deps

# Generate Prisma client
RUN npx prisma generate

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Development command - no Turbopack cache issues
CMD ["npx", "tsx", "server.ts"]
