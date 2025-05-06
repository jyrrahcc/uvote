
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CandidateApplicationCard from "./CandidateApplicationCard";
import { useCandidateApplications } from "../hooks/useCandidateApplications";

interface CandidateApplicationsTabProps {
  electionId: string;
}

const CandidateApplicationsTab = ({ electionId }: CandidateApplicationsTabProps) => {
  const {
    filteredApplications,
    loading,
    activeTab,
    setActiveTab,
    pendingCount,
    approvedCount,
    rejectedCount,
    loadApplications
  } = useCandidateApplications(electionId);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-full max-w-md bg-muted/20 animate-pulse rounded-md"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-muted/20 animate-pulse rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  if (filteredApplications.length === 0 && activeTab === "all") {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No candidate applications found for this election.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({filteredApplications.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredApplications.length > 0 ? (
              filteredApplications.map(application => (
                <CandidateApplicationCard 
                  key={application.id}
                  application={application}
                  onStatusUpdate={loadApplications}
                />
              ))
            ) : (
              <p className="col-span-2 text-center py-8 text-muted-foreground">
                No {activeTab === "all" ? "" : activeTab} applications found.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CandidateApplicationsTab;
