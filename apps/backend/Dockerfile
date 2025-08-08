# Use the official Airflow image as base (Python 3.12)
FROM apache/airflow:2.9.1-python3.12

# Switch to root to install OS-level dependencies
USER root

# Install additional system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy project requirements
COPY requirements.txt /opt/airflow/requirements.txt

# Switch to airflow user to install Python dependencies
USER airflow
RUN pip install --no-cache-dir -r /opt/airflow/requirements.txt

# Switch back to root to copy code and adjust permissions
USER root

# Copy your application code into the image
COPY app/ /opt/airflow/app/
COPY daily_mlop_workflow.py /opt/airflow/dags/
COPY middle_schools.csv /opt/airflow/

# Create data directory
RUN mkdir -p /opt/airflow/data

# Ensure correct permissions
RUN chown -R airflow: /opt/airflow/dags /opt/airflow/app /opt/airflow/data /opt/airflow/middle_schools.csv

# Revert to non-root user for runtime
USER airflow

# Create startup script
RUN echo '#!/bin/bash\n\
# Start Airflow scheduler in background\n\
airflow db init\n\
airflow scheduler &\n\
\n\
# Start Airflow webserver in background\n\
airflow webserver --port 8081 &\n\
\n\
# Start FastAPI server\n\
cd /opt/airflow\n\
uvicorn app.main:app --host 0.0.0.0 --port 8080\n\
' > /opt/airflow/start.sh && chmod +x /opt/airflow/start.sh

# Expose FastAPI port
EXPOSE 8080

# Health check for FastAPI
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/docs || exit 1

# Start both services
ENTRYPOINT ["/opt/airflow/start.sh"]
