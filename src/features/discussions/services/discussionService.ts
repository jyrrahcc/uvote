
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
    author: topicData.author_profile ? {
      id: topicData.author_profile.id,
      firstName: topicData.author_profile.first_name,
      lastName: topicData.author_profile.last_name,
      imageUrl: topicData.author_profile.image_url
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
    author: commentData.author_profile ? {
      id: commentData.author_profile.id,
      firstName: commentData.author_profile.first_name,
      lastName: commentData.author_profile.last_name,
      imageUrl: commentData.author_profile.image_url
    } : null,
    replies: []  // Will be populated if needed
  };
};

// Get all topics for an election
export const getTopics = async (electionId: string): Promise<DiscussionTopic[]> => {
  try {
    // First, fetch the topics with basic information
    const { data: topicsData, error: topicsError } = await supabase
      .from('discussion_topics')
      .select(`
        *,
        replies_count:discussion_comments(count)
      `)
      .eq('election_id', electionId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (topicsError) {
      console.error("Error fetching topics:", topicsError);
      return [];
    }

    // Extract creator IDs to fetch their profiles
    const creatorIds = topicsData.map(topic => topic.created_by);
    
    // Fetch author profiles separately
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', creatorIds);
    
    if (profilesError) {
      console.error("Error fetching author profiles:", profilesError);
      // Continue with the data we have, even without profiles
    }
    
    // Create a map of user IDs to profiles
    const profilesMap: Record<string, any> = {};
    if (profilesData) {
      profilesData.forEach(profile => {
        profilesMap[profile.id] = profile;
      });
    }
    
    // Process topics and add author information
    const processedTopics = topicsData.map((topic: any) => {
      // Add replies_count to each topic
      const topicWithRepliesCount = {
        ...topic,
        replies_count: topic.replies_count[0]?.count || 0,
        author_profile: profilesMap[topic.created_by] || null
      };
      
      return transformTopic(topicWithRepliesCount);
    });

    return processedTopics;
  } catch (error) {
    console.error("Error fetching topics:", error);
    return [];
  }
};

// Get a single topic by ID
export const getTopic = async (topicId: string): Promise<DiscussionTopic | null> => {
  try {
    // First, fetch the topic
    const { data: topicData, error: topicError } = await supabase
      .from('discussion_topics')
      .select(`
        *,
        replies_count:discussion_comments(count)
      `)
      .eq('id', topicId)
      .maybeSingle();

    if (topicError || !topicData) {
      console.error("Error fetching topic:", topicError);
      return null;
    }

    // Then fetch the author profile separately
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', topicData.created_by)
      .maybeSingle();
    
    if (profileError) {
      console.error("Error fetching topic author:", profileError);
      // Continue with the data we have, even without profile
    }
    
    const topicWithRepliesCount = {
      ...topicData,
      replies_count: topicData.replies_count[0]?.count || 0,
      author_profile: profileData || null
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

    // First insert the topic
    const topicData = {
      title,
      content,
      election_id: electionId,
      created_by: userData.user.id
    };

    console.log("Creating new topic:", topicData);

    const { data, error } = await supabase
      .from('discussion_topics')
      .insert([topicData])
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error creating topic:", error);
      return null;
    }
    
    if (!data) {
      return null;
    }

    // Then fetch author profile separately
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .maybeSingle();
    
    if (profileError) {
      console.error("Error fetching topic author:", profileError);
    }
    
    const topicWithAuthor = {
      ...data,
      author_profile: profileData || null
    };
    
    return transformTopic(topicWithAuthor);
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
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error updating topic:", error);
      return null;
    }
    
    if (!data) {
      return null;
    }

    // Then fetch author profile separately
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.created_by)
      .maybeSingle();
    
    if (profileError) {
      console.error("Error fetching topic author:", profileError);
    }
    
    const topicWithAuthor = {
      ...data,
      author_profile: profileData || null
    };
    
    return transformTopic(topicWithAuthor);
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
    // First, fetch the comments
    const { data: commentsData, error: commentsError } = await supabase
      .from('discussion_comments')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.error("Error fetching comments:", commentsError);
      return [];
    }

    // Extract user IDs to fetch their profiles
    const userIds = commentsData.map(comment => comment.user_id);
    
    // Fetch author profiles separately
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
    
    if (profilesError) {
      console.error("Error fetching comment authors:", profilesError);
      // Continue with the data we have, even without profiles
    }
    
    // Create a map of user IDs to profiles
    const profilesMap: Record<string, any> = {};
    if (profilesData) {
      profilesData.forEach(profile => {
        profilesMap[profile.id] = profile;
      });
    }
    
    // Process comments and add author information
    const processedComments = commentsData.map((comment: any) => {
      return {
        ...comment,
        author_profile: profilesMap[comment.user_id] || null
      };
    });

    return processedComments.map(transformComment);
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
      user_id: userData.user.id,
      parent_id: parentId || null
    };

    const { data, error } = await supabase
      .from('discussion_comments')
      .insert(commentData)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error creating comment:", error);
      return null;
    }
    
    if (!data) {
      return null;
    }

    // Then fetch author profile separately
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .maybeSingle();
    
    if (profileError) {
      console.error("Error fetching comment author:", profileError);
    }
    
    const commentWithAuthor = {
      ...data,
      author_profile: profileData || null
    };
    
    return transformComment(commentWithAuthor);
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
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error updating comment:", error);
      return null;
    }
    
    if (!data) {
      return null;
    }

    // Then fetch author profile separately
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user_id)
      .maybeSingle();
    
    if (profileError) {
      console.error("Error fetching comment author:", profileError);
    }
    
    const commentWithAuthor = {
      ...data,
      author_profile: profileData || null
    };
    
    return transformComment(commentWithAuthor);
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
