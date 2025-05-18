import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CandidateApplication } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import ApplicationActions from "./ApplicationActions";

interface CandidateApplicationsTabProps {
  electionId: string;
}

const CandidateApplicationsTab = ({ electionId }: CandidateApplicationsTabProps) => {
  const [applications, setApplications] = useState<CandidateApplication[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('candidate_applications')
          .select('*')
          .eq('election_id', electionId);

        if (error) {
          console.error("Error fetching applications:", error);
          toast.error("Failed to load candidate applications");
          return;
        }

        setApplications(data);
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast.error("Failed to load candidate applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [electionId]);

  const sortedApplications = applications?.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidate Applications</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading applications...</p>
        ) : applications && applications.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>{application.name}</TableCell>
                    <TableCell>{application.position}</TableCell>
                    <TableCell>{application.status}</TableCell>
                    <TableCell>
                      {new Date(application.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <ApplicationActions application={application} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p>No candidate applications found for this election.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default CandidateApplicationsTab;
