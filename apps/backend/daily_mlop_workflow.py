# ~/airflow/dags/daily_mlop_workflow.py
# 매일 스크랩, CSV 업데이트 후 정보 수집 및 표시 스크립트 실행

from airflow import DAG
from airflow.operators.bash import BashOperator
from datetime import datetime, timedelta
import os

# 기본 인수 설정
default_args = {
    'owner': 'mlops',
    'depends_on_past': False,
    'email_on_failure': True,
    'email': ['soniajhung@gmail.com'],
    'retries': 1,
    'retry_delay': timedelta(minutes=10),
}

with DAG(
    dag_id='daily_mlop_workflow',
    default_args=default_args,
    description='매일 scrap, update_csv 및 정보 표시(main.py) 순차 실행',
    start_date=datetime(2025, 8, 6),
    schedule_interval='@daily',
    catchup=False,
    max_active_runs=1,
) as dag:

    # 1) scrap.py 실행: 웹 크롤링 등을 수행하여 원시 데이터 확보
    run_scrap = BashOperator(
        task_id='run_scrap',
        bash_command=(
            "cd ~/mlops && "
            "source ~/airflow-venv/bin/activate && "
            "python scrap.py"
        ),
    )

    # 2) update_csv.py 실행: scrap 결과를 가공해 middle_schools.csv 생성
    run_update_csv = BashOperator(
        task_id='run_update_csv',
        bash_command=(
            "cd ~/mlops && "
            "source ~/airflow-venv/bin/activate && "
            "python update_csv.py"
        ),
    )

    # 3) main.py 실행: front-end 연동용 정보 수집 및 표시
    run_main = BashOperator(
        task_id='run_main',
        bash_command=(
            "cd ~/mlops && "
            "source ~/airflow-venv/bin/activate && "
            "python main.py"
        ),
    )

    # 작업 순서 정의
    run_scrap >> run_update_csv >> run_main
