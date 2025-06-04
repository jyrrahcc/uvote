
import { supabase } from "@/integrations/supabase/client";
import { Poll, PollResults, PollOption } from "@/types/discussions";
import { v4 as uuidv4 } from "uuid";
import { getElectionIdCondition, isGlobalDiscussion } from "./globalDiscussionService";

/**
 * Get all polls for an election or global polls with proper filtering
 */
export const getPolls = async (electionId: string): Promise<Poll[]> => {
  try {
    let query = supabase.from('polls').select('*');
    
    if (isGlobalDiscussion(electionId)) {
      // Filter for global polls (null election_id)
      query = query.is('election_id', null);
    } else {
      // Filter for election specific polls
      query = query.eq('election_id', electionId);
    }
    
    const { data: pollsData, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to ensure options are properly typed
    return (pollsData || []).map(poll => {
      // Convert options from Record<string, string> to PollOption[]
      const optionsRecord = poll.options as Record<string, string>;
      const optionsArray: PollOption[] = Object.entries(optionsRecord).map(([id, text]) => ({
        id,
        text
      }));
      
      return {
        ...poll,
        options: optionsArray
      };
    });
  } catch (error) {
    console.error("Error getting polls:", error);
    throw error;
  }
};

/**
 * Get a specific poll by ID with vote counts and user voting status
 */
export const getPoll = async (pollId: string, includeVoteData: boolean = true): Promise<Poll | null> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .eq('id', pollId)
      .single();
      
    if (error) throw error;
    
    if (!data) return null;
    
    // Convert options from Record<string, string> to PollOption[]
    const optionsRecord = data.options as Record<string, string>;
    const optionsArray: PollOption[] = Object.entries(optionsRecord).map(([id, text]) => ({
      id,
      text
    }));
    
    const poll: Poll = {
      ...data,
      options: optionsArray
    };
    
    if (includeVoteData) {
      // Get vote counts and user voting status
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      // Fetch all votes for this poll
      const { data: votes, error: votesError } = await supabase
        .from('poll_votes')
        .select('*')
        .eq('poll_id', pollId);
      
      if (!votesError && votes) {
        // Calculate vote counts for each option
        const voteCounts: Record<string, number> = {};
        let hasUserVoted = false;
        
        votes.forEach(vote => {
          if (userId && vote.user_id === userId) {
            hasUserVoted = true;
          }
          
          const voteOptions = vote.options as Record<string, boolean>;
          Object.entries(voteOptions).forEach(([optionId, selected]) => {
            if (selected) {
              voteCounts[optionId] = (voteCounts[optionId] || 0) + 1;
            }
          });
        });
        
        // Update poll options with vote counts and percentages
        const totalVotes = votes.length;
        poll.options = poll.options.map(option => ({
          ...option,
          votes: voteCounts[option.id] || 0,
          percentage: totalVotes > 0 ? ((voteCounts[option.id] || 0) / totalVotes) * 100 : 0
        }));
        
        poll.votes_count = totalVotes;
        poll.has_voted = hasUserVoted;
      }
    }
    
    return poll;
  } catch (error) {
    console.error("Error getting poll:", error);
    throw error;
  }
};

/**
 * Create a new poll with proper authentication and validation
 */
export const createPoll = async (pollData: {
  question: string;
  options: PollOption[];
  description?: string;
  topic_id?: string;
  multiple_choice?: boolean;
  ends_at?: string;
  election_id: string;
}): Promise<Poll | null> => {
  try {
    // Get current user session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new Error("User must be authenticated to create polls");
    }

    const userId = sessionData.session.user.id;

    // Validate poll data
    if (!pollData.question.trim()) {
      throw new Error("Poll question is required");
    }
    
    if (!pollData.options || pollData.options.length < 2) {
      throw new Error("Poll must have at least 2 options");
    }

    // Prepare options as a record for database storage
    const pollOptions: Record<string, string> = {};
    pollData.options.forEach(option => {
      const optionId = option.id || uuidv4();
      pollOptions[optionId] = option.text.trim();
    });
    
    const insertData = {
      question: pollData.question.trim(),
      description: pollData.description?.trim() || null,
      options: pollOptions,
      topic_id: pollData.topic_id || null,
      multiple_choice: pollData.multiple_choice || false,
      created_by: userId,
      ends_at: pollData.ends_at || null,
      ...getElectionIdCondition(pollData.election_id)
    };
    
    const { data, error } = await supabase
      .from('polls')
      .insert(insertData)
      .select()
      .single();
      
    if (error) throw error;
    
    // Transform options back to PollOption array
    if (data) {
      const optionsRecord = data.options as Record<string, string>;
      const optionsArray: PollOption[] = Object.entries(optionsRecord).map(([id, text]) => ({
        id,
        text
      }));
      
      return {
        ...data,
        options: optionsArray
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error creating poll:", error);
    throw error;
  }
};

/**
 * Update an existing poll with proper authorization
 */
export const updatePoll = async (pollId: string, updates: Partial<Poll>): Promise<Poll | null> => {
  try {
    // Get current user session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new Error("User must be authenticated to update polls");
    }

    const userId = sessionData.session.user.id;

    // Prepare update data
    const updateData: any = {};
    
    if (updates.question !== undefined) {
      updateData.question = updates.question.trim();
    }
    
    if (updates.description !== undefined) {
      updateData.description = updates.description?.trim() || null;
    }
    
    if (updates.options !== undefined) {
      // Convert options array to record for database
      const optionsRecord: Record<string, string> = {};
      updates.options.forEach(opt => {
        optionsRecord[opt.id] = opt.text.trim();
      });
      updateData.options = optionsRecord;
    }
    
    if (updates.multiple_choice !== undefined) {
      updateData.multiple_choice = updates.multiple_choice;
    }
    
    if (updates.is_closed !== undefined) {
      updateData.is_closed = updates.is_closed;
    }
    
    if (updates.ends_at !== undefined) {
      updateData.ends_at = updates.ends_at;
    }
    
    const { data, error } = await supabase
      .from('polls')
      .update(updateData)
      .eq('id', pollId)
      .eq('created_by', userId) // Ensure user can only update their own polls
      .select()
      .single();
      
    if (error) throw error;
    
    // Transform options back to PollOption array
    if (data) {
      const optionsRecord = data.options as Record<string, string>;
      const optionsArray: PollOption[] = Object.entries(optionsRecord).map(([id, text]) => ({
        id,
        text
      }));
      
      return {
        ...data,
        options: optionsArray
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error updating poll:", error);
    throw error;
  }
};

/**
 * Delete a poll by ID with proper authorization
 */
export const deletePoll = async (pollId: string): Promise<boolean> => {
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
