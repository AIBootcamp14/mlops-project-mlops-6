import argparse
import os
import csv
from asil_crawler import AsilCrawler


def parse_args():
    parser = argparse.ArgumentParser(
        description="Update school achievement/progression CSV files"
    )
    parser.add_argument(
        "--area",
        default="11", #서울 전체로 정의
        help="지역 코드 (예: 11=서울, 11680=서울 강남구)",
    )
    parser.add_argument(
        "--type",
        choices=["3", "4"],
        default="3",
        help="학교 유형 (3=중학교, 4=고등학교)",
    )
    parser.add_argument(
        "--metrics",
        nargs='+',
        choices=["achievement", "progression"],
        default=["achievement"],
        help="저장할 데이터 종류 (achievement=학업성취도, progression=진학률)",
    )
    parser.add_argument(
        "--output-dir",
        default=".",
        help="CSV 파일을 저장할 디렉토리",
    )
    return parser.parse_args()


def save_to_csv(data, filepath):
    if not data:
        print(f"경고: 저장할 데이터가 없습니다. ({filepath})")
        return
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    # CSV 헤더는 dict의 키 순서대로
    fieldnames = list(data[0].keys())
    with open(filepath, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
    print(f"Saved {len(data)} rows -> {filepath}")


def main():
    args = parse_args()
    crawler = AsilCrawler()

    # metric 별로 order/orderby 설정
    metric_map = {
        'achievement': ('1', 'desc'),  # 학업성취도순
        'progression': ('7', 'desc'),   # 진학률순
    }

    for metric in args.metrics:
        order, orderby = metric_map[metric]
        # 데이터 가져오기
        data = crawler.fetch_school_list(
            area_code=args.area,
            type1=args.type,
            order=order,
            orderby=orderby,
        )
        # ── [A] rank 열 제거 & location → gu·dong 분리 ─────────────────────
        for row in data:
            row.pop("rank", None)                    # 1) rank 제거
            loc = row.pop("location", "").strip()    # 2) location 추출·삭제
            parts = loc.split()
            gu = dong = ""
            for p in parts:                          # 3) 구 · 동 판별
                if p.endswith("구"):
                    gu = p
                elif p.endswith(("동", "읍", "면")):
                    dong = p
            row["gu"]   = gu
            row["dong"] = dong
        # ────────────────────────────────────────────────────────────────


        data = [row for row in data if row["school_name"] != "평균"]
        def _avg(row):
            v = row.get("average", "").replace("%", "").strip()  # '97.6%' → '97.6'
            return float(v) if v else -1                         # 빈 값이면 -1
        data.sort(key=_avg, reverse=True)
        for r in data: r.pop("average", None)

        # 파일명: metrics_area_type.csv
        filename = "middle_school.csv"  
        filepath = os.path.join(args.output_dir, filename)
        save_to_csv(data, filepath)


if __name__ == '__main__':
    main()