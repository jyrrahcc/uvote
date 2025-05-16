
import { Json } from "@/integrations/supabase/types";

export interface Discussion {
  id: string;
  title: string;
  content?: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  election_id: string;
  is_pinned?: boolean;
  is_locked?: boolean;
  view_count?: number;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  topic_id: string;
  parent_id?: string;
}

export interface Poll {
  id: string;
  question: string;
  description?: string;
  options: PollOption[];
  created_at: string;
  created_by: string;
  election_id: string;
  topic_id?: string;
  multiple_choice?: boolean;
  is_closed?: boolean;
  ends_at?: string;
  votes_count?: number;
  has_voted?: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes?: number;
  percentage?: number;
}

export interface PollVote {
  id: string;
  pollId: string;
  userId: string;
  options: Record<string, boolean>;
  createdAt: string;
}

// Database schema interfaces
export interface DbDiscussion {
  id: string;
  title: string;
  content?: string | null;
  created_at: string;
  created_by: string;
  updated_at: string;
  election_id: string;
  is_pinned?: boolean | null;
  is_locked?: boolean | null;
  view_count?: number | null;
}

export interface DbComment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  topic_id: string;
  parent_id?: string | null;
}

export interface DbPoll {
  id: string;
  question: string;
  description?: string | null;
  options: Json;
  created_at: string;
  created_by: string;
  election_id: string;
  topic_id?: string | null;
  multiple_choice?: boolean | null;
  is_closed?: boolean | null;
  ends_at?: string | null;
}

export interface DbPollVote {
  id: string;
  poll_id: string;
  user_id: string;
  options: Json;
  created_at: string;
}
