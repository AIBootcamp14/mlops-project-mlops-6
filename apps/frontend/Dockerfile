FROM node:18-alpine

WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사
COPY . .

# 포트 노출
EXPOSE 5173

# 개발 서버 실행 (호스트를 0.0.0.0으로 설정하여 컨테이너 외부에서 접근 가능)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 