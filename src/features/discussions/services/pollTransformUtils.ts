
import { DbPoll, Poll, PollOption } from '@/types/discussions';

export const transformPollData = (dbPoll: DbPoll): Poll => {
  let pollOptions: PollOption[] = [];

  // Process options based on their structure in the database
  if (dbPoll.options) {
    // If options is an array structure
    if (Array.isArray(dbPoll.options)) {
      pollOptions = dbPoll.options.map((opt: any) => ({
        id: opt.id,
        text: opt.text,
        votes: opt.votes || 0,
        percentage: opt.percentage || 0
      }));
    } 
    // If options is a record structure (key-value pairs)
    else if (typeof dbPoll.options === 'object') {
      pollOptions = Object.entries(dbPoll.options).map(([id, value]) => {
        // Handle different formats of options storage
        if (typeof value === 'string') {
          // Simple format: { "id1": "Option Text 1", ... }
          return {
            id, 
            text: value,
            votes: 0,
            percentage: 0
          };
        } else if (typeof value === 'object' && value !== null) {
          // Complex format: { "id1": { text: "Option Text 1", ... }, ... }
          return {
            id,
            text: (value as any).text || String(value),
            votes: (value as any).votes || 0,
            percentage: (value as any).percentage || 0
          };
        } else {
          // Fallback for other formats
          return {
            id,
            text: String(value),
            votes: 0,
            percentage: 0
          };
        }
      });
    }
  }

  // Create the Poll object with both snake_case and camelCase properties
  const poll: Poll = {
    id: dbPoll.id,
    question: dbPoll.question,
    description: dbPoll.description || undefined,
    options: pollOptions,
    created_at: dbPoll.created_at,
    created_by: dbPoll.created_by,
    election_id: dbPoll.election_id,
    topic_id: dbPoll.topic_id || undefined,
    multiple_choice: dbPoll.multiple_choice || false,
    is_closed: dbPoll.is_closed || false,
    ends_at: dbPoll.ends_at || undefined,
    // Add camelCase aliases for component usage
    createdAt: dbPoll.created_at,
    createdBy: dbPoll.created_by,
    electionId: dbPoll.election_id,
    topicId: dbPoll.topic_id || undefined,
    multipleChoice: dbPoll.multiple_choice || false,
    isClosed: dbPoll.is_closed || false,
    endsAt: dbPoll.ends_at || undefined,
    // Author details will need to be populated separately
    author: undefined
  };

  return poll;
};
