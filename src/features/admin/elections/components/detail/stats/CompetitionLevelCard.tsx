
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CompetitionLevelCardProps {
  candidatesCount: number;
  positionsCount: number;
}

const CompetitionLevelCard: React.FC<CompetitionLevelCardProps> = ({
  candidatesCount,
  positionsCount
}) => {
  const competitionLevel = candidatesCount > 0 && positionsCount > 0 ? 
    (candidatesCount / positionsCount).toFixed(1) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Competition Level
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            {competitionLevel}
          </div>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>
          Average candidates per position
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Progress 
          value={candidatesCount > 0 && positionsCount > 0 ? 
            Math.min(100, (candidatesCount / positionsCount) * 25) : 0} 
          className="h-2" 
        />
      </CardContent>
    </Card>
  );
};

export default CompetitionLevelCard;
