
import { supabase } from "@/integrations/supabase/client";
import { Poll, PollResults, PollVoter } from "@/types/discussions";
import { transformPoll } from "./pollTransformUtils";

// Get all polls for an election
export const getPolls = async (electionId: string): Promise<Poll[]> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select(`
        *,
        profiles:created_by(
          id,
          first_name,
          last_name,
          image_url
        )
      `)
      .eq('election_id', electionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching polls:", error);
      return [];
    }

    return data.map(transformPoll);
  } catch (error) {
    console.error("Error fetching polls:", error);
    return [];
  }
};

// Get a specific poll by ID with author data
export const getPoll = async (pollId: string): Promise<Poll | null> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select(`
        *,
        profiles:created_by(
          id,
          first_name,
          last_name,
          image_url
        )
      `)
      .eq('id', pollId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching poll:", error);
      return null;
    }

    if (!data) {
      console.error("Poll not found:", pollId);
      return null;
    }

    return transformPoll(data);
  } catch (error) {
    console.error("Error fetching poll:", error);
    return null;
  }
};

// Get user's vote on a specific poll
export const getUserVote = async (pollId: string, userId: string): Promise<string[] | null> => {
  try {
    const { data, error } = await supabase
      .from('poll_votes')
      .select('options')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user vote:", error);
      return null;
    }

    if (!data) {
      return null;
    }
    
    // Convert options from JSON to array of selected option IDs
    const options = data.options as Record<string, boolean>;
    const selectedOptions = Object.entries(options)
      .filter(([_, isSelected]) => isSelected)
      .map(([optionId]) => optionId);
    
    return selectedOptions;
  } catch (error) {
    console.error("Error fetching user vote:", error);
    return null;
  }
};

// Calculate poll results
export const getPollResults = async (pollId: string): Promise<PollResults[]> => {
  try {
    // First, get the poll to get the options
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .select('options')
      .eq('id', pollId)
      .maybeSingle();

    if (pollError || !pollData) {
      console.error("Error fetching poll options:", pollError);
      return [];
    }

    // Get all votes for this poll
    const { data: votesData, error: votesError } = await supabase
      .from('poll_votes')
      .select(`
        id,
        options,
        user_id,
        user:user_id(
          id,
          first_name:first_name,
          last_name:last_name,
          image_url
        )
      `)
      .eq('poll_id', pollId);

    if (votesError) {
      console.error("Error fetching poll votes:", votesError);
      return [];
    }

    // Process results
    const pollOptions = pollData.options as Record<string, string>;
    const optionsMap: Record<string, PollResults> = {};
    let totalVotes = 0;

    // Initialize results for each option
    Object.entries(pollOptions).forEach(([optionId, optionText]) => {
      optionsMap[optionId] = {
        optionId,
        optionText,
        votes: 0,
        percentage: 0,
        voters: []
      };
    });

    // Count votes for each option
    votesData.forEach((vote) => {
      const selectedOptions = vote.options as Record<string, boolean>;
      
      for (const optionId in selectedOptions) {
        if (selectedOptions[optionId] && optionsMap[optionId]) {
          optionsMap[optionId].votes += 1;
          totalVotes += 1;
          
          // Add voter information if available
          if (vote.user) {
            const voter: PollVoter = {
              userId: vote.user.id,
              firstName: vote.user.first_name,
              lastName: vote.user.last_name,
              imageUrl: vote.user.image_url
            };
            optionsMap[optionId].voters.push(voter);
          }
        }
      }
    });

    // Calculate percentages
    if (totalVotes > 0) {
      Object.values(optionsMap).forEach(option => {
        option.percentage = Math.round((option.votes / totalVotes) * 100);
      });
    }

    return Object.values(optionsMap);
  } catch (error) {
    console.error("Error calculating poll results:", error);
    return [];
  }
};
