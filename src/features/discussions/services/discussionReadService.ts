
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
    const { data, error } = await supabase
      .from('discussion_comments')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          image_url
        )
      `)
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    return (data || []).map(comment => ({
      ...comment,
      author: comment.profiles ? {
        id: comment.user_id,
        firstName: comment.profiles.first_name,
        lastName: comment.profiles.last_name,
        imageUrl: comment.profiles.image_url
      } : undefined
    }));
  } catch (error) {
    console.error("Error getting comments for topic:", error);
    throw error;
  }
};
