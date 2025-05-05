
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Election, Candidate } from "@/types";
import { useRole } from "@/features/auth/context/RoleContext";
import { Plus } from "lucide-react";
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

const CandidatesPage = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isAdmin } = useRole();
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
        
        {isAdmin && (
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
        )}
      </div>
      
      <CandidatesList
        candidates={candidates}
        loading={loading}
        isAdmin={isAdmin}
        onDeleteCandidate={handleDeleteCandidate}
        onOpenAddDialog={() => setIsDialogOpen(true)}
      />
    </div>
  );
};

export default CandidatesPage;
