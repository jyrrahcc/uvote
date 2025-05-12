
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Candidate, Election } from "@/types";
import ElectionOverviewTab from "../position-details/ElectionOverviewTab";
import CandidatesTab from "../position-details/CandidatesTab";
import DiscussionsPage from "@/features/discussions/DiscussionsPage";
import { MessageSquare } from "lucide-react";

interface ElectionTabsViewProps {
  election: Election;
  candidates: Candidate[] | null;
  positionVotes: Record<string, any>;
  formatDate: (dateString: string) => string;
  isUserEligible?: boolean;
}

const ElectionTabsView = ({ 
  election, 
  candidates, 
  positionVotes,
  formatDate,
  isUserEligible = true
}: ElectionTabsViewProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <Tabs 
      defaultValue="overview" 
      className="mt-6"
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="candidates">Candidates</TabsTrigger>
        <TabsTrigger value="discussions" className="flex items-center">
          <MessageSquare className="w-4 h-4 mr-2" />
          Discussions
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <ElectionOverviewTab 
          election={election} 
          candidates={candidates}
          positionVotes={positionVotes}
          formatDate={formatDate}
        />
      </TabsContent>
      
      <TabsContent value="candidates">
        <CandidatesTab 
          election={election}
          candidates={candidates}
          isUserEligible={isUserEligible}
        />
      </TabsContent>
      
      <TabsContent value="discussions">
        <DiscussionsPage electionId={election.id} />
      </TabsContent>
    </Tabs>
  );
};

export default ElectionTabsView;
