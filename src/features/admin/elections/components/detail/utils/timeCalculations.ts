
import { Election } from "@/types";

export const calculateTimeRemaining = (election: Election) => {
  const now = new Date();
  const endDate = new Date(election.endDate);
  
  if (election.status === 'completed') {
    return { text: "Election completed", statusText: "Ended" };
  }
  
  if (election.status === 'upcoming') {
    const startDate = new Date(election.startDate);
    const diffTime = startDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return { 
      text: `Starts in ${diffDays} days, ${diffHours} hours`,
      statusText: "Starting soon",
      daysRemaining: diffDays,
      hoursRemaining: diffHours
    };
  }
  
  // If active
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return { 
    text: `${diffDays} days, ${diffHours} hours remaining`,
    statusText: "In progress",
    daysRemaining: diffDays,
    hoursRemaining: diffHours
  };
};
