import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, School, MapPin } from "lucide-react";

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
            <h3 className="font-medium mb-1">실시간 검색</h3>
            <p className="text-sm text-muted-foreground">
              최신 데이터로 정확한 정보
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
