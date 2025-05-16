
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
      pollOptions = Object.entries(dbPoll.options).map(([id, text]) => ({
        id,
        text: typeof text === 'string' ? text : String(text),
        votes: 0,
        percentage: 0
      }));
    }
  }

  return {
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
    // Author details will need to be populated separately
    author: undefined
  };
};
