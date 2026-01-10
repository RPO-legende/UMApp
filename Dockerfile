# Stage 1: Build Frontend
FROM node:20 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build -- --outDir dist

# Stage 2: Build Backend
FROM node:20 AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npm run build

# Stage 3: Final Image - Combine Frontend and Backend
FROM node:20-slim
WORKDIR /app

# Copy backend built files
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/package*.json ./
COPY --from=backend-builder /app/backend/views ./views

# Copy frontend built files to backend's public folder
COPY --from=frontend-builder /app/frontend/dist ./public

# Install only production dependencies
RUN npm install --omit=dev

EXPOSE 3000

CMD ["node", "dist/server.js"]
