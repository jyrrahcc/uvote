
import { Poll, PollResults } from "@/types/discussions";

// Transform database record to frontend Poll model
export const transformPoll = (record: any): Poll => {
  if (!record) return {} as Poll;
  
  return {
    id: record.id,
    question: record.question,
    options: record.options || {},
    description: record.description || null,
    createdBy: record.created_by,
    createdAt: record.created_at,
    electionId: record.election_id || null,
    topicId: record.topic_id || null,
    endsAt: record.ends_at || null,
    isClosed: record.is_closed || false,
    multipleChoice: record.multiple_choice || false,
    author: record.profiles ? {
      id: record.profiles.id,
      firstName: record.profiles.first_name,
      lastName: record.profiles.last_name,
      imageUrl: record.profiles.image_url
    } : null
  };
};

// Transform poll results for frontend use
export const transformResults = (poll: Poll | null, votes: any[], voters: any[]): PollResults[] => {
  if (!poll || !votes.length) return [];
  
  const totalVotes = votes.length;
  const results: PollResults[] = [];
  
  // Map user data for easy lookup
  const userMap = new Map();
  voters.forEach(voter => {
    userMap.set(voter.id, {
      userId: voter.id,
      firstName: voter.first_name,
      lastName: voter.last_name,
      imageUrl: voter.image_url
    });
  });
  
  // Count votes for each option
  const optionVotes: Record<string, string[]> = {};
  
  // Initialize each option with empty array
  Object.keys(poll.options).forEach(optionId => {
    optionVotes[optionId] = [];
  });
  
  // Count votes
  votes.forEach(vote => {
    Object.entries(vote.options).forEach(([optionId, selected]) => {
      if (selected && optionVotes[optionId]) {
        optionVotes[optionId].push(vote.user_id);
      }
    });
  });
  
  // Create results
  Object.entries(poll.options).forEach(([optionId, optionText]) => {
    const optionVoterIds = optionVotes[optionId] || [];
    const voterCount = optionVoterIds.length;
    
    results.push({
      optionId,
      optionText,
      votes: voterCount,
      percentage: totalVotes > 0 ? (voterCount / totalVotes) * 100 : 0,
      voters: optionVoterIds
        .map(voterId => userMap.get(voterId))
        .filter(Boolean) // Filter out undefined voters
    });
  });
  
  // Sort by vote count (descending)
  return results.sort((a, b) => b.votes - a.votes);
};
