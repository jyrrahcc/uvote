
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CandidateRegistrationForm from "./CandidateRegistrationForm";
import CandidateApplicationForm from "./CandidateApplicationForm";

interface CandidateRegistrationDialogProps {
  isAdmin: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  canRegister: boolean;
  userHasRegistered: boolean;
  userHasApplied: boolean;
  isUserEligible: boolean;
  electionId: string;
  userId: string;
  onCandidateAdded: (candidate: any) => void;
  onApplicationSubmitted?: () => void;
}

const CandidateRegistrationDialog = ({
  isAdmin,
  isOpen,
  setIsOpen,
  canRegister,
  userHasRegistered,
  userHasApplied,
  isUserEligible,
  electionId,
  userId,
  onCandidateAdded,
  onApplicationSubmitted
}: CandidateRegistrationDialogProps) => {
  // Function to close the dialog
  const handleClose = () => setIsOpen(false);

  if (isAdmin) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="mt-4 md:mt-0" type="button">
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
            <div className="pt-4">
              <CandidateRegistrationForm
                electionId={electionId}
                userId={userId}
                onCandidateAdded={onCandidateAdded}
                onClose={handleClose}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  if (canRegister) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="mt-4 md:mt-0" type="button">
            <Plus className="mr-2 h-4 w-4" />
            Apply as Candidate
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Candidate Application</DialogTitle>
            <DialogDescription>
              Submit this form to apply as a candidate for this election.
            </DialogDescription>
          </DialogHeader>
          
          {electionId && (
            <div className="pt-4">
              <CandidateApplicationForm
                electionId={electionId}
                userId={userId}
                open={isOpen}
                onClose={handleClose}
                onApplicationSubmitted={onApplicationSubmitted}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  if (!isUserEligible && !isAdmin) {
    return (
      <Alert className="max-w-xs mt-4 md:mt-0" variant="destructive">
        <AlertTitle>Not Eligible</AlertTitle>
        <AlertDescription>
          You are not eligible to apply as a candidate for this election.
        </AlertDescription>
      </Alert>
    );
  }

  if (userHasApplied) {
    return (
      <Alert className="max-w-xs mt-4 md:mt-0 bg-green-50 border-green-200">
        <AlertTitle className="text-green-700">Application Submitted</AlertTitle>
        <AlertDescription className="text-green-700">
          Your application has been submitted and is awaiting review.
        </AlertDescription>
      </Alert>
    );
  }

  if (userHasRegistered) {
    return (
      <Alert className="max-w-xs mt-4 md:mt-0">
        <AlertDescription>
          You have already registered as a candidate for this election.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default CandidateRegistrationDialog;
