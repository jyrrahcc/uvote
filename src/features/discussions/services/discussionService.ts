
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Discussion, Comment } from "@/types/discussions";

// Fetch all discussion topics for a specific election
export const fetchDiscussionTopics = async (electionId: string): Promise<Discussion[]> => {
  try {
    // First fetch the topics
    const { data: topicsData, error: topicsError } = await supabase
      .from('discussion_topics')
      .select('*')
      .eq('election_id', electionId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (topicsError) throw topicsError;

    // Then fetch all the related user profiles
    const userIds = topicsData.map(topic => topic.created_by);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, image_url')
      .in('id', userIds);

    if (profilesError) throw profilesError;

    // Create a map of profiles by user ID for easier lookup
    const profileMap = new Map();
    profilesData.forEach(profile => {
      profileMap.set(profile.id, profile);
    });

    // Combine the topics with their author profiles and map DB fields to TS interface fields
    return topicsData.map(topic => {
      const authorProfile = profileMap.get(topic.created_by);
      
      // Create the Discussion object with the DB fields
      const discussion: Discussion = {
        id: topic.id,
        title: topic.title,
        content: topic.content,
        created_at: topic.created_at,
        created_by: topic.created_by,
        updated_at: topic.updated_at,
        election_id: topic.election_id,
        is_pinned: topic.is_pinned,
        is_locked: topic.is_locked,
        view_count: topic.view_count,
        author: authorProfile ? {
          id: authorProfile.id,
          firstName: authorProfile.first_name,
          lastName: authorProfile.last_name,
          imageUrl: authorProfile.image_url
        } : undefined
      };
      
      return discussion;
    });
  } catch (error) {
    console.error("Error fetching discussion topics:", error);
    throw error;
  }
};

// Fetch a specific discussion topic by ID
export const fetchDiscussionTopicById = async (topicId: string): Promise<Discussion> => {
  try {
    // First fetch the topic
    const { data: topic, error: topicError } = await supabase
      .from('discussion_topics')
      .select('*')
      .eq('id', topicId)
      .single();

    if (topicError) throw topicError;

    // Then fetch the author profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, image_url')
      .eq('id', topic.created_by)
      .single();

    if (profileError) throw profileError;

    // Increment view count
    await supabase
      .from('discussion_topics')
      .update({ view_count: (topic.view_count || 0) + 1 })
      .eq('id', topicId);

    // Return the topic with author information, mapped to the TS interface
    return {
      id: topic.id,
      title: topic.title,
      content: topic.content,
      created_at: topic.created_at,
      created_by: topic.created_by,
      updated_at: topic.updated_at,
      election_id: topic.election_id,
      is_pinned: topic.is_pinned,
      is_locked: topic.is_locked,
      view_count: topic.view_count,
      author: {
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        imageUrl: profile.image_url
      }
    };
  } catch (error) {
    console.error("Error fetching discussion topic:", error);
    throw error;
  }
};

// Create a new discussion topic
export const createDiscussionTopic = async (topicData: Partial<Discussion>): Promise<Discussion> => {
  try {
    const { data, error } = await supabase
      .from('discussion_topics')
      .insert({
        title: topicData.title || '',
        content: topicData.content || '',
        election_id: topicData.election_id || '',
        created_by: topicData.created_by || ''
      })
      .select()
      .single();

    if (error) throw error;

    // Fetch the author profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, image_url')
      .eq('id', data.created_by)
      .single();

    if (profileError) throw profileError;

    // Return the topic with author information, mapped to the TS interface
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      created_at: data.created_at,
      created_by: data.created_by,
      updated_at: data.updated_at,
      election_id: data.election_id,
      is_pinned: data.is_pinned,
      is_locked: data.is_locked,
      view_count: data.view_count,
      author: {
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        imageUrl: profile.image_url
      }
    };
  } catch (error) {
    console.error("Error creating discussion topic:", error);
    throw error;
  }
};

// Update a discussion topic
export const updateDiscussionTopic = async (
  topicId: string,
  updates: Partial<Discussion>
): Promise<Discussion> => {
  try {
    // Create an updates object with only the fields we want to update, mapped to DB field names
    const updateFields: Record<string, any> = {};
    
    if (updates.title !== undefined) updateFields.title = updates.title;
    if (updates.content !== undefined) updateFields.content = updates.content;
    if (updates.is_pinned !== undefined) updateFields.is_pinned = updates.is_pinned;
    if (updates.is_locked !== undefined) updateFields.is_locked = updates.is_locked;
    
    // Add updated_at timestamp
    updateFields.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('discussion_topics')
      .update(updateFields)
      .eq('id', topicId)
      .select()
      .single();

    if (error) throw error;

    // Fetch the author profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, image_url')
      .eq('id', data.created_by)
      .single();

    if (profileError) throw profileError;

    // Return the topic with author information, mapped to the TS interface
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      created_at: data.created_at,
      created_by: data.created_by,
      updated_at: data.updated_at,
      election_id: data.election_id,
      is_pinned: data.is_pinned,
      is_locked: data.is_locked,
      view_count: data.view_count,
      author: {
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        imageUrl: profile.image_url
      }
    };
  } catch (error) {
    console.error("Error updating discussion topic:", error);
    throw error;
  }
};

