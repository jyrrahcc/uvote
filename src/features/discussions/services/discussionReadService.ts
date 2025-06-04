
import { supabase } from "@/integrations/supabase/client";
import { Discussion, DiscussionComment } from "@/types/discussions";
import { isGlobalDiscussion } from "./globalDiscussionService";

/**
 * Helper function to get discussion topics with comment counts and author information
 */
export const getTopicsWithCommentCounts = async (electionId: string): Promise<Discussion[]> => {
  try {
    const condition = isGlobalDiscussion(electionId) ? null : electionId;
    
    // Fetch topics with comment counts
    const { data: topics, error: topicsError } = await supabase
      .from('discussion_topics')
      .select(`
        *,
        comments:discussion_comments(count)
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
    
    // Process the data to match expected format
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
    console.error("Error getting topics with comment counts:", error);
    throw error;
  }
};

/**
 * Get comments for a discussion topic
 */
export const getCommentsForTopic = async (topicId: string): Promise<DiscussionComment[]> => {
  try {
    // First fetch the comment data
    const { data: comments, error: commentsError } = await supabase
      .from('discussion_comments')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });
    
    if (commentsError) {
      console.error("Error fetching comments:", commentsError);
      throw commentsError;
    }
    
    if (!comments || comments.length === 0) {
      return [];
    }
    
    // Then fetch the profiles separately
    const userIds = comments.map(comment => comment.user_id).filter(Boolean);
    
    if (userIds.length === 0) {
      return comments.map(comment => ({
        ...comment,
        author: undefined
      }));
    }
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, image_url')
      .in('id', userIds);
    
    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      // Continue without author information rather than throwing
    }
    
    // Map profiles to comments
    const profilesById = (profiles || []).reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {} as Record<string, any>);
    
    // Merge comment and profile data
    const commentsWithProfiles = comments.map(comment => {
      const profile = profilesById[comment.user_id];
      
      return {
        ...comment,
        author: profile ? {
          id: comment.user_id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          imageUrl: profile.image_url
        } : undefined
      };
    });
    
    return commentsWithProfiles;
  } catch (error) {
    console.error("Error getting comments for topic:", error);
    throw error;
  }
};
