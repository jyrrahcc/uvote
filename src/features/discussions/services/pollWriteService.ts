
import { supabase } from "@/integrations/supabase/client";
import { Poll } from "@/types/discussions";
import { transformPoll } from "./pollTransformUtils";

// Create a new poll
export const createPoll = async (
  question: string,
  options: Record<string, string>,
  description: string | null = null,
  topicId: string | null = null,
  multipleChoice: boolean = false,
  endsAt: string | null = null
): Promise<Poll | null> => {
  try {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("User not authenticated");
      return null;
    }
    
    // Determine election_id - either from topic or directly provided
    let electionId: string | null = null;
    
    if (topicId) {
      // Get election ID from the topic
      const { data: topicData, error: topicError } = await supabase
        .from('discussion_topics')
        .select('election_id')
        .eq('id', topicId)
        .single();
      
      if (topicError) {
        console.error("Error getting topic's election ID:", topicError);
        return null;
      }
      
      electionId = topicData.election_id;
    } else {
      // Use the election ID from the URL
      const urlPathSegments = window.location.pathname.split('/');
      electionId = urlPathSegments[urlPathSegments.length - 1];
    }
    
    if (!electionId) {
      console.error("Could not determine election ID");
      return null;
    }
    
    // Insert poll
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .insert({
        question,
        options,
        description,
        topic_id: topicId,
        multiple_choice: multipleChoice,
        ends_at: endsAt,
        created_by: user.id,
        election_id: electionId
      })
      .select('*')
      .single();
    
    if (pollError) {
      console.error("Error creating poll:", pollError);
      return null;
    }
    
    // Fetch author profile separately
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, image_url')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error("Error fetching profile:", profileError);
      // Return poll without author information
      return transformPoll({ ...pollData, profiles: null });
    }
    
    // Combine poll data with author profile
    return transformPoll({
      ...pollData,
      profiles: profileData
    });
  } catch (error) {
    console.error("Error creating poll:", error);
    return null;
  }
};

// Update an existing poll
export const updatePoll = async (pollId: string, updates: Partial<Poll>): Promise<Poll | null> => {
  try {
    // Transform from frontend model to database model
    const dbUpdates: Record<string, any> = {};
    
    if (updates.question !== undefined) dbUpdates.question = updates.question;
    if (updates.options !== undefined) dbUpdates.options = updates.options;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.topicId !== undefined) dbUpdates.topic_id = updates.topicId;
    if (updates.endsAt !== undefined) dbUpdates.ends_at = updates.endsAt;
    if (updates.isClosed !== undefined) dbUpdates.is_closed = updates.isClosed;
    if (updates.multipleChoice !== undefined) dbUpdates.multiple_choice = updates.multipleChoice;
    
    // Update the poll
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .update(dbUpdates)
      .eq('id', pollId)
      .select('*')
      .single();
    
    if (pollError) {
      console.error("Error updating poll:", pollError);
      return null;
    }
    
    // Fetch the author profile separately
    let authorProfile = null;
    if (pollData.created_by) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, image_url')
        .eq('id', pollData.created_by)
        .maybeSingle();
      
      if (profileError) {
        console.error("Error fetching author profile:", profileError);
      } else {
        authorProfile = profileData;
      }
    }
    
    // Combine poll data with author profile
    return transformPoll({
      ...pollData,
      profiles: authorProfile
    });
  } catch (error) {
    console.error("Error updating poll:", error);
    return null;
  }
};

// Delete a poll
export const deletePoll = async (pollId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId);
    
    if (error) {
      console.error("Error deleting poll:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting poll:", error);
    return false;
  }
};

// Vote on a poll
export const voteOnPoll = async (pollId: string, selectedOptions: string[]): Promise<boolean> => {
  try {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("User not authenticated");
      return false;
    }
    
    // Convert the array of selected options to the expected format for storage
    const options: Record<string, boolean> = {};
    
    // First, get the poll to know all available options
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .select('options')
      .eq('id', pollId)
      .single();
    
    if (pollError) {
      console.error("Error getting poll options:", pollError);
      return false;
    }
    
    // Initialize all options as false
    Object.keys(pollData.options).forEach(optionId => {
      options[optionId] = false;
    });
    
    // Set selected options to true
    selectedOptions.forEach(optionId => {
      options[optionId] = true;
    });
    
    // Check if the user has already voted on this poll
    const { data: existingVote, error: checkError } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', user.id);
    
    if (checkError) {
      console.error("Error checking existing vote:", checkError);
      return false;
    }
    
    let result;
    
    if (existingVote && existingVote.length > 0) {
      // Update existing vote
      result = await supabase
        .from('poll_votes')
        .update({ options })
        .eq('poll_id', pollId)
        .eq('user_id', user.id);
    } else {
      // Create new vote
      result = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          user_id: user.id,
          options
        });
    }
    
    if (result.error) {
      console.error("Error voting on poll:", result.error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error voting on poll:", error);
    return false;
  }
};
