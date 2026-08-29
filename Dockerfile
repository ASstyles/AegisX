# ---------- Frontend build ----------
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build


# ---------- Backend ----------
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

RUN apt-get update && \
    apt-get install -y nginx && \
    rm -rf /var/lib/apt/lists/*

COPY nginx.conf /etc/nginx/sites-available/default

EXPOSE 10000

CMD ["sh", "-c", "uvicorn backend.app:app --host 127.0.0.1 --port 8000 & nginx -g 'daemon off;'"]