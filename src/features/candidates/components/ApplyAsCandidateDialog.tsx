
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, FileCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { hasUserAppliedForElection } from "../services/candidateApplicationService";
import CandidateApplicationForm from "./CandidateApplicationForm";
import { useAuth } from "@/features/auth/context/AuthContext";

interface ApplyAsCandidateDialogProps {
  electionId: string;
  electionActive: boolean;
  onApplicationSubmitted: () => void;
}

const ApplyAsCandidateDialog = ({
  electionId,
  electionActive,
  onApplicationSubmitted
}: ApplyAsCandidateDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const userId = user?.id || '';
  
  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (userId && electionId) {
        setLoading(true);
        const applied = await hasUserAppliedForElection(electionId, userId);
        setHasApplied(applied);
        setLoading(false);
      }
    };
    
    checkApplicationStatus();
  }, [electionId, userId]);
  
  const handleSuccess = () => {
    setIsOpen(false);
    onApplicationSubmitted();
    setHasApplied(true);
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
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Apply as Candidate
        </Button>
      </DialogTrigger>
      
      {isOpen && (
        <CandidateApplicationForm
          electionId={electionId}
          userId={userId}
          open={isOpen}
          onClose={() => setIsOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </Dialog>
  );
};

export default ApplyAsCandidateDialog;
