
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CandidatesList from "./CandidatesList";
import { Candidate } from "@/types";
import CandidateApplicationsTab from "./CandidateApplicationsTab";

interface CandidatesTabViewProps {
  isAdmin: boolean;
  candidates: Candidate[];
  loading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  electionId: string;
  handleDeleteCandidate: (id: string) => void;
  onOpenAddDialog: () => void;
}

const CandidatesTabView = ({
  isAdmin,
  candidates,
  loading,
  activeTab,
  setActiveTab,
  electionId,
  handleDeleteCandidate,
  onOpenAddDialog
}: CandidatesTabViewProps) => {
  return (
    <Tabs defaultValue="candidates" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="candidates">Candidates</TabsTrigger>
        {isAdmin && <TabsTrigger value="applications">Applications</TabsTrigger>}
      </TabsList>
      
      <TabsContent value="candidates" className="py-4">
        <CandidatesList
          candidates={candidates}
          loading={loading}
          isAdmin={isAdmin}
          onDeleteCandidate={handleDeleteCandidate}
          onOpenAddDialog={onOpenAddDialog}
        />
      </TabsContent>
      
      {isAdmin && (
        <TabsContent value="applications" className="py-4">
          <CandidateApplicationsTab 
            electionId={electionId}
            isAdmin={isAdmin}
          />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default CandidatesTabView;
