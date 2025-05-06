
import { useState, useEffect } from "react";
import { CandidateApplication } from "@/types";
import { 
  fetchCandidateApplicationsForElection, 
  fetchCandidateApplicationsByUser
} from "../services/candidateApplicationService";

export const useCandidateApplications = (electionId: string) => {
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCandidateApplicationsForElection(electionId);
      setApplications(data);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch applications"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (electionId) {
      fetchApplications();
    }
  }, [electionId]);

  return {
    applications,
    loading,
    error,
    refetch: fetchApplications
  };
};

export const useUserCandidateApplications = () => {
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCandidateApplicationsByUser();
      setApplications(data);
    } catch (err) {
      console.error("Error fetching user applications:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch applications"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserApplications();
  }, []);

  return {
    applications,
    loading,
    error,
    refetch: fetchUserApplications
  };
};
