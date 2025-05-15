import { supabase } from "@/integrations/supabase/client";
import { Poll, PollVote } from "@/types";
import { transformPollData } from "./pollTransformUtils";
import { Json } from "@/integrations/supabase/types";

// Fetch all polls for an election
export const fetchPollsForElection = async (electionId: string): Promise<Poll[]> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .eq('election_id', electionId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match our application schema
    return (data || []).map(poll => transformPollData(poll));
  } catch (error) {
    console.error("Error fetching polls:", error);
    throw error;
  }
};

// Fetch a specific poll by ID
export const fetchPollById = async (pollId: string, userId?: string): Promise<Poll | null> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .eq('id', pollId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - poll not found
        return null;
      }
      throw error;
    }
    
    if (!data) return null;
    
    // Transform the data
    const poll = transformPollData(data);
    
    // Check if the user has voted on this poll
    if (userId) {
      const { data: voteData, error: voteError } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (!voteError) {
        poll.has_voted = !!voteData;
      }
    }
    
    // Get vote counts for each option
    const { data: votesData, error: votesError } = await supabase
      .from('poll_votes')
      .select('options')
      .eq('poll_id', pollId);
    
    if (!votesError && votesData) {
      // Count votes for each option
      const voteCounts: Record<string, number> = {};
      let totalVotes = 0;
      
      votesData.forEach(vote => {
        const options = vote.options as Record<string, boolean>;
        Object.entries(options).forEach(([optionId, selected]) => {
          if (selected) {
            voteCounts[optionId] = (voteCounts[optionId] || 0) + 1;
            totalVotes++;
          }
        });
      });
      
      // Update the poll options with vote counts and percentages
      poll.options = poll.options.map(option => {
        const votes = voteCounts[option.id] || 0;
        const percentage = totalVotes > 0 ? (votes / votesData.length) * 100 : 0;
        return {
          ...option,
          votes,
          percentage: Math.round(percentage * 10) / 10 // Round to 1 decimal place
        };
      });
      
      poll.votes_count = votesData.length;
    }
    
    return poll;
  } catch (error) {
    console.error("Error fetching poll:", error);
    throw error;
  }
};

// Fetch polls for a specific discussion topic
export const fetchPollsForTopic = async (topicId: string): Promise<Poll[]> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match our application schema
    return (data || []).map(poll => transformPollData(poll));
  } catch (error) {
    console.error("Error fetching polls for topic:", error);
    throw error;
  }
};

// Fetch votes for a specific poll
export const fetchVotesForPoll = async (pollId: string): Promise<PollVote[]> => {
  try {
    const { data, error } = await supabase
      .from('poll_votes')
      .select('*')
      .eq('poll_id', pollId);
    
    if (error) throw error;
    
    // Process the options to ensure they are properly typed as Record<string, boolean>
    return (data || []).map(vote => {
      // Ensure options is properly typed as Record<string, boolean>
      let parsedOptions: Record<string, boolean> = {};
      
      // Handle different possible formats of the options
      if (typeof vote.options === 'string') {
        try {
          parsedOptions = JSON.parse(vote.options);
        } catch (e) {
          console.error("Error parsing options string:", e);
        }
      } else if (vote.options && typeof vote.options === 'object') {
        // Convert the Json type to Record<string, boolean>
        Object.entries(vote.options as object).forEach(([key, value]) => {
          parsedOptions[key] = Boolean(value);
        });
      }
      
      return {
        id: vote.id,
        pollId: vote.poll_id,
        userId: vote.user_id,
        options: parsedOptions,
        createdAt: vote.created_at
      };
    });
  } catch (error) {
    console.error("Error fetching poll votes:", error);
    throw error;
  }
};

// Check if a user has voted on a specific poll
export const hasUserVotedOnPoll = async (pollId: string, userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error("Error checking if user voted:", error);
    throw error;
  }
};

// Get poll results with vote counts and percentages
export const getPollResults = async (pollId: string): Promise<Poll> => {
  try {
    // First get the poll details
    const poll = await fetchPollById(pollId);
    
    if (!poll) {
      throw new Error("Poll not found");
    }
    
    // Get all votes for this poll
    const { data: votesData, error: votesError } = await supabase
      .from('poll_votes')
      .select('options')
      .eq('poll_id', pollId);
    
    if (votesError) throw votesError;
    
    // Count votes for each option
    const voteCounts: Record<string, number> = {};
    let totalVotes = 0;
    
    (votesData || []).forEach(vote => {
      const options = vote.options as Record<string, boolean>;
      Object.entries(options).forEach(([optionId, selected]) => {
        if (selected) {
          voteCounts[optionId] = (voteCounts[optionId] || 0) + 1;
          totalVotes++;
        }
      });
    });
    
    // Update the poll options with vote counts and percentages
    poll.options = poll.options.map(option => {
      const votes = voteCounts[option.id] || 0;
      const percentage = totalVotes > 0 ? (votes / (votesData?.length || 1)) * 100 : 0;
      return {
        ...option,
        votes,
        percentage: Math.round(percentage * 10) / 10 // Round to 1 decimal place
      };
    });
    
    poll.votes_count = votesData?.length || 0;
    
    return poll;
  } catch (error) {
    console.error("Error getting poll results:", error);
    throw error;
  }
};
