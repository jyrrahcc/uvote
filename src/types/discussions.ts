
export interface DiscussionTopic {
  id: string;
  election_id: string;
  created_by: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  is_pinned: boolean | null;
  is_locked: boolean | null;
  view_count: number | null;
  author?: {
    first_name: string;
    last_name: string;
    image_url: string | null;
  } | null;
}

export interface DiscussionComment {
  id: string;
  topic_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  parent_id: string | null;
  author?: {
    first_name: string;
    last_name: string;
    image_url: string | null;
  } | null;
  replies?: DiscussionComment[];
}

export interface Poll {
  id: string;
  election_id: string;
  topic_id: string | null;
  created_by: string;
  question: string;
  description: string | null;
  options: Record<string, string>;
  multiple_choice: boolean | null;
  created_at: string;
  ends_at: string | null;
  is_closed: boolean | null;
  author?: {
    first_name: string;
    last_name: string;
    image_url: string | null;
  } | null;
}

export interface PollVote {
  id: string;
  poll_id: string;
  user_id: string;
  options: string[];
  created_at: string;
}

export interface PollResults {
  optionId: string;
  optionText: string;
  votes: number;
  percentage: number;
  voters?: {
    userId: string;
    firstName: string;
    lastName: string;
    imageUrl?: string | null;
  }[];
}
