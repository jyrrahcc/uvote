
import { useEffect, useState } from "react";
import { useCandidateApplications } from "../hooks/useCandidateApplications";
import CandidateApplicationCard from "./CandidateApplicationCard";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CandidateApplication } from "@/types";
import ApplicationStatusBadge from "./ApplicationStatusBadge";
import { formatDate } from "@/utils/dateUtils";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from '@/components/ui/spinner';

interface CandidateApplicationsTabProps {
  electionId: string;
  isAdmin: boolean;
}

const CandidateApplicationsTab = ({ electionId, isAdmin }: CandidateApplicationsTabProps) => {
  const { applications, loading, error, refetch, deleteApplication, isDeleting } = useCandidateApplications(electionId);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    // Fetch applications on component mount
    refetch();
  }, [electionId, refetch]);

  const handleDeleteApplication = async (applicationId: string) => {
    // The deleteApplication function now handles everything including verification
    await deleteApplication(applicationId);
  };
  
  const filteredApplications = filterStatus 
    ? applications.filter(app => app.status === filterStatus) 
    : applications;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner className="h-6 w-6 mr-2" />
        <span>Loading applications...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load applications: {error.message}
        </AlertDescription>
      </Alert>
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Candidate Applications</h3>
        <Tabs 
          defaultValue={null} 
          value={filterStatus || undefined}
          onValueChange={(value) => setFilterStatus(value || null)}
          className="w-auto"
        >
          <TabsList>
            <TabsTrigger value={undefined as any}>All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="disqualified">Disqualified</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {applications.length > 0 && (
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map(app => (
                <TableRow key={app.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell>{app.name}</TableCell>
                  <TableCell>{app.position}</TableCell>
                  <TableCell><ApplicationStatusBadge status={app.status} /></TableCell>
                  <TableCell>{formatDate(app.created_at || '')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {isDeleting && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-2">
            <Spinner className="h-5 w-5" />
            <span>Deleting application...</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredApplications.map((application) => (
          <CandidateApplicationCard 
            key={application.id}
            application={application} 
            isAdmin={isAdmin}
            onStatusChange={refetch}
            onDelete={handleDeleteApplication}
          />
        ))}
      </div>
    </div>
  );
};

export default CandidateApplicationsTab;
