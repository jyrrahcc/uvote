
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRole } from "@/features/auth/context/RoleContext";
import { useAuth } from "@/features/auth/context/AuthContext";
import { fetchElectionDetails } from "@/features/elections/services/electionService";
import { fetchCandidatesForElection, deleteCandidate } from "../services/candidateService";
import { hasUserAppliedForElection } from "../services/candidateApplicationService";
import { supabase } from "@/integrations/supabase/client";
import { Election, Candidate } from "@/types";
import CandidatesPageHeader from "../components/CandidatesPageHeader";
import CandidatesTabView from "../components/CandidatesTabView";

const CandidatesPage = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userHasRegistered, setUserHasRegistered] = useState(false);
  const [userHasApplied, setUserHasApplied] = useState(false);
  const [activeTab, setActiveTab] = useState("candidates");
  const { isAdmin } = useRole();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (electionId) {
      loadData();
    }
  }, [electionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch election details
      const electionData = await fetchElectionDetails(electionId!);
      setElection(electionData);
      
      // Fetch candidates
      const candidatesData = await fetchCandidatesForElection(electionId!);
      setCandidates(candidatesData);

      // Check if current user has already registered as a candidate
      if (user) {
        const { data } = await supabase
          .from('candidates')
          .select('id')
          .eq('election_id', electionId)
          .eq('created_by', user.id)
          .maybeSingle();
        
        setUserHasRegistered(!!data);
        
        // Check if user has applied to be a candidate
        const hasApplied = await hasUserAppliedForElection(electionId!, user.id);
        setUserHasApplied(hasApplied);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load election data");
      navigate('/elections');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    try {
      await deleteCandidate(id);
      toast.success("Candidate deleted successfully");
      // Update local state
      setCandidates(candidates.filter(candidate => candidate.id !== id));
    } catch (error) {
      console.error("Error deleting candidate:", error);
      toast.error("Failed to delete candidate");
    }
  };

  const handleCandidateAdded = (data: any) => {
    // Type casting to match our Candidate[] type
    setCandidates([...candidates, ...(data as unknown as Candidate[])]);
    
    if (!isAdmin) {
      setUserHasRegistered(true);
    }
  };

  const handleApplicationSubmitted = () => {
    setUserHasApplied(true);
  };

  const isElectionActiveOrUpcoming = () => {
    return election?.status === 'active' || election?.status === 'upcoming';
  };

  return (
    <div className="space-y-6">
      <CandidatesPageHeader
        election={election}
        isAdmin={isAdmin}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        electionId={electionId || ''}
        userId={user?.id}
        userHasRegistered={userHasRegistered}
        userHasApplied={userHasApplied}
        handleCandidateAdded={handleCandidateAdded}
        isElectionActiveOrUpcoming={isElectionActiveOrUpcoming}
        handleApplicationSubmitted={handleApplicationSubmitted}
      />
      
      <CandidatesTabView
        isAdmin={isAdmin}
        candidates={candidates}
        loading={loading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        electionId={electionId || ''}
        handleDeleteCandidate={handleDeleteCandidate}
        onOpenAddDialog={() => setIsDialogOpen(true)}
      />
    </div>
  );
};

export default CandidatesPage;
