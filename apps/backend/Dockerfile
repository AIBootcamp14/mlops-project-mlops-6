# Use the official Airflow image as base (Python 3.12)
FROM apache/airflow:2.9.1-python3.12

# Switch to root to install OS-level dependencies (none here)
USER root

# Copy project requirements
COPY requirements.txt /opt/airflow/requirements.txt

# Switch to airflow user to install Python dependencies per Airflow recommendations
USER airflow
RUN pip install --no-cache-dir -r /opt/airflow/requirements.txt

# Switch back to root to copy code and adjust permissions
USER root

# Copy your mlops scripts and DAG definition into the image
# COPY mlops/ /opt/airflow/mlops/
# COPY airflow/dags/mlops_project/daily_mlop_workflow.py /opt/airflow/dags/
COPY daily_mlop_workflow.py /opt/airflow/dags/

# Ensure correct permissions
# RUN chown -R airflow: /opt/airflow/mlops /opt/airflow/dags
RUN chown -R airflow: /opt/airflow/dags

# Revert to non-root user for runtime
USER airflow

# Entrypoint: initialize DB, then start scheduler & webserver
ENTRYPOINT ["/bin/bash", "-c", "airflow db init && airflow scheduler & airflow webserver --port 8080"]

# Expose webserver port
EXPOSE 8080
