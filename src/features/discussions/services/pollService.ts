import { supabase } from "@/integrations/supabase/client";
import { Poll, PollResults, PollVoter } from "@/types/discussions";

// Transform data from snake_case DB format to camelCase TypeScript models
const transformPoll = (pollData: any): Poll => {
  return {
    id: pollData.id,
    question: pollData.question,
    options: pollData.options as Record<string, string>,
    description: pollData.description || '',
    electionId: pollData.election_id,
    topicId: pollData.topic_id || null,
    createdBy: pollData.created_by,
    createdAt: pollData.created_at,
    endsAt: pollData.ends_at || null,
    isClosed: pollData.is_closed,
    multipleChoice: pollData.multiple_choice,
    author: pollData.author ? {
      id: pollData.author.id,
      firstName: pollData.author.first_name,
      lastName: pollData.author.last_name,
      imageUrl: pollData.author.image_url
    } : null
  };
};

const transformVoters = (voters: any[]): PollVoter[] => {
  return voters.map(voter => ({
    userId: voter.user_id || voter.id || 'unknown',
    firstName: voter.first_name || voter.firstName,
    lastName: voter.last_name || voter.lastName,
    imageUrl: voter.image_url || voter.imageUrl
  }));
};

// Get all polls for an election
export const fetchPolls = async (electionId: string): Promise<Poll[]> => {
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
export const fetchPollById = async (pollId: string): Promise<Poll | null> => {
  return getPoll(pollId);
};

// Original function kept for compatibility
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
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .select('options')
      .eq('id', pollId)
      .maybeSingle();

    if (pollError) {
      console.error("Error fetching poll options:", pollError);
      return [];
    }
    
    if (!pollData) {
      return [];
    }

    const options = pollData?.options || {};
    const optionKeys = Object.keys(options);

    const results: PollResults[] = [];

    // For each option, get the votes
    for (const optionId of optionKeys) {
      const { data: votes, error: voteError } = await supabase
        .from('poll_votes')
        .select(`
          user_id,
          profiles (
            first_name,
            last_name,
            image_url
          )
        `)
        .eq('poll_id', pollId)
        .contains('options', [optionId]);

      if (voteError) {
        console.error(`Error fetching votes for option ${optionId}:`, voteError);
        continue;
      }

      const voters = votes?.map(vote => ({
        userId: vote.user_id,
        firstName: vote.profiles?.first_name || 'Unknown',
        lastName: vote.profiles?.last_name || 'Voter',
        imageUrl: vote.profiles?.image_url || null
      })) || [];

      const result: PollResults = {
        optionId: optionId,
        optionText: options[optionId],
        votes: votes?.length || 0,
        percentage: 0, // will be calculated later
        voters: transformVoters(voters)
      };
      results.push(result);
    }

    // Calculate percentages
    const totalVotes = results.reduce((sum, result) => sum + result.votes, 0);
    results.forEach(result => {
      result.percentage = totalVotes > 0 ? (result.votes / totalVotes) * 100 : 0;
    });

    return results;
  } catch (error) {
    console.error("Error fetching poll results:", error);
    return [];
  }
};

// Create a new poll
export const createPoll = async (
  electionId: string,
  question: string,
  options: Record<string, string>,
  topicId: string | null = null,
  description: string | null = null,
  multipleChoice: boolean = false,
  endsAt: string | null = null
): Promise<Poll | null> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const pollData = {
      question,
      options,
      description,
      election_id: electionId,
      topic_id: topicId,
      created_by: userData.user.id,
      multiple_choice: multipleChoice,
      ends_at: endsAt,
      is_closed: false
    };

    const { data, error } = await supabase
      .from('polls')
      .insert([pollData])
      .select(`
        *,
        author:profiles (
          id,
          first_name,
          last_name,
          image_url
        )
      `)
      .maybeSingle();

    if (error) {
      console.error("Error creating poll:", error);
      return null;
    }
    
    if (!data) {
      return null;
    }

    return transformPoll(data);
  } catch (error) {
    console.error("Error creating poll:", error);
    return null;
  }
};

// Update an existing poll
export const updatePoll = async (pollId: string, updates: Partial<Poll>): Promise<Poll | null> => {
  try {
    // Convert camelCase to snake_case for database fields
    const dbUpdates: Record<string, any> = {};
    
    if (updates.question !== undefined) dbUpdates.question = updates.question;
    if (updates.options !== undefined) dbUpdates.options = updates.options;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.topicId !== undefined) dbUpdates.topic_id = updates.topicId;
    if (updates.multipleChoice !== undefined) dbUpdates.multiple_choice = updates.multipleChoice;
    if (updates.endsAt !== undefined) dbUpdates.ends_at = updates.endsAt;
    if (updates.isClosed !== undefined) dbUpdates.is_closed = updates.isClosed;
    
    const { data, error } = await supabase
      .from('polls')
      .update(dbUpdates)
      .eq('id', pollId)
      .select(`
        *,
        author:profiles (
          id,
          first_name,
          last_name,
          image_url
        )
      `)
      .maybeSingle();

    if (error) {
      console.error("Error updating poll:", error);
      return null;
    }
    
    if (!data) {
      return null;
    }

    return transformPoll(data);
  } catch (error) {
    console.error("Error updating poll:", error);
    return null;
  }
};

// Delete a poll
export const deletePoll = async (pollId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId);

    if (error) {
      console.error("Error deleting poll:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting poll:", error);
    return false;
  }
};

// Vote on a poll
export const votePoll = async (pollId: string, optionIds: string[]): Promise<boolean> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    // First check if user already voted on this poll
    const { data: existingVote, error: checkError } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing vote:", checkError);
      return false;
    }

    // If user already voted, update their vote
    if (existingVote) {
      const { error: updateError } = await supabase
        .from('poll_votes')
        .update({ options: optionIds })
        .eq('poll_id', pollId)
        .eq('user_id', userData.user.id);

      if (updateError) {
        console.error("Error updating vote:", updateError);
        return false;
      }
    } else {
      // Otherwise create a new vote
      const { error: insertError } = await supabase
        .from('poll_votes')
        .insert([{
          poll_id: pollId,
          user_id: userData.user.id,
          options: optionIds
        }]);

      if (insertError) {
        console.error("Error casting vote:", insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error voting on poll:", error);
    return false;
  }
};

// Get the user's vote for a poll
export const fetchUserVote = async (pollId: string): Promise<{ options: string[] } | null> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return null;
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

    return data;
  } catch (error) {
    console.error("Error fetching user vote:", error);
    return null;
  }
};

// Alias for getPollResults for API consistency
export const fetchPollResults = async (pollId: string): Promise<PollResults[]> => {
  return getPollResults(pollId);
};
