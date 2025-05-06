
import { Election } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import AddCandidateForm from "./AddCandidateForm";
import ApplyAsCandidateDialog from "./ApplyAsCandidateDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CandidatesPageHeaderProps {
  election: Election | null;
  isAdmin: boolean;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  electionId: string;
  userId: string | undefined;
  userHasRegistered: boolean;
  userHasApplied: boolean;
  handleCandidateAdded: (data: any) => void;
  isElectionActiveOrUpcoming: () => boolean;
  handleApplicationSubmitted: () => void;
}

const CandidatesPageHeader = ({
  election,
  isAdmin,
  isDialogOpen,
  setIsDialogOpen,
  electionId,
  userId,
  userHasRegistered,
  userHasApplied,
  handleCandidateAdded,
  isElectionActiveOrUpcoming,
  handleApplicationSubmitted
}: CandidatesPageHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">
          {election?.title || "Candidates"}
        </h1>
        {election && (
          <p className="text-muted-foreground mt-1">
            {election.description}
          </p>
        )}
      </div>
      
      {isAdmin ? (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Candidate
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Candidate</DialogTitle>
              <DialogDescription>
                Fill out this form to add a new candidate to this election.
              </DialogDescription>
            </DialogHeader>
            
            {electionId && (
              <AddCandidateForm
                electionId={electionId}
                onCandidateAdded={handleCandidateAdded}
                onClose={() => setIsDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      ) : (
        electionId && userId && !userHasRegistered && !userHasApplied && (
          <ApplyAsCandidateDialog 
            electionId={electionId}
            userId={userId}
            electionActive={isElectionActiveOrUpcoming()}
            onApplicationSubmitted={handleApplicationSubmitted}
          />
        )
      )}
    </div>
  );
};

export default CandidatesPageHeader;
