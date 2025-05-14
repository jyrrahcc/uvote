import { supabase } from "@/integrations/supabase/client";
import { Poll, PollVote, PollResults } from "@/types/discussions";
import { toast } from "@/hooks/use-toast";

export const fetchPolls = async (electionId: string, topicId?: string | null): Promise<Poll[]> => {
  try {
    // Build the query based on whether we want polls for a specific topic
    let query = supabase
      .from('polls')
      .select('*')
      .eq('election_id', electionId)
      .order('created_at', { ascending: false });
      
    // If topicId is provided, filter by it
    if (topicId) {
      query = query.eq('topic_id', topicId);
    }
    
    const { data: pollsData, error } = await query;
    
    if (error) {
      console.error("Error fetching polls:", error);
      throw error;
    }
    
    if (!pollsData || pollsData.length === 0) {
      console.log("No polls found for election:", electionId);
      return [];
    }
    
    // For each poll, fetch the author information
    const pollsWithAuthors = await Promise.all(
      pollsData.map(async (poll) => {
        const { data: authorData, error: authorError } = await supabase
          .from('profiles')
          .select('first_name, last_name, image_url')
          .eq('id', poll.created_by)
          .single();
          
        if (authorError) {
          console.warn(`Could not fetch author data for poll ${poll.id}:`, authorError);
          return {
            ...poll,
            author: null
          };
        }
        
        return {
          ...poll,
          author: authorData
        };
      })
    );
    
    console.log("Loaded polls:", pollsWithAuthors);
    return pollsWithAuthors as Poll[];
  } catch (error) {
    console.error("Error fetching polls:", error);
    throw error;
  }
};

export const fetchPollById = async (pollId: string): Promise<Poll | null> => {
  try {
    // Fetch the poll
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .eq('id', pollId)
      .single();
      
    if (error) {
      console.error("Error fetching poll:", error);
      throw error;
    }
    
    if (!data) {
      console.error("No poll found with ID:", pollId);
      return null;
    }
    
    // Fetch author information separately
    const { data: authorData, error: authorError } = await supabase
      .from('profiles')
      .select('first_name, last_name, image_url')
      .eq('id', data.created_by)
      .single();
      
    if (authorError) {
      console.warn(`Could not fetch author data for poll ${pollId}:`, authorError);
    }
    
    const poll = {
      ...data,
      author: authorData || null
    } as Poll;
    
    return poll;
  } catch (error) {
    console.error("Error fetching poll:", error);
    return null;
  }
};

export const createPoll = async (
  electionId: string,
  topicId: string | null,
  question: string,
  options: Record<string, string>,
  description?: string | null,
  multipleChoice: boolean = false,
  endsAt?: string | null
): Promise<Poll | null> => {
  try {
    const { data: userData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Session error:", sessionError);
      throw sessionError;
    }
    if (!userData.session) {
      console.error("No user session found");
      throw new Error("User not authenticated");
    }

    const userId = userData.session.user.id;

    const { data, error } = await supabase
      .from('polls')
      .insert({
        election_id: electionId,
        topic_id: topicId,
        created_by: userId,
        question,
        options: options,
        description: description || null,
        multiple_choice: multipleChoice,
        ends_at: endsAt || null
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating poll:", error);
      throw error;
    }

    toast({
      title: "Success",
      description: "Poll created successfully"
    });
    return data as Poll;
  } catch (error: any) {
    console.error("Error creating poll:", error);
    toast({
      title: "Error",
      description: `Failed to create poll: ${error.message}`,
      variant: "destructive"
    });
    return null;
  }
};

export const updatePoll = async (pollId: string, updates: Partial<Poll>): Promise<Poll | null> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .update(updates)
      .eq('id', pollId)
      .select()
      .single();

    if (error) {
      console.error("Error updating poll:", error);
      throw error;
    }

    toast({
      title: "Success",
      description: "Poll updated successfully"
    });
    return data as Poll;
  } catch (error: any) {
    console.error("Error updating poll:", error);
    toast({
      title: "Error",
      description: `Failed to update poll: ${error.message}`,
      variant: "destructive"
    });
    return null;
  }
};

