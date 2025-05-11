
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ElectionTitleSectionProps {
  title: string;
  description: string;
  isCandidacyPeriodActive: boolean;
  isAdmin: boolean;
  userHasApplied: boolean;
  canApply: boolean;
  onApply: () => void;
}

const ElectionTitleSection = ({
  title,
  description,
  isCandidacyPeriodActive,
  isAdmin,
  userHasApplied,
  canApply,
  onApply
}: ElectionTitleSectionProps) => {
  const navigate = useNavigate();
  
  const renderCandidacyStatus = () => {
    if (userHasApplied) {
      return (
        <div className="flex items-center mt-4 md:mt-0 text-emerald-600">
          <CheckCircle className="mr-2 h-5 w-5" />
          <span>Application submitted</span>
        </div>
      );
    }
    
    if (!canApply && !isAdmin && isCandidacyPeriodActive) {
      return (
        <Alert variant="destructive" className="mt-4 md:mt-0 max-w-xs">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You are not eligible to apply for this election.
          </AlertDescription>
        </Alert>
      );
    }
    
    return null;
  };
  
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      <div className="mt-4 md:mt-0">
        {!isAdmin && isCandidacyPeriodActive && canApply && !userHasApplied && (
          <Button 
            className="bg-[#008f50] hover:bg-[#007a45]"
            onClick={onApply}
          >
            Apply as Candidate
          </Button>
        )}
        
        {isAdmin && (
          <Button
            variant="outline"
            className="mt-4 md:mt-0"
            onClick={() => navigate(`/admin/elections`)}
          >
            Manage Elections
          </Button>
        )}
        
        {renderCandidacyStatus()}
      </div>
    </div>
  );
};

export default ElectionTitleSection;
