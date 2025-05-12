
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Candidate, Election } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import { useCandidacyPeriod } from "@/features/candidates/components/election-header/useCandidacyPeriod";
import PositionCandidatesList from "./PositionCandidatesList";

interface CandidatesTabProps {
  election: Election;
  candidates: Candidate[] | null;
  isUserEligible?: boolean;
}

const CandidatesTab = ({ election, candidates, isUserEligible = true }: CandidatesTabProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useRole();
  const { isCandidacyPeriodActive } = useCandidacyPeriod(election);
  
  const [userHasApplied, setUserHasApplied] = useState(false);
  const [loadingApplication, setLoadingApplication] = useState(false);
  
  // Group candidates by position
  const candidatesByPosition = candidates?.reduce((acc: {[key: string]: Candidate[]}, candidate) => {
    const position = candidate.position || "Unspecified";
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(candidate);
    return acc;
  }, {}) || {};
  
  const positions = Object.keys(candidatesByPosition);
  
  useEffect(() => {
    const checkUserApplication = async () => {
      if (!user || !election.id) return;
      
      try {
        setLoadingApplication(true);
        
        const { data, error } = await supabase
          .from('candidate_applications')
          .select('*')
          .eq('election_id', election.id)
          .eq('user_id', user.id)
          .limit(1);
          
        if (error) {
          console.error("Error checking user application:", error);
          return;
        }
        
        setUserHasApplied(data && data.length > 0);
      } catch (error) {
        console.error("Error checking user application:", error);
      } finally {
        setLoadingApplication(false);
      }
    };
    
    checkUserApplication();
  }, [user, election.id]);
  
  const handleApplyAsCandidate = () => {
    navigate(`/elections/${election.id}/candidates`);
  };
  
  const showCandidacyButton = isCandidacyPeriodActive && !isAdmin && !userHasApplied && isUserEligible;
  const showIneligibleMessage = isCandidacyPeriodActive && !isAdmin && !userHasApplied && !isUserEligible;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">All Candidates</h3>
        
        <div>
          {showCandidacyButton && (
            <Button onClick={handleApplyAsCandidate} className="bg-[#008f50] hover:bg-[#007a45]">
              <Users className="mr-2 h-4 w-4" />
              Candidates
            </Button>
          )}
          
          {userHasApplied && (
            <div className="text-sm text-green-600 font-medium flex items-center">
              <span>Your application has been submitted</span>
            </div>
          )}
        </div>
      </div>
      
      {showIneligibleMessage && (
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700">
            You are not eligible to apply as a candidate for this election. This election may be restricted to specific departments or year levels.
          </AlertDescription>
        </Alert>
      )}
      
      {positions.length > 0 ? (
        <div className="space-y-8">
          {positions.map(position => (
            <div key={position}>
              <h3 className="text-lg font-medium mb-3">{position}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <PositionCandidatesList 
                  position={position}
                  candidates={candidatesByPosition[position] || []}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <div className="p-6 text-center text-muted-foreground">
            <p>No candidates have been added for this election yet.</p>
            {isCandidacyPeriodActive && !userHasApplied && isUserEligible && (
              <div className="mt-4">
                <p className="mb-2">Candidacy period is open!</p>
                <Button onClick={handleApplyAsCandidate} variant="outline">
                  Apply as Candidate
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default CandidatesTab;
