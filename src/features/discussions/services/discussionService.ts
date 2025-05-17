import { supabase } from "@/integrations/supabase/client";
import { Discussion, DiscussionTopic, DiscussionComment } from "@/types/discussions";
import { getElectionIdCondition, isGlobalDiscussion } from "./globalDiscussionService";

/**
 * Get all topics for an election or global discussions
 */
export const getTopics = async (electionId: string): Promise<DiscussionTopic[]> => {
  try {
    let query;
    
    if (isGlobalDiscussion(electionId)) {
      query = supabase.rpc('get_topics_with_comment_counts_global');
    } else {
      query = supabase.rpc('get_topics_with_comment_counts', {
        election_id_param: electionId
      });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error getting topics:", error);
    throw error;
  }
};

/**
 * Get a specific topic by ID
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
 * Create a new discussion topic
 */
export const createTopic = async (electionId: string, title: string, content: string): Promise<DiscussionTopic | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error("Not authenticated");
    
    const { data, error } = await supabase
      .from('discussion_topics')
      .insert({
        title,
        content,
        ...getElectionIdCondition(electionId),
        created_by: session.session.user.id
      })
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
 * Update an existing discussion topic
 */
export const updateTopic = async (topicId: string, updates: Partial<DiscussionTopic>): Promise<DiscussionTopic | null> => {
  try {
    const { data, error } = await supabase
      .from('discussion_topics')
      .update(updates)
      .eq('id', topicId)
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
 * Delete a discussion topic
 */
export const deleteTopic = async (topicId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('discussion_topics')
      .delete()
      .eq('id', topicId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error deleting topic:", error);
    return false;
  }
};

/**
 * Get all comments for a topic
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
 * Create a new comment
 */
export const createComment = async (topicId: string, content: string, parentId?: string | null): Promise<DiscussionComment | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error("Not authenticated");
    
    const { data, error } = await supabase
      .from('discussion_comments')
      .insert({
        topic_id: topicId,
        content,
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
 * Update an existing comment
 */
export const updateComment = async (commentId: string, content: string): Promise<DiscussionComment | null> => {
  try {
    const { data, error } = await supabase
      .from('discussion_comments')
      .update({ content })
      .eq('id', commentId)
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
 * Delete a comment
 */
export const deleteComment = async (commentId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('discussion_comments')
      .delete()
      .eq('id', commentId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    return false;
  }
};
