
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ElectionTitleSectionProps {
  title: string;
  description: string;
  isCandidacyPeriodActive: boolean;
  isAdmin: boolean;
  userHasApplied: boolean;
  onApply: () => void;
}

const ElectionTitleSection = ({
  title,
  description,
  isCandidacyPeriodActive,
  isAdmin,
  userHasApplied,
  onApply
}: ElectionTitleSectionProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      {!isAdmin && isCandidacyPeriodActive && !userHasApplied && (
        <Button 
          className="mt-4 md:mt-0 bg-[#008f50] hover:bg-[#007a45]"
          onClick={onApply}
        >
          Apply as Candidate
        </Button>
      )}
      
      {!isAdmin && userHasApplied && (
        <div className="flex items-center mt-4 md:mt-0 text-emerald-600">
          <CheckCircle className="mr-2 h-5 w-5" />
          <span>Application submitted</span>
        </div>
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
    </div>
  );
};

export default ElectionTitleSection;
