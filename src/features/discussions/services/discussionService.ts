import { supabase } from "@/integrations/supabase/client";
import { DiscussionTopic, DiscussionComment } from "@/types/discussions";

// Get all topics for an election
export const getTopics = async (electionId: string): Promise<DiscussionTopic[]> => {
  try {
    const { data, error } = await supabase
      .from('discussion_topics')
      .select(`
        id, 
        title, 
        content, 
        election_id, 
        created_by,
        created_at,
        updated_at,
        is_pinned,
        is_locked,
        profiles:created_by (
          id, 
          first_name, 
          last_name,
          image_url
        ),
        replies:discussion_comments (count)
      `)
      .eq('election_id', electionId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching topics:", error);
      return [];
    }
    
    return data.map(topic => ({
      id: topic.id,
      title: topic.title,
      content: topic.content,
      electionId: topic.election_id,
      createdBy: topic.created_by,
      createdAt: topic.created_at,
      updatedAt: topic.updated_at,
      isPinned: topic.is_pinned || false,
      isLocked: topic.is_locked || false,
      author: topic.profiles ? {
        id: topic.profiles.id,
        firstName: topic.profiles.first_name,
        lastName: topic.profiles.last_name,
        imageUrl: topic.profiles.image_url
      } : null,
      repliesCount: topic.replies ? topic.replies.length : 0
    }));
  } catch (error) {
    console.error("Error fetching topics:", error);
    return [];
  }
};

// Get a specific topic by ID with author data
export const getTopic = async (topicId: string): Promise<DiscussionTopic | null> => {
  try {
    const { data, error } = await supabase
      .from('discussion_topics')
      .select(`
        id, 
        title, 
        content, 
        election_id, 
        created_by,
        created_at,
        updated_at,
        is_pinned,
        is_locked,
        profiles:created_by (
          id, 
          first_name, 
          last_name,
          image_url
        )
      `)
      .eq('id', topicId)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching topic:", error);
      return null;
    }
    
    if (!data) {
      console.error("Topic not found:", topicId);
      return null;
    }
    
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      electionId: data.election_id,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isPinned: data.is_pinned || false,
      isLocked: data.is_locked || false,
      author: data.profiles ? {
        id: data.profiles.id,
        firstName: data.profiles.first_name,
        lastName: data.profiles.last_name,
        imageUrl: data.profiles.image_url
      } : null
    };
  } catch (error) {
    console.error("Error fetching topic:", error);
    return null;
  }
};

// Create a new discussion topic
export const createTopic = async (electionId: string, title: string, content: string): Promise<DiscussionTopic | null> => {
  try {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("User not authenticated");
      return null;
    }
    
    const { data, error } = await supabase
      .from('discussion_topics')
      .insert({
        election_id: electionId,
        title: title,
        content: content,
        created_by: user.id
      })
      .select(`
        id, 
        title, 
        content, 
        election_id, 
        created_by,
        created_at,
        updated_at,
        is_pinned,
        is_locked,
        profiles:created_by (
          id, 
          first_name, 
          last_name,
          image_url
        )
      `)
      .single();
    
    if (error) {
      console.error("Error creating topic:", error);
      return null;
    }
    
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      electionId: data.election_id,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isPinned: data.is_pinned || false,
      isLocked: data.is_locked || false,
      author: data.profiles ? {
        id: data.profiles.id,
        firstName: data.profiles.first_name,
        lastName: data.profiles.last_name,
        imageUrl: data.profiles.image_url
      } : null
    };
  } catch (error) {
    console.error("Error creating topic:", error);
    return null;
  }
};

// Update an existing topic
export const updateTopic = async (topicId: string, updates: Partial<DiscussionTopic>): Promise<DiscussionTopic | null> => {
  try {
    // Transform front-end model to database model
    const dbUpdates: Record<string, any> = {};
    
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.isPinned !== undefined) dbUpdates.is_pinned = updates.isPinned;
    if (updates.isLocked !== undefined) dbUpdates.is_locked = updates.isLocked;
    
    // Important: Use PATCH instead of UPDATE and properly format the request
    const { data, error } = await supabase
      .from('discussion_topics')
      .update(dbUpdates)
      .eq('id', topicId)
      .select(`
        id, 
        title, 
        content, 
        election_id, 
        created_by,
        created_at,
        updated_at, 
        is_pinned, 
        is_locked,
        profiles:created_by (
          id, 
          first_name, 
          last_name,
          image_url
        )
      `)
      .single();
    
    if (error) {
      console.error("Error updating topic:", error);
      return null;
    }
    
    // Transform from database model to front-end model
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      electionId: data.election_id,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isPinned: data.is_pinned || false,
      isLocked: data.is_locked || false,
      author: data.profiles ? {
        id: data.profiles.id,
        firstName: data.profiles.first_name,
        lastName: data.profiles.last_name,
        imageUrl: data.profiles.image_url
      } : null
    };
  } catch (error: any) {
    console.error("Error updating topic:", error);
    return null;
  }
};

// Delete a topic
export const deleteTopic = async (topicId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('discussion_topics')
      .delete()
      .eq('id', topicId);
    
    if (error) {
      console.error("Error deleting topic:", error);
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
        id,
        content,
        topic_id,
        created_by,
        created_at,
        updated_at,
        parent_id,
        profiles:created_by (
          id,
          first_name,
          last_name,
          image_url
        )
      `)
      .eq('topic_id', topicId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
    
    return data.map(comment => ({
      id: comment.id,
      content: comment.content,
      topicId: comment.topic_id,
      createdBy: comment.created_by,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      parentId: comment.parent_id,
      author: comment.profiles ? {
        id: comment.profiles.id,
        firstName: comment.profiles.first_name,
        lastName: comment.profiles.last_name,
        imageUrl: comment.profiles.image_url
      } : null
    }));
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
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("User not authenticated");
      return null;
    }
    
    const { data, error } = await supabase
      .from('discussion_comments')
      .insert({
        topic_id: topicId,
        content: content,
        created_by: user.id,
        parent_id: parentId
      })
      .select(`
        id,
        content,
        topic_id,
        created_by,
        created_at,
        updated_at,
        parent_id,
        profiles:created_by (
          id,
          first_name,
          last_name,
          image_url
        )
      `)
      .single();
    
    if (error) {
      console.error("Error creating comment:", error);
      return null;
    }
    
    return {
      id: data.id,
      content: data.content,
      topicId: data.topic_id,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      parentId: data.parent_id,
      author: data.profiles ? {
        id: data.profiles.id,
        firstName: data.profiles.first_name,
        lastName: data.profiles.last_name,
        imageUrl: data.profiles.image_url
      } : null
    };
  } catch (error) {
    console.error("Error creating comment:", error);
    return null;
  }
};

// Update an existing comment
export const updateComment = async (commentId: string, content: string): Promise<DiscussionComment | null> => {
  try {
    const { data, error } = await supabase
      .from('discussion_comments')
      .update({ content })
      .eq('id', commentId)
      .select(`
        id,
        content,
        topic_id,
        created_by,
        created_at,
        updated_at,
        parent_id,
        profiles:created_by (
          id,
          first_name,
          last_name,
          image_url
        )
      `)
      .single();
    
    if (error) {
      console.error("Error updating comment:", error);
      return null;
    }
    
    return {
      id: data.id,
      content: data.content,
      topicId: data.topic_id,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      parentId: data.parent_id,
      author: data.profiles ? {
        id: data.profiles.id,
        firstName: data.profiles.first_name,
        lastName: data.profiles.last_name,
        imageUrl: data.profiles.image_url
      } : null
    };
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
