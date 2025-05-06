
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchElectionDetails, updateElectionStatus } from "../services/electionService";
import { Election } from "@/types";

/**
 * Custom hook for fetching and managing election data
 */
export const useElection = (electionId: string | undefined) => {
  const [isAccessVerified, setIsAccessVerified] = useState(false);
  
  // Main query for election data
  const {
    data: election,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["election", electionId],
    queryFn: () => (electionId ? fetchElectionDetails(electionId) : Promise.reject("No election ID provided")),
    enabled: !!electionId,
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Check if the user has verified access to this election
  useEffect(() => {
    if (election?.isPrivate) {
      try {
        const verifiedElections = JSON.parse(localStorage.getItem('verifiedElections') || '{}');
        setIsAccessVerified(!!verifiedElections[election.accessCode || '']);
      } catch {
        setIsAccessVerified(false);
      }
    } else {
      setIsAccessVerified(true);
    }
  }, [election]);
  
  // Update election status based on current date if needed
  useEffect(() => {
    if (election) {
      const checkAndUpdateStatus = async () => {
        await updateElectionStatus(election);
      };
      
      checkAndUpdateStatus();
    }
  }, [election]);
  
  /**
   * Verify access code for private elections
   */
  const verifyAccessCode = (code: string): boolean => {
    if (!election || !election.isPrivate) return true;
    
    const isValid = election.accessCode === code;
    
    if (isValid) {
      try {
        // Store the verification in local storage
        const verifiedElections = JSON.parse(localStorage.getItem('verifiedElections') || '{}');
        verifiedElections[code] = true;
        localStorage.setItem('verifiedElections', JSON.stringify(verifiedElections));
        setIsAccessVerified(true);
      } catch (e) {
        console.error("Error storing verification:", e);
      }
    }
    
    return isValid;
  };
  
  return {
    election,
    isLoading,
    error,
    refetch,
    isAccessVerified,
    verifyAccessCode,
  };
};
