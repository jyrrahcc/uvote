
import { supabase } from "@/integrations/supabase/client";
import { Discussion, DiscussionTopic, DiscussionComment } from "@/types/discussions";
import { getElectionIdCondition, isGlobalDiscussion } from "./globalDiscussionService";

/**
 * Get all topics for an election or global discussions with proper authentication and author information
 */
export const getTopics = async (electionId: string): Promise<DiscussionTopic[]> => {
  try {
    const condition = isGlobalDiscussion(electionId) ? null : electionId;
    
    // Fetch topics with comment counts using specific foreign key relationship
    const { data: topics, error: topicsError } = await supabase
      .from('discussion_topics')
      .select(`
        *,
        comments:discussion_comments!discussion_comments_topic_id_fkey(count)
      `)
      .eq('election_id', condition)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (topicsError) {
      console.error("Error fetching topics:", topicsError);
      throw topicsError;
    }
    
    if (!topics || topics.length === 0) {
      return [];
    }
    
    // Get unique user IDs
    const userIds = topics.map(topic => topic.created_by).filter(Boolean);
    
    if (userIds.length === 0) {
      return topics.map(topic => ({
        ...topic,
        author: undefined,
        repliesCount: topic.comments[0]?.count || 0
      }));
    }
    
    // Fetch profiles separately
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, image_url')
      .in('id', userIds);
    
    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      // Continue without author information rather than throwing
    }
    
    // Create a map of profiles by user ID
    const profilesMap = (profiles || []).reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {} as Record<string, any>);
    
    // Transform the data to match expected format
    return topics.map(topic => {
      const profile = profilesMap[topic.created_by];
      return {
        ...topic,
        author: profile ? {
          id: profile.id,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          imageUrl: profile.image_url || undefined
        } : undefined,
        repliesCount: topic.comments[0]?.count || 0
      };
    });
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
      
    if (error) {
      console.error("Error fetching topic:", error);
      throw error;
    }
    
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
    if (!session.session) {
      throw new Error("Authentication required to create discussions");
    }
    
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
      
    if (error) {
      console.error("Error creating topic:", error);
      throw error;
    }
    
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
      throw new Error("Authentication required to update topics");
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
      
    if (error) {
      console.error("Error updating topic:", error);
      throw error;
    }
    
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
      throw new Error("Authentication required to delete topics");
    }

    // Use the database function to safely delete topic with comments
    const { error } = await supabase.rpc('delete_topic_with_comments', {
      topic_id_param: topicId
    });
      
    if (error) {
      console.error("Error deleting topic:", error);
      throw error;
    }
    
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
      
    if (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
    
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
    if (!session.session) {
      throw new Error("Authentication required to create comments");
    }
    
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
      
    if (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
    
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
      throw new Error("Authentication required to update comments");
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
      
    if (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
    
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
      throw new Error("Authentication required to delete comments");
    }

    const userId = sessionData.session.user.id;

    const { error } = await supabase
      .from('discussion_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId); // Ensure user can only delete their own comments
      
    if (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    return false;
  }
};
