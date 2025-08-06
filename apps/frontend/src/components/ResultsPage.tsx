import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, School, BarChart } from "lucide-react";
import SchoolCard from "./SchoolCard";

interface School {
  id: string;
  name: string;
  distance: number;
  achievementRate: number;
  address: string;
  studentCount: number;
  grade: "A" | "B" | "C" | "D";
  lat: number;
  lng: number;
}

interface ResultsPageProps {
  apartmentName: string;
  onBack: () => void;
}

const ResultsPage = ({ apartmentName, onBack }: ResultsPageProps) => {
  // 목업 데이터
  const mockSchools: School[] = [
    {
      id: "1",
      name: "서울중학교",
      distance: 0.3,
      achievementRate: 15,
      address: "서울시 강남구 역삼동 123-45",
      studentCount: 850,
      grade: "A",
      lat: 37.5665,
      lng: 126.978,
    },
    {
      id: "2",
      name: "한강중학교",
      distance: 0.5,
      achievementRate: 22,
      address: "서울시 강남구 삼성동 456-78",
      studentCount: 920,
      grade: "A",
      lat: 37.569,
      lng: 126.985,
    },
    {
      id: "3",
      name: "미래중학교",
      distance: 0.8,
      achievementRate: 18,
      address: "서울시 강남구 논현동 789-12",
      studentCount: 780,
      grade: "A",
      lat: 37.564,
      lng: 126.992,
    },
    {
      id: "4",
      name: "청솔중학교",
      distance: 1.1,
      achievementRate: 28,
      address: "서울시 강남구 신사동 234-56",
      studentCount: 1050,
      grade: "B",
      lat: 37.572,
      lng: 126.97,
    },
    {
      id: "5",
      name: "새로운중학교",
      distance: 1.3,
      achievementRate: 35,
      address: "서울시 서초구 반포동 345-67",
      studentCount: 890,
      grade: "B",
      lat: 37.558,
      lng: 126.985,
    },
    {
      id: "6",
      name: "희망중학교",
      distance: 1.5,
      achievementRate: 31,
      address: "서울시 서초구 서초동 456-78",
      studentCount: 950,
      grade: "B",
      lat: 37.555,
      lng: 126.992,
    },
    {
      id: "7",
      name: "꿈나무중학교",
      distance: 1.7,
      achievementRate: 42,
      address: "서울시 강남구 도곡동 567-89",
      studentCount: 820,
      grade: "B",
      lat: 37.575,
      lng: 126.98,
    },
    {
      id: "8",
      name: "푸른중학교",
      distance: 1.9,
      achievementRate: 38,
      address: "서울시 강남구 대치동 678-90",
      studentCount: 1100,
      grade: "B",
      lat: 37.571,
      lng: 126.99,
    },
  ];

  const averageAchievementRate = Math.round(
    mockSchools.reduce((sum, school) => sum + school.achievementRate, 0) /
      mockSchools.length
  );

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

  const gradeInfo = getAchievementGrade(averageAchievementRate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
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
              반경 3km 내 {mockSchools.length}개 중학교 기준
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold mb-2">
                  상위 {averageAchievementRate}%
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
                거리 순으로 정렬된 {mockSchools.length}개 중학교
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-3">
            {mockSchools.map((school, index) => (
              <SchoolCard key={school.id} school={school} rank={index + 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
