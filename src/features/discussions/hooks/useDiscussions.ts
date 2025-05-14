import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { DiscussionTopic, DiscussionComment } from '@/types/discussions';
import {
  getTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  getComments,
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
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTopics = useCallback(async () => {
    if (!electionId) {
      console.error("No election ID provided, skipping topics load");
      setTopics([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log("Loading topics for election:", electionId);
      const data = await getTopics(electionId);
      console.log("Loaded topics:", data);
      setTopics(data);
    } catch (error: any) {
      console.error("Error loading topics:", error);
      setError("Failed to load topics");
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
        console.log("Detected change in topics, reloading...");
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
      const topic = await getTopic(topicId);
      setSelectedTopic(topic);
      
      if (topic) {
        await loadComments(topicId);
        return topic;
      }
      
      console.error("Failed to load topic, no data returned");
      toast({
        title: "Error",
        description: "Failed to load discussion topic",
        variant: "destructive"
      });
      return null;
    } catch (error: any) {
      console.error("Error loading topic:", error);
      setError("Failed to load topic");
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
      const commentsData = await getComments(topicId);
      
      // Process comments to create a threaded structure
      const commentMap: Record<string, DiscussionComment> = {};
      const rootComments: DiscussionComment[] = [];
      
      // First pass: create a map of all comments
      commentsData.forEach(comment => {
        // Initialize replies array if needed
        const commentWithReplies = {
          ...comment,
          replies: []
        };
        commentMap[comment.id] = commentWithReplies;
      });
      
      // Second pass: organize comments into a tree structure
      commentsData.forEach(comment => {
        if (comment.parentId) {
          // This is a reply, add it to its parent's replies
          if (commentMap[comment.parentId]) {
            commentMap[comment.parentId].replies = commentMap[comment.parentId].replies || [];
            commentMap[comment.parentId].replies!.push(commentMap[comment.id]);
          } else {
            // If parent doesn't exist (which shouldn't happen), add as root
            rootComments.push(commentMap[comment.id]);
          }
        } else {
          // This is a root comment
          rootComments.push(commentMap[comment.id]);
        }
      });
      
      console.log("Processed comments:", rootComments);
      setComments(rootComments);
    } catch (error) {
      console.error("Error loading comments:", error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive"
      });
    } finally {
      setCommentLoading(false);
    }
  };
  
  const addTopic = async (title: string, content: string) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a discussion",
        variant: "destructive"
      });
      return null;
    }
    
    if (!electionId) {
      toast({
        title: "Error",
        description: "No election ID provided",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      console.log("Creating new topic:", { title, content, electionId });
      const topic = await createTopic(electionId, title, content);
      
      if (topic) {
        setTopics(prevTopics => [topic, ...prevTopics]);
        return topic;
      }
      
      toast({
        title: "Error",
        description: "Failed to create discussion topic",
        variant: "destructive"
      });
      return null;
    } catch (error: any) {
      console.error("Error creating topic:", error);
      toast({
        title: "Error",
        description: `Failed to create topic: ${error.message}`,
        variant: "destructive"
      });
      return null;
    }
  };
  
  const removeTopic = async (topicId: string) => {
    try {
      console.log("Deleting topic:", topicId);
      const success = await deleteTopic(topicId);
      
      if (success) {
        setTopics(prevTopics => prevTopics.filter(topic => topic.id !== topicId));
        return true;
      }
      
      toast({
        title: "Error",
        description: "Failed to delete discussion topic",
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
  
  const updateExistingTopic = async (topicId: string, updates: Partial<DiscussionTopic>) => {
    try {
      console.log("Updating topic:", topicId, updates);
      const updatedTopic = await updateTopic(topicId, updates);
      
      if (updatedTopic) {
        // Update topics list
        setTopics(prevTopics => 
          prevTopics.map(topic => 
            topic.id === topicId ? updatedTopic : topic
          )
        );
        
        // Update selected topic if it's the one being updated
        if (selectedTopic?.id === topicId) {
          setSelectedTopic(updatedTopic);
        }
        
        return updatedTopic;
      }
      
      toast({
        title: "Error",
        description: "Failed to update discussion topic",
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
  
  const addComment = async (topicId: string, content: string, parentId?: string | null) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to comment",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      console.log("Adding comment:", { topicId, content, parentId });
      const comment = await createComment(topicId, content, parentId);
      
      if (comment) {
        // Reload comments to get the proper threaded structure
        await loadComments(topicId);
        return true;
      }
      
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
      return false;
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: `Failed to add comment: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
  };
  
  const editComment = async (commentId: string, content: string) => {
    try {
      console.log("Editing comment:", commentId, content);
      const updatedComment = await updateComment(commentId, content);
      
      if (updatedComment && selectedTopic) {
        // Reload comments to get the updated content
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
      console.error("Error editing comment:", error);
      toast({
        title: "Error",
        description: `Failed to edit comment: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
  };
  
  const removeComment = async (commentId: string) => {
    try {
      console.log("Deleting comment:", commentId);
      const success = await deleteComment(commentId);
      
      if (success && selectedTopic) {
        // Reload comments to get the updated structure
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
      console.error("Error removing comment:", error);
      toast({
        title: "Error",
        description: `Failed to delete comment: ${error.message}`,
        variant: "destructive"
      });
      return false;
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
    updateTopic: updateExistingTopic,
    removeTopic,
    addComment,
    editComment,
    removeComment
  };
};
