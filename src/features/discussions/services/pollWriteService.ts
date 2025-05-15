import { supabase } from "@/integrations/supabase/client";
import { Poll, PollVote } from "@/types";

// Create a new poll
export const createPoll = async (pollData: Partial<Poll>): Promise<Poll> => {
  try {
    console.log("Creating new poll:", pollData);
    
    // Prepare options in the format expected by the database
    const rawOptions = pollData.options || {};
    const optionsArray = Object.keys(rawOptions).map(key => ({
      id: key,
      text: rawOptions[key]
    }));
    
    // Insert the poll
    const { data, error } = await supabase
      .from('polls')
      .insert({
        question: pollData.question || '',
        description: pollData.description || null,
        multiple_choice: pollData.multipleChoice || false,
        options: JSON.stringify(optionsArray),
        ends_at: pollData.endsAt || null,
        election_id: pollData.electionId || null,
        topic_id: pollData.topicId || null,
        created_by: pollData.createdBy || null
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating poll:", error);
      throw error;
    }
    
    // Fetch the creator's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, image_url')
      .eq('id', data.created_by)
      .single();
    
    if (profileError) {
      console.error("Error fetching creator profile:", profileError);
    }
    
    // Parse the options from the database format
    const dbOptions = typeof data.options === 'string' 
      ? JSON.parse(data.options) 
      : data.options;
      
    const formattedOptions: Record<string, string> = {};
    if (Array.isArray(dbOptions)) {
      dbOptions.forEach(option => {
        if (option.id && option.text) {
          formattedOptions[option.id] = option.text;
        }
      });
    }
    
    // Create the poll object
    return {
      id: data.id,
      question: data.question,
      description: data.description || undefined,
      options: formattedOptions,
      multipleChoice: data.multiple_choice || false,
      isClosed: data.is_closed || false,
      createdAt: data.created_at,
      endsAt: data.ends_at || undefined,
      electionId: data.election_id,
      topicId: data.topic_id || undefined,
      createdBy: data.created_by,
      author: profile ? {
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        imageUrl: profile.image_url
      } : null
    };
  } catch (error) {
    console.error("Error creating poll:", error);
    throw error;
  }
};

// Vote on a poll
export const voteOnPoll = async (
  pollId: string, 
  userId: string, 
  selectedOptions: Record<string, boolean>
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
      // User has already voted, update their vote
      const { error: updateError } = await supabase
        .from('poll_votes')
        .update({ options: selectedOptions })
        .eq('poll_id', pollId)
        .eq('user_id', userId);
      
      if (updateError) throw updateError;
    } else {
      // New vote
      const { error: insertError } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          user_id: userId,
          options: selectedOptions
        });
      
      if (insertError) throw insertError;
    }
    
    return true;
  } catch (error) {
    console.error("Error voting on poll:", error);
    throw error;
  }
};

// Close a poll
export const closePoll = async (pollId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('polls')
      .update({ is_closed: true })
      .eq('id', pollId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error closing poll:", error);
    throw error;
  }
};

// Reopen a poll
export const reopenPoll = async (pollId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('polls')
      .update({ is_closed: false })
      .eq('id', pollId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error reopening poll:", error);
    throw error;
  }
};

// Delete a poll
export const deletePoll = async (pollId: string): Promise<boolean> => {
  try {
    // First delete all votes
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
  } catch (error) {
    console.error("Error deleting poll:", error);
    throw error;
  }
};

// Update a poll
export const updatePoll = async (pollId: string, updates: Partial<Poll>): Promise<Poll | null> => {
  try {
    // Create an updates object with DB field names
    const updateFields: Record<string, any> = {};
    
    if (updates.question !== undefined) updateFields.question = updates.question;
    if (updates.description !== undefined) updateFields.description = updates.description;
    if (updates.multipleChoice !== undefined) updateFields.multiple_choice = updates.multipleChoice;
    if (updates.isClosed !== undefined) updateFields.is_closed = updates.isClosed;
    if (updates.endsAt !== undefined) updateFields.ends_at = updates.endsAt;
    
    if (updates.options) {
      const optionsArray = Object.keys(updates.options).map(key => ({
        id: key,
        text: updates.options![key]
      }));
      updateFields.options = JSON.stringify(optionsArray);
    }
    
    const { data, error } = await supabase
      .from('polls')
      .update(updateFields)
      .eq('id', pollId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Fetch the creator's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, image_url')
      .eq('id', data.created_by)
      .single();
    
    if (profileError) {
      console.error("Error fetching creator profile:", profileError);
    }
    
    // Parse the options from the database format
    const dbOptions = typeof data.options === 'string' 
      ? JSON.parse(data.options) 
      : data.options;
      
    const formattedOptions: Record<string, string> = {};
    if (Array.isArray(dbOptions)) {
      dbOptions.forEach(option => {
        if (option.id && option.text) {
          formattedOptions[option.id] = option.text;
        }
      });
    }
    
    // Create the poll object
    return {
      id: data.id,
      question: data.question,
      description: data.description || undefined,
      options: formattedOptions,
      multipleChoice: data.multiple_choice || false,
      isClosed: data.is_closed || false,
      createdAt: data.created_at,
      endsAt: data.ends_at || undefined,
      electionId: data.election_id,
      topicId: data.topic_id || undefined,
      createdBy: data.created_by,
      author: profile ? {
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        imageUrl: profile.image_url
      } : null
    };
  } catch (error) {
    console.error("Error updating poll:", error);
    throw error;
  }
};
