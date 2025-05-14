
import { supabase } from "@/integrations/supabase/client";
import { Poll } from "@/types";
import { transformPoll } from "./pollTransformUtils";

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
