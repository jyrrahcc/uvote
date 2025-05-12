
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { CandidateApplication } from "@/types";
import { deleteCandidateApplication, fetchCandidateApplicationsForElection, fetchUserApplications } from "../services/candidateApplicationService";

export const useCandidateApplications = (electionId: string) => {
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCandidateApplicationsForElection(electionId);
      setApplications(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching applications:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [electionId]);

  const deleteApplication = async (applicationId: string) => {
    try {
      await deleteCandidateApplication(applicationId);
      // Update the local state to reflect the deletion
      setApplications(prev => prev.filter(app => app.id !== applicationId));
      toast.success("Application deleted successfully");
      // Explicitly refetch data to ensure UI is in sync with database
      await fetchData();
      return true;
    } catch (err: any) {
      console.error("Error deleting application:", err);
      toast.error("Failed to delete application");
      return false;
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
    refetch: fetchData,
    deleteApplication
  };
};

// For accessing user's own applications
export const useUserCandidateApplications = () => {
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
    try {
      await deleteCandidateApplication(applicationId);
      // Update the local state to reflect the deletion
      setApplications(prev => prev.filter(app => app.id !== applicationId));
      toast.success("Application deleted successfully");
      // Explicitly refetch to ensure UI is in sync with database
      await fetchData();
      return true;
    } catch (err: any) {
      console.error("Error deleting application:", err);
      toast.error("Failed to delete application");
      return false;
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    applications,
    loading,
    error,
    refetch: fetchData,
    deleteApplication
  };
};
