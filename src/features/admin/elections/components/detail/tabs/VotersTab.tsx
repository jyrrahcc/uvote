
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Election } from "@/types";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

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
  const [actualEligibleVoters, setActualEligibleVoters] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEligibleVotersCount = async () => {
      try {
        setLoading(true);
        
        // Build the query to count eligible voters based on election criteria
        let query = supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });

        // Filter by departments/colleges if specified
        if (election.departments && election.departments.length > 0 && !election.departments.includes("University-wide")) {
          query = query.in('department', election.departments);
        }

        // Filter by year levels if specified
        if (election.eligibleYearLevels && election.eligibleYearLevels.length > 0 && !election.eligibleYearLevels.includes("All Year Levels & Groups")) {
          query = query.in('year_level', election.eligibleYearLevels);
        }

        const { count, error } = await query;

        if (error) {
          console.error('Error fetching eligible voters count:', error);
          setActualEligibleVoters(stats.totalVoters); // Fallback to original stats
        } else {
          setActualEligibleVoters(count || 0);
        }
      } catch (error) {
        console.error('Error in fetchEligibleVotersCount:', error);
        setActualEligibleVoters(stats.totalVoters); // Fallback to original stats
      } finally {
        setLoading(false);
      }
    };

    fetchEligibleVotersCount();
  }, [election, stats.totalVoters]);

  // Calculate participation rate based on actual eligible voters
  const actualParticipationRate = actualEligibleVoters > 0 
    ? Math.round((stats.totalVotes / actualEligibleVoters) * 100) 
    : 0;

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
              <div className="text-3xl font-bold">
                {loading ? "..." : actualEligibleVoters}
              </div>
              <div className="text-sm text-muted-foreground">Total Eligible Voters</div>
            </div>
            <div className="flex flex-col">
              <div className="text-3xl font-bold">{stats.totalVotes}</div>
              <div className="text-sm text-muted-foreground">Total Votes Cast</div>
            </div>
            <div className="flex flex-col">
              <div className="text-3xl font-bold">
                {loading ? "..." : `${actualParticipationRate}%`}
              </div>
              <div className="text-sm text-muted-foreground">Participation Rate</div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Election Eligibility Criteria</h3>
            <div className="space-y-2">
              {election.departments && election.departments.length > 0 && (
                <div>
                  <div className="font-medium">Eligible Departments:</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {election.departments.map(dept => (
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
              
              {(!election.departments || election.departments.length === 0) && 
               (!election.eligibleYearLevels || election.eligibleYearLevels.length === 0) && (
                <div className="text-sm text-muted-foreground">
                  No specific eligibility restrictions - All registered users can vote
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VotersTab;
