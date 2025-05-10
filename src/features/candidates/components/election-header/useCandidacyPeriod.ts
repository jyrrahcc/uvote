
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
  
  // Check if candidacy period is in the future
  const isCandidacyPeriodUpcoming = () => {
    if (!election?.candidacyStartDate) return false;
    
    const now = new Date();
    const candidacyStart = new Date(election.candidacyStartDate);
    
    return now < candidacyStart;
  };
  
  // Check if candidacy period is in the past
  const isCandidacyPeriodEnded = () => {
    if (!election?.candidacyEndDate) return false;
    
    const now = new Date();
    const candidacyEnd = new Date(election.candidacyEndDate);
    
    return now > candidacyEnd;
  };
  
  // Format candidacy dates for display
  const formatCandidacyPeriod = () => {
    if (!election?.candidacyStartDate || !election?.candidacyEndDate) return "";
    
    const startDate = new Date(election.candidacyStartDate);
    const endDate = new Date(election.candidacyEndDate);
    
    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    return `${dateFormatter.format(startDate)} - ${dateFormatter.format(endDate)}`;
  };
  
  // Get time remaining in candidacy period
  const getCandidacyTimeRemaining = () => {
    if (!election?.candidacyEndDate) return null;
    
    const now = new Date();
    const candidacyEnd = new Date(election.candidacyEndDate);
    
    if (now > candidacyEnd) return null;
    
    const timeRemaining = candidacyEnd.getTime() - now.getTime();
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return { days, hours };
  };

  return {
    isCandidacyPeriodActive: isCandidacyPeriodActive(),
    isCandidacyPeriodUpcoming: isCandidacyPeriodUpcoming(),
    isCandidacyPeriodEnded: isCandidacyPeriodEnded(),
    formatCandidacyPeriod: formatCandidacyPeriod(),
    candidacyTimeRemaining: getCandidacyTimeRemaining()
  };
};
