
import { Poll } from "@/types";

/**
 * Transform a poll from the database format to the frontend format
 */
export const transformPoll = (pollData: any): Poll => {
  return {
    id: pollData.id,
    question: pollData.question,
    options: pollData.options || {},
    description: pollData.description || null,
    electionId: pollData.election_id,
    topicId: pollData.topic_id,
    createdBy: pollData.created_by,
    createdAt: pollData.created_at,
    endsAt: pollData.ends_at || null,
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
