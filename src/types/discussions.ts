
import { Json } from "@/integrations/supabase/types";

// User interface for discussions and comments
export interface DiscussionUser {
  id: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
}

// Core interface with database field names (snake_case)
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
  
  // UI-friendly properties
  author?: DiscussionUser;
  repliesCount?: number;
}

// Alias for backward compatibility
export type DiscussionTopic = Discussion;

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  topic_id: string;
  parent_id?: string;
  
  // UI-friendly properties
  author?: DiscussionUser;
  replies?: Comment[];
}

// Alias for backward compatibility
export type DiscussionComment = Comment;

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
  author?: {
    firstName: string;
    lastName: string;
    imageUrl?: string;
  };
}

export interface PollOption {
  id: string;
  text: string;
  votes?: number;
  percentage?: number;
}

export interface PollResults {
  optionId: string;
  optionText: string;
  votes: number;
  percentage: number;
  voters?: {
    id: string;
    firstName: string;
    lastName: string;
    imageUrl?: string;
  }[];
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

// Mapping functions to convert between DB and UI representations
export const mapDbDiscussionToDiscussion = (dbDiscussion: DbDiscussion, author?: DiscussionUser, repliesCount?: number): Discussion => {
  return {
    id: dbDiscussion.id,
    title: dbDiscussion.title,
    content: dbDiscussion.content || undefined,
    created_at: dbDiscussion.created_at,
    created_by: dbDiscussion.created_by,
    updated_at: dbDiscussion.updated_at,
    election_id: dbDiscussion.election_id,
    is_pinned: dbDiscussion.is_pinned || false,
    is_locked: dbDiscussion.is_locked || false,
    view_count: dbDiscussion.view_count || 0,
    author: author,
    repliesCount: repliesCount
  };
};

export const mapDbCommentToComment = (dbComment: DbComment, author?: DiscussionUser): Comment => {
  return {
    id: dbComment.id,
    content: dbComment.content,
    created_at: dbComment.created_at,
    updated_at: dbComment.updated_at,
    user_id: dbComment.user_id,
    topic_id: dbComment.topic_id,
    parent_id: dbComment.parent_id || undefined,
    author: author,
    replies: []
  };
};
