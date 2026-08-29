# ==============================================================================
# Stage 1: Build the React / Vite Frontend
# ==============================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ==============================================================================
# Stage 2: Final Production Image (FastAPI Backend + Nginx Reverse Proxy)
# ==============================================================================
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install Nginx, envsubst (gettext-base), and dos2unix for line ending normalization
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        nginx \
        gettext-base \
        dos2unix && \
    rm -rf /var/lib/apt/lists/*

# Install Python backend dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source code
COPY backend/ ./backend/

# Copy built frontend assets from builder stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy Nginx template configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Copy and configure entrypoint script
COPY entrypoint.sh ./entrypoint.sh
RUN dos2unix ./entrypoint.sh && chmod +x ./entrypoint.sh

# Default Render port exposure (Render overrides dynamically via $PORT)
EXPOSE 10000

# Start Uvicorn backend + Nginx reverse proxy
ENTRYPOINT ["./entrypoint.sh"]