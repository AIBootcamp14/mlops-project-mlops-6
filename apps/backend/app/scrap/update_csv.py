#!/usr/bin/env python3
# update_csv.py
# ----------------
# 이 스크립트는 학교알리미(asil.kr)에서 지정한 지역·학교유형의
# 학업성취도(achievement) 및 진학률(progression) 데이터를
# 실시간으로 크롤링하여 CSV 파일로 저장(갱신)합니다.

import argparse
import os
import csv
import requests
from bs4 import BeautifulSoup

# 크롤링에 사용할 기본 URL 및 헤더
BASE_URL = 'http://asil.kr/asil/sub/school_list.jsp'
HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/115.0.0.0 Safari/537.36'
    ),
    'Referer': 'http://asil.kr/asil/sub/school_list.jsp',
    'Origin': 'http://asil.kr'
}


def fetch_school_list(area: str, type1: str, order: str, orderby: str) -> list[dict]:
    """
    주어진 파라미터로 POST 요청을 보내고, 두 번째 .tbList 테이블을 파싱하여
    학교 목록을 반환합니다.
    """
    session = requests.Session()
    session.headers.update(HEADERS)
    payload = {
        'area': area,
        'type1': type1,
        'order': order,
        'orderby': orderby,
    }
    resp = session.post(BASE_URL, data=payload)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, 'html.parser')
    tables = soup.select('div.tbList')
    # 첫 번째 tbList는 헤더, 두 번째부터 실제 데이터
    if len(tables) < 2:
        return []
    table = tables[1].find('table')

    rows = table.select('tbody tr')
    data = []
    for tr in rows:
        cols = [td.get_text(strip=True) for td in tr.find_all('td')]
        if len(cols) < 11:
            continue
        data.append({
            'rank': cols[0],
            'location': cols[1],
            'school_name': cols[2],
            'applicants': cols[3],
            'average': cols[4],
            'korean': cols[5],
            'english': cols[6],
            'math': cols[7],
            'special_ratio': cols[8],
            'special_count': cols[9],
            'graduates': cols[10],
        })
    return data


def save_to_csv(data: list[dict], filepath: str):
    if not data:
        print(f"경고: 저장할 데이터가 없습니다. ({filepath})")
        return
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    fieldnames = list(data[0].keys())
    with open(filepath, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
    print(f"Saved {len(data)} rows -> {filepath}")


def parse_args():
    parser = argparse.ArgumentParser(
        description="Update school achievement/progression CSV files"
    )
    parser.add_argument(
        "--area", default="11680", help="지역 코드 (예: 11=서울, 11680=강남구)"
    )
    parser.add_argument(
        "--type", choices=["3", "4"], default="3",
        help="학교 유형 (3=중학교, 4=고등학교)"
    )
    parser.add_argument(
        "--metrics", nargs='+',
        choices=["achievement", "progression"],
        default=["achievement"],
        help="저장할 데이터 종류"
    )
    parser.add_argument(
        "--output-dir", default=".",
        help="CSV 파일을 저장할 디렉토리"
    )
    return parser.parse_args()


def main():
    args = parse_args()
    # metrics별 order/orderby 매핑
    metric_map = {
        'achievement': ('1', 'desc'),  # 학업성취도 순
        'progression': ('7', 'desc'),   # 진학률 순
    }

    for metric in args.metrics:
        order, orderby = metric_map[metric]
        data = fetch_school_list(
            area=args.area,
            type1=args.type,
            order=order,
            orderby=orderby,
        )
        filename = f"{metric}_{args.area}_{args.type}.csv"
        filepath = os.path.join(args.output_dir, filename)
        save_to_csv(data, filepath)


if __name__ == '__main__':
    main()
