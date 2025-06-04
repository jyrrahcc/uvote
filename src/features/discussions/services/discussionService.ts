
import { supabase } from "@/integrations/supabase/client";
import { Discussion, DiscussionTopic, DiscussionComment } from "@/types/discussions";
import { getElectionIdCondition, isGlobalDiscussion } from "./globalDiscussionService";

/**
 * Get all topics for an election or global discussions with proper authentication and author information
 */
export const getTopics = async (electionId: string): Promise<DiscussionTopic[]> => {
  try {
    if (isGlobalDiscussion(electionId)) {
      // For global discussions, fetch topics with author information
      const { data, error } = await supabase
        .from('discussion_topics')
        .select(`
          *,
          profiles!discussion_topics_created_by_fkey(
            id,
            first_name,
            last_name,
            image_url
          ),
          comments:discussion_comments(count)
        `)
        .is('election_id', null)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match expected format
      return (data || []).map(topic => ({
        ...topic,
        author: topic.profiles ? {
          id: topic.profiles.id,
          firstName: topic.profiles.first_name || '',
          lastName: topic.profiles.last_name || '',
          imageUrl: topic.profiles.image_url || undefined
        } : undefined,
        repliesCount: topic.comments[0]?.count || 0
      }));
    } else {
      // For election-specific discussions, we'll need to fetch with joins
      const { data, error } = await supabase
        .from('discussion_topics')
        .select(`
          *,
          profiles!discussion_topics_created_by_fkey(
            id,
            first_name,
            last_name,
            image_url
          ),
          comments:discussion_comments(count)
        `)
        .eq('election_id', electionId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match expected format
      return (data || []).map(topic => ({
        ...topic,
        author: topic.profiles ? {
          id: topic.profiles.id,
          firstName: topic.profiles.first_name || '',
          lastName: topic.profiles.last_name || '',
          imageUrl: topic.profiles.image_url || undefined
        } : undefined,
        repliesCount: topic.comments[0]?.count || 0
      }));
    }
  } catch (error) {
    console.error("Error getting topics:", error);
    throw error;
  }
};

/**
 * Get a specific topic by ID with proper authorization check
 */
export const getTopic = async (topicId: string): Promise<DiscussionTopic | null> => {
  try {
    const { data, error } = await supabase
      .from('discussion_topics')
      .select('*')
      .eq('id', topicId)
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error getting topic:", error);
    throw error;
  }
};

/**
 * Create a new discussion topic with proper authentication
 */
export const createTopic = async (electionId: string, title: string, content: string): Promise<DiscussionTopic | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error("Not authenticated");
    
    // Validate input data
    if (!title.trim()) {
      throw new Error("Discussion title is required");
    }

    const insertData = {
      title: title.trim(),
      content: content?.trim() || null,
      created_by: session.session.user.id,
      ...getElectionIdCondition(electionId)
    };
    
    const { data, error } = await supabase
      .from('discussion_topics')
      .insert(insertData)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error creating topic:", error);
    throw error;
  }
};

/**
 * Update an existing discussion topic with proper authorization
 */
export const updateTopic = async (topicId: string, updates: Partial<DiscussionTopic>): Promise<DiscussionTopic | null> => {
  try {
    // Get current user session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new Error("User must be authenticated to update topics");
    }

    const userId = sessionData.session.user.id;

    // Prepare update data
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title.trim();
    if (updates.content !== undefined) updateData.content = updates.content?.trim() || null;
    if (updates.is_pinned !== undefined) updateData.is_pinned = updates.is_pinned;
    if (updates.is_locked !== undefined) updateData.is_locked = updates.is_locked;
    
    const { data, error } = await supabase
      .from('discussion_topics')
      .update(updateData)
      .eq('id', topicId)
      .eq('created_by', userId) // Ensure user can only update their own topics
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error updating topic:", error);
    throw error;
  }
};

/**
 * Delete a discussion topic with proper authorization
 */
export const deleteTopic = async (topicId: string): Promise<boolean> => {
  try {
    // Get current user session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new Error("User must be authenticated to delete topics");
    }

    // Use the database function to safely delete topic with comments
    const { error } = await supabase.rpc('delete_topic_with_comments', {
      topic_id_param: topicId
    });
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error deleting topic:", error);
    return false;
  }
};

/**
 * Get all comments for a topic with proper filtering
 */
export const getComments = async (topicId: string): Promise<DiscussionComment[]> => {
  try {
    const { data, error } = await supabase
      .from('discussion_comments')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error getting comments:", error);
    throw error;
  }
};

/**
 * Create a new comment with proper authentication
 */
export const createComment = async (topicId: string, content: string, parentId?: string | null): Promise<DiscussionComment | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error("Not authenticated");
    
    // Validate input
    if (!content.trim()) {
      throw new Error("Comment content is required");
    }
    
    const { data, error } = await supabase
      .from('discussion_comments')
      .insert({
        topic_id: topicId,
        content: content.trim(),
        user_id: session.session.user.id,
        parent_id: parentId || null
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};

/**
 * Update an existing comment with proper authorization
 */
export const updateComment = async (commentId: string, content: string): Promise<DiscussionComment | null> => {
  try {
    // Get current user session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new Error("User must be authenticated to update comments");
    }

    const userId = sessionData.session.user.id;

    // Validate input
    if (!content.trim()) {
      throw new Error("Comment content is required");
    }
    
    const { data, error } = await supabase
      .from('discussion_comments')
      .update({ content: content.trim() })
      .eq('id', commentId)
      .eq('user_id', userId) // Ensure user can only update their own comments
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error updating comment:", error);
    throw error;
  }
};

/**
 * Delete a comment with proper authorization
 */
export const deleteComment = async (commentId: string): Promise<boolean> => {
  try {
    // Get current user session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new Error("User must be authenticated to delete comments");
    }

    const userId = sessionData.session.user.id;

    const { error } = await supabase
      .from('discussion_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId); // Ensure user can only delete their own comments
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    return false;
  }
};
