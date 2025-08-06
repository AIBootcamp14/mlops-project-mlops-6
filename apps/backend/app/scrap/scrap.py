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
        default="11680",
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
        # 파일명: metrics_area_type.csv
        filename = f"{metric}_{args.area}_{args.type}.csv"
        filepath = os.path.join(args.output_dir, filename)
        save_to_csv(data, filepath)


if __name__ == '__main__':
    main()