
import { useMemo } from "react";
import { Candidate } from "@/types";

/**
 * Custom hook to organize candidates by position
 */
export const useCandidateGroups = (candidates: Candidate[] | null) => {
  // Group candidates by position
  const positionGroups = useMemo(() => {
    const groups: { [key: string]: Candidate[] } = {};
    
    if (Array.isArray(candidates)) {
      candidates.forEach((candidate) => {
        if (!groups[candidate.position]) {
          groups[candidate.position] = [];
        }
        groups[candidate.position].push(candidate);
      });
    }
    
    return groups;
  }, [candidates]);
  
  // Get unique positions
  const positions = useMemo(() => 
    Object.keys(positionGroups),
  [positionGroups]);
  
  return {
    positionGroups,
    positions
  };
};
