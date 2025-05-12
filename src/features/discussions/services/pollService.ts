
import { supabase } from "@/integrations/supabase/client";
import { Poll, PollVote, PollResults } from "@/types/discussions";
import { toast } from "sonner";

export const fetchPolls = async (electionId: string): Promise<Poll[]> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select(`
        *,
        author:profiles(first_name, last_name, image_url)
      `)
      .eq('election_id', electionId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Transform the data to match our types
    return (data || []).map(poll => ({
      ...poll,
      options: poll.options as Record<string, string>,
      author: poll.author as { first_name: string, last_name: string, image_url: string | null }
    })) as Poll[];
  } catch (error) {
    console.error("Error fetching polls:", error);
    return [];
  }
};

export const fetchPollById = async (pollId: string): Promise<Poll | null> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select(`
        *,
        author:profiles(first_name, last_name, image_url)
      `)
      .eq('id', pollId)
      .single();
      
    if (error) throw error;
    
    // Transform the data to match our types
    return {
      ...data,
      options: data.options as Record<string, string>,
      author: data.author as { first_name: string, last_name: string, image_url: string | null }
    } as Poll;
  } catch (error) {
    console.error("Error fetching poll:", error);
    return null;
  }
};

export const createPoll = async (
  electionId: string,
  question: string,
  options: Record<string, string>,
  description: string | null,
  topicId: string | null,
  multipleChoice: boolean | null,
  endsAt: string | null
): Promise<Poll | null> => {
  try {
    const { data: userData } = await supabase.auth.getSession();
    if (!userData.session) throw new Error("User not authenticated");
    
    const userId = userData.session.user.id;
    
    const { data, error } = await supabase
      .from('polls')
      .insert({
        election_id: electionId,
        topic_id: topicId,
        created_by: userId,
        question,
        description,
        options,
        multiple_choice: multipleChoice,
        ends_at: endsAt
      })
      .select()
      .single();
      
    if (error) throw error;
    
    toast.success("Poll created successfully");
    return data as Poll;
  } catch (error: any) {
    console.error("Error creating poll:", error);
    toast.error(`Failed to create poll: ${error.message}`);
    return null;
  }
};

export const updatePoll = async (
  pollId: string,
  updates: Partial<Poll>
): Promise<Poll | null> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .update(updates)
      .eq('id', pollId)
      .select()
      .single();
      
    if (error) throw error;
    
    toast.success("Poll updated successfully");
    return data as Poll;
  } catch (error: any) {
    console.error("Error updating poll:", error);
    toast.error(`Failed to update poll: ${error.message}`);
    return null;
  }
};

export const deletePoll = async (pollId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId);
      
    if (error) throw error;
    
    toast.success("Poll deleted successfully");
    return true;
  } catch (error: any) {
    console.error("Error deleting poll:", error);
    toast.error(`Failed to delete poll: ${error.message}`);
    return false;
  }
};

export const fetchPollResults = async (pollId: string): Promise<PollResults[]> => {
  try {
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('options')
      .eq('id', pollId)
      .single();
    
    if (pollError) throw pollError;
    
    const options = poll.options as Record<string, string>;
    
    const { data: votes, error: votesError } = await supabase
      .from('poll_votes')
      .select('options')
      .eq('poll_id', pollId);
    
    if (votesError) throw votesError;
    
    const results: PollResults[] = [];
    const optionVotes: Record<string, number> = {};
    let totalVotes = 0;
    
    // Count votes for each option
    votes.forEach(vote => {
      const voteOptions = vote.options as string[];
      voteOptions.forEach(optionId => {
        optionVotes[optionId] = (optionVotes[optionId] || 0) + 1;
        totalVotes++;
      });
    });
    
    // Calculate results for each option
    Object.entries(options).forEach(([optionId, optionText]) => {
      const votes = optionVotes[optionId] || 0;
      const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
      
      results.push({
        optionId,
        optionText,
        votes,
        percentage
      });
    });
    
    return results.sort((a, b) => b.votes - a.votes);
  } catch (error) {
    console.error("Error fetching poll results:", error);
    return [];
  }
};

export const fetchUserVote = async (pollId: string): Promise<PollVote | null> => {
  try {
    const { data: userData } = await supabase.auth.getSession();
    if (!userData.session) return null;
    
    const userId = userData.session.user.id;
    
    const { data, error } = await supabase
      .from('poll_votes')
      .select('*')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No votes found
        return null;
      }
      throw error;
    }
    
    return data as PollVote;
  } catch (error) {
    console.error("Error fetching user vote:", error);
    return null;
  }
};

export const votePoll = async (pollId: string, options: string[]): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getSession();
    if (!userData.session) throw new Error("User not authenticated");
    
    const userId = userData.session.user.id;
    
    // Check if user already voted
    const existingVote = await fetchUserVote(pollId);
    
    if (existingVote) {
      // Update existing vote
      const { error } = await supabase
        .from('poll_votes')
        .update({ options })
        .eq('id', existingVote.id);
      
      if (error) throw error;
    } else {
      // Create new vote
      const { error } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          user_id: userId,
          options
        });
      
      if (error) throw error;
    }
    
    toast.success("Vote recorded successfully");
    return true;
  } catch (error: any) {
    console.error("Error voting:", error);
    toast.error(`Failed to vote: ${error.message}`);
    return false;
  }
};
