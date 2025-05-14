
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Election } from "@/types";
import { Badge } from "@/components/ui/badge";

interface VotersTabProps {
  election: Election;
  stats: {
    totalVoters: number;
    totalVotes: number;
    participationRate: number;
    positionsCount: number;
    candidatesCount: number;
  };
}

const VotersTab: React.FC<VotersTabProps> = ({ election, stats }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Voter Statistics</CardTitle>
        <CardDescription>
          Summary of voter participation in this election
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <div className="text-3xl font-bold">{stats.totalVoters}</div>
              <div className="text-sm text-muted-foreground">Total Eligible Voters</div>
            </div>
            <div className="flex flex-col">
              <div className="text-3xl font-bold">{stats.totalVotes}</div>
              <div className="text-sm text-muted-foreground">Total Votes Cast</div>
            </div>
            <div className="flex flex-col">
              <div className="text-3xl font-bold">{stats.participationRate}%</div>
              <div className="text-sm text-muted-foreground">Participation Rate</div>
            </div>
          </div>
          
          {election.restrictVoting && (
            <div>
              <h3 className="text-lg font-medium mb-2">Eligible Voters</h3>
              <div className="space-y-2">
                {election.colleges && election.colleges.length > 0 && (
                  <div>
                    <div className="font-medium">Eligible Departments:</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {election.colleges.map(dept => (
                        <Badge key={dept} variant="outline">{dept}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {election.eligibleYearLevels && election.eligibleYearLevels.length > 0 && (
                  <div>
                    <div className="font-medium">Eligible Year Levels:</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {election.eligibleYearLevels.map(year => (
                        <Badge key={year} variant="outline">{year}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VotersTab;
