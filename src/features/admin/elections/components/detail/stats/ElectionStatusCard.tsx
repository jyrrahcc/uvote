
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Election } from "@/types";

interface ElectionStatusCardProps {
  election: Election;
  timeInfo: {
    text: string;
    statusText: string;
    daysRemaining?: number;
    hoursRemaining?: number;
  };
  formatDate: (dateString: string) => string;
}

const ElectionStatusCard: React.FC<ElectionStatusCardProps> = ({
  election,
  timeInfo,
  formatDate
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Election Status
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold capitalize">
            {election.status}
          </div>
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>
          {timeInfo.text}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatDate(election.startDate)}</span>
          <span>{formatDate(election.endDate)}</span>
        </div>
        <Progress 
          value={election.status === 'upcoming' ? 0 : 
                election.status === 'completed' ? 100 : 
                50} 
          className="h-2 mt-1" 
        />
      </CardContent>
    </Card>
  );
};

export default ElectionStatusCard;
