
import { ElectionResult } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ResultsSummaryProps {
  result: ElectionResult;
  electionStatus: string;
}

const ResultsSummary = ({ result, electionStatus }: ResultsSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Election Summary</CardTitle>
        <CardDescription>
          {electionStatus === 'completed' 
            ? 'Final results of the election.'
            : 'Current standings. Results will be finalized when the election ends.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Votes</p>
              <p className="text-3xl font-bold">{result.totalVotes}</p>
            </div>
            
            {result.winner && (
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm font-medium text-primary">
                  Leading Candidate
                </p>
                <p className="text-xl font-bold">
                  {result.winner.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {result.winner.votes} votes ({result.winner.percentage}%)
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsSummary;
