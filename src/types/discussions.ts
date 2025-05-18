
/**
 * Poll type definition
 */
export interface Poll {
  id: string;
  question: string;
  description?: string;
  options: PollOption[];
  multiple_choice: boolean;
  is_closed: boolean;
  created_at: string;
  created_by: string;
  election_id?: string;
  topic_id?: string;
  ends_at?: string;
  total_votes?: number;
  votes_count?: number; // Add this property
  has_voted?: boolean; // Add this property
  author?: any; // Add this property for author information
}

export interface PollOption {
  id: string;
  text: string;
  votes?: number;
  percentage?: number;
}

export interface PollVote {
  id: string;
  poll_id: string;
  user_id: string;
  options: string[];
  created_at: string;
}

export interface PollResults {
  poll: Poll;
  options: PollOption[];
  totalVotes: number;
  userVote?: PollVote | null;
}

export interface DbPoll {
  id: string;
  question: string;
  description?: string;
  options: any;
  multiple_choice: boolean;
  is_closed: boolean;
  created_at: string;
  created_by: string;
  election_id?: string;
  topic_id?: string;
  ends_at?: string;
}

export interface DbPollVote {
  id: string;
  poll_id: string;
  user_id: string;
  options: any;
  created_at: string;
}

// Add discussion-related types
export interface DiscussionTopic {
  id: string;
  title: string;
  content?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  election_id?: string;
  is_pinned?: boolean;
  is_locked?: boolean;
  replies_count?: number;
  view_count?: number;
  author?: any;
}

export interface DiscussionComment {
  id: string;
  content: string;
  topic_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  parent_id?: string;
  author?: any;
  replies?: DiscussionComment[];
}

export interface Discussion {
  topic: DiscussionTopic;
  comments: DiscussionComment[];
}

export const mapDbPollToPoll = (dbPoll: DbPoll, totalVotes = 0): Poll => {
  const options = typeof dbPoll.options === 'string' 
    ? JSON.parse(dbPoll.options) 
    : dbPoll.options;

  return {
    id: dbPoll.id,
    question: dbPoll.question,
    description: dbPoll.description,
    options: Array.isArray(options?.options) 
      ? options.options.map((opt: any) => ({
          id: opt.id,
          text: opt.text,
          votes: 0,
          percentage: 0
        }))
      : [],
    multiple_choice: dbPoll.multiple_choice,
    is_closed: dbPoll.is_closed,
    created_at: dbPoll.created_at,
    created_by: dbPoll.created_by,
    election_id: dbPoll.election_id,
    topic_id: dbPoll.topic_id,
    ends_at: dbPoll.ends_at,
    total_votes: totalVotes,
    votes_count: totalVotes, // Add this property
    has_voted: false // Default value for has_voted
  };
};

export const mapDbPollVoteToPollVote = (dbPollVote: DbPollVote): PollVote => {
  const options = typeof dbPollVote.options === 'string' 
    ? JSON.parse(dbPollVote.options) 
    : dbPollVote.options;

  return {
    id: dbPollVote.id,
    poll_id: dbPollVote.poll_id,
    user_id: dbPollVote.user_id,
    options: Array.isArray(options) ? options : [],
    created_at: dbPollVote.created_at
  };
};
