
import { supabase } from "@/integrations/supabase/client";
import { Poll, PollResults } from "@/types/discussions";
import { toast } from "@/hooks/use-toast";

export const fetchPolls = async (electionId: string): Promise<Poll[]> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select(`
        *,
        author:created_by (
          first_name,
          last_name,
          image_url
        )
      `)
      .eq('election_id', electionId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Explicitly cast the options to the correct type and handle potential null author
    return (data || []).map(poll => ({
      ...poll,
      options: poll.options as Record<string, string>,
      author: poll.author && typeof poll.author === 'object' ? {
        first_name: (poll.author as any).first_name || '',
        last_name: (poll.author as any).last_name || '',
        image_url: (poll.author as any).image_url
      } : undefined
    })) as Poll[];
  } catch (error: any) {
    console.error("Error fetching polls:", error);
    toast({
      title: "Error",
      description: `Failed to fetch polls: ${error.message}`,
      variant: "destructive"
    });
    return [];
  }
};

export const fetchPollById = async (pollId: string): Promise<Poll | null> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select(`
        *,
        author:created_by (
          first_name,
          last_name,
          image_url
        )
      `)
      .eq('id', pollId)
      .single();
    
    if (error) throw error;
    
    // Handle null data
    if (!data) return null;
    
    // Cast the options property to the correct type and handle potential null author
    return {
      ...data,
      options: data.options as Record<string, string>,
      author: data.author && typeof data.author === 'object' ? {
        first_name: (data.author as any).first_name || '',
        last_name: (data.author as any).last_name || '',
        image_url: (data.author as any).image_url
      } : undefined
    } as Poll;
  } catch (error: any) {
    console.error("Error fetching poll:", error);
    toast({
      title: "Error",
      description: `Failed to fetch poll: ${error.message}`,
      variant: "destructive"
    });
    return null;
  }
};

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
    
    if (userError) throw userError;
    if (!userData.user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('polls')
      .insert({
        election_id: electionId,
        topic_id: topicId,
        created_by: userData.user.id,
        question,
        options,
        description,
        multiple_choice: multipleChoice,
        ends_at: endsAt
      })
      .select(`
        *,
        author:created_by (
          first_name,
          last_name,
          image_url
        )
      `)
      .single();
    
    if (error) throw error;
    
    // Handle null data
    if (!data) return null;
    
    // Cast the options property to the correct type and handle potential null author
    return {
      ...data,
      options: data.options as Record<string, string>,
      author: data.author && typeof data.author === 'object' ? {
        first_name: (data.author as any).first_name || '',
        last_name: (data.author as any).last_name || '',
        image_url: (data.author as any).image_url
      } : undefined
    } as Poll;
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
      .select(`
        *,
        author:created_by (
          first_name,
          last_name,
          image_url
        )
      `)
      .single();
    
    if (error) throw error;
    
    // Handle null data
    if (!data) return null;
    
    // Cast the options property to the correct type and handle potential null author
    return {
      ...data,
      options: data.options as Record<string, string>,
      author: data.author && typeof data.author === 'object' ? {
        first_name: (data.author as any).first_name || '',
        last_name: (data.author as any).last_name || '',
        image_url: (data.author as any).image_url
      } : undefined
    } as Poll;
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
    // Delete votes first to avoid foreign key constraints
    const { error: votesError } = await supabase
      .from('poll_votes')
      .delete()
      .eq('poll_id', pollId);
    
    if (votesError) throw votesError;
    
    // Then delete the poll
    const { error } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId);
    
    if (error) throw error;
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

export const votePoll = async (pollId: string, selectedOptions: string[]): Promise<boolean> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw userError;
    if (!userData.user) throw new Error("User not authenticated");
    
    // Check if the user has already voted
    const { data: existingVote, error: checkError } = await supabase
      .from('poll_votes')
      .select('*')
      .eq('poll_id', pollId)
      .eq('user_id', userData.user.id)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    // If the user has already voted, update their vote
    if (existingVote) {
      const { error: updateError } = await supabase
        .from('poll_votes')
        .update({ options: selectedOptions })
        .eq('id', existingVote.id);
      
      if (updateError) throw updateError;
    } else {
      // Otherwise, insert a new vote
      const { error: insertError } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          user_id: userData.user.id,
          options: selectedOptions
        });
      
      if (insertError) throw insertError;
    }
    
    return true;
  } catch (error: any) {
    console.error("Error voting in poll:", error);
    toast({
      title: "Error",
      description: `Failed to vote: ${error.message}`,
      variant: "destructive"
    });
    return false;
  }
};

export const fetchUserVote = async (pollId: string) => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw userError;
    if (!userData.user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('poll_votes')
      .select('*')
      .eq('poll_id', pollId)
      .eq('user_id', userData.user.id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error fetching user vote:", error);
    return null;
  }
};

export const fetchPollResults = async (pollId: string): Promise<PollResults[]> => {
  try {
    // First, get the poll to know the options
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('options')
      .eq('id', pollId)
      .single();
    
    if (pollError) throw pollError;
    if (!poll) throw new Error("Poll not found");
    
    // Then get all votes for this poll
    const { data: votes, error: votesError } = await supabase
      .from('poll_votes')
      .select('options, user_id')
      .eq('poll_id', pollId);
    
    if (votesError) throw votesError;
    
    // Fetch voter profiles for all user IDs
    const userIds = votes?.map(vote => vote.user_id) || [];
    let voterProfiles: Record<string, { firstName: string, lastName: string, imageUrl?: string | null, userId: string }> = {};
    
    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, image_url')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      
      if (profiles) {
        profiles.forEach(profile => {
          voterProfiles[profile.id] = {
            userId: profile.id,
            firstName: profile.first_name,
            lastName: profile.last_name,
            imageUrl: profile.image_url
          };
        });
      }
    }
    
    // Calculate results for each option
    const options = poll.options as Record<string, string>;
    const optionVotes: Record<string, Set<string>> = {};
    
    // Initialize vote counters for each option
    Object.keys(options).forEach(optionId => {
      optionVotes[optionId] = new Set();
    });
    
    // Count votes
    votes?.forEach(vote => {
      (vote.options as string[]).forEach(optionId => {
        if (optionVotes[optionId]) {
          optionVotes[optionId].add(vote.user_id);
        }
      });
    });
    
    // Calculate total number of unique voters
    const totalVoters = votes?.length || 0;
    
    // Prepare results
    const results: PollResults[] = Object.keys(options).map(optionId => {
      const voterIds = Array.from(optionVotes[optionId]);
      return {
        optionId,
        optionText: options[optionId],
        votes: optionVotes[optionId].size,
        percentage: totalVoters > 0 ? (optionVotes[optionId].size / totalVoters) * 100 : 0,
        voters: voterIds.map(userId => ({
          userId,
          firstName: voterProfiles[userId]?.firstName || '',
          lastName: voterProfiles[userId]?.lastName || '',
          imageUrl: voterProfiles[userId]?.imageUrl
        }))
      };
    });
    
    // Sort by votes, highest first
    return results.sort((a, b) => b.votes - a.votes);
  } catch (error: any) {
    console.error("Error fetching poll results:", error);
    toast({
      title: "Error",
      description: `Failed to fetch poll results: ${error.message}`,
      variant: "destructive"
    });
    return [];
  }
};
