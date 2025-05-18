import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Verified } from "lucide-react";
import { Link } from "react-router-dom";

interface CandidatesListProps {
  candidates: any[];
  onSelect?: (candidateId: string) => void;
  selectedId?: string;
  readOnly?: boolean;
}

const CandidatesList = ({ candidates, onSelect, selectedId, readOnly = false }: CandidatesListProps) => {
  return (
    <div className="candidates-list">
      {candidates.map((candidate) => {
        // Make sure we're using electionId instead of election_id
        const candidateData = {
          ...candidate,
          election_id: candidate.electionId || ''  // Ensure election_id is available for the component
        };
        
        return (
          <div
            key={candidate.id}
            className={`relative rounded-md border ${
              candidate.id === selectedId ? "border-primary-500 ring-2 ring-primary-500" : "border-muted"
            } p-4 shadow-sm transition-colors hover:border-accent hover:bg-accent/50`}
          >
            <div className="flex items-center space-x-4">
              <Avatar>
                {candidate.imageUrl ? (
                  <AvatarImage src={candidate.imageUrl} alt={candidate.name} />
                ) : (
                  <AvatarFallback>{candidate.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-sm font-medium leading-none flex items-center">
                  {candidate.name}
                  <Verified className="ml-1 h-4 w-4 text-blue-500" />
                </h2>
                <p className="text-sm text-muted-foreground">{candidate.position}</p>
              </div>
            </div>
            <div className="mt-4 text-sm">
              <p>{candidate.bio}</p>
            </div>
            <div className="absolute right-4 top-4">
              {!readOnly && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onSelect && onSelect(candidate.id)}
                  className={candidate.id === selectedId ? "bg-primary-500 text-primary-foreground" : ""}
                >
                  Select
                </Button>
              )}
              {readOnly && (
                <Link to={`/elections/${candidateData.election_id}/candidates/${candidate.id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CandidatesList;
