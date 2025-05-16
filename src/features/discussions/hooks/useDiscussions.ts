
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Discussion, Comment } from "@/types/discussions";
import * as discussionService from "../services/discussionService";

export const useDiscussions = (electionId: string) => {
  const [topics, setTopics] = useState<Discussion[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  // Load all topics for an election
  const loadTopics = useCallback(async () => {
    if (!electionId) {
      console.error("No election ID provided to useDiscussions");
      return;
    }
    
    setLoading(true);
    try {
      const data = await discussionService.getTopics(electionId);
      setTopics(data);
    } catch (error) {
      console.error("Failed to load discussion topics:", error);
      toast.error("Could not load discussions");
    } finally {
      setLoading(false);
    }
  }, [electionId]);

  // Load a specific topic and its comments
  const loadTopic = useCallback(async (topicId: string) => {
    setLoading(true);
    setCommentLoading(true);
    
    try {
      const topic = await discussionService.getTopic(topicId);
      setSelectedTopic(topic);
      
      const topicComments = await discussionService.getComments(topicId);
      
      // Organize comments into a tree structure
      const commentMap = new Map();
      const rootComments: Comment[] = [];
      
      // First pass: create a lookup table
      topicComments.forEach(comment => {
        // Initialize empty replies array for each comment
        comment.replies = comment.replies || [];
        commentMap.set(comment.id, comment);
      });
      
      // Second pass: link replies to their parents or add to root
      topicComments.forEach(comment => {
        if (comment.parent_id) {
          const parentComment = commentMap.get(comment.parent_id);
          if (parentComment) {
            if (!parentComment.replies) parentComment.replies = [];
            parentComment.replies.push(comment);
          } else {
            rootComments.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });
      
      setComments(rootComments);
    } catch (error) {
      console.error("Failed to load discussion topic:", error);
      toast.error("Could not load the discussion");
    } finally {
      setLoading(false);
      setCommentLoading(false);
    }
  }, []);

  // Add a new topic
  const addTopic = useCallback(async (title: string, content: string): Promise<Discussion | null> => {
    if (!electionId) throw new Error("No election ID provided");
    
    try {
      const newTopic = await discussionService.createTopic(electionId, title, content);
      setTopics(prev => [newTopic, ...prev]);
      return newTopic;
    } catch (error) {
      console.error("Failed to create topic:", error);
      toast.error("Could not create the discussion topic");
      return null;
    }
  }, [electionId]);

  // Update an existing topic
  const updateTopic = useCallback(async (topicId: string, updates: Partial<Discussion>): Promise<Discussion | null> => {
    try {
      const updatedTopic = await discussionService.updateTopic(topicId, updates);
      
      // Update topics list
      setTopics(prev => prev.map(topic => 
        topic.id === updatedTopic.id ? updatedTopic : topic
      ));
      
      // Update selected topic if it's the one being viewed
      if (selectedTopic && selectedTopic.id === updatedTopic.id) {
        setSelectedTopic(updatedTopic);
      }
      
      return updatedTopic;
    } catch (error) {
      console.error("Failed to update topic:", error);
      toast.error("Could not update the discussion topic");
      return null;
    }
  }, [selectedTopic]);

  // Remove a topic
  const removeTopic = useCallback(async (topicId: string): Promise<boolean> => {
    try {
      const success = await discussionService.deleteTopic(topicId);
      
      if (success) {
        // Update topics list
        setTopics(prev => prev.filter(topic => topic.id !== topicId));
        
        // Clear selected topic if it's the one being removed
        if (selectedTopic && selectedTopic.id === topicId) {
          setSelectedTopic(null);
        }
      }
      
      return success;
    } catch (error) {
      console.error("Failed to delete topic:", error);
      toast.error("Could not delete the discussion topic");
      return false;
    }
  }, [selectedTopic]);

  // Add a comment to a topic
  const addComment = useCallback(async (topicId: string, content: string, parentId?: string): Promise<Comment | null> => {
    setCommentLoading(true);
    
    try {
      const newComment = await discussionService.createComment(topicId, content, parentId);
      
      // If it's a reply to an existing comment
      if (parentId) {
        // Find the parent comment
        setComments(prevComments => {
          const findAndAddReply = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.id === parentId) {
                // Add reply to this comment
                return {
                  ...comment,
                  replies: [...(comment.replies || []), newComment]
                };
              } else if (comment.replies && comment.replies.length > 0) {
                // Check in replies recursively
                return {
                  ...comment,
                  replies: findAndAddReply(comment.replies)
                };
              }
              return comment;
            });
          };
          
          return findAndAddReply(prevComments);
        });
      } else {
        // Top-level comment
        setComments(prev => [...prev, { ...newComment, replies: [] }]);
      }
      
      return newComment;
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Could not add your comment");
      return null;
    } finally {
      setCommentLoading(false);
    }
  }, []);

  // Edit an existing comment
  const editComment = useCallback(async (commentId: string, content: string): Promise<Comment | null> => {
    setCommentLoading(true);
    
    try {
      const updatedComment = await discussionService.updateComment(commentId, content);
      
      // Update the comment in the state
      setComments(prevComments => {
        const findAndUpdateComment = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              // Update this comment
              return {
                ...comment,
                content: updatedComment.content,
                updated_at: updatedComment.updated_at
              };
            } else if (comment.replies && comment.replies.length > 0) {
              // Check in replies recursively
              return {
                ...comment,
                replies: findAndUpdateComment(comment.replies)
              };
            }
            return comment;
          });
        };
        
        return findAndUpdateComment(prevComments);
      });
      
      return updatedComment;
    } catch (error) {
      console.error("Failed to edit comment:", error);
      toast.error("Could not update your comment");
      return null;
    } finally {
      setCommentLoading(false);
    }
  }, []);

  // Remove a comment
  const removeComment = useCallback(async (commentId: string): Promise<boolean> => {
    setCommentLoading(true);
    
    try {
      const success = await discussionService.deleteComment(commentId);
      
      if (success) {
        // Remove the comment from state
        setComments(prevComments => {
          // Filter out top-level comments matching this ID
          const filteredComments = prevComments.filter(comment => comment.id !== commentId);
          
          // For each remaining comment, filter out replies matching this ID
          const recursivelyFilterReplies = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.replies && comment.replies.length > 0) {
                return {
                  ...comment,
                  replies: recursivelyFilterReplies(
                    comment.replies.filter(reply => reply.id !== commentId)
                  )
                };
              }
              return comment;
            });
          };
          
          return recursivelyFilterReplies(filteredComments);
        });
      }
      
      return success;
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Could not delete the comment");
      return false;
    } finally {
      setCommentLoading(false);
    }
  }, []);

  return {
    topics,
    selectedTopic,
    comments,
    loading,
    commentLoading,
    loadTopics,
    loadTopic,
    addTopic,
    updateTopic,
    removeTopic,
    addComment,
    editComment,
    removeComment
  };
};