// Delete a discussion topic
export const deleteDiscussionTopic = async (topicId: string): Promise<boolean> => {
  try {
    // First delete all comments associated with the topic
    const { error: commentsError } = await supabase
      .from('discussion_comments')
      .delete()
      .eq('topic_id', topicId);

    if (commentsError) throw commentsError;

    // Then delete the topic itself
    const { error: topicError } = await supabase
      .from('discussion_topics')
      .delete()
      .eq('id', topicId);

    if (topicError) throw topicError;

    return true;
  } catch (error) {
    console.error("Error deleting discussion topic:", error);
    throw error;
  }
};

// Fetch comments for a specific topic
export const fetchCommentsForTopic = async (topicId: string): Promise<Comment[]> => {
  try {
    // First fetch all comments for this topic
    const { data: commentsData, error: commentsError } = await supabase
      .from('discussion_comments')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });

    if (commentsError) throw commentsError;

    // Then fetch all related user profiles
    const userIds = commentsData.map(comment => comment.user_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, image_url')
      .in('id', userIds);

    if (profilesError) throw profilesError;

    // Create a map of profiles by user ID for easier lookup
    const profileMap = new Map();
    profilesData.forEach(profile => {
      profileMap.set(profile.id, profile);
    });

    // Combine the comments with their author profiles and map DB fields to TS interface fields
    return commentsData.map(comment => {
      const author = profileMap.get(comment.user_id);
      return {
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        user_id: comment.user_id,
        topic_id: comment.topic_id,
        parent_id: comment.parent_id || undefined,
        author: author ? {
          id: author.id,
          firstName: author.first_name,
          lastName: author.last_name,
          imageUrl: author.image_url
        } : undefined
      };
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

// Add a new comment to a topic
export const addCommentToTopic = async (
  topicId: string,
  userId: string,
  content: string,
  parentId?: string
): Promise<Comment> => {
  try {
    const { data, error } = await supabase
      .from('discussion_comments')
      .insert({
        topic_id: topicId,
        user_id: userId,
        content: content,
        parent_id: parentId || null
      })
      .select()
      .single();

    if (error) throw error;

    // Fetch the author profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, image_url')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Return the comment with author information, mapped to the TS interface
    return {
      id: data.id,
      content: data.content,
      created_at: data.created_at,
      updated_at: data.updated_at,
      user_id: data.user_id,
      topic_id: data.topic_id,
      parent_id: data.parent_id || undefined,
      author: {
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        imageUrl: profile.image_url
      }
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (commentId: string): Promise<boolean> => {
  try {
    // Delete all child comments first
    const { error: childError } = await supabase
      .from('discussion_comments')
      .delete()
      .eq('parent_id', commentId);

    if (childError) throw childError;

    // Then delete the comment itself
    const { error } = await supabase
      .from('discussion_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};

// Create aliases for existing functions to maintain compatibility with useDiscussions.ts
export const getTopics = fetchDiscussionTopics;
export const getTopic = fetchDiscussionTopicById;

export const createTopic = async (electionId: string, title: string, content: string): Promise<Discussion> => {
  // Get the current user ID
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    throw new Error("User not authenticated");
  }
  
  // Now call createDiscussionTopic with the user ID
  return createDiscussionTopic({
    election_id: electionId,
    title,
    content,
    created_by: data.user.id
  });
};

export const updateTopic = updateDiscussionTopic;
export const deleteTopic = deleteDiscussionTopic;
export const getComments = fetchCommentsForTopic;

export const createComment = async (topicId: string, content: string, parentId?: string | null): Promise<Comment> => {
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    throw new Error("User not authenticated");
  }
  return addCommentToTopic(topicId, data.user.id, content, parentId || undefined);
};

export const updateComment = async (commentId: string, content: string): Promise<Comment> => {
  try {
    const { data, error } = await supabase
      .from('discussion_comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;

    // Fetch the author profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, image_url')
      .eq('id', data.user_id)
      .single();

    if (profileError) throw profileError;

    // Return the comment with author information, mapped to the TS interface
    return {
      id: data.id,
      content: data.content,
      created_at: data.created_at,
      updated_at: data.updated_at,
      user_id: data.user_id,
      topic_id: data.topic_id,
      parent_id: data.parent_id || undefined,
      author: {
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        imageUrl: profile.image_url
      }
    };
  } catch (error) {
    console.error("Error updating comment:", error);
    throw error;
  }
};
