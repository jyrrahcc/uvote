import { supabase } from "@/integrations/supabase/client";
import { Poll, PollResults, PollVoter } from "@/types/discussions";

const transformPoll = (pollData: any): Poll => {
  return {
    id: pollData.id,
    question: pollData.question,
    options: pollData.options as Record<string, string>, // Explicitly cast to the expected type
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
    userId: voter.user_id || voter.id || 'unknown',  // Add userId
    firstName: voter.first_name || voter.firstName,
    lastName: voter.last_name || voter.lastName,
    imageUrl: voter.image_url
  }));
};

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
      .single();

    if (error) {
      console.error("Error fetching poll:", error);
      return null;
    }

    return transformPoll(data);
  } catch (error) {
    console.error("Error fetching poll:", error);
    return null;
  }
};

export const getPollResults = async (pollId: string): Promise<PollResults[]> => {
  try {
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .select('options')
      .eq('id', pollId)
      .single();

    if (pollError) {
      console.error("Error fetching poll options:", pollError);
      return [];
    }

    const options = pollData?.options || {};
    const optionKeys = Object.keys(options);

    const results: PollResults[] = [];

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
        .eq('option_id', optionId);

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
