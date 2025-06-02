
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart } from "lucide-react";
import { Election } from "@/types";

interface CandidacyPeriodCardProps {
  election: Election;
  formatDate: (dateString: string) => string;
}

const CandidacyPeriodCard: React.FC<CandidacyPeriodCardProps> = ({
  election,
  formatDate
}) => {
  const isClosed = election.candidacyEndDate && new Date() > new Date(election.candidacyEndDate);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Candidacy Period
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            {isClosed ? "Closed" : "Open"}
          </div>
          <LineChart className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>
          {formatDate(election.candidacyStartDate || "")} - {formatDate(election.candidacyEndDate || "")}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default CandidacyPeriodCard;