export const deletePoll = async (pollId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId);

    if (error) {
      console.error("Error deleting poll:", error);
      throw error;
    }

    toast({
      title: "Success",
      description: "Poll deleted successfully"
    });
    return true;
  } catch (error: any) {
    console.error("Error deleting poll:", error);
    toast({
      title: "Error",
      description: `Failed to delete poll: ${error.message}`,
      variant: "destructive"
    });
    return false;
  }
};

export const votePoll = async (pollId: string, options: string[]): Promise<PollVote | null> => {
  try {
    const { data: userData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Session error:", sessionError);
      throw sessionError;
    }
    if (!userData.session) {
      console.error("No user session found");
      throw new Error("User not authenticated");
    }

    const userId = userData.session.user.id;

    // Ensure options is not null and is an array
    if (!Array.isArray(options)) {
      console.error("Options must be an array");
      throw new Error("Options must be an array");
    }

    const { data, error } = await supabase
      .from('poll_votes')
      .insert({
        poll_id: pollId,
        user_id: userId,
        options: options as any, // Cast options to Json
      })
      .select()
      .single();

    if (error) {
      console.error("Error voting on poll:", error);
      throw error;
    }

    toast({
      title: "Success",
      description: "Voted on poll successfully"
    });
    return data as PollVote;
  } catch (error: any) {
    console.error("Error voting on poll:", error);
    toast({
      title: "Error",
      description: `Failed to vote on poll: ${error.message}`,
      variant: "destructive"
    });
    return null;
  }
};

export const fetchPollResults = async (pollId: string): Promise<PollResults[]> => {
  try {
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .select('options')
      .eq('id', pollId)
      .single();

    if (pollError) {
      console.error("Error fetching poll options:", pollError);
      throw pollError;
    }

    if (!pollData) {
      console.error("Poll not found");
      return [];
    }

    const options = pollData.options as Record<string, string>;

    const { data: voteData, error: voteError } = await supabase
      .from('poll_votes')
      .select('options')
      .eq('poll_id', pollId);

    if (voteError) {
      console.error("Error fetching poll votes:", voteError);
      throw voteError;
    }

    const results: { [optionId: string]: number } = {};
    Object.keys(options).forEach(optionId => {
      results[optionId] = 0;
    });

    voteData.forEach(vote => {
      const selectedOptions = vote.options as string[];
      selectedOptions.forEach(optionId => {
        if (results[optionId] !== undefined) {
          results[optionId]++;
        }
      });
    });

    const totalVotes = voteData.length;

    const pollResults: PollResults[] = Object.entries(options).map(([optionId, optionText]) => ({
      optionId,
      optionText,
      votes: results[optionId] || 0,
      percentage: totalVotes > 0 ? ((results[optionId] || 0) / totalVotes) * 100 : 0,
    }));

    return pollResults;
  } catch (error) {
    console.error("Error fetching poll results:", error);
    return [];
  }
};

export const fetchUserVote = async (pollId: string): Promise<PollVote | null> => {
  try {
    const { data: userData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Session error:", sessionError);
      throw sessionError;
    }
    if (!userData.session) {
      console.error("No user session found");
      return null;
    }

    const userId = userData.session.user.id;

    const { data, error } = await supabase
      .from('poll_votes')
      .select('*')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error("Error fetching user's vote:", error);
      return null;
    }

    return data as PollVote;
  } catch (error) {
    console.error("Error fetching user's vote:", error);
    return null;
  }
};

export const calculatePollResults = (options: Record<string, string>, votes: PollVote[]): PollResults[] => {
  const results: { [optionId: string]: number } = {};
  Object.keys(options).forEach(optionId => {
    results[optionId] = 0;
  });

  votes.forEach(vote => {
    const selectedOptions = vote.options as string[];
    selectedOptions.forEach(optionId => {
      if (results[optionId] !== undefined) {
        results[optionId]++;
      }
    });
  });

  const totalVotes = votes.length;

  const pollResults: PollResults[] = Object.entries(options).map(([optionId, optionText]) => ({
    optionId,
    optionText,
    votes: results[optionId] || 0,
    percentage: totalVotes > 0 ? ((results[optionId] || 0) / totalVotes) * 100 : 0,
  }));

  return pollResults;
};
