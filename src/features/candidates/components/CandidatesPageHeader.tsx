
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, PlusCircle, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Election } from "@/types";
import AddCandidateForm from "./AddCandidateForm"; 
import CandidateRegistrationForm from "./CandidateRegistrationForm";
import CandidateApplicationForm from "./CandidateApplicationForm";

interface CandidatesPageHeaderProps {
  election: Election | null;
  isAdmin: boolean;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  electionId: string;
  userId: string | undefined;
  userHasRegistered: boolean;
  userHasApplied: boolean;
  handleCandidateAdded: (candidate: any) => void;
  handleApplicationSubmitted: () => void;
  isElectionActiveOrUpcoming: () => boolean;
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
  handleApplicationSubmitted,
  isElectionActiveOrUpcoming
}: CandidatesPageHeaderProps) => {
  const [dialogType, setDialogType] = useState<'add' | 'register' | 'apply'>('add');
  
  // Check if the current date is within the candidacy period
  const isWithinCandidacyPeriod = () => {
    if (!election || !election.candidacyStartDate || !election.candidacyEndDate) {
      return false;
    }
    
    const now = new Date();
    const startDate = new Date(election.candidacyStartDate);
    const endDate = new Date(election.candidacyEndDate);
    
    return now >= startDate && now <= endDate;
  };

  // Determine if user can apply as a candidate
  const canApplyAsCandidate = () => {
    return !userHasRegistered && !userHasApplied && isWithinCandidacyPeriod();
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-3xl font-bold">
          {election ? (
            election.title
          ) : (
            <Skeleton className="h-9 w-64" />
          )}
        </h2>
        
        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Candidates</span>
          <span className="text-xs bg-muted rounded-full px-2 py-0.5 ml-1">
            {election ? election.status : <Skeleton className="h-4 w-16 inline-block" />}
          </span>
        </div>
        
        {election && election.candidacyStartDate && election.candidacyEndDate && (
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Candidacy Period: {new Date(election.candidacyStartDate).toLocaleDateString()} - {new Date(election.candidacyEndDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {isAdmin ? (
          <DialogTrigger asChild>
            <Button 
              onClick={() => { setDialogType('add'); setIsDialogOpen(true); }}
              className="bg-[#008f50] hover:bg-[#007a45]"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Candidate
            </Button>
          </DialogTrigger>
        ) : (
          isWithinCandidacyPeriod() && !userHasRegistered && !userHasApplied && (
            <DialogTrigger asChild>
              <Button 
                onClick={() => { setDialogType('apply'); setIsDialogOpen(true); }}
                className="bg-[#008f50] hover:bg-[#007a45]"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Apply as Candidate
              </Button>
            </DialogTrigger>
          )
        )}
        
        <DialogContent className="sm:max-w-[550px]">
          {dialogType === 'add' && isAdmin && (
            <>
              <DialogHeader>
                <DialogTitle>Add Candidate</DialogTitle>
                <DialogDescription>
                  Fill in the candidate details and click save.
                </DialogDescription>
              </DialogHeader>
              
              <AddCandidateForm 
                electionId={electionId}
                onCandidateAdded={handleCandidateAdded}
                onCancel={() => setIsDialogOpen(false)}
              />
            </>
          )}
          
          {dialogType === 'register' && (
            <>
              <DialogHeader>
                <DialogTitle>Register as Candidate</DialogTitle>
                <DialogDescription>
                  Fill in your details to register as a candidate for this election.
                </DialogDescription>
              </DialogHeader>
              
              <CandidateRegistrationForm 
                electionId={electionId}
                userId={userId || ''}
                onCandidateAdded={handleCandidateAdded}
                onClose={() => setIsDialogOpen(false)}
              />
            </>
          )}
          
          {dialogType === 'apply' && (
            <>
              <DialogHeader>
                <DialogTitle>Apply as Candidate</DialogTitle>
                <DialogDescription>
                  Submit your application to be a candidate in this election. Your application will be reviewed by an administrator.
                </DialogDescription>
              </DialogHeader>
              
              <CandidateApplicationForm 
                electionId={electionId}
                onApplicationSubmitted={handleApplicationSubmitted}
                onCancel={() => setIsDialogOpen(false)}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CandidatesPageHeader;
