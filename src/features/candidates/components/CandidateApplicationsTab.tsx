
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CandidateApplication } from "@/types";
import CandidateApplicationCard from "./CandidateApplicationCard";
import { AlertCircle, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { fetchCandidateApplicationsForElection } from "../services/candidateApplicationService";

interface CandidateApplicationsTabProps {
  electionId: string;
  isAdmin: boolean;
}

const CandidateApplicationsTab = ({ electionId, isAdmin }: CandidateApplicationsTabProps) => {
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const applications = await fetchCandidateApplicationsForElection(electionId);
      setApplications(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load candidate applications");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (electionId) {
      fetchApplications();
    }
  }, [electionId]);
  
  const handleStatusChange = () => {
    fetchApplications();
  };
  
  const pendingApplications = applications.filter(app => app.status === "pending");
  const approvedApplications = applications.filter(app => app.status === "approved");
  const rejectedApplications = applications.filter(app => app.status === "rejected");
  
  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading applications...</p>
      </div>
    );
  }
  
  if (applications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Candidate Applications</CardTitle>
          <CardDescription>
            There are no applications for this election yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Applications</h3>
            <p className="text-muted-foreground max-w-md">
              When users apply to be candidates, their applications will appear here for review.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingApplications.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedApplications.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedApplications.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="pt-4">
          {pendingApplications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingApplications.map((application) => (
                <CandidateApplicationCard
                  key={application.id}
                  application={application}
                  isAdmin={isAdmin}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center border rounded-md">
              <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending applications</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="approved" className="pt-4">
          {approvedApplications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvedApplications.map((application) => (
                <CandidateApplicationCard
                  key={application.id}
                  application={application}
                  isAdmin={isAdmin}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center border rounded-md">
              <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No approved applications</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="rejected" className="pt-4">
          {rejectedApplications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rejectedApplications.map((application) => (
                <CandidateApplicationCard
                  key={application.id}
                  application={application}
                  isAdmin={isAdmin}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center border rounded-md">
              <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No rejected applications</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CandidateApplicationsTab;
