import { useState } from "react";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Badge } from "./components/ui/badge";
import {
  Search,
  School,
  MapPin,
  ArrowLeft,
  TrendingUp,
  Users,
  BarChart,
} from "lucide-react";
import "./App.css";

const queryClient = new QueryClient();

// 아파트 주변 중학교 정보 관련 타입과 컴포넌트
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

interface SchoolCardProps {
  school: School;
  rank: number;
}

const SchoolCard = ({ school, rank }: SchoolCardProps) => {
  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-accent text-accent-foreground";
      case "B":
        return "bg-primary text-primary-foreground";
      case "C":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  return (
    <Card className="hover:shadow-card transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary font-bold text-sm">
              {rank}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg leading-tight mb-1">
                {school.name}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {school.address}
              </p>
            </div>
          </div>
          <Badge className={getGradeBadgeColor(school.grade)}>
            {school.grade}등급
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
              <MapPin className="h-3 w-3" />
              거리
            </div>
            <div className="font-semibold text-primary">
              {formatDistance(school.distance)}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
              <TrendingUp className="h-3 w-3" />
              학업성취도
            </div>
            <div className="font-semibold text-accent">
              상위 {school.achievementRate}%
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
              <Users className="h-3 w-3" />
              학생 수
            </div>
            <div className="font-semibold">
              {school.studentCount.toLocaleString()}명
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// 아파트 검색 페이지 컴포넌트
const SearchPage = () => {
  const [apartmentName, setApartmentName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apartmentName.trim()) {
      navigate(`/results/${encodeURIComponent(apartmentName.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <School className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            아파트 주변 중학교 정보
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            아파트명을 입력하시면 반경 3km 내 중학교의 학업성취도와 위치 정보를
            제공해드립니다
          </p>
        </div>

        {/* Search Card */}
        <Card className="shadow-elevated border-0">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              아파트 검색
            </CardTitle>
            <CardDescription>정확한 아파트명을 입력해주세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="예: 헬리오시티, 래미안퍼스티지, 롯데캐슬..."
                  value={apartmentName}
                  onChange={(e) => setApartmentName(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
                disabled={!apartmentName.trim()}
              >
                주변 중학교 정보 검색
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center p-4">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-accent/10 rounded-lg">
                <School className="h-6 w-6 text-accent" />
              </div>
            </div>
            <h3 className="font-medium mb-1">학업성취도</h3>
            <p className="text-sm text-muted-foreground">
              평균 성취도 백분율 제공
            </p>
          </Card>
          <Card className="text-center p-4">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="font-medium mb-1">거리별 정렬</h3>
            <p className="text-sm text-muted-foreground">
              가까운 순서로 20개 학교
            </p>
          </Card>
          <Card className="text-center p-4">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-primary-glow/10 rounded-lg">
                <Search className="h-6 w-6 text-primary-glow" />
              </div>
            </div>
            <h3 className="font-medium mb-1">지도 보기</h3>
            <p className="text-sm text-muted-foreground">
              시각적 위치 정보 제공
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

// 결과 페이지 컴포넌트
const ResultsPage = () => {
  const { apartmentName } = useParams<{ apartmentName: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  // apartmentName이 없으면 검색 페이지로 리다이렉트
  if (!apartmentName) {
    navigate("/");
    return null;
  }
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

// 메인 App 컴포넌트
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/results/:apartmentName" element={<ResultsPage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
