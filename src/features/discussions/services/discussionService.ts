
import { supabase } from "@/integrations/supabase/client";
import { DiscussionTopic, DiscussionComment } from "@/types/discussions";
import { toast } from "sonner";
import { extractAuthor } from "../utils/profileUtils";

export const fetchDiscussionTopics = async (electionId: string): Promise<DiscussionTopic[]> => {
  try {
    const { data, error } = await supabase
      .from('discussion_topics')
      .select(`
        *,
        profiles:created_by(first_name, last_name, image_url)
      `)
      .eq('election_id', electionId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Transform data to match our types
    return (data || []).map(topic => {
      // Safely access profile data
      const profileData = topic.profiles;
      
      return {
        ...topic,
        author: extractAuthor(profileData)
      };
    }) as DiscussionTopic[];
  } catch (error) {
    console.error("Error fetching discussion topics:", error);
    return [];
  }
};

export const fetchDiscussionTopicById = async (topicId: string): Promise<DiscussionTopic | null> => {
  try {
    const { data, error } = await supabase
      .from('discussion_topics')
      .select(`
        *,
        profiles:created_by(first_name, last_name, image_url)
      `)
      .eq('id', topicId)
      .single();
      
    if (error) throw error;
    
    // Safely access profile data
    const profileData = data.profiles;
    
    // Transform data to match our types
    const topic = {
      ...data,
      author: extractAuthor(profileData)
    } as DiscussionTopic;
    
    // Increment view count
    await supabase
      .from('discussion_topics')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', topicId);
    
    return topic;
  } catch (error) {
    console.error("Error fetching discussion topic:", error);
    return null;
  }
};

export const createDiscussionTopic = async (
  electionId: string, 
  title: string, 
  content: string | null
): Promise<DiscussionTopic | null> => {
  try {
    const { data: userData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!userData.session) throw new Error("User not authenticated");
    
    const userId = userData.session.user.id;
    
    console.log("Creating topic with:", { electionId, userId, title, content });
    
    const { data, error } = await supabase
      .from('discussion_topics')
      .insert({
        election_id: electionId,
        created_by: userId,
        title,
        content
      })
      .select()
      .single();
      
    if (error) {
      console.error("Database error:", error);
      throw error;
    }
    
    console.log("Topic created successfully:", data);
    toast.success("Discussion topic created successfully");
    return data as DiscussionTopic;
  } catch (error: any) {
    console.error("Error creating discussion topic:", error);
    toast.error(`Failed to create topic: ${error.message}`);
    return null;
  }
};

export const updateDiscussionTopic = async (
  topicId: string, 
  updates: Partial<DiscussionTopic>
): Promise<DiscussionTopic | null> => {
  try {
    const { data, error } = await supabase
      .from('discussion_topics')
      .update(updates)
      .eq('id', topicId)
      .select()
      .single();
      
    if (error) throw error;
    
    toast.success("Discussion topic updated successfully");
    return data as DiscussionTopic;
  } catch (error: any) {
    console.error("Error updating discussion topic:", error);
    toast.error(`Failed to update topic: ${error.message}`);
    return null;
  }
};

export const deleteDiscussionTopic = async (topicId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('discussion_topics')
      .delete()
      .eq('id', topicId);
      
    if (error) throw error;
    
    toast.success("Discussion topic deleted successfully");
    return true;
  } catch (error: any) {
    console.error("Error deleting discussion topic:", error);
    toast.error(`Failed to delete topic: ${error.message}`);
    return false;
  }
};

export const fetchComments = async (topicId: string): Promise<DiscussionComment[]> => {
  try {
    const { data, error } = await supabase
      .from('discussion_comments')
      .select(`
        *,
        profiles:user_id(first_name, last_name, image_url)
      `)
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    
    // Transform data to match our types
    return (data || []).map(comment => {
      // Safely access profile data
      const profileData = comment.profiles;
      
      return {
        ...comment,
        author: extractAuthor(profileData)
      };
    }) as DiscussionComment[];
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

export const createComment = async (
  topicId: string, 
  content: string,
  parentId?: string | null
): Promise<DiscussionComment | null> => {
  try {
    const { data: userData } = await supabase.auth.getSession();
    if (!userData.session) throw new Error("User not authenticated");
    
    const userId = userData.session.user.id;
    
    const { data, error } = await supabase
      .from('discussion_comments')
      .insert({
        topic_id: topicId,
        user_id: userId,
        content,
        parent_id: parentId || null
      })
      .select()
      .single();
      
    if (error) throw error;
    
    toast.success("Comment posted successfully");
    return data as DiscussionComment;
  } catch (error: any) {
    console.error("Error posting comment:", error);
    toast.error(`Failed to post comment: ${error.message}`);
    return null;
  }
};

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
      .single();
      
    if (error) throw error;
    
    toast.success("Comment updated successfully");
    return data as DiscussionComment;
  } catch (error: any) {
    console.error("Error updating comment:", error);
    toast.error(`Failed to update comment: ${error.message}`);
    return null;
  }
};

export const deleteComment = async (commentId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('discussion_comments')
      .delete()
      .eq('id', commentId);
      
    if (error) throw error;
    
    toast.success("Comment deleted successfully");
    return true;
  } catch (error: any) {
    console.error("Error deleting comment:", error);
    toast.error(`Failed to delete comment: ${error.message}`);
    return false;
  }
};
