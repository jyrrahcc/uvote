
import { supabase } from "@/integrations/supabase/client";
import { Poll, PollResults, PollVoter } from "@/types";
import { transformPoll } from "./pollTransformUtils";

/**
 * Get all polls for an election
 */
export const getPolls = async (electionId: string): Promise<Poll[]> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select(`
        *,
        author:profiles(
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

/**
 * Get a single poll by ID
 */
export const getPoll = async (pollId: string): Promise<Poll | null> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select(`
        *,
        author:profiles(
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
      return null;
    }

    return transformPoll(data);
  } catch (error) {
    console.error("Error fetching poll:", error);
    return null;
  }
};

/**
 * Get poll results
 */
export const getPollResults = async (pollId: string): Promise<PollResults[]> => {
  try {
    // First, get the poll details to access the options
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .select('options')
      .eq('id', pollId)
      .single();

    if (pollError || !pollData) {
      console.error("Error fetching poll options:", pollError);
      return [];
    }

    // Then, get all votes for this poll
    const { data: votesData, error: votesError } = await supabase
      .from('poll_votes')
      .select(`
        options,
        voter:profiles(
          id,
          first_name,
          last_name,
          image_url
        )
      `)
      .eq('poll_id', pollId);

    if (votesError) {
      console.error("Error fetching poll votes:", votesError);
      return [];
    }

    // Initialize results for each option
    const optionsMap: Record<string, string> = pollData.options || {};
    const results: Record<string, {
      optionId: string;
      optionText: string;
      votes: number;
      voters: PollVoter[];
    }> = {};

    // Initialize results object with all options
    Object.entries(optionsMap).forEach(([optionId, optionText]) => {
      results[optionId] = {
        optionId,
        optionText: optionText as string,
        votes: 0,
        voters: []
      };
    });

    // Count votes and collect voters
    votesData.forEach(vote => {
      const options = vote.options || {};
      const voter = vote.voter ? {
        userId: vote.voter.id,
        firstName: vote.voter.first_name,
        lastName: vote.voter.last_name,
        imageUrl: vote.voter.image_url
      } : null;

      Object.keys(options).forEach(optionId => {
        if (options[optionId] && results[optionId]) {
          results[optionId].votes++;
          if (voter) {
            results[optionId].voters.push(voter);
          }
        }
      });
    });

    // Calculate percentages and format results
    const totalVotes = Object.values(results).reduce((sum, option) => sum + option.votes, 0);
    
    const formattedResults = Object.values(results).map(option => ({
      optionId: option.optionId,
      optionText: option.optionText,
      votes: option.votes,
      percentage: totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0,
      voters: option.voters
    }));

    // Sort by number of votes descending
    return formattedResults.sort((a, b) => b.votes - a.votes);
  } catch (error) {
    console.error("Error fetching poll results:", error);
    return [];
  }
};

/**
 * Get the user's vote on a poll
 */
export const getUserVote = async (pollId: string): Promise<string[] | null> => {
  try {
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      console.error("User not authenticated:", userError);
      return null;
    }

    // Get user's vote
    const { data, error } = await supabase
      .from('poll_votes')
      .select('options')
      .eq('poll_id', pollId)
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user vote:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Extract selected option IDs
    const selectedOptions = Object.entries(data.options || {})
      .filter(([_, selected]) => selected)
      .map(([optionId]) => optionId);

    return selectedOptions;
  } catch (error) {
    console.error("Error fetching user vote:", error);
    return null;
  }
};
