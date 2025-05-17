
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
 * Create or update a discussion topic
 */
export const manageGlobalDiscussionTopic = async (
  action: 'create' | 'update',
  data: Partial<Discussion>,
  topicId?: string
): Promise<Discussion | null> => {
  try {
    if (action === 'create') {
      const { data: newTopic, error } = await supabase
        .from('discussion_topics')
        .insert({
          title: data.title,
          content: data.content,
          election_id: null, // Global discussion has null election_id
          created_by: data.created_by,
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
 * Create or update a poll
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
    created_by: string;
    is_closed?: boolean;
  },
  pollId?: string
): Promise<Poll | null> => {
  try {
    const pollOptions = data.options.map(option => ({
      id: option.id || uuidv4(),
      text: option.text
    }));

    if (action === 'create') {
      const { data: newPoll, error } = await supabase
        .from('polls')
        .insert({
          question: data.question,
          description: data.description,
          options: pollOptions,
          election_id: null, // Global poll has null election_id
          topic_id: data.topic_id,
          multiple_choice: data.multiple_choice || false,
          created_by: data.created_by,
          ends_at: data.ends_at,
          is_closed: data.is_closed || false
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      // Convert Json options back to proper PollOption type
      return newPoll ? {
        ...newPoll,
        options: newPoll.options as unknown as PollOption[]
      } : null;
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
        .select('*')
        .single();
        
      if (error) throw error;
      
      // Convert Json options back to proper PollOption type
      return updatedPoll ? {
        ...updatedPoll,
        options: updatedPoll.options as unknown as PollOption[]
      } : null;
    }
    
    return null;
  } catch (error) {
    console.error(`Error ${action}ing global poll:`, error);
    throw error;
  }
};
