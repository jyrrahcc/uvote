
import { AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface CandidacyAlertProps {
  isActive: boolean;
  startDate: string;
  endDate: string;
}

const CandidacyAlert = ({ isActive, startDate, endDate }: CandidacyAlertProps) => {
  if (!isActive) return null;
  
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-center">
      <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
      <div>
        <p className="font-medium text-amber-800">Candidacy period is open</p>
        <p className="text-sm text-amber-700">
          Apply as a candidate from {format(new Date(startDate), 'MMM d, yyyy')} to {format(new Date(endDate), 'MMM d, yyyy')}
        </p>
      </div>
    </div>
  );
};

export default CandidacyAlert;
