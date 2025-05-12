
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import CandidateRegistrationForm from "./CandidateRegistrationForm";
import CandidateApplicationForm from "./CandidateApplicationForm";

interface CandidateRegistrationDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isAdmin: boolean;
  canRegister: boolean;
  userHasRegistered: boolean;
  userHasApplied: boolean;
  isUserEligible: boolean;
  electionId: string;
  userId: string;
  onCandidateAdded?: (candidate: any) => void;
  onApplicationSubmitted?: () => void;
  eligibilityReason?: string | null;
}

const CandidateRegistrationDialog = ({
  isOpen,
  setIsOpen,
  isAdmin,
  canRegister,
  userHasRegistered,
  userHasApplied,
  isUserEligible,
  electionId,
  userId,
  onCandidateAdded,
  onApplicationSubmitted,
  eligibilityReason
}: CandidateRegistrationDialogProps) => {
  const getDialogTitle = () => {
    if (isAdmin) {
      return "Add New Candidate";
    }
    return "Register as Candidate";
  };

  const getDialogDescription = () => {
    if (isAdmin) {
      return "Add a new candidate to the election.";
    }
    return "Submit your application to be a candidate in this election.";
  };

  const renderContent = () => {
    // If user has already registered or applied and is not admin
    if ((userHasRegistered || userHasApplied) && !isAdmin) {
      return (
        <Alert className="mt-2 bg-blue-50 border-blue-100">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            {userHasRegistered
              ? "You are already registered as a candidate for this election."
              : "You have already submitted an application for this election. Your application is being reviewed."}
          </AlertDescription>
        </Alert>
      );
    }

    // If user is not eligible and not admin
    if (!isUserEligible && !isAdmin) {
      return (
        <Alert className="mt-2 bg-red-50 border-red-100">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {eligibilityReason || "You are not eligible to register as a candidate for this election."}
          </AlertDescription>
        </Alert>
      );
    }

    // For admin - direct registration form
    if (isAdmin) {
      return (
        <CandidateRegistrationForm
          electionId={electionId}
          userId={userId}
          onSuccess={(candidate) => {
            if (onCandidateAdded) onCandidateAdded(candidate);
            setIsOpen(false);
          }}
          onCancel={() => setIsOpen(false)}
          onClose={() => setIsOpen(false)}
        />
      );
    }

    // For eligible users - application form or registration form based on election policy
    return (
      <CandidateApplicationForm
        electionId={electionId}
        userId={userId}
        onSuccess={(candidate: any) => {
          if (onCandidateAdded) onCandidateAdded(candidate);
          setIsOpen(false);
        }}
        onApplicationSubmitted={() => {
          if (onApplicationSubmitted) onApplicationSubmitted();
          setIsOpen(false);
        }}
        onCancel={() => setIsOpen(false)}
        onClose={() => setIsOpen(false)}
        isUserEligible={isUserEligible}
        eligibilityReason={eligibilityReason}
      />
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>
        
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default CandidateRegistrationDialog;
