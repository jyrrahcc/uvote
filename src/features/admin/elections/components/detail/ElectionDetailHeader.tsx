
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, RotateCcw } from "lucide-react";
import { Election } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface ElectionDetailHeaderProps {
  election: Election;
  onBackClick: () => void;
  onCompleteElection: () => void;
  onResetVotes: () => void;
}

const ElectionDetailHeader = ({
  election,
  onBackClick,
  onCompleteElection,
  onResetVotes
}: ElectionDetailHeaderProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="secondary">Upcoming</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-600">Active</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const canCompleteElection = election.status === 'active';
  const canResetVotes = election.status === 'active'; // Only allow reset for active elections

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBackClick}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Elections
        </Button>
        {getStatusBadge(election.status)}
      </div>
      
      <div className="flex gap-2">
        {/* Reset Votes Button - Only show for active elections */}
        {canResetVotes && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-600 hover:text-red-700">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Votes
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset All Votes</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete all votes for this election. 
                  This action cannot be undone. Are you sure you want to continue?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={onResetVotes}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Reset All Votes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        
        {/* Complete Election Button - Only show for active elections */}
        {canCompleteElection && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete Election
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Complete Election</AlertDialogTitle>
                <AlertDialogDescription>
                  This will mark the election as completed and finalize all results. 
                  No more votes can be cast after this action. Are you sure?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onCompleteElection}>
                  Complete Election
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
};

export default ElectionDetailHeader;
