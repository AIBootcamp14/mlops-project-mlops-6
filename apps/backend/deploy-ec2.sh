#!/bin/bash

# EC2 배포 스크립트
echo "Starting EC2 deployment..."

# 환경 변수 파일 확인
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please create .env file with required environment variables"
    exit 1
fi

# 기존 컨테이너 중지 및 제거
echo "Stopping existing containers..."
docker-compose -f docker-compose.ec2.yml down

# 이미지 재빌드
echo "Rebuilding Docker images..."
docker-compose -f docker-compose.ec2.yml build --no-cache

# 컨테이너 시작
echo "Starting containers..."
docker-compose -f docker-compose.ec2.yml up -d

# 컨테이너 상태 확인
echo "Checking container status..."
docker-compose -f docker-compose.ec2.yml ps

# 잠시 대기 후 로그 확인
echo "Waiting for services to start..."
sleep 10

# 로그 확인
echo "Container logs:"
docker-compose -f docker-compose.ec2.yml logs backend

# 서비스 상태 확인
echo "Checking service health..."
echo "FastAPI health check:"
curl -f http://localhost:8080/docs || echo "FastAPI not ready yet"

echo "Airflow health check:"
curl -f http://localhost:8081 || echo "Airflow not ready yet"

echo "Deployment completed!"
echo "Backend should be available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8080"
echo "API docs available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8080/docs"
echo "Airflow Web UI available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8081"
