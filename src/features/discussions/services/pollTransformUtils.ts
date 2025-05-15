
import { Poll } from "@/types/discussions";

/**
 * Transforms a raw poll database object to the frontend model
 */
export const transformPoll = (dbPoll: any): Poll => {
  return {
    id: dbPoll.id,
    question: dbPoll.question,
    options: dbPoll.options || {},
    description: dbPoll.description || null,
    electionId: dbPoll.election_id,
    topicId: dbPoll.topic_id,
    createdBy: dbPoll.created_by,
    createdAt: dbPoll.created_at,
    endsAt: dbPoll.ends_at,
    isClosed: dbPoll.is_closed || false,
    multipleChoice: dbPoll.multiple_choice || false,
    author: dbPoll.profiles ? {
      id: dbPoll.profiles.id,
      firstName: dbPoll.profiles.first_name,
      lastName: dbPoll.profiles.last_name,
      imageUrl: dbPoll.profiles.image_url
    } : null
  };
};

/**
 * Transforms a frontend poll model to database format
 */
export const transformPollToDb = (poll: Poll): any => {
  return {
    id: poll.id,
    question: poll.question,
    options: poll.options,
    description: poll.description,
    election_id: poll.electionId,
    topic_id: poll.topicId,
    created_by: poll.createdBy,
    created_at: poll.createdAt,
    ends_at: poll.endsAt,
    is_closed: poll.isClosed,
    multiple_choice: poll.multipleChoice
  };
};
