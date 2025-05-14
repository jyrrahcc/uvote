
import { Poll, PollVoter } from "@/types";

// Transform data from snake_case DB format to camelCase TypeScript models
export const transformPoll = (pollData: any): Poll => {
  return {
    id: pollData.id,
    question: pollData.question,
    options: pollData.options,
    description: pollData.description || null,
    electionId: pollData.election_id,
    topicId: pollData.topic_id,
    createdBy: pollData.created_by,
    createdAt: pollData.created_at,
    endsAt: pollData.ends_at,
    isClosed: pollData.is_closed || false,
    multipleChoice: pollData.multiple_choice || false,
    author: pollData.author ? {
      id: pollData.author.id,
      firstName: pollData.author.first_name,
      lastName: pollData.author.last_name,
      imageUrl: pollData.author.image_url
    } : null
  };
};

// Transform voter data to PollVoter type with proper null handling
export const transformVoter = (vote: any): PollVoter | null => {
  // Skip if user profile data is missing
  if (!vote.user) return null;
  
  return {
    userId: vote.user_id,
    firstName: vote.user.first_name,
    lastName: vote.user.last_name,
    imageUrl: vote.user.image_url
  };
};
