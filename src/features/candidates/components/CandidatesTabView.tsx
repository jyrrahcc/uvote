
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText } from "lucide-react";
import CandidatesList from "./CandidatesList";
import CandidateApplicationsTab from "./CandidateApplicationsTab";
import { Candidate } from "@/types";

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
  if (isAdmin) {
    return (
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
            onOpenAddDialog={onOpenAddDialog}
          />
        </TabsContent>
        
        <TabsContent value="applications" className="pt-4">
          {electionId && (
            <CandidateApplicationsTab electionId={electionId} />
          )}
        </TabsContent>
      </Tabs>
    );
  }
  
  return (
    <CandidatesList
      candidates={candidates}
      loading={loading}
      isAdmin={isAdmin}
      onDeleteCandidate={handleDeleteCandidate}
      onOpenAddDialog={onOpenAddDialog}
    />
  );
};

export default CandidatesTabView;
