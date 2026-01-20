FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Railway uses PORT env variable (default 8080)
ENV PORT=8080
EXPOSE 8080

# Run the application - use shell form to expand $PORT
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
