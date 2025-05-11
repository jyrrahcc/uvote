
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, FileText, Vote } from "lucide-react";
import { Election } from "@/types";
import { useCandidacyPeriod } from "@/features/candidates/components/election-header/useCandidacyPeriod";

interface ElectionHeaderProps {
  election: Election;
  hasVoted?: boolean;
  isVoter?: boolean;
}

const ElectionHeader = ({ election, hasVoted = false, isVoter = false }: ElectionHeaderProps) => {
  const { isCandidacyPeriodActive } = useCandidacyPeriod(election);
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div className="flex items-center mb-4 md:mb-0">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link to="/elections"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Elections</Link>
        </Button>
        
        {election.status === "active" && (
          <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
        )}
        {election.status === "upcoming" && (
          <Badge variant="outline" className="text-blue-500 border-blue-500">Upcoming</Badge>
        )}
        {election.status === "completed" && (
          <Badge variant="secondary">Completed</Badge>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {/* File Candidacy button (only shown during candidacy period and for eligible voters) */}
        {isCandidacyPeriodActive && isVoter && (
          <Button variant="outline" className="flex items-center gap-2" asChild>
            <Link to={`/elections/${election.id}/candidates`}>
              <FileText className="h-4 w-4" />
              <span>File Candidacy</span>
            </Link>
          </Button>
        )}
        
        {/* Vote button (only shown during active elections and for eligible voters) */}
        {election.status === "active" && (
          <>
            {hasVoted ? (
              <Badge className="flex items-center gap-1 bg-green-500">
                <CheckCircle className="h-3 w-3" />
                <span>You have voted</span>
              </Badge>
            ) : (
              isVoter && (
                <Button className="flex items-center gap-2" asChild>
                  <Link to={`/elections/${election.id}`}>
                    <Vote className="h-4 w-4" />
                    <span>Cast Your Vote</span>
                  </Link>
                </Button>
              )
            )}
          </>
        )}
        
        {/* View Results button (only shown for completed elections) */}
        {election.status === "completed" && (
          <Button asChild>
            <Link to={`/elections/${election.id}/results`}>View Full Results</Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ElectionHeader;
