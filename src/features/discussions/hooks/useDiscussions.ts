
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { DiscussionTopic, DiscussionComment } from '@/types/discussions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Define service functions here
const fetchDiscussionTopics = async (electionId: string): Promise<DiscussionTopic[]> => {
  try {
    const { data, error } = await supabase
      .from('discussion_topics')
      .select(`
        *,
        author:profiles (
          id,
          first_name,
          last_name,
          image_url
        )
      `)
      .eq('election_id', electionId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match our camelCase interface
    return data.map(topic => ({
      id: topic.id,
      title: topic.title,
      content: topic.content || '',
      electionId: topic.election_id,
      createdBy: topic.created_by,
      createdAt: topic.created_at,
      updatedAt: topic.updated_at,
      isPinned: topic.is_pinned,
      isLocked: topic.is_locked,
      author: topic.author ? {
        id: topic.author.id,
        firstName: topic.author.first_name,
        lastName: topic.author.last_name,
        imageUrl: topic.author.image_url
      } : null,
      repliesCount: 0, // Will be set by another query
      lastReplyAt: topic.updated_at
    }));
  } catch (error) {
    console.error("Error fetching discussion topics:", error);
    return [];
  }
};

const fetchDiscussionTopicById = async (topicId: string): Promise<DiscussionTopic | null> => {
  try {
    const { data, error } = await supabase
      .from('discussion_topics')
      .select(`
        *,
        author:profiles (
          id,
          first_name,
          last_name,
          image_url
        )
      `)
      .eq('id', topicId)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      content: data.content || '',
      electionId: data.election_id,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isPinned: data.is_pinned,
      isLocked: data.is_locked,
      author: data.author ? {
        id: data.author.id,
        firstName: data.author.first_name,
        lastName: data.author.last_name,
        imageUrl: data.author.image_url
      } : null,
      repliesCount: 0,
      lastReplyAt: data.updated_at
    };
  } catch (error) {
    console.error("Error fetching discussion topic:", error);
    return null;
  }
};

const createDiscussionTopic = async (electionId: string, title: string, content: string | null): Promise<DiscussionTopic | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('discussion_topics')
      .insert([{
        title,
        content,
        election_id: electionId,
        created_by: userData.user.id
      }])
      .select(`
        *,
        author:profiles (
          id,
          first_name,
          last_name,
          image_url
        )
      `)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      content: data.content || '',
      electionId: data.election_id,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isPinned: data.is_pinned,
      isLocked: data.is_locked,
      author: data.author ? {
        id: data.author.id,
        firstName: data.author.first_name,
        lastName: data.author.last_name,
        imageUrl: data.author.image_url
      } : null,
      repliesCount: 0,
      lastReplyAt: data.updated_at
    };
  } catch (error) {
    console.error("Error creating discussion topic:", error);
    return null;
  }
};

const updateDiscussionTopic = async (topicId: string, updates: Partial<DiscussionTopic>): Promise<DiscussionTopic | null> => {
  try {
    // Convert camelCase properties to snake_case for the database
    const dbUpdates: Record<string, any> = {};
    
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.isPinned !== undefined) dbUpdates.is_pinned = updates.isPinned;
    if (updates.isLocked !== undefined) dbUpdates.is_locked = updates.isLocked;
    
    const { data, error } = await supabase
      .from('discussion_topics')
      .update(dbUpdates)
      .eq('id', topicId)
      .select(`
        *,
        author:profiles (
          id,
          first_name,
          last_name,
          image_url
        )
      `)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      content: data.content || '',
      electionId: data.election_id,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isPinned: data.is_pinned,
      isLocked: data.is_locked,
      author: data.author ? {
        id: data.author.id,
        firstName: data.author.first_name,
        lastName: data.author.last_name,
        imageUrl: data.author.image_url
      } : null,
      repliesCount: 0,
      lastReplyAt: data.updated_at
    };
  } catch (error) {
    console.error("Error updating discussion topic:", error);
    return null;
  }
};

const deleteDiscussionTopic = async (topicId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('discussion_topics')
      .delete()
      .eq('id', topicId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error deleting discussion topic:", error);
    return false;
  }
};

const fetchComments = async (topicId: string): Promise<DiscussionComment[]> => {
  try {
    const { data, error } = await supabase
      .from('discussion_comments')
      .select(`
        *,
        author:profiles (
          id,
          first_name,
          last_name,
          image_url
        )
      `)
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Transform the data to match our camelCase interface
    return data.map(comment => ({
      id: comment.id,
      content: comment.content,
      topicId: comment.topic_id,
      parentId: comment.parent_id,
      createdBy: comment.user_id,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      author: comment.author ? {
        id: comment.author.id,
        firstName: comment.author.first_name,
        lastName: comment.author.last_name,
        imageUrl: comment.author.image_url
      } : null,
      replies: []
    }));
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

const createComment = async (topicId: string, content: string, parentId?: string | null): Promise<DiscussionComment | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('discussion_comments')
      .insert([{
        content,
        topic_id: topicId,
        parent_id: parentId,
        user_id: userData.user.id
      }])
      .select(`
        *,
        author:profiles (
          id,
          first_name,
          last_name,
          image_url
        )
      `)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      content: data.content,
      topicId: data.topic_id,
      parentId: data.parent_id,
      createdBy: data.user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      author: data.author ? {
        id: data.author.id,
        firstName: data.author.first_name,
        lastName: data.author.last_name,
        imageUrl: data.author.image_url
      } : null
    };
  } catch (error) {
    console.error("Error creating comment:", error);
    return null;
  }
};

