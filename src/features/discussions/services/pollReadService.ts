
import { supabase } from "@/integrations/supabase/client";
import { Poll, PollResults, PollVoter } from "@/types";
import { transformPoll, transformVoter } from "./pollTransformUtils";

// Get all polls for an election
export const getPolls = async (electionId: string): Promise<Poll[]> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select(`
        *,
        author:profiles (
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

// Get a single poll by ID
export const getPoll = async (pollId: string): Promise<Poll | null> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select(`
        *,
        author:profiles (
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

// Get poll results
export const getPollResults = async (pollId: string): Promise<PollResults[]> => {
  try {
    // Get the poll to get its options
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .select('options')
      .eq('id', pollId)
      .maybeSingle();

    if (pollError || !pollData) {
      console.error("Error fetching poll options:", pollError);
      return [];
    }

    // Get all votes for this poll and directly join with profiles
    const { data: votesData, error: votesError } = await supabase
      .from('poll_votes')
      .select(`
        id,
        options,
        user_id,
        user:profiles (
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

    // Log the voter data structure for debugging
    console.log("Vote data structure:", votesData[0]);

    // Count votes for each option
    const options = pollData.options as Record<string, string>;
    const optionIds = Object.keys(options);
    const totalVotes = votesData.length;
    
    const results: PollResults[] = optionIds.map(optionId => {
      // Count votes for this option
      const votes = votesData.filter(vote => {
        const voteOptions = vote.options as string[];
        return voteOptions.includes(optionId);
      }).length;
      
      // Get voters who selected this option
      const voters: PollVoter[] = votesData
        .filter(vote => {
          const voteOptions = vote.options as string[];
          return voteOptions.includes(optionId);
        })
        .map(transformVoter)
        .filter((voter): voter is PollVoter => voter !== null);

      return {
        optionId,
        optionText: options[optionId],
        votes,
        percentage: totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0,
        voters
      };
    });

    // Sort by number of votes (descending)
    return results.sort((a, b) => b.votes - a.votes);
  } catch (error) {
    console.error("Error getting poll results:", error);
    return [];
  }
};

// Get user's vote for a poll
export const getUserVote = async (pollId: string): Promise<string[] | null> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return null; // User not authenticated
    }

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
      return null; // User hasn't voted
    }

    return data.options as string[];
  } catch (error) {
    console.error("Error getting user vote:", error);
    return null;
  }
};
