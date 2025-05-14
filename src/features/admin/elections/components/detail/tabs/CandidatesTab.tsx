
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface CandidatesTabProps {
  candidates: any[];
}

const CandidatesTab: React.FC<CandidatesTabProps> = ({ candidates }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidates</CardTitle>
        <CardDescription>
          All registered candidates for this election
        </CardDescription>
      </CardHeader>
      <CardContent>
        {candidates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No candidates registered for this election yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(new Set(candidates.map(c => c.position))).map(position => (
              <div key={position} className="space-y-2">
                <h3 className="font-semibold text-lg">{position}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {candidates
                    .filter(candidate => candidate.position === position)
                    .map(candidate => (
                      <Card key={candidate.id} className="overflow-hidden">
                        <div className="aspect-video bg-muted flex items-center justify-center">
                          {candidate.image_url ? (
                            <img 
                              src={candidate.image_url} 
                              alt={candidate.name} 
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="text-muted-foreground">No Image</div>
                          )}
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{candidate.name}</CardTitle>
                          <CardDescription>
                            {candidate.department && `${candidate.department}`}
                            {candidate.year_level && candidate.department && ` • `}
                            {candidate.year_level && `${candidate.year_level}`}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {candidate.bio || "No biography provided"}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CandidatesTab;
