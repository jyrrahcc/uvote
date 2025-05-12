
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
      setLoading(true);
      setError(null);
      console.log("Loading topics for election:", electionId);
      const data = await fetchDiscussionTopics(electionId);
      console.log("Loaded topics:", data);
      setTopics(data);
    } catch (error) {
      console.error("Error loading discussions:", error);
      setError("Failed to load discussion topics");
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
      const topic = await fetchDiscussionTopicById(topicId);
      setSelectedTopic(topic);
      
      if (topic) {
        await loadComments(topicId);
      }
      
      return topic;
    } catch (error) {
      console.error("Error loading topic:", error);
      setError("Failed to load discussion topic");
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const loadComments = async (topicId: string) => {
    try {
      setCommentLoading(true);
      const commentsData = await fetchComments(topicId);
      
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
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setCommentLoading(false);
    }
  };
  
  const addTopic = async (electionId: string, title: string, content: string) => {
    try {
      if (!user) {
        throw new Error("You must be logged in to create a topic");
      }
      
      console.log("Adding new topic:", { electionId, title, content });
      
      const newTopic = await createDiscussionTopic(electionId, title, content);
      
      if (newTopic) {
        console.log("New topic created:", newTopic);
        // Reload topics to ensure we have the latest data with author information
        await loadTopics();
        return newTopic;
      }
      return null;
    } catch (error: any) {
      console.error("Error creating topic:", error);
      setError(error.message || "Failed to create topic");
      return null;
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
      return null;
    } catch (error: any) {
      setError(error.message || "Failed to update topic");
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
      return false;
    } catch (error: any) {
      setError(error.message || "Failed to delete topic");
      return false;
    }
  };
  
  const addComment = async (content: string, parentId?: string) => {
    try {
      if (!selectedTopic) {
        throw new Error("No topic selected");
      }
      
      setCommentLoading(true);
      const newComment = await createComment(selectedTopic.id, content, parentId);
      
      if (newComment) {
        await loadComments(selectedTopic.id);
        return newComment;
      }
      
      return null;
    } catch (error: any) {
      setError(error.message || "Failed to post comment");
      return null;
    } finally {
      setCommentLoading(false);
    }
  };
  
  const editComment = async (commentId: string, content: string) => {
    try {
      if (!selectedTopic) {
        throw new Error("No topic selected");
      }
      
      setCommentLoading(true);
      const updatedComment = await updateComment(commentId, content);
      
      if (updatedComment && selectedTopic) {
        await loadComments(selectedTopic.id);
        return updatedComment;
      }
      
      return null;
    } catch (error: any) {
      setError(error.message || "Failed to update comment");
      return null;
    } finally {
      setCommentLoading(false);
    }
  };
  
  const removeComment = async (commentId: string) => {
    try {
      if (!selectedTopic) {
        throw new Error("No topic selected");
      }
      
      setCommentLoading(true);
      const success = await deleteComment(commentId);
      
      if (success && selectedTopic) {
        await loadComments(selectedTopic.id);
        return true;
      }
      
      return false;
    } catch (error: any) {
      setError(error.message || "Failed to delete comment");
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
    addTopic,
    updateTopic,
    removeTopic,
    addComment,
    editComment,
    removeComment
  };
};
