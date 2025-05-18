import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CandidateApplication } from '@/types';
import { format } from 'date-fns';
import { ElectionsTable } from '@/components/admin/ElectionsTable';

const MyApplicationsPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<CandidateApplication[] | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('candidate_applications')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching applications:', error);
          return;
        }

        setApplications(data);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  const sortedApplications = applications?.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const electionIds = applications?.map(app => app.electionId) || [];

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>My Applications</CardTitle>
          <CardDescription>
            View the status of your submitted applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading applications...</p>
          ) : sortedApplications && sortedApplications.length > 0 ? (
            <div className="grid gap-4">
              {sortedApplications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <CardTitle>{application.name}</CardTitle>
                    <CardDescription>
                      Applied for {application.position} on {format(new Date(application.createdAt), 'PPP')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Status: {application.status}</p>
                    {application.feedback && <p>Feedback: {application.feedback}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p>No applications found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyApplicationsPage;
