
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, FileCheck, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { hasUserAppliedForElection } from "../services/candidateApplicationService";
import CandidateApplicationForm from "./CandidateApplicationForm";
import { useAuth } from "@/features/auth/context/AuthContext";
import { checkUserEligibility } from "@/utils/eligibilityUtils";
import { Election } from "@/types";

interface ApplyAsCandidateDialogProps {
  electionId: string;
  electionActive: boolean;
  onApplicationSubmitted: () => void;
  election: Election | null;
  isUserEligible?: boolean;
  eligibilityReason?: string | null;
}

const ApplyAsCandidateDialog = ({
  electionId,
  electionActive,
  onApplicationSubmitted,
  election,
  isUserEligible: initialEligibility,
  eligibilityReason: initialEligibilityReason
}: ApplyAsCandidateDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUserEligible, setIsUserEligible] = useState(initialEligibility !== undefined ? initialEligibility : true);
  const [eligibilityReason, setEligibilityReason] = useState<string | null>(initialEligibilityReason || null);
  const { user } = useAuth();
  const userId = user?.id || '';
  
  useEffect(() => {
    const checkApplicationAndEligibility = async () => {
      if (userId && electionId) {
        setLoading(true);
        
        // Check if user has applied
        const applied = await hasUserAppliedForElection(electionId, userId);
        setHasApplied(applied);
        
        // Check eligibility if not provided externally
        if (initialEligibility === undefined && election) {
          const eligibilityResult = await checkUserEligibility(userId, election);
          setIsUserEligible(eligibilityResult.isEligible);
          setEligibilityReason(eligibilityResult.reason);
        }
        
        setLoading(false);
      }
    };
    
    checkApplicationAndEligibility();
  }, [electionId, userId, election, initialEligibility, initialEligibilityReason]);
  
  const handleSuccess = () => {
    setIsOpen(false);
    onApplicationSubmitted();
    setHasApplied(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };
  
  if (loading) {
    return <div className="h-9 w-[150px] bg-muted/20 animate-pulse rounded-md"></div>;
  }
  
  if (hasApplied) {
    return (
      <Alert className="max-w-xs bg-green-50 border-green-200">
        <FileCheck className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-green-700">
          Your application has been submitted and is awaiting review.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!electionActive) {
    return (
      <Alert className="max-w-xs">
        <AlertDescription>
          Only upcoming or active elections accept candidate applications.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!isUserEligible) {
    return (
      <Alert className="max-w-xs bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-amber-700">
          {eligibilityReason || "You are not eligible to apply for this election based on department or year level requirements."}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Apply as Candidate
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Apply as Candidate</DialogTitle>
        </DialogHeader>
        <CandidateApplicationForm
          electionId={electionId}
          userId={userId}
          onClose={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
          onApplicationSubmitted={handleSuccess}
          isUserEligible={isUserEligible}
          eligibilityReason={eligibilityReason}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ApplyAsCandidateDialog;
