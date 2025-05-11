
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ElectionTitleSectionProps {
  title: string;
  description?: string;
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
  return (
    <div className="flex flex-col md:flex-row justify-between items-start">
      <div className="max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
        {description && (
          <p className="mt-2 text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="mt-4 md:mt-0">
        {!isAdmin && isCandidacyPeriodActive && !userHasApplied && canApply && (
          <Button 
            onClick={onApply}
            className="bg-[#008f50] hover:bg-[#007a45] text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> 
            Apply as Candidate
          </Button>
        )}
        
        {!isAdmin && !canApply && !userHasApplied && (
          <Alert variant="destructive" className="max-w-xs">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You are not eligible to apply for this election.
            </AlertDescription>
          </Alert>
        )}
        
        {userHasApplied && (
          <Alert className="max-w-xs bg-green-50 border-green-200">
            <AlertDescription className="text-green-700">
              Your application has been submitted.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default ElectionTitleSection;
