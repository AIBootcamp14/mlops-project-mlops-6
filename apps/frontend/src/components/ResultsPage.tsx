import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, School, BarChart, Loader2 } from "lucide-react";
import SchoolCard from "./SchoolCard";

// API 응답 타입 정의
interface ApiSchool {
  학교명: string;
  distance_km: number;
  performance_score: number;
  rank: number;
}

interface ApiResponse {
  apartment: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  search_radius_km: number;
  sort_by: string;
  percentile: number | null;
  schools: ApiSchool[];
}

const ResultsPage = () => {
  const { apartmentName } = useParams<{ apartmentName: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!apartmentName) return;

      try {
        setLoading(true);
        setError(null);

        // 런타임 config 또는 환경변수에서 API URL 가져오기
        const apiUrl =
          window.APP_CONFIG?.API_URL ||
          import.meta.env.VITE_API_URL ||
          "http://localhost:8000";

        const response = await fetch(
          `${apiUrl}/search-schools?apartment=${encodeURIComponent(
            apartmentName
          )}&sort_by=distance&radius=3.0`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "검색 중 오류가 발생했습니다.");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apartmentName]);

  const handleBack = () => {
    navigate("/");
  };

  // apartmentName이 없으면 검색 페이지로 리다이렉트
  if (!apartmentName) {
    navigate("/");
    return null;
  }

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <h2 className="text-xl font-semibold">검색 중...</h2>
          <p className="text-muted-foreground">
            {apartmentName} 주변 중학교 정보를 찾고 있습니다.
          </p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="p-4 bg-destructive/10 rounded-full w-fit mx-auto">
            <School className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold">검색 실패</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={handleBack} className="mt-4">
            다시 검색하기
          </Button>
        </div>
      </div>
    );
  }

  // 데이터가 없거나 학교가 없는 경우
  if (!data || !data.schools || data.schools.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="p-4 bg-muted rounded-full w-fit mx-auto">
            <School className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">검색 결과 없음</h2>
          <p className="text-muted-foreground">
            반경 3km 내에 중학교가 없습니다. 다른 아파트를 검색해보세요.
          </p>
          <Button onClick={handleBack} className="mt-4">
            다시 검색하기
          </Button>
        </div>
      </div>
    );
  }

  const getAchievementGrade = (rate: number) => {
    if (rate <= 20)
      return {
        grade: "A",
        color: "bg-accent text-accent-foreground",
        label: "최상위권",
      };
    if (rate <= 35)
      return {
        grade: "B",
        color: "bg-primary text-primary-foreground",
        label: "상위권",
      };
    if (rate <= 50)
      return {
        grade: "C",
        color: "bg-secondary text-secondary-foreground",
        label: "중위권",
      };
    return {
      grade: "D",
      color: "bg-muted text-muted-foreground",
      label: "하위권",
    };
  };

  const gradeInfo = getAchievementGrade(data.percentile || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            다시 검색
          </Button>
          <div>
            <h1 className="text-xl font-bold">{apartmentName}</h1>
            <p className="text-sm text-muted-foreground">
              반경 3km 내 중학교 정보
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* 평균 학업성취도 요약 */}
        <Card className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart className="h-6 w-6" />
              주변 중학교 평균 학업성취도
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              반경 3km 내 {data.schools.length}개 중학교 기준
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold mb-2">
                  상위 {data.percentile || 0}%
                </div>
                <Badge className={`${gradeInfo.color} text-sm`}>
                  {gradeInfo.grade}등급 · {gradeInfo.label}
                </Badge>
              </div>
              <div className="text-right text-primary-foreground/80">
                <div className="text-sm">전체 중학교 대비</div>
                <div className="text-lg font-semibold">상위권 학군</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 중학교 목록 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5 text-primary" />
                주변 중학교 목록
              </CardTitle>
              <CardDescription>
                거리 순으로 정렬된 {data.schools.length}개 중학교
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-3">
            {data.schools.map((school) => (
              <SchoolCard
                key={school.rank}
                school={school}
                rank={school.rank}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
