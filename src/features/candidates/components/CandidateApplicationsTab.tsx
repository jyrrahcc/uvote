
import { useEffect } from "react";
import { useCandidateApplications } from "../hooks/useCandidateApplications";
import CandidateApplicationCard from "./CandidateApplicationCard";
import { Card, CardContent } from "@/components/ui/card";

interface CandidateApplicationsTabProps {
  electionId: string;
  isAdmin: boolean;
}

const CandidateApplicationsTab = ({ electionId, isAdmin }: CandidateApplicationsTabProps) => {
  const { applications, loading, error, refetch, deleteApplication } = useCandidateApplications(electionId);

  useEffect(() => {
    // Fetch applications on component mount
    refetch();
  }, [electionId]);

  const handleDeleteApplication = async (applicationId: string) => {
    await deleteApplication(applicationId);
    refetch(); // Explicitly refetch after deletion
  };

  if (loading) {
    return <div className="text-center py-10">Loading applications...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Error loading applications: {error.message}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-10">
          <p className="text-muted-foreground">
            No applications have been submitted for this election yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {applications.map((application) => (
        <CandidateApplicationCard 
          key={application.id}
          application={application} 
          isAdmin={isAdmin}
          onStatusChange={refetch}
          onDelete={handleDeleteApplication}
        />
      ))}
    </div>
  );
};

export default CandidateApplicationsTab;
