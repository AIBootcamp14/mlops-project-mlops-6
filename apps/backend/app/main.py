from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import requests
import os
from typing import List, Optional
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터 모델
class School(BaseModel):
    학교명: str
    distance_km: float
    performance_score: float
    rank: int

class SearchResponse(BaseModel):
    apartment: str
    coordinates: dict
    search_radius_km: float
    sort_by: str
    percentile: Optional[float]
    schools: List[School]

# Kakao API 키 (환경변수에서 가져오기)
KAKAO_KEY = os.getenv("KAKAO_REST_API_KEY", "your-kakao-api-key")

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """두 좌표 간 거리 계산 (Haversine 공식)"""
    from math import radians, cos, sin, asin, sqrt
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    return 6371 * c

def geocode_address(query: str) -> Optional[tuple]:
    """아파트명으로 좌표 얻기"""
    headers = {"Authorization": f"KakaoAK {KAKAO_KEY}"}
    params = {"query": query, "size": 1}
    
    try:
        res = requests.get("https://dapi.kakao.com/v2/local/search/keyword.json", 
                          headers=headers, params=params)
        res.raise_for_status()
        docs = res.json().get("documents", [])
        if not docs:
            return None
        p = docs[0]
        return float(p.get("y")), float(p.get("x"))  # latitude, longitude
    except Exception:
        return None

def load_school_data() -> pd.DataFrame:
    """학교 데이터 로드"""
    try:
        df = pd.read_csv("middle_schools.csv", encoding='utf-8-sig')
        df = df.rename(columns={
            '학업성취도': 'performance_score',
            'X좌표(경도)': 'longitude',
            'Y좌표(위도)': 'latitude'
        })
        df['latitude'] = pd.to_numeric(df['latitude'], errors='coerce')
        df['longitude'] = pd.to_numeric(df['longitude'], errors='coerce')
        df['performance_score'] = pd.to_numeric(df['performance_score'], errors='coerce')
        return df.dropna(subset=['latitude', 'longitude', 'performance_score'])
    except Exception:
        # 샘플 데이터 반환
        return pd.DataFrame({
            '학교명': ['샘플중학교1', '샘플중학교2', '샘플중학교3'],
            'latitude': [37.5665, 37.5666, 37.5667],
            'longitude': [126.9780, 126.9781, 126.9782],
            'performance_score': [85.5, 82.3, 78.9]
        })

@app.get("/search-schools")
async def search_schools(
    apartment: str = Query(...),
    sort_by: str = Query("distance"),
    radius: float = Query(3.0)
) -> SearchResponse:
    """아파트 주변 학교 검색"""
    
    # 아파트 좌표 얻기
    coords = geocode_address(apartment)
    if not coords:
        raise HTTPException(status_code=404, detail="아파트를 찾을 수 없습니다.")
    
    lat, lon = coords
    
    # 학교 데이터 로드
    df = load_school_data()
    
    # 거리 계산
    df['distance_km'] = df.apply(
        lambda r: haversine(lat, lon, r['latitude'], r['longitude']), axis=1)
    
    # 반경 내 학교 필터링
    nearby = df[df['distance_km'] <= radius].copy()
    
    if nearby.empty:
        return SearchResponse(
            apartment=apartment,
            coordinates={"latitude": lat, "longitude": lon},
            search_radius_km=radius,
            sort_by=sort_by,
            percentile=None,
            schools=[]
        )
    
    # 정렬
    if sort_by == "distance":
        nearby = nearby.sort_values('distance_km').head(20)
    else:
        nearby = nearby.sort_values('performance_score', ascending=False).head(20)
    
    # 순위 추가
    nearby = nearby.reset_index(drop=True)
    nearby['rank'] = nearby.index + 1
    
    # 백분율 계산
    avg_score = nearby['performance_score'].mean()
    all_scores = df['performance_score']
    lower_count = (all_scores < avg_score).sum()
    percentile = (lower_count / len(all_scores)) * 100
    upper_percent = 100 - int(percentile)
    
    # 결과 변환
    schools = []
    for _, row in nearby.iterrows():
        schools.append(School(
            학교명=row['학교명'],
            distance_km=round(row['distance_km'], 2),
            performance_score=round(row['performance_score'], 1),
            rank=row['rank']
        ))
    
    return SearchResponse(
        apartment=apartment,
        coordinates={"latitude": lat, "longitude": lon},
        search_radius_km=radius,
        sort_by=sort_by,
        percentile=round(upper_percent, 1),
        schools=schools
    )

@app.get("/generate")
def generate(prompt: str = Query(...)):
    """기존 텍스트 생성 엔드포인트 (호환성 유지)"""
    return {"generated_text": f"Generated text for: {prompt}"}