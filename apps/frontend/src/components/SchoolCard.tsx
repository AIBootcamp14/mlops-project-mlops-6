import { Card, CardContent } from "./ui/card";
import { MapPin, TrendingUp } from "lucide-react";

interface School {
  id: string;
  name: string;
  distance: number;
  achievementRate: number;
  address: string;
}

interface SchoolCardProps {
  school: School;
  rank: number;
}

const SchoolCard = ({ school, rank }: SchoolCardProps) => {
  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  return (
    <Card className="hover:shadow-card transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary">
      <CardContent className="p-4">
        <div className="relative flex items-start mb-3">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary font-bold text-sm">
              {rank}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg leading-tight mb-1">
                {school.name}
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  거리
                </p>
                <div className="font-semibold text-primary">
                  {formatDistance(school.distance)}
                </div>
              </div>
            </div>
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 top-6 flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              학업성취도
            </div>
            <div className="font-semibold text-accent">
              상위 {school.achievementRate}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolCard;
