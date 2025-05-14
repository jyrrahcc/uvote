
import { Election } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users } from "lucide-react";

interface ElectionMetadataProps {
  election: Election;
  formatDate: (dateString: string) => string;
}

const ElectionMetadata = ({ election, formatDate }: ElectionMetadataProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <h3 className="font-medium">Voting Period</h3>
            <p className="text-sm text-muted-foreground">
              {formatDate(election.startDate)} - {formatDate(election.endDate)}
            </p>
          </div>
        </div>
        
        {election.candidacyStartDate && election.candidacyEndDate && (
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h3 className="font-medium">Candidacy Period</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(election.candidacyStartDate)} - {formatDate(election.candidacyEndDate)}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex items-start gap-3">
          <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <h3 className="font-medium">Department</h3>
            <p className="text-sm text-muted-foreground">
              {election.colleges && election.colleges.length > 0
                ? election.colleges.join(", ")
                : election.department || "University-wide"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ElectionMetadata;
