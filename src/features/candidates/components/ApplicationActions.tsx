
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CandidateApplication } from '@/types/candidates';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ApplicationActionsProps {
  application: CandidateApplication;
}

const ApplicationActions: React.FC<ApplicationActionsProps> = ({ application }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateStatus = async (newStatus: 'approved' | 'rejected' | 'disqualified') => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('candidate_applications')
        .update({ 
          status: newStatus,
          reviewed_by: '00000000-0000-0000-0000-000000000000', // Replace with actual user ID in production
          reviewed_at: new Date().toISOString()
        })
        .eq('id', application.id);

      if (error) {
        throw error;
      }

      toast.success(`Application ${newStatus} successfully`);
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error("Failed to update application status");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusActions = () => {
    switch (application.status) {
      case 'pending':
        return (
          <>
            <Button 
              variant="default" // Changed from "success" to "default"
              size="sm" 
              onClick={() => handleUpdateStatus('approved')}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700" // Added green color via className
            >
              Approve
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => handleUpdateStatus('rejected')}
              disabled={isLoading}
            >
              Reject
            </Button>
          </>
        );
      case 'approved':
        return (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => handleUpdateStatus('disqualified')}
            disabled={isLoading}
          >
            Disqualify
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex space-x-2">
      {getStatusActions()}
    </div>
  );
};

export default ApplicationActions;
