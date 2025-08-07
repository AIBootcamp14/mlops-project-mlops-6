# Use Python 3.12 slim image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and data files
COPY app/ ./app/
COPY daily_mlop_workflow.py .
COPY middle_schools.csv .

# Create data directory
RUN mkdir -p data

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/docs || exit 1

# Run FastAPI application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
