
import { Link } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Timer } from "lucide-react";
import { Election } from "@/types";

interface ElectionStatusAlertProps {
  election: Election;
  status: 'completed' | 'upcoming';
}

const ElectionStatusAlert = ({ election, status }: ElectionStatusAlertProps) => {
  if (status === 'completed') {
    return (
      <Alert className="mb-6 bg-muted">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>This election has ended</AlertTitle>
        <AlertDescription>
          Voting is no longer available, but you can view the results.
        </AlertDescription>
        <div className="mt-4">
          <Button asChild>
            <Link to={`/elections/${election.id}/results`}>View Results</Link>
          </Button>
        </div>
      </Alert>
    );
  }
  
  if (status === 'upcoming') {
    return (
      <Alert className="mb-6 bg-secondary/50">
        <Timer className="h-4 w-4" />
        <AlertTitle>This election has not started yet</AlertTitle>
        <AlertDescription>
          Voting will be available once the election starts on {new Date(election.startDate).toLocaleDateString()}.
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};

export default ElectionStatusAlert;
