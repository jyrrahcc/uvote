import { supabase } from "@/integrations/supabase/client";
import { DiscussionTopic, DiscussionComment } from "@/types/discussions";
import { toast } from "@/hooks/use-toast";
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
    if (sessionError) {
      console.error("Session error:", sessionError);
      throw sessionError;
    }
    if (!userData.session) {
      console.error("No user session found");
      throw new Error("User not authenticated");
    }
    
    const userId = userData.session.user.id;
    
    console.log("Creating topic with:", { electionId, userId, title, content });
    
    // First, check if the election exists
    const { data: electionData, error: electionError } = await supabase
      .from('elections')
      .select('id')
      .eq('id', electionId)
      .single();
      
    if (electionError) {
      console.error("Election not found:", electionError);
      throw new Error(`Invalid election: ${electionError.message}`);
    }
    
    // Create the discussion topic without using .single() initially
    const { data, error } = await supabase
      .from('discussion_topics')
      .insert({
        election_id: electionId,
        created_by: userId,
        title,
        content
      })
      .select();
      
    if (error) {
      console.error("Database error creating topic:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.error("No data returned after insertion");
      throw new Error("Topic created but no data returned");
    }
    
    const createdTopic = data[0];
    console.log("Topic created successfully:", createdTopic);
    
    toast({
      title: "Success",
      description: "Discussion topic created successfully"
    });
    
    // Get the author information to return a complete topic object
    const { data: authorData } = await supabase
      .from('profiles')
      .select('first_name, last_name, image_url')
      .eq('id', userId)
      .single();
      
    const topicWithAuthor = {
      ...createdTopic,
      author: authorData || null
    } as DiscussionTopic;
    
    return topicWithAuthor;
  } catch (error: any) {
    console.error("Error creating discussion topic:", error);
    toast({
      title: "Error",
      description: `Failed to create topic: ${error.message}`,
      variant: "destructive"
    });
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
    
    toast({
      title: "Success",
      description: "Discussion topic updated successfully"
    });
    return data as DiscussionTopic;
  } catch (error: any) {
    console.error("Error updating discussion topic:", error);
    toast({
      title: "Error",
      description: `Failed to update topic: ${error.message}`,
      variant: "destructive"
    });
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
    
    toast({
      title: "Success",
      description: "Discussion topic deleted successfully"
    });
    return true;
  } catch (error: any) {
    console.error("Error deleting discussion topic:", error);
    toast({
      title: "Error",
      description: `Failed to delete topic: ${error.message}`,
      variant: "destructive"
    });
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
    
    console.log("Creating comment:", { topicId, content, parentId });
    
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
      
    if (error) {
      console.error("Database error creating comment:", error);
      throw error;
    }
    
    console.log("Comment created successfully:", data);
    
    toast({
      title: "Success",
      description: "Comment posted successfully"
    });
    return data as DiscussionComment;
  } catch (error: any) {
    console.error("Error posting comment:", error);
    toast({
      title: "Error",
      description: `Failed to post comment: ${error.message}`,
      variant: "destructive"
    });
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
    
    toast({
      title: "Success",
      description: "Comment updated successfully"
    });
    return data as DiscussionComment;
  } catch (error: any) {
    console.error("Error updating comment:", error);
    toast({
      title: "Error",
      description: `Failed to update comment: ${error.message}`,
      variant: "destructive"
    });
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
    
    toast({
      title: "Success",
      description: "Comment deleted successfully"
    });
    return true;
  } catch (error: any) {
    console.error("Error deleting comment:", error);
    toast({
      title: "Error",
      description: `Failed to delete comment: ${error.message}`,
      variant: "destructive"
    });
    return false;
  }
};
