#!/bin/sh
set -eu

PORT="${PORT:-10000}"

echo "========================================"
echo "Starting AegisX Unified Service on Port ${PORT}"
echo "========================================"

# Export PYTHONPATH so app imports resolve regardless of working directory
export PYTHONPATH="/app:${PYTHONPATH:-}"

# Generate nginx configuration
envsubst '${PORT}' < /app/nginx.conf > /etc/nginx/nginx.conf

# Validate nginx
nginx -t

echo "Starting Uvicorn backend server on 127.0.0.1:8000..."

cd /app/backend

uvicorn app:app --host 127.0.0.1 --port 8000 &
UVICORN_PID=$!

# Give Uvicorn a moment to start
sleep 2

# Verify Uvicorn is still running
if ! kill -0 "$UVICORN_PID" 2>/dev/null; then
    echo "ERROR: Uvicorn failed to start"
    exit 1
fi

echo "Uvicorn started successfully with PID ${UVICORN_PID}"
echo "Starting Nginx..."

cleanup() {
    echo "Stopping AegisX services..."
    kill "$UVICORN_PID" 2>/dev/null || true
    wait "$UVICORN_PID" 2>/dev/null || true
}

# IMPORTANT:
# Use numeric POSIX signal numbers instead of SIGTERM/SIGINT
# because the current environment is reporting:
# trap: SIGTERM: bad trap

trap cleanup 15 2

# Nginx must remain in the foreground
nginx -g "daemon off;"

# If nginx exits, clean up Uvicorn
cleanup
exit 0
