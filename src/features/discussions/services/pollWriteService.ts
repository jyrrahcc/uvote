
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Poll, PollVote } from "@/types";
import { transformPollData } from "./pollTransformUtils";

// Create a new poll
export const createPoll = async (pollData: Partial<Poll>): Promise<Poll | null> => {
  try {
    // Ensure required fields are present
    if (!pollData.question || !pollData.options || !pollData.electionId || !pollData.createdBy) {
      throw new Error("Missing required fields");
    }

    // Format poll data for database
    const dbPollData = {
      question: pollData.question,
      options: pollData.options,
      description: pollData.description || null,
      election_id: pollData.electionId,
      topic_id: pollData.topicId || null,
      created_by: pollData.createdBy,
      is_closed: pollData.isClosed || false,
      multiple_choice: pollData.multipleChoice || false,
      ends_at: pollData.endsAt || null
    };

    // Insert the poll
    const { data, error } = await supabase
      .from('polls')
      .insert(dbPollData)
      .select()
      .single();

    if (error) throw error;

    // Fetch creator profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, image_url')
      .eq('id', data.created_by)
      .single();

    if (profileError) throw profileError;

    const creator = profile ? {
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      imageUrl: profile.image_url
    } : null;

    // Transform database response to match our interface
    return transformPollData(data, creator);
  } catch (error) {
    console.error("Error creating poll:", error);
    toast.error("Failed to create poll");
    throw error;
  }
};

// Update a poll
export const updatePoll = async (pollId: string, updates: Partial<Poll>): Promise<Poll | null> => {
  try {
    // Format updates for database
    const dbUpdates: Record<string, any> = {};
    
    if (updates.question !== undefined) dbUpdates.question = updates.question;
    if (updates.options !== undefined) dbUpdates.options = updates.options;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.isClosed !== undefined) dbUpdates.is_closed = updates.isClosed;
    if (updates.multipleChoice !== undefined) dbUpdates.multiple_choice = updates.multipleChoice;
    if (updates.endsAt !== undefined) dbUpdates.ends_at = updates.endsAt;

    // Update the poll
    const { data, error } = await supabase
      .from('polls')
      .update(dbUpdates)
      .eq('id', pollId)
      .select()
      .single();

    if (error) throw error;

    // Fetch creator profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, image_url')
      .eq('id', data.created_by)
      .single();

    if (profileError) throw profileError;

    const creator = profile ? {
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      imageUrl: profile.image_url
    } : null;

    // Transform database response to match our interface
    return transformPollData(data, creator);
  } catch (error) {
    console.error("Error updating poll:", error);
    toast.error("Failed to update poll");
    throw error;
  }
};

// Delete a poll
export const deletePoll = async (pollId: string): Promise<boolean> => {
  try {
    // First delete all votes for this poll
    const { error: votesError } = await supabase
      .from('poll_votes')
      .delete()
      .eq('poll_id', pollId);

    if (votesError) throw votesError;

    // Then delete the poll itself
    const { error } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId);

    if (error) throw error;

    toast.success("Poll deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting poll:", error);
    toast.error("Failed to delete poll");
    throw error;
  }
};

// Vote on a poll
export const voteOnPoll = async (
  pollId: string, 
  userId: string, 
  options: Record<string, boolean>
): Promise<boolean> => {
  try {
    // Check if user has already voted
    const { data: existingVote, error: checkError } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', userId);

    if (checkError) throw checkError;

    if (existingVote && existingVote.length > 0) {
      // Update existing vote
      const { error: updateError } = await supabase
        .from('poll_votes')
        .update({ options })
        .eq('poll_id', pollId)
        .eq('user_id', userId);

      if (updateError) throw updateError;
    } else {
      // Create new vote
      const { error: insertError } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          user_id: userId,
          options
        });

      if (insertError) throw insertError;
    }

    toast.success("Vote recorded successfully");
    return true;
  } catch (error) {
    console.error("Error recording vote:", error);
    toast.error("Failed to record your vote");
    throw error;
  }
};

// Close a poll
export const closePoll = async (pollId: string): Promise<Poll | null> => {
  return updatePoll(pollId, { isClosed: true });
};

// Reopen a poll
export const reopenPoll = async (pollId: string): Promise<Poll | null> => {
  return updatePoll(pollId, { isClosed: false });
};
