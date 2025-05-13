
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { DiscussionTopic, DiscussionComment } from '@/types/discussions';
import { 
  fetchDiscussionTopics,
  fetchDiscussionTopicById,
  createDiscussionTopic,
  updateDiscussionTopic,
  deleteDiscussionTopic,
  fetchComments,
  createComment,
  updateComment,
  deleteComment
} from '../services/discussionService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useDiscussions = (electionId: string) => {
  const { user } = useAuth();
  const [topics, setTopics] = useState<DiscussionTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<DiscussionTopic | null>(null);
  const [comments, setComments] = useState<DiscussionComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentLoading, setCommentLoading] = useState(false);

  const loadTopics = useCallback(async () => {
    try {
      if (!electionId) {
        console.error("No election ID provided, skipping topic load");
        setTopics([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      console.log("Loading topics for election:", electionId);
      const data = await fetchDiscussionTopics(electionId);
      console.log("Loaded topics:", data);
      setTopics(data);
    } catch (error: any) {
      console.error("Error loading discussions:", error);
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

  useEffect(() => {
    if (!electionId) return;
    
    loadTopics();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('discussion-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'discussion_topics',
        filter: `election_id=eq.${electionId}`
      }, () => {
        console.log("Detected change in discussion topics, reloading...");
        loadTopics();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [electionId, loadTopics]);
  
  const loadTopic = async (topicId: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading topic details:", topicId);
      const topic = await fetchDiscussionTopicById(topicId);
      
      if (!topic) {
        console.error("Failed to load topic, no data returned");
        toast({
          title: "Error",
          description: "Failed to load topic details",
          variant: "destructive"
        });
        return null;
      }
      
      console.log("Topic loaded:", topic);
      setSelectedTopic(topic);
      await loadComments(topicId);
      return topic;
    } catch (error: any) {
      console.error("Error loading topic:", error);
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
        if (comment.parent_id) {
          // This is a reply, add it to parent's replies array
          const parent = commentMap.get(comment.parent_id);
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
  
  const addTopic = async (electionId: string, title: string, content: string) => {
    try {
      if (!user) {
        const errorMsg = "You must be logged in to create a topic";
        setError(errorMsg);
        console.error(errorMsg);
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
        console.error(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        return null;
      }
      
      console.log("Adding new topic:", { electionId, title, content });
      setLoading(true);
      
      const newTopic = await createDiscussionTopic(electionId, title, content);
      
      if (newTopic) {
        console.log("New topic created successfully:", newTopic);
        // Reload topics to ensure we have the latest data
        await loadTopics();
        return newTopic;
      } else {
        console.error("Failed to create topic: No topic data returned");
        toast({
          title: "Error",
          description: "Failed to create topic",
          variant: "destructive"
        });
        setError("Failed to create topic");
        return null;
      }
    } catch (error: any) {
      console.error("Error creating topic:", error);
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
      console.log("Updating topic:", topicId, updates);
      const updatedTopic = await updateDiscussionTopic(topicId, updates);
      if (updatedTopic) {
        console.log("Topic updated successfully:", updatedTopic);
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
      
      console.error("Failed to update topic: No topic data returned");
      toast({
        title: "Error",
        description: "Failed to update topic",
        variant: "destructive"
      });
      return null;
    } catch (error: any) {
      console.error("Error updating topic:", error);
      setError(error.message || "Failed to update topic");
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
      console.log("Deleting topic:", topicId);
      const success = await deleteDiscussionTopic(topicId);
      if (success) {
        console.log("Topic deleted successfully");
        setTopics(prevTopics => prevTopics.filter(topic => topic.id !== topicId));
        if (selectedTopic?.id === topicId) {
          setSelectedTopic(null);
        }
        return true;
      }
      
      console.error("Failed to delete topic");
      toast({
        title: "Error",
        description: "Failed to delete topic",
        variant: "destructive"
      });
      return false;
    } catch (error: any) {
      console.error("Error deleting topic:", error);
      setError(error.message || "Failed to delete topic");
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
        const errorMsg = "You must be logged in to comment";
        toast({
          title: "Authentication Error",
          description: errorMsg,
          variant: "destructive"
        });
        throw new Error(errorMsg);
      }

      if (!selectedTopic) {
        const errorMsg = "No topic selected";
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        throw new Error(errorMsg);
      }
      
      setCommentLoading(true);
      console.log("Adding comment to topic:", selectedTopic.id, content, parentId || "root comment");
      const newComment = await createComment(selectedTopic.id, content, parentId);
      
      if (newComment) {
        console.log("Comment added successfully:", newComment);
        await loadComments(selectedTopic.id);
        return newComment;
      }
      
      console.error("Failed to add comment: No comment data returned");
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive"
      });
      return null;
    } catch (error: any) {
      console.error("Error posting comment:", error);
      setError(error.message || "Failed to post comment");
      toast({
        title: "Error",
        description: `Failed to post comment: ${error.message}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setCommentLoading(false);
    }
  };
  
  const editComment = async (commentId: string, content: string) => {
    try {
      if (!selectedTopic) {
        const errorMsg = "No topic selected";
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        throw new Error(errorMsg);
      }
      
      setCommentLoading(true);
      console.log("Updating comment:", commentId, content);
      const updatedComment = await updateComment(commentId, content);
      
      if (updatedComment && selectedTopic) {
        console.log("Comment updated successfully:", updatedComment);
        await loadComments(selectedTopic.id);
        return updatedComment;
      }
      
      console.error("Failed to update comment: No comment data returned");
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive"
      });
      return null;
    } catch (error: any) {
      console.error("Error updating comment:", error);
      setError(error.message || "Failed to update comment");
      toast({
        title: "Error",
        description: `Failed to update comment: ${error.message}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setCommentLoading(false);
    }
  };
  
  const removeComment = async (commentId: string) => {
    try {
      if (!selectedTopic) {
        const errorMsg = "No topic selected";
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        throw new Error(errorMsg);
      }
      
      setCommentLoading(true);
      console.log("Deleting comment:", commentId);
      const success = await deleteComment(commentId);
      
      if (success && selectedTopic) {
        console.log("Comment deleted successfully");
        await loadComments(selectedTopic.id);
        return true;
      }
      
      console.error("Failed to delete comment");
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive"
      });
      return false;
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      setError(error.message || "Failed to delete comment");
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
