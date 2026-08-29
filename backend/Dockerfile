# ==============================================================================
# AegisX Backend Service (FastAPI + Uvicorn + ML Engine)
# ==============================================================================
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    TZ=Asia/Kolkata \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install tzdata and curl for healthcheck and accurate Asia/Kolkata timezone support
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        tzdata \
        curl && \
    rm -rf /var/lib/apt/lists/*

# Install Python backend dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source code
COPY backend/ ./backend/

# Expose backend port
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start FastAPI Uvicorn Server
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]
