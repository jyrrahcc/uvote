
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import { useElection } from "@/features/elections/hooks/useElection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ElectionStatusAlert from "@/features/elections/components/ElectionStatusAlert";
import ElectionMetadata from "@/features/elections/components/position-details/ElectionMetadata";
import ElectionHeader from "@/features/elections/components/position-details/ElectionHeader";
import ElectionOverviewTab from "@/features/elections/components/position-details/ElectionOverviewTab";
import CandidatesTab from "@/features/elections/components/position-details/CandidatesTab";

/**
 * Election Detail Page - Displays full information about a specific election
 */
const ElectionDetailPage = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const { user } = useAuth();
  const { isVoter } = useRole();
  const {
    election,
    loading,
    error,
    candidates,
    hasVoted,
    votingStats,
    accessCodeVerified,
    setAccessCodeVerified
  } = useElection(electionId);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [positionVotes, setPositionVotes] = useState<Record<string, any>>({});

  // Fetch live vote counts for each position when the election is active
  useEffect(() => {
    if (election?.status === "active" && election?.positions?.length > 0) {
      fetchVoteCounts();
    }
  }, [election]);

  const fetchVoteCounts = async () => {
    if (!election || !electionId) return;
    
    try {
      // Get votes grouped by candidate for this election
      const { data: votesData, error: votesError } = await supabase
        .from("votes")
        .select("candidate_id")
        .eq("election_id", electionId)
        .not("candidate_id", "is", null);

      if (votesError) throw votesError;

      // Process votes by position using candidates data
      const votesByPosition: Record<string, any> = {};
      
      if (votesData && election.positions && candidates) {
        // Initialize positions
        election.positions.forEach(position => {
          votesByPosition[position] = {
            position,
            totalVotes: 0,
            candidates: {}
          };
        });
        
        // Count votes for each candidate
        votesData.forEach(vote => {
          if (vote.candidate_id) {
            // Find candidate and their position
            const candidate = candidates.find(c => c.id === vote.candidate_id);
            if (candidate && candidate.position) {
              if (!votesByPosition[candidate.position]) {
                votesByPosition[candidate.position] = {
                  position: candidate.position,
                  totalVotes: 0,
                  candidates: {}
                };
              }
              
              if (!votesByPosition[candidate.position].candidates[vote.candidate_id]) {
                votesByPosition[candidate.position].candidates[vote.candidate_id] = 0;
              }
              
              votesByPosition[candidate.position].candidates[vote.candidate_id]++;
              votesByPosition[candidate.position].totalVotes++;
            }
          }
        });
      }
      
      setPositionVotes(votesByPosition);
    } catch (error) {
      console.error("Error fetching vote counts:", error);
      toast.error("Failed to load vote counts");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // If loading, display loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link to="/elections"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Elections</Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-xl mb-2">Loading election details...</div>
          <p className="text-sm text-muted-foreground">Please wait while we fetch the election information.</p>
        </div>
      </div>
    );
  }

  // If error, display error state
  if (error || !election) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link to="/elections"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Elections</Link>
          </Button>
        </div>
        <div className="text-center py-12 border rounded-md">
          <p className="text-xl text-destructive font-medium mb-4">
            {error || "Election not found"}
          </p>
          <Button asChild>
            <Link to="/elections">Return to Elections</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Render election details
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header with back button and action buttons */}
      <ElectionHeader 
        election={election} 
        hasVoted={hasVoted} 
        isVoter={isVoter} 
      />
      
      {/* Election title and description */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{election.title}</h1>
        {election.description && (
          <p className="text-muted-foreground mt-2">{election.description}</p>
        )}
      </div>
      
      {/* Status alerts for non-active elections */}
      {election.status !== "active" && (
        <ElectionStatusAlert election={election} status={election.status} />
      )}
      
      {/* Election banner if available */}
      {election.banner_urls && election.banner_urls.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-lg">
          <img 
            src={election.banner_urls[0]} 
            alt={election.title}
            className="w-full h-48 md:h-64 object-cover"
          />
        </div>
      )}
      
      {/* Election metadata */}
      <ElectionMetadata election={election} formatDate={formatDate} />
      
      {/* Tabs for Overview and Candidates */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
        </TabsList>
        
        {/* Overview tab content */}
        <TabsContent value="overview">
          <ElectionOverviewTab 
            election={election}
            candidates={candidates}
            positionVotes={positionVotes}
            formatDate={formatDate}
          />
        </TabsContent>
        
        {/* Candidates tab content */}
        <TabsContent value="candidates">
          <CandidatesTab 
            positions={election.positions}
            candidates={candidates}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ElectionDetailPage;
