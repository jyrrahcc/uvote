
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface VoteSummaryProps {
  electionId: string;
}

const VoteSummary = ({ electionId }: VoteSummaryProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Thank You for Voting</CardTitle>
        <CardDescription>
          You have already cast your vote in this election.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center py-8">
        <div className="rounded-full bg-green-100 p-3">
          <Check className="h-8 w-8 text-green-600" />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          asChild 
          variant="outline"
          className="w-full"
        >
          <Link to={`/elections/${electionId}/results`}>View Results</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VoteSummary;
