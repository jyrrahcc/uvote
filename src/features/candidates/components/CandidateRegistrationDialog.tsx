
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  onApplicationSubmitted: () => void;
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
  const navigate = useNavigate();
  
  if (!userId) {
    // Redirect to login if not logged in
    if (isOpen) {
      navigate("/login");
      setIsOpen(false);
    }
    return null;
  }
  
  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {isAdmin ? (
        <CandidateRegistrationForm
          electionId={electionId}
          userId={userId}
          onSuccess={onCandidateAdded}
          onCancel={handleClose}
        />
      ) : userHasRegistered ? (
        <DialogContent>
          <Alert variant="default" className="mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You have already registered as a candidate for this election.
            </AlertDescription>
          </Alert>
        </DialogContent>
      ) : userHasApplied ? (
        <DialogContent>
          <Alert variant="default" className="mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You have already submitted an application for this election.
            </AlertDescription>
          </Alert>
        </DialogContent>
      ) : !isUserEligible ? (
        <DialogContent>
          <Alert variant="destructive" className="mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You are not eligible to register as a candidate for this election.
            </AlertDescription>
          </Alert>
        </DialogContent>
      ) : (
        <CandidateApplicationForm
          electionId={electionId}
          userId={userId}
          onClose={handleClose}
          onCancel={handleClose}
          onApplicationSubmitted={onApplicationSubmitted}
        />
      )}
    </Dialog>
  );
};

export default CandidateRegistrationDialog;