const updateComment = async (commentId: string, content: string): Promise<DiscussionComment | null> => {
  try {
    const { data, error } = await supabase
      .from('discussion_comments')
      .update({ content })
      .eq('id', commentId)
      .select(`
        *,
        author:profiles (
          id,
          first_name,
          last_name,
          image_url
        )
      `)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      content: data.content,
      topicId: data.topic_id,
      parentId: data.parent_id,
      createdBy: data.user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      author: data.author ? {
        id: data.author.id,
        firstName: data.author.first_name,
        lastName: data.author.last_name,
        imageUrl: data.author.image_url
      } : null
    };
  } catch (error) {
    console.error("Error updating comment:", error);
    return null;
  }
};

const deleteComment = async (commentId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('discussion_comments')
      .delete()
      .eq('id', commentId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    return false;
  }
};

export const useDiscussions = (electionId: string) => {
  const { user } = useAuth();
  const [topics, setTopics] = useState<DiscussionTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<DiscussionTopic | null>(null);
  const [comments, setComments] = useState<DiscussionComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentLoading, setCommentLoading] = useState(false);

  // Add debugging for the current election ID
  useEffect(() => {
    console.log("🔍 useDiscussions hook initialized with electionId:", electionId);
  }, [electionId]);

  const loadTopics = useCallback(async () => {
    try {
      if (!electionId) {
        console.error("📛 No election ID provided, skipping topic load");
        setTopics([]);
        setLoading(false);
        return;
      }

      console.log("🔄 Starting to load topics for election:", electionId);
      setLoading(true);
      setError(null);
      
      const data = await fetchDiscussionTopics(electionId);
      
      console.log(`✅ Loaded ${data.length} topics in useDiscussions hook:`, data);
      setTopics(data);
    } catch (error: any) {
      console.error("📛 Error loading discussions:", error);
      setError("Failed to load discussion topics");
      toast({
        title: "Error",
        description: "Failed to load discussion topics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [electionId]);

  // Set up initial load and realtime subscription
  useEffect(() => {
    if (!electionId) {
      console.warn("⚠️ No electionId provided to useDiscussions, skipping setup");
      return;
    }
    
    console.log("🔄 Setting up initial load and realtime for electionId:", electionId);
    
    // Load topics immediately
    loadTopics();
    
    // Set up realtime subscription
    console.log("🔄 Setting up Supabase realtime subscription for discussions");
    const channel = supabase
      .channel('discussion-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'discussion_topics',
        filter: `election_id=eq.${electionId}`
      }, (payload) => {
        console.log("🔔 Detected change in discussion topics:", payload);
        loadTopics();
      })
      .subscribe((status) => {
        console.log("✅ Supabase channel status:", status);
      });
      
    return () => {
      console.log("🧹 Cleaning up Supabase channel for discussions");
      supabase.removeChannel(channel);
    };
  }, [electionId, loadTopics]);
  
  const loadTopic = async (topicId: string) => {
    try {
      console.log("🔄 Loading topic details:", topicId);
      setLoading(true);
      setError(null);
      
      const topic = await fetchDiscussionTopicById(topicId);
      
      if (!topic) {
        console.error("📛 Failed to load topic, no data returned");
        toast({
          title: "Error",
          description: "Failed to load topic details",
          variant: "destructive"
        });
        return null;
      }
      
      console.log("✅ Topic loaded successfully:", topic);
      setSelectedTopic(topic);
      await loadComments(topicId);
      return topic;
    } catch (error: any) {
      console.error("📛 Error loading topic:", error);
      setError("Failed to load discussion topic");
      toast({
        title: "Error",
        description: `Failed to load topic: ${error.message}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const loadComments = async (topicId: string) => {
    try {
      setCommentLoading(true);
      console.log("Loading comments for topic:", topicId);
      const commentsData = await fetchComments(topicId);
      console.log("Comments loaded:", commentsData);
      
      // Organize comments into a hierarchical structure
      const commentMap = new Map<string, DiscussionComment>();
      const rootComments: DiscussionComment[] = [];
      
      // First pass: Create a map of all comments
      commentsData.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });
      
      // Second pass: Build the hierarchy
      commentsData.forEach(comment => {
        if (comment.parentId) {
          // This is a reply, add it to parent's replies array
          const parent = commentMap.get(comment.parentId);
          if (parent && parent.replies) {
            parent.replies.push(commentMap.get(comment.id)!);
          }
        } else {
          // This is a root comment
          rootComments.push(commentMap.get(comment.id)!);
        }
      });
      
      setComments(rootComments);
    } catch (error: any) {
      console.error("Error loading comments:", error);
      toast({
        title: "Error",
        description: `Failed to load comments: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setCommentLoading(false);
    }
  };
  
  const addTopic = async (electionId: string, title: string, content: string | null) => {
    try {
      if (!user) {
        const errorMsg = "You must be logged in to create a topic";
        setError(errorMsg);
        console.error("📛", errorMsg);
        toast({
          title: "Authentication Error",
          description: errorMsg,
          variant: "destructive"
        });
        return null;
      }

      if (!electionId) {
        const errorMsg = "No election ID provided";
        setError(errorMsg);
        console.error("📛", errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        return null;
      }
      
      console.log("🔄 Adding new topic:", { electionId, title, content });
      setLoading(true);
      
      const newTopic = await createDiscussionTopic(electionId, title, content);
      
      if (newTopic) {
        console.log("✅ New topic created successfully, reloading topics");
        
        // Force reload all topics to ensure we have the latest data
        await loadTopics();
        
        return newTopic;
      } else {
        console.error("📛 Failed to create topic: No topic data returned");
        toast({
          title: "Error",
          description: "Failed to create topic",
          variant: "destructive"
        });
        setError("Failed to create topic");
        return null;
      }
    } catch (error: any) {
      console.error("📛 Error creating topic:", error);
      setError(error.message || "Failed to create topic");
      toast({
        title: "Error",
        description: `Failed to create topic: ${error.message}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const updateTopic = async (topicId: string, updates: Partial<DiscussionTopic>) => {
    try {
      const updatedTopic = await updateDiscussionTopic(topicId, updates);
      
      if (updatedTopic) {
        setTopics(prevTopics => 
          prevTopics.map(topic => 
            topic.id === topicId ? { ...topic, ...updatedTopic } : topic
          )
        );
        
        if (selectedTopic?.id === topicId) {
          setSelectedTopic(prevTopic => prevTopic ? { ...prevTopic, ...updatedTopic } : null);
        }
        
        return updatedTopic;
      }
      
      toast({
        title: "Error",
        description: "Failed to update topic",
        variant: "destructive"
      });
      return null;
    } catch (error: any) {
      console.error("Error updating topic:", error);
      toast({
        title: "Error",
        description: `Failed to update topic: ${error.message}`,
        variant: "destructive"
      });
      return null;
    }
  };
  
  const removeTopic = async (topicId: string) => {
    try {
      const success = await deleteDiscussionTopic(topicId);
      
      if (success) {
        setTopics(prevTopics => prevTopics.filter(topic => topic.id !== topicId));
        
        if (selectedTopic?.id === topicId) {
          setSelectedTopic(null);
        }
        
        return true;
      }
      
      toast({
        title: "Error",
        description: "Failed to delete topic",
        variant: "destructive"
      });
      return false;
    } catch (error: any) {
      console.error("Error deleting topic:", error);
      toast({
        title: "Error",
        description: `Failed to delete topic: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
  };
  
  const addComment = async (content: string, parentId?: string) => {
    try {
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to comment",
          variant: "destructive"
        });
        throw new Error("You must be logged in to comment");
      }

      if (!selectedTopic) {
        toast({
          title: "Error",
          description: "No topic selected",
          variant: "destructive"
        });
        throw new Error("No topic selected");
      }
      
      setCommentLoading(true);
      const newComment = await createComment(selectedTopic.id, content, parentId);
      
      if (newComment && selectedTopic) {
        await loadComments(selectedTopic.id);
        return true;
      }
      
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive"
      });
      return false;
    } catch (error: any) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: `Failed to post comment: ${error.message}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setCommentLoading(false);
    }
  };
  
  const editComment = async (commentId: string, content: string) => {
    try {
      if (!selectedTopic) {
        toast({
          title: "Error",
          description: "No topic selected",
          variant: "destructive"
        });
        throw new Error("No topic selected");
      }
      
      setCommentLoading(true);
      const updatedComment = await updateComment(commentId, content);
      
      if (updatedComment && selectedTopic) {
        await loadComments(selectedTopic.id);
        return true;
      }
      
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive"
      });
      return false;
    } catch (error: any) {
      console.error("Error updating comment:", error);
      toast({
        title: "Error",
        description: `Failed to update comment: ${error.message}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setCommentLoading(false);
    }
  };
  
  const removeComment = async (commentId: string) => {
    try {
      if (!selectedTopic) {
        toast({
          title: "Error", 
          description: "No topic selected",
          variant: "destructive"
        });
        throw new Error("No topic selected");
      }
      
      setCommentLoading(true);
      const success = await deleteComment(commentId);
      
      if (success && selectedTopic) {
        await loadComments(selectedTopic.id);
        return true;
      }
      
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive"
      });
      return false;
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: `Failed to delete comment: ${error.message}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setCommentLoading(false);
    }
  };

  return {
    topics,
    selectedTopic,
    comments,
    loading,
    commentLoading,
    error,
    loadTopic,
    loadTopics,
    addTopic,
    updateTopic,
    removeTopic,
    addComment,
    editComment,
    removeComment
  };
};
