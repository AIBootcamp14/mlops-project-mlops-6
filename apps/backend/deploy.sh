#!/bin/bash

# EC2 배포 스크립트
echo "Starting deployment..."

# 기존 컨테이너 중지 및 제거
echo "Stopping existing containers..."
docker-compose down

# 이미지 재빌드
echo "Rebuilding Docker images..."
docker-compose build --no-cache

# 컨테이너 시작
echo "Starting containers..."
docker-compose up -d

# 컨테이너 상태 확인
echo "Checking container status..."
docker-compose ps

# 로그 확인
echo "Container logs:"
docker-compose logs backend

echo "Deployment completed!"
echo "Backend should be available at: http://YOUR_EC2_IP:8080"
echo "API docs available at: http://YOUR_EC2_IP:8080/docs"
echo "Airflow Web UI available at: http://YOUR_EC2_IP:8081"
