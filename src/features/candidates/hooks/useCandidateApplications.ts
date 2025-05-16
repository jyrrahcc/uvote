
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { CandidateApplication } from "@/types";
import { deleteCandidateApplication, fetchCandidateApplicationsForElection, fetchUserApplications } from "../services/candidateApplicationService";

export const useCandidateApplications = (electionId: string) => {
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!electionId) {
      console.log('No election ID provided to fetch applications');
      setApplications([]);
      setLoading(false);
      return;
    }
    
    try {
      console.log(`Fetching applications for election: ${electionId}`);
      setLoading(true);
      const data = await fetchCandidateApplicationsForElection(electionId);
      console.log(`Received ${data.length} applications`);
      setApplications(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching applications:", err);
      setError(err);
      toast.error("Failed to load candidate applications");
    } finally {
      setLoading(false);
    }
  }, [electionId]);

  const deleteApplication = async (applicationId: string) => {
    if (isDeleting) {
      console.log("Already processing a delete operation");
      return false;
    }

    try {
      console.log(`Starting deletion of application: ${applicationId}`);
      setIsDeleting(true);
      
      // Call the service function that now returns a boolean indicating success
      const isDeleted = await deleteCandidateApplication(applicationId);
      
      if (isDeleted) {
        // Update the UI optimistically
        setApplications(prev => prev.filter(app => app.id !== applicationId));
        toast.success("Application deleted successfully");
        
        // Explicitly refetch to ensure UI is in sync with database
        await fetchData();
        return true;
      } else {
        toast.error("Failed to delete application");
        return false;
      }
    } catch (err: any) {
      console.error("Error deleting application:", err);
      toast.error(`Failed to delete application: ${err.message || 'Unknown error'}`);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (electionId) {
      fetchData();
    }
  }, [electionId, fetchData]);

  return {
    applications,
    loading,
    error,
    isDeleting,
    refetch: fetchData,
    deleteApplication
  };
};

// For accessing user's own applications
export const useUserCandidateApplications = () => {
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchUserApplications();
      setApplications(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching user applications:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const deleteApplication = async (applicationId: string) => {
    if (isDeleting) return false;

    try {
      setIsDeleting(true);
      const isDeleted = await deleteCandidateApplication(applicationId);
      
      if (isDeleted) {
        // Update the UI optimistically
        setApplications(prev => prev.filter(app => app.id !== applicationId));
        toast.success("Application deleted successfully");
        // Explicitly refetch to ensure UI is in sync with database
        await fetchData();
        return true;
      } else {
        toast.error("Failed to delete application");
        return false;
      }
    } catch (err: any) {
      console.error("Error deleting application:", err);
      toast.error(`Failed to delete application: ${err.message || 'Unknown error'}`);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    applications,
    loading,
    error,
    isDeleting,
    refetch: fetchData,
    deleteApplication
  };
};
