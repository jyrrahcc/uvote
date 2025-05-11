
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, PlusCircle, Users, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  isUserEligible: boolean;
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
  isUserEligible,
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
    return !userHasRegistered && !userHasApplied && isWithinCandidacyPeriod() && isUserEligible;
  };
  
  // Get eligibility message
  const getEligibilityMessage = () => {
    if (!isUserEligible && !isAdmin) {
      return (
        <Alert variant="destructive" className="mt-4 md:mt-0 max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You are not eligible to apply for this election. This election may be restricted to specific departments or year levels.
          </AlertDescription>
        </Alert>
      );
    }
    
    if (userHasApplied) {
      return (
        <Alert className="mt-4 md:mt-0 max-w-md bg-green-50 border-green-200">
          <AlertDescription className="text-green-700">
            Your application has been submitted and is awaiting review.
          </AlertDescription>
        </Alert>
      );
    }
    
    return null;
  };

  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
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
      
      <div className="flex flex-col mt-4 md:mt-0 md:items-end space-y-2">
        {isAdmin ? (
          <Button 
            onClick={() => { setDialogType('add'); setIsDialogOpen(true); }}
            className="bg-[#008f50] hover:bg-[#007a45]"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Candidate
          </Button>
        ) : (
          canApplyAsCandidate() && (
            <Button 
              onClick={() => { setDialogType('apply'); setIsDialogOpen(true); }}
              className="bg-[#008f50] hover:bg-[#007a45]"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Apply as Candidate
            </Button>
          )
        )}
        
        {getEligibilityMessage()}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {dialogType === 'add' && isAdmin && (
          <DialogContent className="sm:max-w-[550px]">
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
          </DialogContent>
        )}
        
        {dialogType === 'register' && (
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Register as Candidate</DialogTitle>
              <DialogDescription>
                Fill in your details to register as a candidate for this election.
              </DialogDescription>
            </DialogHeader>
            
            <CandidateRegistrationForm 
              electionId={electionId}
              userId={userId || ''}
              onSuccess={handleCandidateAdded}
              onClose={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        )}
        
        {dialogType === 'apply' && (
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Apply as Candidate</DialogTitle>
              <DialogDescription>
                Submit your application to be a candidate in this election. Your application will be reviewed by an administrator.
              </DialogDescription>
            </DialogHeader>
            
            <CandidateApplicationForm 
              electionId={electionId}
              userId={userId || ''}
              open={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              onApplicationSubmitted={handleApplicationSubmitted}
            />
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default CandidatesPageHeader;
