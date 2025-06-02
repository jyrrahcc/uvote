
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CandidatesPositionsCardProps {
  candidatesCount: number;
  positionsCount: number;
}

const CandidatesPositionsCard: React.FC<CandidatesPositionsCardProps> = ({
  candidatesCount,
  positionsCount
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Candidates & Positions
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold">
            {candidatesCount}
          </div>
          <ClipboardList className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>
          Across {positionsCount} {positionsCount === 1 ? 'position' : 'positions'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xs text-muted-foreground mb-1">Candidates per position:</div>
        <Progress 
          value={positionsCount > 0 ? 
            (candidatesCount / positionsCount) * 20 : 0} 
          className="h-2" 
        />
      </CardContent>
    </Card>
  );
};

export default CandidatesPositionsCard;
