
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import { Election, Candidate, mapDbElectionToElection } from "@/types";
import { ArrowLeft, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import CandidateRegistrationForm from "@/features/candidates/components/CandidateRegistrationForm";
import CandidatesList from "@/features/candidates/components/CandidatesList";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Candidates = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userHasRegistered, setUserHasRegistered] = useState(false);
  const { isAdmin } = useRole();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (electionId) {
      loadData();
    }
  }, [electionId]);

  const loadData = async () => {
    if (!electionId) {
      navigate('/elections');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch election details
      const { data: electionData, error: electionError } = await supabase
        .from('elections')
        .select('*')
        .eq('id', electionId)
        .single();
      
      if (electionError) {
        throw new Error("Failed to load election details");
      }
      
      if (!electionData) {
        throw new Error("Election not found");
      }
      
      const transformedElection = mapDbElectionToElection(electionData);
      setElection(transformedElection);
      
      // Fetch candidates
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', electionId);
      
      if (candidatesError) {
        throw new Error("Failed to load candidates");
      }
      
      setCandidates(candidatesData as Candidate[]);

      // Check if current user has already registered as a candidate
      if (user) {
        const { data, error: checkError } = await supabase
          .from('candidates')
          .select('id')
          .eq('election_id', electionId)
          .eq('created_by', user.id)
          .single();
        
        if (!checkError || checkError.code !== 'PGRST116') {
          setUserHasRegistered(!!data);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
      toast.error("Failed to load election data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Candidate deleted successfully");
      // Update local state
      setCandidates(candidates.filter(candidate => candidate.id !== id));
    } catch (error) {
      console.error("Error deleting candidate:", error);
      toast.error("Failed to delete candidate");
    }
  };

  const handleCandidateAdded = (newCandidate: any) => {
    setCandidates(prev => [...prev, ...(Array.isArray(newCandidate) ? newCandidate : [newCandidate])]);
    
    if (!isAdmin) {
      setUserHasRegistered(true);
    }
    
    setIsDialogOpen(false);
  };

  const canRegisterAsCandidate = () => {
    return !isAdmin && user && !userHasRegistered && election?.status === 'upcoming';
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center py-12">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-xl mb-2">Loading...</div>
          <p className="text-sm text-muted-foreground">Please wait while we fetch the election details.</p>
        </div>
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center py-12 border rounded-md">
          <p className="text-xl text-destructive font-medium mb-4">{error || "Election not found"}</p>
          <Button onClick={() => navigate('/elections')}>
            Back to Elections
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate('/elections')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Elections
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{election.title} - Candidates</h1>
          <p className="text-muted-foreground">{election.description}</p>
        </div>
        
        {isAdmin ? (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0">
                <Plus className="mr-2 h-4 w-4" />
                Add Candidate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Candidate</DialogTitle>
                <DialogDescription>
                  Fill out this form to add a new candidate to this election.
                </DialogDescription>
              </DialogHeader>
              
              {electionId && (
                <div className="pt-4">
                  <CandidateRegistrationForm
                    electionId={electionId}
                    userId={user?.id || ''}
                    onCandidateAdded={handleCandidateAdded}
                    onClose={() => setIsDialogOpen(false)}
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>
        ) : canRegisterAsCandidate() ? (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0">
                <Plus className="mr-2 h-4 w-4" />
                Register as Candidate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Candidate Registration</DialogTitle>
                <DialogDescription>
                  Submit this form to register as a candidate for this election.
                </DialogDescription>
              </DialogHeader>
              
              {electionId && user && (
                <div className="pt-4">
                  <CandidateRegistrationForm
                    electionId={electionId}
                    userId={user.id}
                    onCandidateAdded={handleCandidateAdded}
                    onClose={() => setIsDialogOpen(false)}
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>
        ) : userHasRegistered ? (
          <Alert className="max-w-xs mt-4 md:mt-0">
            <AlertDescription>
              You have already registered as a candidate for this election.
            </AlertDescription>
          </Alert>
        ) : null}
      </div>

      {/* Election status info */}
      <Card className="mb-8 bg-muted/50">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="capitalize">{election.status}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Start Date</p>
              <p>{new Date(election.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium">End Date</p>
              <p>{new Date(election.endDate).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <CandidatesList
        candidates={candidates}
        loading={false}
        isAdmin={isAdmin}
        onDeleteCandidate={handleDeleteCandidate}
        onOpenAddDialog={() => setIsDialogOpen(true)}
      />

      {candidates.length === 0 && (
        <div className="text-center py-12 border rounded-md mt-8">
          <p className="text-xl font-semibold">No candidates yet</p>
          <p className="text-muted-foreground mt-2">
            {canRegisterAsCandidate() ? 
              "Be the first to register as a candidate." : 
              "This election has no registered candidates yet."}
          </p>
          
          {canRegisterAsCandidate() && (
            <Button 
              className="mt-4" 
              onClick={() => setIsDialogOpen(true)}
            >
              Register as Candidate
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Candidates;
