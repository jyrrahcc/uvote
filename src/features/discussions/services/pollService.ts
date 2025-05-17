import { supabase } from "@/integrations/supabase/client";
import { Poll, PollResults, PollOption } from "@/types/discussions";
import { v4 as uuidv4 } from "uuid";
import { getElectionIdCondition, isGlobalDiscussion } from "./globalDiscussionService";

/**
 * Get all polls for an election or global polls
 */
export const getPolls = async (electionId: string): Promise<Poll[]> => {
  try {
    const { data: pollsData, error } = await supabase
      .from('polls')
      .select('*');
    
    if (error) throw error;
    
    const polls = isGlobalDiscussion(electionId)
      ? // Filter for global polls (null election_id)
        (pollsData || []).filter(poll => poll.election_id === null)
      : // Filter for election specific polls
        (pollsData || []).filter(poll => poll.election_id === electionId);
    
    // Transform the data to ensure options are properly typed
    return polls.map(poll => ({
      ...poll,
      options: poll.options as unknown as PollOption[]
    }));
  } catch (error) {
    console.error("Error getting polls:", error);
    throw error;
  }
};

/**
 * Get a specific poll by ID
 */
export const getPoll = async (pollId: string): Promise<Poll | null> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .eq('id', pollId)
      .single();
      
    if (error) throw error;
    
    // Transform options to ensure they're properly typed
    return data ? {
      ...data,
      options: data.options as unknown as PollOption[]
    } : null;
  } catch (error) {
    console.error("Error getting poll:", error);
    throw error;
  }
};

/**
 * Create a new poll
 */
export const createPoll = async (pollData: {
  question: string;
  options: PollOption[];
  description?: string;
  topic_id?: string;
  multiple_choice?: boolean;
  ends_at?: string;
  election_id: string;
  created_by: string;
}): Promise<Poll | null> => {
  try {
    // Ensure each option has an ID
    const pollOptions = pollData.options.map(option => ({
      id: option.id || uuidv4(),
      text: option.text
    }));
    
    const { data, error } = await supabase
      .from('polls')
      .insert({
        question: pollData.question,
        description: pollData.description,
        options: pollOptions,
        ...getElectionIdCondition(pollData.election_id),
        topic_id: pollData.topic_id,
        multiple_choice: pollData.multiple_choice || false,
        created_by: pollData.created_by,
        ends_at: pollData.ends_at
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Transform options to ensure they're properly typed
    return data ? {
      ...data,
      options: data.options as unknown as PollOption[]
    } : null;
  } catch (error) {
    console.error("Error creating poll:", error);
    throw error;
  }
};

/**
 * Update an existing poll
 */
export const updatePoll = async (pollId: string, updates: Partial<Poll>): Promise<Poll | null> => {
  try {
    // Convert options to the format expected by Supabase if present
    const updateData: any = { ...updates };
    if (updates.options) {
      updateData.options = updates.options.map(option => ({
        id: option.id,
        text: option.text
      }));
    }
    
    const { data, error } = await supabase
      .from('polls')
      .update(updateData)
      .eq('id', pollId)
      .select()
      .single();
      
    if (error) throw error;
    
    // Transform options to ensure they're properly typed
    return data ? {
      ...data,
      options: data.options as unknown as PollOption[]
    } : null;
  } catch (error) {
    console.error("Error updating poll:", error);
    throw error;
  }
};

/**
 * Delete a poll by ID
 */
export const deletePoll = async (pollId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error deleting poll:", error);
    return false;
  }
};

/**
 * Get poll results
 */
export const getPollResults = async (pollId: string): Promise<PollResults[]> => {
  try {
    // Fetch poll data
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('id, options')
      .eq('id', pollId)
      .single();
      
    if (pollError) throw pollError;
    if (!poll) throw new Error("Poll not found");
    
    // Fetch votes for the poll
    const { data: votes, error: votesError } = await supabase
      .from('poll_votes')
      .select('*')
      .eq('poll_id', pollId);
      
    if (votesError) throw votesError;
    
    // Cast the options to the correct type
    const pollOptions = poll.options as unknown as PollOption[];
    
    // Calculate votes per option
    const results: PollResults[] = pollOptions.map(option => {
      const optionVotes = votes.filter(vote => {
        const voteOptions = vote.options as Record<string, boolean>;
        return voteOptions[option.id] === true;
      });
      
      return {
        optionId: option.id,
        optionText: option.text,
        votes: optionVotes.length,
        percentage: 0, // Will be calculated later
        voters: [] // Not implemented in this example
      };
    });
    
    // Calculate total votes and percentages
    const totalVotes = votes.length;
    
    if (totalVotes > 0) {
      results.forEach(result => {
        result.percentage = (result.votes / totalVotes) * 100;
      });
    }
    
    return results;
  } catch (error) {
    console.error("Error getting poll results:", error);
    throw error;
  }
};

/**
 * Get user vote for a poll
 */
export const getUserVote = async (pollId: string, userId: string): Promise<string[] | null> => {
  try {
    const { data, error } = await supabase
      .from('poll_votes')
      .select('options')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .single();
      
    if (error) {
      // If no vote found, it's not an error, just return null
      if (error.message === "No rows found") {
        return null;
      }
      throw error;
    }
    
    const selectedOptions: string[] = [];
    if (data && data.options) {
      const options = data.options as Record<string, boolean>;
      for (const optionId in options) {
        if (options[optionId] === true) {
          selectedOptions.push(optionId);
        }
      }
    }
    
    return selectedOptions;
  } catch (error) {
    console.error("Error getting user vote:", error);
    throw error;
  }
};

/**
 * Vote on a poll
 */
export const voteOnPoll = async (pollId: string, userId: string, options: Record<string, boolean>): Promise<boolean> => {
  try {
    // Check if the user has already voted on this poll
    const { data: existingVote, error: existingVoteError } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (existingVoteError) throw existingVoteError;
    
    if (existingVote) {
      // Update existing vote
      const { error: updateError } = await supabase
        .from('poll_votes')
        .update({ options })
        .eq('id', existingVote.id);
        
      if (updateError) throw updateError;
    } else {
      // Create a new vote
      const { error: insertError } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          user_id: userId,
          options
        });
        
      if (insertError) throw insertError;
    }
    
    return true;
  } catch (error) {
    console.error("Error voting on poll:", error);
    throw error;
  }
};
