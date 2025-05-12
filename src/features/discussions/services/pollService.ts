
import { supabase } from "@/integrations/supabase/client";
import { Poll, PollVote, PollResults } from "@/types/discussions";
import { toast } from "sonner";

export const fetchPolls = async (electionId: string): Promise<Poll[]> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select(`
        *,
        profiles:created_by(first_name, last_name, image_url)
      `)
      .eq('election_id', electionId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data.map(poll => ({
      ...poll,
      author: poll.profiles
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
        profiles:created_by(first_name, last_name, image_url)
      `)
      .eq('id', pollId)
      .single();
      
    if (error) throw error;
    
    return {
      ...data,
      author: data.profiles
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
  description: string | null = null,
  topicId: string | null = null,
  multipleChoice: boolean = false,
  endsAt: string | null = null
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
        ends_at: endsAt,
        is_closed: false
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

export const votePoll = async (
  pollId: string,
  selectedOptions: string[]
): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getSession();
    if (!userData.session) throw new Error("User not authenticated");
    
    const userId = userData.session.user.id;
    
    // Check if user has already voted
    const { data: existingVote } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (existingVote) {
      // Update existing vote
      const { error } = await supabase
        .from('poll_votes')
        .update({ options: selectedOptions })
        .eq('id', existingVote.id);
      
      if (error) throw error;
      
      toast.success("Your vote has been updated");
    } else {
      // Create new vote
      const { error } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          user_id: userId,
          options: selectedOptions
        });
      
      if (error) throw error;
      
      toast.success("Your vote has been recorded");
    }
    
    return true;
  } catch (error: any) {
    console.error("Error voting:", error);
    toast.error(`Failed to record vote: ${error.message}`);
    return false;
  }
};

export const getUserVote = async (pollId: string): Promise<string[] | null> => {
  try {
    const { data: userData } = await supabase.auth.getSession();
    if (!userData.session) return null;
    
    const userId = userData.session.user.id;
    
    const { data, error } = await supabase
      .from('poll_votes')
      .select('options')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    return data?.options || null;
  } catch (error) {
    console.error("Error getting user vote:", error);
    return null;
  }
};

export const getPollResults = async (pollId: string): Promise<PollResults[]> => {
  try {
    // Get the poll to get the options
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('options')
      .eq('id', pollId)
      .single();
    
    if (pollError) throw pollError;
    
    // Get all votes for this poll
    const { data: votes, error: votesError } = await supabase
      .from('poll_votes')
      .select('options')
      .eq('poll_id', pollId);
    
    if (votesError) throw votesError;
    
    const options = poll.options as Record<string, string>;
    const results: PollResults[] = [];
    
    // Count votes for each option
    const optionCounts: Record<string, number> = {};
    
    // Initialize counts
    Object.keys(options).forEach(optionId => {
      optionCounts[optionId] = 0;
    });
    
    // Count votes
    votes.forEach(vote => {
      (vote.options as string[]).forEach(optionId => {
        if (optionCounts[optionId] !== undefined) {
          optionCounts[optionId]++;
        }
      });
    });
    
    const totalVotes = votes.length;
    
    // Format results
    Object.entries(options).forEach(([optionId, optionText]) => {
      const votes = optionCounts[optionId] || 0;
      const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
      
      results.push({
        optionId,
        optionText,
        votes,
        percentage
      });
    });
    
    return results;
  } catch (error) {
    console.error("Error getting poll results:", error);
    return [];
  }
};
