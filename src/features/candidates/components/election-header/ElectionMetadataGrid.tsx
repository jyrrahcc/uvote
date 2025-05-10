
import { Calendar, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import { Election } from "@/types";

interface ElectionMetadataGridProps {
  election: Election;
  isCandidacyPeriodActive: boolean;
}

const ElectionMetadataGrid = ({ election, isCandidacyPeriodActive }: ElectionMetadataGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex items-center">
        <Calendar className="h-5 w-5 mr-2 text-[#008f50]" />
        <div>
          <p className="text-sm font-medium">Voting Period</p>
          <p className="text-sm text-muted-foreground">
            {format(new Date(election.startDate), 'MMM d, yyyy')} - {format(new Date(election.endDate), 'MMM d, yyyy')}
          </p>
        </div>
      </div>
      
      <div className="flex items-center">
        <Clock className="h-5 w-5 mr-2 text-[#008f50]" />
        <div>
          <p className="text-sm font-medium">Status</p>
          <div className={`text-sm ${
            election.status === 'active' ? 'text-green-600' : 
            election.status === 'upcoming' ? 'text-blue-600' : 
            'text-gray-600'
          } capitalize`}>
            {election.status}
            {isCandidacyPeriodActive && election.status === 'upcoming' && (
              <span className="ml-2 text-amber-600">(Candidacy Open)</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <Users className="h-5 w-5 mr-2 text-[#008f50]" />
        <div>
          <p className="text-sm font-medium">Department</p>
          <p className="text-sm text-muted-foreground">
            {election.departments && election.departments.length > 0 
              ? election.departments.join(', ') 
              : election.department || "University-wide"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ElectionMetadataGrid;
