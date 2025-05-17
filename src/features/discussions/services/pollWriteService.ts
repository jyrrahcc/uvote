
import { Poll, DbPoll } from "@/types/discussions";
import { supabase } from "@/integrations/supabase/client";
import { transformPollData } from "./pollTransformUtils";

// Create a new poll
export const createNewPoll = async (pollData: {
  question: string;
  options: any[];
  description?: string;
  topic_id?: string;
  multiple_choice?: boolean;
  ends_at?: string;
  election_id: string;
  created_by: string;
}): Promise<Poll | null> => {
  try {
    // Convert options array to a record for the database
    let optionsRecord: Record<string, string> = {};
    
    pollData.options.forEach(opt => {
      if (typeof opt === 'object' && opt.id && opt.text) {
        optionsRecord[opt.id] = opt.text;
      }
    });
    
    const { data, error } = await supabase
      .from('polls')
      .insert({
        question: pollData.question,
        options: optionsRecord,
        description: pollData.description || null,
        topic_id: pollData.topic_id || null,
        multiple_choice: pollData.multiple_choice || false,
        ends_at: pollData.ends_at || null,
        election_id: pollData.election_id,
        created_by: pollData.created_by,
        is_closed: false
      })
      .select()
      .single();
    
    if (error) throw error;
    
    if (!data) return null;
    
    return transformPollData(data as DbPoll);
  } catch (error) {
    console.error("Error creating poll:", error);
    throw error;
  }
};

// Update an existing poll
export const updateExistingPoll = async (pollId: string, updates: Partial<Poll>): Promise<Poll | null> => {
  try {
    // Map camelCase properties to snake_case for database
    const dbUpdates: any = {};
    
    if (updates.question !== undefined) dbUpdates.question = updates.question;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.options !== undefined) {
      // Convert options array to record for database
      const optionsRecord: Record<string, string> = {};
      updates.options.forEach(opt => {
        optionsRecord[opt.id] = opt.text;
      });
      dbUpdates.options = optionsRecord;
    }
    if (updates.topic_id !== undefined) dbUpdates.topic_id = updates.topic_id;
    if (updates.multiple_choice !== undefined) dbUpdates.multiple_choice = updates.multiple_choice;
    if (updates.is_closed !== undefined) dbUpdates.is_closed = updates.is_closed;
    if (updates.ends_at !== undefined) dbUpdates.ends_at = updates.ends_at;
    
    const { data, error } = await supabase
      .from('polls')
      .update(dbUpdates)
      .eq('id', pollId)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!data) return null;
    
    return transformPollData(data as DbPoll);
  } catch (error) {
    console.error("Error updating poll:", error);
    throw error;
  }
};

// Delete a poll and its votes
export const deletePollAndVotes = async (pollId: string): Promise<boolean> => {
  try {
    // Use a custom SQL function to delete the poll and all associated votes
    const { data, error } = await supabase
      .rpc('delete_poll_with_votes', {
        poll_id_param: pollId
      });
    
    if (error) {
      console.error("Error with delete_poll_with_votes function:", error);
      // Fall back to manual deletion
      
      // First delete the votes
      const { error: votesError } = await supabase
        .from('poll_votes')
        .delete()
        .eq('poll_id', pollId);
      
      if (votesError) throw votesError;
      
      // Then delete the poll
      const { error: pollError } = await supabase
        .from('polls')
        .delete()
        .eq('id', pollId);
      
      if (pollError) throw pollError;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting poll:", error);
    throw error;
  }
};

// Submit a vote on a poll
export const submitVote = async (
  pollId: string, 
  userId: string, 
  options: Record<string, boolean>
): Promise<boolean> => {
  try {
    // Check if the user has already voted on this poll
    const { data: existingVote, error: checkError } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (existingVote) {
      // Update the existing vote
      const { error: updateError } = await supabase
        .from('poll_votes')
        .update({ options })
        .eq('id', existingVote.id);
      
      if (updateError) throw updateError;
    } else {
      // Create a new vote
      const { error: insertError } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          user_id: userId,
          options
        });
      
      if (insertError) throw insertError;
    }
    
    return true;
  } catch (error) {
    console.error("Error submitting vote:", error);
    throw error;
  }
};
