
import { supabase } from "@/integrations/supabase/client";
import { Poll, PollResults, PollVoter } from "@/types/discussions";

// Transform data from snake_case DB format to camelCase TypeScript models
const transformPoll = (pollData: any): Poll => {
  return {
    id: pollData.id,
    question: pollData.question,
    options: pollData.options,
    description: pollData.description || null,
    electionId: pollData.election_id,
    topicId: pollData.topic_id,
    createdBy: pollData.created_by,
    createdAt: pollData.created_at,
    endsAt: pollData.ends_at,
    isClosed: pollData.is_closed || false,
    multipleChoice: pollData.multiple_choice || false,
    author: pollData.author ? {
      id: pollData.author.id,
      firstName: pollData.author.first_name,
      lastName: pollData.author.last_name,
      imageUrl: pollData.author.image_url
    } : null
  };
};

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

// Create a new poll
export const createPoll = async (
  electionId: string,
  question: string,
  options: Record<string, string>,
  description?: string | null,
  topicId?: string | null,
  multipleChoice?: boolean,
  endsAt?: string | null
): Promise<Poll | null> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const pollData = {
      question,
      options,
      description: description || null,
      election_id: electionId,
      topic_id: topicId || null,
      created_by: userData.user.id,
      multiple_choice: multipleChoice || false,
      ends_at: endsAt || null
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

// Update a poll
export const updatePoll = async (
  pollId: string,
  updates: Partial<Poll>
): Promise<Poll | null> => {
  try {
    const dbUpdates: Record<string, any> = {};
    
    if (updates.question !== undefined) dbUpdates.question = updates.question;
    if (updates.options !== undefined) dbUpdates.options = updates.options;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.isClosed !== undefined) dbUpdates.is_closed = updates.isClosed;
    if (updates.multipleChoice !== undefined) dbUpdates.multiple_choice = updates.multipleChoice;
    if (updates.endsAt !== undefined) dbUpdates.ends_at = updates.endsAt;

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
    // First delete all votes associated with the poll
    const { error: votesError } = await supabase
      .from('poll_votes')
      .delete()
      .eq('poll_id', pollId);

    if (votesError) {
      console.error("Error deleting poll votes:", votesError);
      return false;
    }

    // Then delete the poll itself
    const { error: pollError } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId);

    if (pollError) {
      console.error("Error deleting poll:", pollError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting poll:", error);
    return false;
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

    // Get all votes for this poll
    const { data: votesData, error: votesError } = await supabase
      .from('poll_votes')
      .select(`
        id,
        options,
        user_id,
        profiles:user_id (
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
        .map(vote => {
          if (!vote.profiles) return null;
          return {
            userId: vote.user_id,
            firstName: vote.profiles.first_name,
            lastName: vote.profiles.last_name,
            imageUrl: vote.profiles.image_url
          };
        })
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

// Vote in a poll
export const vote = async (pollId: string, options: string[]): Promise<boolean> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    // Check if user has already voted
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

    if (existingVote) {
      // Update existing vote
      const { error: updateError } = await supabase
        .from('poll_votes')
        .update({ options })
        .eq('id', existingVote.id);

      if (updateError) {
        console.error("Error updating vote:", updateError);
        return false;
      }
    } else {
      // Create new vote
      const { error: insertError } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          user_id: userData.user.id,
          options
        });

      if (insertError) {
        console.error("Error creating vote:", insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error voting:", error);
    return false;
  }
};
