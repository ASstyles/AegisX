# ==============================================================================
# Stage 1: Build the React / Vite Frontend
# ==============================================================================
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY frontend/package*.json ./
RUN npm install

# Build production bundle
COPY frontend/ ./
RUN npm run build

# ==============================================================================
# Stage 2: Serve via Nginx Reverse Proxy
# ==============================================================================
FROM nginx:alpine

ENV TZ=Asia/Kolkata

RUN apk add --no-cache tzdata wget

# Copy built frontend assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx proxy configuration
COPY frontend/nginx.conf /etc/nginx/nginx.conf

# Expose HTTP port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
