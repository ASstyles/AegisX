#!/bin/sh
set -e

# Default to port 10000 if PORT is not set (Render provides $PORT)
export PORT=${PORT:-10000}
echo "========================================="
echo "Starting AegisX Unified Service on Port $PORT"
echo "========================================="

# Substitute $PORT into Nginx configuration
if command -v envsubst > /dev/null 2>&1; then
    envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
else
    sed "s/\${PORT}/${PORT}/g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
fi

# Remove default sites-available/sites-enabled symlinks if present to prevent port collisions
rm -f /etc/nginx/sites-enabled/default /etc/nginx/sites-available/default

# Validate Nginx configuration
nginx -t

# Start FastAPI backend with Uvicorn on 127.0.0.1:8000
echo "Starting Uvicorn backend server on 127.0.0.1:8000..."
uvicorn backend.app:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Trap termination signals to gracefully stop backend and nginx
shutdown() {
    echo "Shutting down AegisX services..."
    kill -TERM "$BACKEND_PID" 2>/dev/null || true
    exit 0
}
trap shutdown SIGTERM SIGINT

# Wait briefly for FastAPI to initialize
sleep 2

# Check if backend started properly
if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "FATAL: FastAPI backend failed to start!"
    exit 1
fi

echo "FastAPI backend started successfully (PID: $BACKEND_PID)."
echo "Starting Nginx reverse proxy on 0.0.0.0:$PORT..."

# Start Nginx in foreground
exec nginx -g "daemon off;"
