
import { ElectionResult } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DetailedResultsProps {
  result: ElectionResult;
}

const DetailedResults = ({ result }: DetailedResultsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {result.candidates.length > 0 ? (
            result.candidates
              .sort((a, b) => b.votes - a.votes)
              .map((candidate, index) => (
                <div key={candidate.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-medium">
                        {candidate.name}
                      </p>
                      <p className="text-sm">
                        {candidate.votes} vote{candidate.votes !== 1 && 's'} ({candidate.percentage}%)
                      </p>
                    </div>
                    <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${candidate.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No votes have been cast yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DetailedResults;
