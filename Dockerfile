FROM node:18-alpine AS builder

# Show build information
RUN echo ">> NEOFAVICON SYSTEM :: BUILD PHASE INITIATED"

# Install dependencies for Sharp image processing
RUN apk add --no-cache \
    g++ \
    make \
    python3 \
    git

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies with detailed output
RUN echo ">> INSTALLING SYSTEM DEPENDENCIES" && \
    npm install --production && \
    echo ">> DEPENDENCIES INSTALLED SUCCESSFULLY"

# Copy app source
COPY . .

# Create necessary directories
RUN mkdir -p uploads public/output && \
    chmod 777 uploads public/output

# Build stage complete
RUN echo ">> BUILD STAGE COMPLETE"

# Production image
FROM node:18-alpine

# Install additional runtime dependencies for Sharp
RUN apk add --no-cache \
    tzdata \
    curl \
    bash

# Set timezone
ENV TZ=UTC

# Create app directory
WORKDIR /usr/src/app

# Copy from builder stage
COPY --from=builder /usr/src/app ./

# Add chalk for colorful console output
RUN npm install chalk@4.1.2

# Add container health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --spider -q http://localhost:3000/ || exit 1

# Metadata
LABEL maintainer="NEOFAVICON SYSTEM"
LABEL version="1.0.0"
LABEL description="Cyberpunk-themed favicon converter microservice"

# Expose the port the app runs on
EXPOSE 3000

# Display startup message
RUN echo ">> NEOFAVICON SYSTEM CONTAINER READY"

# Command to run the application
CMD ["node", "server.js"]