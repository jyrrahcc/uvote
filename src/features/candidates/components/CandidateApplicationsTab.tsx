import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CandidateApplication, mapDbApplicationToApplication } from '@/types';
import ApplicationActions from './ApplicationActions';

interface CandidateApplicationsTabProps {
  electionId: string;
  isAdmin?: boolean; // Add this prop
}

const CandidateApplicationsTab = ({ electionId, isAdmin = true }: CandidateApplicationsTabProps) => {
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [electionId, activeTab]);

  const fetchApplications = async () => {
    try {
      setLoading(true);

      const query = supabase
        .from('candidate_applications')
        .select('*')
        .eq('election_id', electionId);

      if (activeTab !== 'all') {
        query.eq('status', activeTab);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Map the database objects to application objects
      const mappedApplications = data.map(mapDbApplicationToApplication);
      
      setApplications(mappedApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="text-center py-12">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">No {activeTab} applications found</div>
          ) : (
            <div className="space-y-4">
              {applications.map(application => (
                <div key={application.id} className="border p-4 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{application.name}</h3>
                      <p className="text-sm text-muted-foreground">Position: {application.position}</p>
                      <p className="text-sm text-muted-foreground">Status: {application.status}</p>
                      <p className="text-sm text-muted-foreground">Department: {application.department}</p>
                      <p className="text-sm mt-2">{application.bio}</p>
                    </div>
                    {isAdmin && <ApplicationActions application={application} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CandidateApplicationsTab;
