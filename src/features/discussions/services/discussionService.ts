
import { supabase } from "@/integrations/supabase/client";
import { DiscussionTopic, DiscussionComment } from "@/types/discussions";

// Transform data from snake_case DB format to camelCase TypeScript models
const transformTopic = (topicData: any): DiscussionTopic => {
  return {
    id: topicData.id,
    title: topicData.title,
    content: topicData.content || '',
    electionId: topicData.election_id,
    createdBy: topicData.created_by,
    createdAt: topicData.created_at,
    updatedAt: topicData.updated_at,
    isPinned: topicData.is_pinned || false,
    isLocked: topicData.is_locked || false,
    author: topicData.author ? {
      id: topicData.author.id,
      firstName: topicData.author.first_name,
      lastName: topicData.author.last_name,
      imageUrl: topicData.author.image_url
    } : null,
    repliesCount: topicData.repliesCount || topicData.replies_count || 0,
    lastReplyAt: topicData.lastReplyAt || topicData.last_reply_at
  };
};

const transformComment = (commentData: any): DiscussionComment => {
  return {
    id: commentData.id,
    content: commentData.content,
    topicId: commentData.topic_id,
    createdBy: commentData.created_by || commentData.user_id,
    createdAt: commentData.created_at,
    updatedAt: commentData.updated_at,
    parentId: commentData.parent_id || null,
    author: commentData.author ? {
      id: commentData.author.id,
      firstName: commentData.author.first_name,
      lastName: commentData.author.last_name,
      imageUrl: commentData.author.image_url
    } : null,
    replies: []  // Will be populated if needed
  };
};

// Get all topics for an election
export const getTopics = async (electionId: string): Promise<DiscussionTopic[]> => {
  try {
    const { data, error } = await supabase
      .from('discussion_topics')
      .select(`
        *,
        author:profiles (
          id,
          first_name,
          last_name,
          image_url
        ),
        replies_count:discussion_comments(count)
      `)
      .eq('election_id', electionId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching topics:", error);
      return [];
    }

    // Add replies_count to each topic
    const topicsWithRepliesCount = data.map((topic: any) => {
      return {
        ...topic,
        replies_count: topic.replies_count.count || 0
      };
    });

    return topicsWithRepliesCount.map(transformTopic);
  } catch (error) {
    console.error("Error fetching topics:", error);
    return [];
  }
};

// Get a single topic by ID
export const getTopic = async (topicId: string): Promise<DiscussionTopic | null> => {
  try {
    const { data, error } = await supabase
      .from('discussion_topics')
      .select(`
        *,
        author:profiles (
          id,
          first_name,
          last_name,
          image_url
        ),
        replies_count:discussion_comments(count)
      `)
      .eq('id', topicId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching topic:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    const topicWithRepliesCount = {
      ...data,
      replies_count: data.replies_count?.count || 0
    };

    return transformTopic(topicWithRepliesCount);
  } catch (error) {
    console.error("Error fetching topic:", error);
    return null;
  }
};

// Create a new topic
export const createTopic = async (
  electionId: string,
  title: string,
  content: string
): Promise<DiscussionTopic | null> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const topicData = {
      title,
      content,
      election_id: electionId,
      created_by: userData.user.id
    };

    const { data, error } = await supabase
      .from('discussion_topics')
      .insert([topicData])
      .select(`
        *,
        author:profiles (
          id,
          first_name,
          last_name,
          image_url
        )
      `)
      .maybeSingle();

    if (error) {
      console.error("Error creating topic:", error);
      return null;
    }
    
    if (!data) {
      return null;
    }

    return transformTopic(data);
  } catch (error) {
    console.error("Error creating topic:", error);
    return null;
  }
};

// Update a topic
export const updateTopic = async (
  topicId: string,
  updates: Partial<DiscussionTopic>
): Promise<DiscussionTopic | null> => {
  try {
    const dbUpdates: Record<string, any> = {};
    
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.isPinned !== undefined) dbUpdates.is_pinned = updates.isPinned;
    if (updates.isLocked !== undefined) dbUpdates.is_locked = updates.isLocked;

    const { data, error } = await supabase
      .from('discussion_topics')
      .update(dbUpdates)
      .eq('id', topicId)
      .select(`
        *,
        author:profiles (
          id,
          first_name,
          last_name,
          image_url
        )
      `)
      .maybeSingle();

    if (error) {
      console.error("Error updating topic:", error);
      return null;
    }
    
    if (!data) {
      return null;
    }

    return transformTopic(data);
  } catch (error) {
    console.error("Error updating topic:", error);
    return null;
  }
};

// Delete a topic
export const deleteTopic = async (topicId: string): Promise<boolean> => {
  try {
    // First delete all comments associated with the topic
    const { error: commentsError } = await supabase
      .from('discussion_comments')
      .delete()
      .eq('topic_id', topicId);

    if (commentsError) {
      console.error("Error deleting topic comments:", commentsError);
      return false;
    }

    // Then delete the topic itself
    const { error: topicError } = await supabase
      .from('discussion_topics')
      .delete()
      .eq('id', topicId);

    if (topicError) {
      console.error("Error deleting topic:", topicError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting topic:", error);
    return false;
  }
};

// Get comments for a topic
export const getComments = async (topicId: string): Promise<DiscussionComment[]> => {
  try {
    const { data, error } = await supabase
      .from('discussion_comments')
      .select(`
        *,
        author:profiles (
          id,
          first_name,
          last_name,
          image_url
        )
      `)
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      return [];
    }

    return data.map(transformComment);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

// Create a new comment
export const createComment = async (
  topicId: string,
  content: string,
  parentId?: string | null
): Promise<DiscussionComment | null> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const commentData = {
      content,
      topic_id: topicId,
      created_by: userData.user.id,
      parent_id: parentId || null
    };

    const { data, error } = await supabase
      .from('discussion_comments')
      .insert([commentData])
      .select(`
        *,
        author:profiles (
          id,
          first_name,
          last_name,
          image_url
        )
      `)
      .maybeSingle();

    if (error) {
      console.error("Error creating comment:", error);
      return null;
    }
    
    if (!data) {
      return null;
    }

    return transformComment(data);
  } catch (error) {
    console.error("Error creating comment:", error);
    return null;
  }
};

// Update a comment
export const updateComment = async (
  commentId: string,
  content: string
): Promise<DiscussionComment | null> => {
  try {
    const { data, error } = await supabase
      .from('discussion_comments')
      .update({ content })
      .eq('id', commentId)
      .select(`
        *,
        author:profiles (
          id,
          first_name,
          last_name,
          image_url
        )
      `)
      .maybeSingle();

    if (error) {
      console.error("Error updating comment:", error);
      return null;
    }
    
    if (!data) {
      return null;
    }

    return transformComment(data);
  } catch (error) {
    console.error("Error updating comment:", error);
    return null;
  }
};

// Delete a comment
export const deleteComment = async (commentId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('discussion_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error("Error deleting comment:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    return false;
  }
};
