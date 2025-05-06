
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchCandidateApplications, CandidateApplication } from "../services/candidateApplicationService";
import CandidateApplicationCard from "./CandidateApplicationCard";

interface CandidateApplicationsListProps {
  electionId: string;
}

const CandidateApplicationsList = ({ electionId }: CandidateApplicationsListProps) => {
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await fetchCandidateApplications(electionId);
      setApplications(data);
    } catch (error) {
      console.error("Error loading applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (electionId) {
      loadApplications();
    }
  }, [electionId]);

  const filteredApplications = applications.filter(app => {
    if (activeTab === "all") return true;
    return app.status === activeTab;
  });

  const pendingCount = applications.filter(app => app.status === "pending").length;
  const approvedCount = applications.filter(app => app.status === "approved").length;
  const rejectedCount = applications.filter(app => app.status === "rejected").length;

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

  if (applications.length === 0) {
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
          <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
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

export default CandidateApplicationsList;
