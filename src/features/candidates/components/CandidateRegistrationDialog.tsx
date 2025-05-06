
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import CandidateRegistrationForm from "./CandidateRegistrationForm";

interface CandidateRegistrationDialogProps {
  isAdmin: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  canRegister: boolean;
  userHasRegistered: boolean;
  electionId: string;
  userId: string;
  onCandidateAdded: (candidate: any) => void;
}

const CandidateRegistrationDialog = ({
  isAdmin,
  isOpen,
  setIsOpen,
  canRegister,
  userHasRegistered,
  electionId,
  userId,
  onCandidateAdded
}: CandidateRegistrationDialogProps) => {
  if (isAdmin) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="mt-4 md:mt-0">
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
                onClose={() => setIsOpen(false)}
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
          <Button className="mt-4 md:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            Register as Candidate
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Candidate Registration</DialogTitle>
            <DialogDescription>
              Submit this form to register as a candidate for this election.
            </DialogDescription>
          </DialogHeader>
          
          {electionId && (
            <div className="pt-4">
              <CandidateRegistrationForm
                electionId={electionId}
                userId={userId}
                onCandidateAdded={onCandidateAdded}
                onClose={() => setIsOpen(false)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
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
