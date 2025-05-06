
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users } from "lucide-react";
import { Election, Candidate } from "@/types";
import { useRole } from "@/features/auth/context/RoleContext";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { fetchElectionDetails } from "@/features/elections/services/electionService";
import { fetchCandidates, deleteCandidate } from "../services/candidateService";
import AddCandidateForm from "../components/AddCandidateForm";
import CandidatesList from "../components/CandidatesList";
import CandidateRegistrationForm from "../components/CandidateRegistrationForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import ApplyAsCandidateDialog from "../components/ApplyAsCandidateDialog";
import CandidateApplicationsList from "../components/CandidateApplicationsList";
import { hasUserAppliedForElection } from "../services/candidateApplicationService";

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
      const candidatesData = await fetchCandidates(electionId!);
      setCandidates(candidatesData);

      // Check if current user has already registered as a candidate
      if (user) {
        const { data } = await supabase
          .from('candidates')
          .select('id')
          .eq('election_id', electionId)
          .eq('created_by', user.id)
          .single();
        
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {election?.title || "Candidates"}
          </h1>
          {election && (
            <p className="text-muted-foreground mt-1">
              {election.description}
            </p>
          )}
        </div>
        
        {isAdmin ? (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
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
                <AddCandidateForm
                  electionId={electionId}
                  onCandidateAdded={handleCandidateAdded}
                  onClose={() => setIsDialogOpen(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        ) : (
          electionId && user && !userHasRegistered && !userHasApplied && (
            <ApplyAsCandidateDialog 
              electionId={electionId}
              userId={user.id}
              electionActive={isElectionActiveOrUpcoming()}
              onApplicationSubmitted={handleApplicationSubmitted}
            />
          )
        )}
      </div>
      
      {isAdmin ? (
        <Tabs defaultValue="candidates" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="candidates">
              <Users className="h-4 w-4 mr-2" />
              Candidates
            </TabsTrigger>
            <TabsTrigger value="applications">
              <FileText className="h-4 w-4 mr-2" />
              Applications
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="candidates" className="pt-4">
            <CandidatesList
              candidates={candidates}
              loading={loading}
              isAdmin={isAdmin}
              onDeleteCandidate={handleDeleteCandidate}
              onOpenAddDialog={() => setIsDialogOpen(true)}
            />
          </TabsContent>
          
          <TabsContent value="applications" className="pt-4">
            {electionId && (
              <CandidateApplicationsList electionId={electionId} />
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <CandidatesList
          candidates={candidates}
          loading={loading}
          isAdmin={isAdmin}
          onDeleteCandidate={handleDeleteCandidate}
          onOpenAddDialog={() => setIsDialogOpen(true)}
        />
      )}
    </div>
  );
};

export default CandidatesPage;
