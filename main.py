# school_zone_analysis.py
# 아파트명을 입력받아 반경 3km 내 중학교 학군 정보를 상위 백분율과 학교 리스트로 반환하는 스크립트
# 기존에 생성된 'middle_schools.csv' 파일을 사용합니다.
#
# 처리 순서:
# 1) geocode_address: 아파트명 → 위도·경도 확보
# 2) load_school_data: CSV에서 학교 데이터(위도, 경도, 학업성취도) 로드
# 3) analyze_schools: 반경 3km 내 학교의 평균 학업성취도를 전국 대비 상위 백분율로 계산
#                   + 반경 내에서 가장 가까운 20개 학교 리스트(학교명, 거리, 성취도, 순위) 생성
# 4) 결과를 터미널에 출력
#
# 사용법: python school_zone_analysis.py --apartment "래미안퍼스티지"

import os
import sys
import argparse
import pandas as pd
import requests
from dotenv import load_dotenv

# .env 로드하여 Kakao API 키 가져오기
load_dotenv()
KAKAO_KEY = os.getenv("KAKAO_REST_API_KEY")
if not KAKAO_KEY:
    print("Error: .env에 KAKAO_REST_API_KEY를 설정하세요.", file=sys.stderr)
    sys.exit(1)

# 데이터 CSV 파일 (기본값: middle_schools.csv)
SCHOOL_DATA_CSV = os.getenv("SCHOOL_DATA_CSV", "middle_schools.csv")

# Kakao 키워드 검색 엔드포인트 (아파트명 → 좌표)
KEYWORD_URL = "https://dapi.kakao.com/v2/local/search/keyword.json"

# 두 좌표 간 거리 계산 (Haversine)
def haversine(lat1, lon1, lat2, lon2):
    from math import radians, cos, sin, asin, sqrt
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    return 6371 * c

# 아파트명으로 좌표 얻기 (키워드 검색 API 이용)
def geocode_address(query: str):
    headers = {"Authorization": f"KakaoAK {KAKAO_KEY}"}
    params = {"query": query, "size": 1}
    res = requests.get(KEYWORD_URL, headers=headers, params=params)
    if res.status_code == 403:
        print("Error 403: Forbidden. Kakao REST API 키나 앱 설정을 확인하세요.", file=sys.stderr)
        sys.exit(1)
    res.raise_for_status()
    docs = res.json().get("documents", [])
    if not docs:
        return None
    p = docs[0]
    return float(p.get("y")), float(p.get("x"))  # latitude, longitude

# 학교 데이터 로드 (컬럼: 구, 동, 학교명, 학업성취도, 도로명주소, X좌표(경도), Y좌표(위도))
def load_school_data(csv_path: str) -> pd.DataFrame:
    cols = ['구', '동', '학교명', '학업성취도', '도로명주소', 'X좌표(경도)', 'Y좌표(위도)']
    df = pd.read_csv(csv_path, usecols=cols, encoding='utf-8-sig')
    df = df.rename(columns={
        '학업성취도': 'performance_score',
        'X좌표(경도)': 'longitude',
        'Y좌표(위도)': 'latitude'
    })
    df['latitude'] = pd.to_numeric(df['latitude'], errors='coerce')
    df['longitude'] = pd.to_numeric(df['longitude'], errors='coerce')
    df['performance_score'] = pd.to_numeric(df['performance_score'], errors='coerce')
    return df.dropna(subset=['latitude', 'longitude', 'performance_score'])

# 인근 학교 분석: 반경 3km 내 평균 성취도 상위 백분율, 가장 가까운 20개 학교 리스트 생성
def analyze_schools(center_lat: float, center_lon: float, df: pd.DataFrame, func: str, radius_km: float = 3.0):
    # 거리 계산
    df['distance_km'] = df.apply(
        lambda r: haversine(center_lat, center_lon, r['latitude'], r['longitude']), axis=1)
    nearby = df[df['distance_km'] <= radius_km].copy()

    # 반경 내 학교가 없으면 빈 결과 반환
    if nearby.empty:
        return {'percentile': None, 'schools': []}

    # 평균 성취도 계산
    avg_score = nearby['performance_score'].mean()

    # 전국 대비 백분율 계산 (평균 성취도보다 낮은 학교 비율)
    all_scores = df['performance_score']
    lower_count = (all_scores < avg_score).sum()
    percentile = lower_count / len(all_scores) * 100
    upper_percent = 100 - int(percentile)

    # 반경 내 학교 중 func에 따른 정렬 후 상위 20개 선택 및 순위 부여
    try:
        if func == 'distance':
            nearby = nearby.sort_values(by='distance_km', ascending=True).head(20)
        elif func == 'score':
            nearby = nearby.sort_values(by='performance_score', ascending=False).head(20)
        else:
            print('Error')
        nearby = nearby.reset_index(drop=True)
        nearby['rank'] = nearby.index + 1
   
        
        schools_list = nearby[['학교명', 'distance_km', 'performance_score', 'rank']].to_dict(orient='records')
        return {'percentile': upper_percent, 'schools': schools_list}
    except Exception as e:
        print(e)

# CLI 진입점
def main():
    parser = argparse.ArgumentParser(description="아파트명으로 반경 3km 내 중학교 학군 정보 반환")
    parser.add_argument('--apartment', type=str, required=True, help="아파트명 입력")
    args = parser.parse_args()
    while True:
        func = input('Choose one between [distance / score]  ').strip().lower()
        if func in ['distance', 'score']:
            break
        else:
            print('잘못된 입력입니다. "distance" 또는 "score" 중 하나를 입력하세요.')


    coords = geocode_address(args.apartment)
    if not coords:
        print(f"'{args.apartment}' 주소를 찾을 수 없습니다.")
        sys.exit(1)
    lat, lon = coords

    df = load_school_data(SCHOOL_DATA_CSV)
    result = analyze_schools(lat, lon, df, func)

    # 출력
    pct = result['percentile']
    if pct is None:
        print("반경 3km 내에 중학교가 없습니다.")
    else:
        print(f"반경 3km 내 중학교 평균 학업성취도: 상위 {pct}%")
        print("중학교 리스트(가장 가까운 20개):")
        for s in result['schools']:
            print(f"{s['rank']}. {s['학교명']} - 거리: {s['distance_km']:.2f}km, 성취도: {s['performance_score']}" if func == 'distance' else f"{s['rank']}. {s['학교명']} - 성취도: {s['performance_score']}, 거리: {s['distance_km']:.2f}km")



if __name__ == '__main__':
    main()

