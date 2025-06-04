
import { supabase } from "@/integrations/supabase/client";
import { Discussion, Poll, DiscussionComment, PollOption } from "@/types/discussions";
import { v4 as uuidv4 } from "uuid";

/**
 * Special election ID used for global discussions not tied to a specific election
 */
export const GLOBAL_DISCUSSION_ID = "global";

/**
 * Helper to check if we're using the global discussions feature
 */
export const isGlobalDiscussion = (electionId: string): boolean => {
  return electionId === GLOBAL_DISCUSSION_ID;
};

/**
 * Modify existing discussion services to work with global discussions
 * This helper is used by the discussion service to handle elections ID conditions
 */
export const getElectionIdCondition = (electionId: string) => {
  if (isGlobalDiscussion(electionId)) {
    // For global discussions, return null for the election_id field
    return { election_id: null };
  } else {
    // For election-specific discussions, use the provided ID
    return { election_id: electionId };
  }
};

/**
 * Create or update a discussion topic with proper user authentication
 */
export const manageGlobalDiscussionTopic = async (
  action: 'create' | 'update',
  data: Partial<Discussion>,
  topicId?: string
): Promise<Discussion | null> => {
  try {
    // Get current user session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new Error("User must be authenticated to manage discussion topics");
    }

    const userId = sessionData.session.user.id;

    if (action === 'create') {
      const { data: newTopic, error } = await supabase
        .from('discussion_topics')
        .insert({
          title: data.title!,
          content: data.content || null,
          election_id: null, // Global discussion has null election_id
          created_by: userId,
          is_pinned: data.is_pinned || false,
          is_locked: data.is_locked || false
        })
        .select('*')
        .single();
        
      if (error) throw error;
      return newTopic;
    } else if (action === 'update' && topicId) {
      const { data: updatedTopic, error } = await supabase
        .from('discussion_topics')
        .update({
          title: data.title,
          content: data.content,
          is_pinned: data.is_pinned,
          is_locked: data.is_locked,
          updated_at: new Date().toISOString()
        })
        .eq('id', topicId)
        .eq('created_by', userId) // Ensure user can only update their own topics
        .select('*')
        .single();
        
      if (error) throw error;
      return updatedTopic;
    }
    
    return null;
  } catch (error) {
    console.error(`Error ${action}ing global discussion topic:`, error);
    throw error;
  }
};

/**
 * Create or update a poll with proper user authentication and validation
 */
export const manageGlobalPoll = async (
  action: 'create' | 'update',
  data: {
    question: string;
    options: PollOption[];
    description?: string;
    topic_id?: string;
    multiple_choice?: boolean;
    ends_at?: string;
    is_closed?: boolean;
  },
  pollId?: string
): Promise<Poll | null> => {
  try {
    // Get current user session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new Error("User must be authenticated to manage polls");
    }

    const userId = sessionData.session.user.id;

    // Validate poll options
    if (!data.options || data.options.length < 2) {
      throw new Error("Poll must have at least 2 options");
    }

    // Prepare options as a record for database storage
    const pollOptions: Record<string, string> = {};
    data.options.forEach(option => {
      const optionId = option.id || uuidv4();
      pollOptions[optionId] = option.text;
    });

    if (action === 'create') {
      const { data: newPoll, error } = await supabase
        .from('polls')
        .insert({
          question: data.question,
          description: data.description || null,
          options: pollOptions,
          election_id: null, // Global poll has null election_id
          topic_id: data.topic_id || null,
          multiple_choice: data.multiple_choice || false,
          created_by: userId,
          ends_at: data.ends_at || null,
          is_closed: data.is_closed || false
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      // Transform the response to match our Poll type
      if (newPoll) {
        const transformedOptions: PollOption[] = Object.entries(newPoll.options as Record<string, string>)
          .map(([id, text]) => ({ id, text }));
        
        return {
          ...newPoll,
          options: transformedOptions
        };
      }
      
      return null;
    } else if (action === 'update' && pollId) {
      const { data: updatedPoll, error } = await supabase
        .from('polls')
        .update({
          question: data.question,
          description: data.description,
          options: pollOptions,
          multiple_choice: data.multiple_choice,
          ends_at: data.ends_at,
          is_closed: data.is_closed
        })
        .eq('id', pollId)
        .eq('created_by', userId) // Ensure user can only update their own polls
        .select('*')
        .single();
        
      if (error) throw error;
      
      // Transform the response to match our Poll type
      if (updatedPoll) {
        const transformedOptions: PollOption[] = Object.entries(updatedPoll.options as Record<string, string>)
          .map(([id, text]) => ({ id, text }));
        
        return {
          ...updatedPoll,
          options: transformedOptions
        };
      }
      
      return null;
    }
    
    return null;
  } catch (error) {
    console.error(`Error ${action}ing global poll:`, error);
    throw error;
  }
};

/**
 * Delete a global discussion topic with proper authorization
 */
export const deleteGlobalDiscussionTopic = async (topicId: string): Promise<boolean> => {
  try {
    // Get current user session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new Error("User must be authenticated to delete discussion topics");
    }

    const userId = sessionData.session.user.id;

    // Use the database function to safely delete topic with comments
    const { error } = await supabase.rpc('delete_topic_with_comments', {
      topic_id_param: topicId
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting global discussion topic:", error);
    throw error;
  }
};

/**
 * Delete a global poll with proper authorization
 */
export const deleteGlobalPoll = async (pollId: string): Promise<boolean> => {
  try {
    // Get current user session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new Error("User must be authenticated to delete polls");
    }

    const userId = sessionData.session.user.id;

    // Use the database function to safely delete poll with votes
    const { error } = await supabase.rpc('delete_poll_with_votes', {
      poll_id_param: pollId
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting global poll:", error);
    throw error;
  }
};
