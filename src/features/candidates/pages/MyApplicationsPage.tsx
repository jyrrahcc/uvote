
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CandidateApplication, mapDbApplicationToApplication } from '@/types/candidates';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ElectionTable from '@/components/admin/ElectionTable';

const MyApplicationsPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('candidate_applications')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        // Map the database applications to our application type
        const mappedApplications = data.map(mapDbApplicationToApplication);
        setApplications(mappedApplications);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load your applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008f50]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle>My Candidate Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length > 0 ? (
            <div className="space-y-8">
              {applications.map((application) => (
                <Card key={application.id} className="overflow-hidden">
                  <div className="bg-muted px-4 py-2 flex justify-between items-center">
                    <h3 className="font-medium">{application.position}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      application.status === 'approved' ? 'bg-green-100 text-green-800' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      application.status === 'disqualified' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-sm mb-2">
                      <span className="font-semibold">Bio:</span> {application.bio}
                    </p>
                    {application.feedback && (
                      <p className="text-sm mb-2">
                        <span className="font-semibold">Feedback:</span> {application.feedback}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Submitted on {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg mb-4">You haven't submitted any candidate applications yet.</p>
              <Button asChild>
                <Link to="/elections">Browse Elections</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyApplicationsPage;
