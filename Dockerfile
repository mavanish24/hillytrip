# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app
# Copy dependency definitions
COPY package*.json ./
# Install all dependencies (including devDependencies)
RUN npm ci
# Copy the rest of the source code
COPY . .
# Build the frontend and bundle the backend server with esbuild
RUN npm run build

# Stage 2: Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
# Set production environment
ENV NODE_ENV=production
ENV PORT=8080
# Copy dependency definitions
COPY package*.json ./
# Install only production dependencies
RUN npm ci --omit=dev
# Copy compiled build artifacts from builder
COPY --from=builder /app/dist ./dist
# Copy local database JSON files (non-relational store)
COPY --from=builder /app/hillytrip_db_store.json ./hillytrip_db_store.json
COPY --from=builder /app/hillytrip_taxi_stands_store.json ./hillytrip_taxi_stands_store.json
COPY --from=builder /app/hillytrip_analytics_store.json ./hillytrip_analytics_store.json
# Create required upload directories and grant full permissions to the 'node' user
RUN mkdir -p uploads public/uploads/messaging public/uploads/taxi_documents && \
    chown -R node:node /app
# Run the container under the non-root 'node' user for enhanced security
USER node
# Expose port (Cloud Run sets the PORT env var, but 3000 is default)
EXPOSE 8080
# Start the application using npm start
CMD ["npm", "start"]
