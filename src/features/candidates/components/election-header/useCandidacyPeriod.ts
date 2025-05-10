
import { Election } from "@/types";

export const useCandidacyPeriod = (election: Election | null) => {
  // Check if candidacy period is active
  const isCandidacyPeriodActive = () => {
    if (!election?.candidacyStartDate || !election?.candidacyEndDate) return false;
    
    const now = new Date();
    const candidacyStart = new Date(election.candidacyStartDate);
    const candidacyEnd = new Date(election.candidacyEndDate);
    
    return now >= candidacyStart && now <= candidacyEnd;
  };

  return {
    isCandidacyPeriodActive: isCandidacyPeriodActive()
  };
};
