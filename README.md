# **아파트 주변 중학교 정보 검색 서비스**

아파트명을 입력하면 반경 3km 내 중학교의 학업성취도와 위치 정보를 제공하는 MLOps 프로젝트입니다.

- **프로젝트 기간:** 2024.01.01 ~ 현재
- **배포 링크:** [로컬 서비스](http://localhost:5173)

---

## **1. 서비스 구성 요소**

### **1.1 주요 기능**

- 아파트 주변 중학교 검색: Kakao API를 통한 주소 검색
- 학업성취도 분석: 반경 3km 내 학교들의 평균 성취도 백분율 계산
- 거리별 정렬: 가까운 순서로 20개 학교 정보 제공
- 실시간 API: FastAPI를 통한 RESTful API 제공
- 웹 인터페이스: React + TypeScript로 구현된 사용자 친화적 UI

### **1.2 사용자 흐름**

- 사용자 시나리오 예시:
  1. 웹 페이지에서 아파트명 입력
  2. Kakao API로 아파트 좌표 검색
  3. 반경 3km 내 중학교 정보 분석
  4. 학업성취도 백분율과 학교 목록 표시

---

## **2. 활용 장비 및 협업 툴**

### **2.1 활용 장비**

- **서버 장비:** Docker Container
- **개발 환경:** macOS, Windows, Linux
- **테스트 장비:** 로컬 개발 환경

### **2.2 협업 툴**

- **소스 관리:** GitHub
- **프로젝트 관리:** GitHub Issues
- **커뮤니케이션:** Slack
- **버전 관리:** Git

---

## **3. 데이터 분석 구조**

- **데이터 소스:** 중학교 학업성취도 CSV 데이터
- **지오코딩:** Kakao REST API를 통한 주소-좌표 변환
- **거리 계산:** Haversine 공식을 사용한 정확한 거리 계산
- **성취도 분석:** 전국 대비 상위 백분율 계산

---

## **4. 서비스 아키텍처**

### **4.1 시스템 구조도**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │   Backend   │    │   Kakao API │
│   (React)   │◄──►│   (FastAPI) │◄──►│   (Geocoding)│
│   Port:5173 │    │   Port:8080 │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

### **4.2 데이터 흐름도**

1. 사용자 아파트명 입력 → Frontend → Backend API
2. Backend → Kakao API → 좌표 검색
3. 좌표 기반 학교 데이터 분석 → Backend → Frontend → 사용자

---

## **5. 사용 기술 스택**

### **5.1 백엔드**

- FastAPI (Python 웹 프레임워크)
- Uvicorn (ASGI 서버)
- Pandas (데이터 분석)
- Requests (HTTP 클라이언트)

### **5.2 프론트엔드**

- React.js (JavaScript 라이브러리)
- TypeScript (타입 안전성)
- Vite (빌드 도구)
- Tailwind CSS (스타일링)

### **5.3 외부 API**

- Kakao REST API (지오코딩)
- 중학교 학업성취도 데이터

### **5.4 배포 및 운영**

- Docker & Docker Compose
- GitHub Actions (CI/CD)

---

## **6. 설치 및 실행 방법**

### **6.1 전체 프로젝트 실행 (Docker Compose 사용)**

#### **Docker 설치 확인:**

```bash
# Docker 설치 확인
docker --version
docker compose version
```

#### **Docker가 설치되지 않은 경우:**

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 다운로드 및 설치
- 또는 개별 서비스 실행 방법 참조 (6.2 섹션)

#### **Docker Compose로 실행:**

```bash
# 프로젝트 클론
git clone <repository-url>
cd mlops-project-mlops-6

# Docker Compose로 실행
docker compose up --build

# 백그라운드 실행
docker compose up -d --build
```

#### **서비스 접속:**

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- API 문서: http://localhost:8080/docs

### **6.2 개별 서비스 실행 (Docker 없이)**

#### **Backend 실행:**

1. **Python 환경 설정:**

   ```bash
   cd apps/backend

   # Python 3.10+ 설치 확인
   python3 --version

   # 가상환경 생성 (권장)
   python3 -m venv venv

   # 가상환경 활성화
   # macOS/Linux:
   source venv/bin/activate
   # Windows:
   # venv\Scripts\activate
   ```

2. **의존성 설치:**

   ```bash
   # pip 업그레이드
   pip install --upgrade pip

   # 의존성 설치
   pip install -r requirements.txt
   ```

3. **서버 실행:**

   ```bash
   # 개발 모드로 실행 (자동 재시작)
   uvicorn app.main:app --host 127.0.0.1 --port 8080 --reload

   # 또는 프로덕션 모드
   uvicorn app.main:app --host 127.0.0.1 --port 8080
   ```

#### **Frontend 실행:**

1. **Node.js 환경 설정:**

   ```bash
   cd apps/frontend

   # Node.js 18+ 설치 확인
   node --version
   npm --version
   ```

2. **의존성 설치:**

   ```bash
   # 기존 node_modules 삭제 (문제 발생 시)
   rm -rf node_modules package-lock.json

   # 의존성 설치
   npm install
   ```

3. **개발 서버 실행:**

   ```bash
   # 개발 서버 실행
   npm run dev

   # 또는 프로덕션 빌드
   npm run build
   npm run preview
   ```

### **6.3 실행 순서**

1. **Backend 먼저 실행:**

   ```bash
   # Terminal 1
   cd apps/backend
   source venv/bin/activate  # macOS/Linux
   uvicorn app.main:app --host 127.0.0.1 --port 8080 --reload
   ```

2. **Frontend 실행:**

   ```bash
   # Terminal 2
   cd apps/frontend
   npm run dev
   ```

3. **브라우저에서 확인:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080/docs

### **6.4 API 사용법**

#### **텍스트 생성 API:**

```bash
   curl "http://localhost:8080/generate?prompt=Hello%20world"
```

#### **응답 예시:**

```json
{
  "generated_text": "Hello world, this is a sample generated text..."
}
```

#### **Python으로 API 호출:**

```python
import requests

   response = requests.get("http://localhost:8080/generate",
                          params={"prompt": "Hello world"})
print(response.json())
```

---

## **7. 개발 환경 설정**

### **7.1 필수 요구사항**

- Python 3.10+
- Node.js 18+
- Git

### **7.2 선택적 요구사항**

- Docker & Docker Compose (전체 서비스 실행 시)
- VS Code 또는 PyCharm
- Postman (API 테스트)

### **7.3 설치 가이드**

#### **Python 설치:**

- [Python 공식 사이트](https://www.python.org/downloads/)에서 3.10+ 다운로드
- 또는 Homebrew (macOS): `brew install python@3.10`

#### **Node.js 설치:**

- [Node.js 공식 사이트](https://nodejs.org/)에서 LTS 버전 다운로드
- 또는 Homebrew (macOS): `brew install node`

#### **Docker 설치:**

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 다운로드

---

## **8. 프로젝트 구조**

```
mlops-project-mlops-6/
├── apps/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── main.py          # FastAPI 애플리케이션
│   │   │   └── ml/
│   │   │       └── model.py     # AI 모델 로직
│   │   ├── requirements.txt     # Python 의존성
│   │   ├── .gitignore          # Python 전용 gitignore
│   │   └── Dockerfile          # Backend Docker 설정
│   └── frontend/
│       ├── src/
│       │   ├── App.tsx         # 메인 React 컴포넌트
│       │   └── App.css         # 스타일시트
│       ├── package.json        # Node.js 의존성
│       ├── .gitignore          # Node.js 전용 gitignore
│       └── Dockerfile          # Frontend Docker 설정
├── docker-compose.yml          # 전체 서비스 구성
├── .gitignore                  # 전체 프로젝트 gitignore
└── README.md                   # 프로젝트 문서
```

### **8.1 .gitignore 구조**

프로젝트는 다음과 같은 `.gitignore` 구조를 사용합니다:

- **루트 `.gitignore`**: 전체 프로젝트 공통 (Python, Node.js, IDE, OS 파일 등)
- **`apps/backend/.gitignore`**: Python 전용 (venv, **pycache**, .pytest_cache 등)
- **`apps/frontend/.gitignore`**: Node.js 전용 (node_modules, dist, .env 등)

#### **주요 제외 항목:**

- `venv/` - Python 가상환경 (용량이 크고 환경별로 다름)
- `node_modules/` - Node.js 의존성 (용량이 크고 npm install로 재생성)
- `__pycache__/` - Python 캐시 파일
- `.env` - 환경변수 파일 (보안상 민감한 정보 포함)
- IDE 설정 파일 (`.vscode/`, `.idea/` 등)

---

## **9. 문제 해결**

### **9.1 일반적인 문제들**

#### **포트 충돌:**

```bash
# 포트 사용 확인
lsof -i :8000
lsof -i :5173

# 다른 포트 사용
# Backend
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload

# Frontend (vite.config.ts 수정)
```

#### **Python 가상환경 문제:**

```bash
# 가상환경 재생성
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### **Node.js 의존성 문제:**

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

#### **Docker 이미지 재빌드:**

```bash
docker compose down
docker compose build --no-cache
docker compose up
```

### **9.2 로그 확인:**

```bash
# Docker 로그
docker compose logs

# 특정 서비스 로그
docker compose logs backend
docker compose logs frontend

# 개별 서비스 로그
# Backend: 터미널에서 직접 확인
# Frontend: 브라우저 개발자 도구
```

### **9.3 성능 최적화**

#### **Backend 최적화:**

```python
# app/main.py에 추가
import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
```

#### **Frontend 최적화:**

```bash
# 프로덕션 빌드
npm run build
npm run preview
```

---

## **10. 기여 방법**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## **11. 라이선스**

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
