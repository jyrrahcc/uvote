
import { supabase } from "@/integrations/supabase/client";
import { Discussion, DiscussionComment } from "@/types/discussions";
import { isGlobalDiscussion } from "./globalDiscussionService";

/**
 * Helper function to get discussion topics with comment counts
 */
export const getTopicsWithCommentCounts = async (electionId: string): Promise<Discussion[]> => {
  try {
    let query;
    
    if (isGlobalDiscussion(electionId)) {
      // For global discussions (null election_id)
      const { data, error } = await supabase
        .from('discussion_topics')
        .select(`
          *,
          comments:discussion_comments(count)
        `)
        .is('election_id', null)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Process the data to match expected format
      return (data || []).map(topic => ({
        ...topic,
        repliesCount: topic.comments[0]?.count || 0
      }));
    } else {
      // For election-specific discussions
      const { data, error } = await supabase.rpc('get_topics_with_comment_counts', {
        election_id_param: electionId
      });
      
      if (error) throw error;
      return data || [];
    }
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
    
    if (commentsError) throw commentsError;
    
    // Then fetch the profiles separately
    const userIds = comments.map(comment => comment.user_id);
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, image_url')
      .in('id', userIds);
    
    if (profilesError) throw profilesError;
    
    // Map profiles to comments
    const profilesById = (profiles || []).reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {} as Record<string, any>);
    
    // Merge comment and profile data
    const commentsWithProfiles = (comments || []).map(comment => {
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
