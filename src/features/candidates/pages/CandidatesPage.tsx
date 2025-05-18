
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import ElectionDetailsHeader from "@/features/candidates/components/election-header/ElectionDetailsHeader";
import { ApplicationForm } from "@/features/candidates/components/ApplicationForm";
import { useAuth } from "@/features/auth/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Election, mapDbElectionToElection } from "@/types";
import { checkUserEligibility } from "@/utils/eligibilityUtils";

const CandidatesPage = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const { user } = useAuth();
  const [election, setElection] = useState<Election | null>(null);
  const [userEligibility, setUserEligibility] = useState<{ isEligible: boolean; reason: string | null }>({
    isEligible: true,
    reason: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchElectionAndEligibility = async () => {
      if (!electionId || !user) return;

      setIsLoading(true);
      try {
        // Fetch election details
        const { data: electionData, error: electionError } = await supabase
          .from('elections')
          .select('*')
          .eq('id', electionId)
          .single();

        if (electionError) {
          console.error("Error fetching election:", electionError);
          return;
        }

        if (electionData) {
          // Map database election to app Election type using the mapper function
          const mappedElection = mapDbElectionToElection(electionData);
          setElection(mappedElection);

          // Check user eligibility
          const eligibility = await checkUserEligibility(user.id, mappedElection);
          setUserEligibility(eligibility);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchElectionAndEligibility();
  }, [electionId, user]);

  const isUserEligible = !election?.restrictVoting || userEligibility?.isEligible;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!election) {
    return <div>Election not found.</div>;
  }

  return (
    <div>
      <ElectionDetailsHeader election={election} />

      {!isUserEligible && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You are not eligible to apply for this election. Reason: {userEligibility.reason || "Unknown"}
          </AlertDescription>
        </Alert>
      )}

      {isUserEligible && (
        <ApplicationForm
          electionId={electionId || ""}
          userId={user?.id || ""}
          onClose={() => setShowForm(false)}
          initialEligibility={userEligibility.isEligible}
          initialEligibilityReason={userEligibility.reason}
        />
      )}
    </div>
  );
};

export default CandidatesPage;
