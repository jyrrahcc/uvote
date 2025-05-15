
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DiscussionTopic, DiscussionComment } from "@/types";

// Fetch all discussion topics for a specific election
export const fetchDiscussionTopics = async (electionId: string): Promise<DiscussionTopic[]> => {
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

    // Combine the topics with their author profiles
    const processedTopics = topicsData.map(topic => {
      const authorProfile = profileMap.get(topic.created_by);
      return {
        ...topic,
        author: authorProfile ? {
          id: authorProfile.id,
          firstName: authorProfile.first_name,
          lastName: authorProfile.last_name,
          imageUrl: authorProfile.image_url
        } : null
      };
    });

    return processedTopics;
  } catch (error) {
    console.error("Error fetching discussion topics:", error);
    throw error;
  }
};

// Fetch a specific discussion topic by ID
export const fetchDiscussionTopicById = async (topicId: string): Promise<DiscussionTopic> => {
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

    // Return the topic with author information
    return {
      ...topic,
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
export const createDiscussionTopic = async (topicData: Partial<DiscussionTopic>): Promise<DiscussionTopic> => {
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

    return {
      ...data,
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
  updates: Partial<DiscussionTopic>
): Promise<DiscussionTopic> => {
  try {
    // Create an updates object with only the fields we want to update
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

    return {
      ...data,
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
export const fetchCommentsForTopic = async (topicId: string): Promise<DiscussionComment[]> => {
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

    // Combine the comments with their author profiles
    const processedComments = commentsData.map(comment => {
      const author = profileMap.get(comment.user_id);
      return {
        id: comment.id,
        content: comment.content,
        topicId: comment.topic_id,
        userId: comment.user_id,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        parentId: comment.parent_id || null,
        author: author ? {
          id: author.id,
          firstName: author.first_name,
          lastName: author.last_name,
          imageUrl: author.image_url
        } : null
      };
    });

    return processedComments;
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
): Promise<DiscussionComment> => {
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

    return {
      id: data.id,
      content: data.content,
      topicId: data.topic_id,
      userId: data.user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      parentId: data.parent_id || null,
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
