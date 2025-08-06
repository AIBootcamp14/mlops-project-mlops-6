import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Users } from "lucide-react";

interface School {
  id: string;
  name: string;
  distance: number;
  achievementRate: number;
  address: string;
  studentCount: number;
  grade: 'A' | 'B' | 'C' | 'D';
}

interface SchoolCardProps {
  school: School;
  rank: number;
}

const SchoolCard = ({ school, rank }: SchoolCardProps) => {
  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-accent text-accent-foreground';
      case 'B': return 'bg-primary text-primary-foreground';
      case 'C': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
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
              <h3 className="font-semibold text-lg leading-tight mb-1">{school.name}</h3>
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

export default SchoolCard;