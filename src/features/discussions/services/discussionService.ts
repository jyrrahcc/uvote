
import { supabase } from "@/integrations/supabase/client";
import { DiscussionTopic, DiscussionComment } from "@/types/discussions";
import { toast } from "@/hooks/use-toast"; 
import { extractAuthor } from "../utils/profileUtils";

export const fetchDiscussionTopics = async (electionId: string): Promise<DiscussionTopic[]> => {
  try {
    console.log("🔍 Fetching discussion topics for election:", electionId);
    
    if (!electionId) {
      console.error("📛 Invalid electionId provided:", electionId);
      return [];
    }
    
    // First, check if the election exists
    const { data: electionData, error: electionError } = await supabase
      .from('elections')
      .select('id')
      .eq('id', electionId)
      .single();
      
    if (electionError) {
      console.error("📛 Election not found:", electionError);
      console.log("Provided election ID was:", electionId);
      return [];
    }
    
    console.log("✅ Election found:", electionData);
    
    // First fetch the discussion topics
    const { data: topicsData, error: topicsError } = await supabase
      .from('discussion_topics')
      .select('*')
      .eq('election_id', electionId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
      
    if (topicsError) {
      console.error("📛 Error fetching discussion topics:", topicsError);
      console.log("Query parameters:", { electionId });
      throw topicsError;
    }
    
    // If no topics found, return empty array
    if (!topicsData || topicsData.length === 0) {
      console.log("ℹ️ No discussion topics found for election:", electionId);
      return [];
    }
    
    console.log(`✅ Raw topics data (${topicsData.length} records):`, topicsData);
    
    // Now for each topic, fetch the author information
    const topicsWithAuthors = await Promise.all(
      topicsData.map(async (topic) => {
        // Fetch the author information for each topic
        const { data: authorData, error: authorError } = await supabase
          .from('profiles')
          .select('first_name, last_name, image_url')
          .eq('id', topic.created_by)
          .single();
          
        if (authorError) {
          console.warn(`⚠️ Could not fetch author data for topic ${topic.id}:`, authorError);
          return {
            ...topic,
            author: null
          };
        }
        
        return {
          ...topic,
          author: authorData
        };
      })
    );
    
    console.log("✅ Topics with authors:", topicsWithAuthors);
    
    return topicsWithAuthors as DiscussionTopic[];
  } catch (error) {
    console.error("📛 Error fetching discussion topics:", error);
    return [];
  }
};

export const fetchDiscussionTopicById = async (topicId: string): Promise<DiscussionTopic | null> => {
  try {
    // Fetch the topic first
    const { data: topicData, error: topicError } = await supabase
      .from('discussion_topics')
      .select('*')
      .eq('id', topicId)
      .single();
      
    if (topicError) throw topicError;
    
    // Fetch author information separately
    const { data: authorData, error: authorError } = await supabase
      .from('profiles')
      .select('first_name, last_name, image_url')
      .eq('id', topicData.created_by)
      .single();
      
    if (authorError) {
      console.warn(`⚠️ Could not fetch author data for topic ${topicId}:`, authorError);
    }
    
    // Transform data to match our types
    const topic = {
      ...topicData,
      author: authorData || null
    } as DiscussionTopic;
    
    // Increment view count
    await supabase
      .from('discussion_topics')
      .update({ view_count: (topicData.view_count || 0) + 1 })
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
    console.log("🔍 Creating topic with:", { electionId, title, content });
    
    if (!electionId) {
      console.error("📛 Invalid electionId provided");
      toast({
        title: "Error",
        description: "Invalid election ID",
        variant: "destructive"
      });
      return null;
    }
    
    const { data: userData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("📛 Session error:", sessionError);
      throw sessionError;
    }
    if (!userData.session) {
      console.error("📛 No user session found");
      throw new Error("User not authenticated");
    }
    
    const userId = userData.session.user.id;
    console.log("✅ User authenticated:", userId);
    
    // First, check if the election exists
    const { data: electionData, error: electionError } = await supabase
      .from('elections')
      .select('id')
      .eq('id', electionId)
      .single();
      
    if (electionError) {
      console.error("📛 Election not found:", electionError);
      throw new Error(`Invalid election: ${electionError.message}`);
    }
    
    console.log("✅ Election validated:", electionData);
    
    // Log insertion attempt
    console.log("🔄 Attempting to insert discussion topic:", {
      election_id: electionId,
      created_by: userId,
      title,
      content
    });
    
    // Create the discussion topic
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
      console.error("📛 Database error creating topic:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.error("📛 No data returned after insertion");
      throw new Error("Topic created but no data returned");
    }
    
    const createdTopic = data[0];
    console.log("✅ Topic created successfully:", createdTopic);
    
    toast({
      title: "Success",
      description: "Discussion topic created successfully"
    });
    
    // Get the author information to return a complete topic object
    const { data: authorData, error: authorError } = await supabase
      .from('profiles')
      .select('first_name, last_name, image_url')
      .eq('id', userId)
      .single();
    
    if (authorError) {
      console.warn("⚠️ Could not fetch author data:", authorError);
    } else {
      console.log("✅ Author data fetched:", authorData);
    }
      
    const topicWithAuthor = {
      ...createdTopic,
      author: authorData || null
    } as DiscussionTopic;
    
    return topicWithAuthor;
  } catch (error: any) {
    console.error("📛 Error creating discussion topic:", error);
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
    // First, fetch all comments for the topic
    const { data: commentsData, error: commentsError } = await supabase
      .from('discussion_comments')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });
      
    if (commentsError) throw commentsError;
    
    if (!commentsData || commentsData.length === 0) {
      return [];
    }
    
    // Now fetch author information for each comment
    const commentsWithAuthors = await Promise.all(
      commentsData.map(async (comment) => {
        const { data: authorData, error: authorError } = await supabase
          .from('profiles')
          .select('first_name, last_name, image_url')
          .eq('id', comment.user_id)
          .single();
          
        if (authorError) {
          console.warn(`⚠️ Could not fetch author data for comment ${comment.id}:`, authorError);
          return {
            ...comment,
            author: null,
            replies: []
          };
        }
        
        return {
          ...comment,
          author: authorData,
          replies: []
        };
      })
    );
    
    // Organize comments into a hierarchical structure
    const commentMap = new Map<string, DiscussionComment>();
    const rootComments: DiscussionComment[] = [];
    
    // First pass: Create a map of all comments
    commentsWithAuthors.forEach(comment => {
      commentMap.set(comment.id, comment);
    });
    
    // Second pass: Build the hierarchy
    commentsWithAuthors.forEach(comment => {
      if (comment.parent_id) {
        // This is a reply, add it to parent's replies array
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies?.push(comment);
        } else {
          // If parent is not found, treat it as a root comment
          rootComments.push(comment);
        }
      } else {
        // This is a root comment
        rootComments.push(comment);
      }
    });
    
    return rootComments;
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
    console.log("🔍 Creating comment:", { topicId, content, parentId });
    
    const { data: userData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("📛 Session error:", sessionError);
      throw sessionError;
    }
    if (!userData.session) {
      console.error("📛 No user session found");
      throw new Error("User not authenticated");
    }
    
    const userId = userData.session.user.id;
    console.log("✅ User authenticated:", userId);
    
    // Check if topic exists
    const { data: topicData, error: topicError } = await supabase
      .from('discussion_topics')
      .select('id')
      .eq('id', topicId)
      .single();
      
    if (topicError) {
      console.error("📛 Topic not found:", topicError);
      throw new Error(`Invalid topic: ${topicError.message}`);
    }
    
    console.log("✅ Topic validated:", topicData);
    
    // Log comment creation attempt
    console.log("🔄 Attempting to insert comment:", {
      topic_id: topicId,
      user_id: userId,
      content,
      parent_id: parentId || null
    });
    
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
      console.error("📛 Database error creating comment:", error);
      throw error;
    }
    
    console.log("✅ Comment created successfully:", data);
    
    toast({
      title: "Success",
      description: "Comment posted successfully"
    });
    
    // Get the author information
    const { data: authorData, error: authorError } = await supabase
      .from('profiles')
      .select('first_name, last_name, image_url')
      .eq('id', userId)
      .single();
    
    if (authorError) {
      console.warn("⚠️ Could not fetch author data:", authorError);
    } else {
      console.log("✅ Author data fetched:", authorData);
    }
    
    const commentWithAuthor = {
      ...data,
      author: authorData || null
    } as DiscussionComment;
    
    return commentWithAuthor;
  } catch (error: any) {
    console.error("📛 Error posting comment:", error);
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
