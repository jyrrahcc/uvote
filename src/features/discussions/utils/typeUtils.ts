
import { Discussion, DiscussionTopic, Comment, DiscussionComment } from "@/types/discussions";

/**
 * Converts a Discussion object to a DiscussionTopic by adding camelCase aliases
 */
export const toDiscussionTopic = (discussion: Discussion): DiscussionTopic => {
  return {
    ...discussion,
    // Add camelCase aliases
    createdAt: discussion.created_at,
    updatedAt: discussion.updated_at,
    createdBy: discussion.created_by,
    electionId: discussion.election_id,
    isPinned: discussion.is_pinned,
    isLocked: discussion.is_locked
  };
};

/**
 * Converts an array of Discussion objects to DiscussionTopic objects
 */
export const toDiscussionTopics = (discussions: Discussion[]): DiscussionTopic[] => {
  return discussions.map(toDiscussionTopic);
};

/**
 * Converts a Comment object to a DiscussionComment by adding camelCase aliases
 */
export const toDiscussionComment = (comment: Comment): DiscussionComment => {
  return {
    ...comment,
    // Add camelCase aliases
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
    userId: comment.user_id,
    topicId: comment.topic_id,
    parentId: comment.parent_id
  };
};

/**
 * Converts an array of Comment objects to DiscussionComment objects
 */
export const toDiscussionComments = (comments: Comment[]): DiscussionComment[] => {
  return comments.map(toDiscussionComment);
};

/**
 * Converts a DiscussionTopic object to a plain Discussion object
 */
export const toDiscussion = (topic: DiscussionTopic): Discussion => {
  // Extract only the properties that belong to Discussion
  const {
    id, title, content, created_at, created_by, updated_at, 
    election_id, is_pinned, is_locked, view_count, author, repliesCount
  } = topic;
  
  return {
    id, title, content, created_at, created_by, updated_at, 
    election_id, is_pinned, is_locked, view_count, author, repliesCount
  };
};

/**
 * Converts a DiscussionComment object to a plain Comment object
 */
export const toComment = (discussionComment: DiscussionComment): Comment => {
  // Extract only the properties that belong to Comment
  const {
    id, content, created_at, updated_at, user_id, topic_id, parent_id, author, replies
  } = discussionComment;
  
  return {
    id, content, created_at, updated_at, user_id, topic_id, parent_id, author, replies
  };
};
