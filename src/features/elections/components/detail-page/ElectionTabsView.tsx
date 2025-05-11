
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Election, Candidate } from "@/types";
import ElectionOverviewTab from "@/features/elections/components/position-details/ElectionOverviewTab";
import CandidatesTab from "@/features/elections/components/position-details/CandidatesTab";

interface ElectionTabsViewProps {
  election: Election;
  candidates: Candidate[] | null;
  positionVotes: Record<string, any>;
  formatDate: (dateString: string) => string;
}

const ElectionTabsView: React.FC<ElectionTabsViewProps> = ({ 
  election, 
  candidates, 
  positionVotes, 
  formatDate 
}) => {
  const [activeTab, setActiveTab] = useState<string>("overview");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
      <TabsList className="mb-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="candidates">Candidates</TabsTrigger>
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
          positions={election.positions}
          candidates={candidates}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ElectionTabsView;
