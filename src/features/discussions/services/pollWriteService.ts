import { supabase } from "@/integrations/supabase/client";
import { Poll } from "@/types";
import { transformPoll } from "./pollTransformUtils";

/**
 * Create a new poll
 */
export const createPoll = async (
  question: string,
  options: Record<string, string>,
  description: string | null,
  topicId: string | null,
  multipleChoice: boolean = false,
  endsAt: string | null = null
): Promise<Poll | null> => {
  try {
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      console.error("User not authenticated:", userError);
      throw new Error("User not authenticated");
    }

    // Get election ID from the topic if provided
    let electionId: string | null = null;
    
    if (topicId) {
      const { data: topicData, error: topicError } = await supabase
        .from('discussion_topics')
        .select('election_id')
        .eq('id', topicId)
        .single();
      
      if (topicError) {
        console.error("Error fetching topic:", topicError);
        throw new Error("Could not fetch topic details");
      }
      
      electionId = topicData.election_id;
    } else {
      // If no topic ID was provided, the election ID must be provided directly
      // from the context where this function is called
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("No active session");
      }
    }

    const pollData = {
      question,
      options,
      description,
      topic_id: topicId,
      election_id: electionId,
      created_by: userData.user.id,
      multiple_choice: multipleChoice,
      ends_at: endsAt,
      is_closed: false
    };

    const { data, error } = await supabase
      .from('polls')
      .insert([pollData])
      .select(`
        *,
        author:profiles(
          id,
          first_name,
          last_name,
          image_url
        )
      `)
      .single();

    if (error) {
      console.error("Error creating poll:", error);
      return null;
    }

    return transformPoll(data);
  } catch (error) {
    console.error("Error creating poll:", error);
    return null;
  }
};

/**
 * Update an existing poll
 */
export const updatePoll = async (
  pollId: string,
  updates: Partial<Poll>
): Promise<Poll | null> => {
  try {
    const dbUpdates: Record<string, any> = {};
    
    if (updates.question !== undefined) dbUpdates.question = updates.question;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.options !== undefined) dbUpdates.options = updates.options;
    if (updates.isClosed !== undefined) dbUpdates.is_closed = updates.isClosed;
    if (updates.multipleChoice !== undefined) dbUpdates.multiple_choice = updates.multipleChoice;
    if (updates.endsAt !== undefined) dbUpdates.ends_at = updates.endsAt;

    const { data, error } = await supabase
      .from('polls')
      .update(dbUpdates)
      .eq('id', pollId)
      .select(`
        *,
        author:profiles(
          id,
          first_name,
          last_name,
          image_url
        )
      `)
      .single();

    if (error) {
      console.error("Error updating poll:", error);
      return null;
    }

    return transformPoll(data);
  } catch (error) {
    console.error("Error updating poll:", error);
    return null;
  }
};

/**
 * Delete a poll
 */
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

/**
 * Vote on a poll
 */
export const voteOnPoll = async (
  pollId: string,
  selectedOptions: string[]
): Promise<boolean> => {
  try {
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      console.error("User not authenticated:", userError);
      throw new Error("User not authenticated");
    }

    // Check if user already voted
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

    // Create options object for the vote
    const options = selectedOptions.reduce((acc, optionId) => {
      acc[optionId] = true;
      return acc;
    }, {} as Record<string, boolean>);

    // If user already voted, update their vote
    if (existingVote) {
      const { error: updateError } = await supabase
        .from('poll_votes')
        .update({ options })
        .eq('id', existingVote.id);

      if (updateError) {
        console.error("Error updating vote:", updateError);
        return false;
      }
    } else {
      // Otherwise, insert a new vote
      const { error: insertError } = await supabase
        .from('poll_votes')
        .insert([
          {
            poll_id: pollId,
            user_id: userData.user.id,
            options
          }
        ]);

      if (insertError) {
        console.error("Error inserting vote:", insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error voting on poll:", error);
    return false;
  }
};
