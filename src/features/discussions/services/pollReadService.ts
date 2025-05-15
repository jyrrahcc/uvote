
import { supabase } from "@/integrations/supabase/client";
import { Poll, PollResults, PollVoter } from "@/types/discussions";
import { transformPoll } from "./pollTransformUtils";

// Get all polls for an election
export const getPolls = async (electionId: string): Promise<Poll[]> => {
  try {
    // First, fetch all polls for the election
    const { data: pollsData, error: pollsError } = await supabase
      .from('polls')
      .select('*')
      .eq('election_id', electionId)
      .order('created_at', { ascending: false });

    if (pollsError) {
      console.error("Error fetching polls:", pollsError);
      return [];
    }

    // If no polls are found, return empty array
    if (!pollsData || pollsData.length === 0) {
      return [];
    }

    // Get all creator user IDs
    const creatorIds = pollsData
      .map(poll => poll.created_by)
      .filter(Boolean);

    // Fetch author profiles separately if we have any creator IDs
    let profilesMap: Record<string, any> = {};
    if (creatorIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, image_url')
        .in('id', creatorIds);

      if (profilesError) {
        console.error("Error fetching author profiles:", profilesError);
      } else if (profilesData) {
        // Create a map of user IDs to profile data
        profilesMap = profilesData.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, any>);
      }
    }

    // Combine poll data with author profiles
    return pollsData.map(poll => {
      const authorProfile = poll.created_by ? profilesMap[poll.created_by] : null;
      return transformPoll({
        ...poll,
        profiles: authorProfile
      });
    });
  } catch (error) {
    console.error("Error fetching polls:", error);
    return [];
  }
};

// Get a specific poll by ID with author data
export const getPoll = async (pollId: string): Promise<Poll | null> => {
  try {
    // First, fetch the poll data
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .select('*')
      .eq('id', pollId)
      .single();

    if (pollError) {
      console.error("Error fetching poll:", pollError);
      return null;
    }

    // If poll has a creator, fetch their profile
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

    // Combine poll with author profile
    return transformPoll({
      ...pollData,
      profiles: authorProfile
    });
  } catch (error) {
    console.error("Error fetching poll:", error);
    return null;
  }
};

// Get user's vote on a specific poll
export const getUserVote = async (pollId: string, userId: string): Promise<string[] | null> => {
  try {
    const { data, error } = await supabase
      .from('poll_votes')
      .select('options')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user vote:", error);
      return null;
    }

    if (!data) {
      return null;
    }
    
    // Convert options from JSON to array of selected option IDs
    const options = data.options as Record<string, boolean>;
    const selectedOptions = Object.entries(options)
      .filter(([_, isSelected]) => isSelected)
      .map(([optionId]) => optionId);
    
    return selectedOptions;
  } catch (error) {
    console.error("Error fetching user vote:", error);
    return null;
  }
};

// Calculate poll results
export const getPollResults = async (pollId: string): Promise<PollResults[]> => {
  try {
    // First, get the poll to get the options
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .select('options')
      .eq('id', pollId)
      .maybeSingle();

    if (pollError || !pollData) {
      console.error("Error fetching poll options:", pollError);
      return [];
    }

    // Get all votes for this poll
    const { data: votesData, error: votesError } = await supabase
      .from('poll_votes')
      .select('id, options, user_id');

    if (votesError) {
      console.error("Error fetching poll votes:", votesError);
      return [];
    }

    // Fetch user profiles separately
    const userIds = votesData.map(vote => vote.user_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, image_url')
      .in('id', userIds);

    if (profilesError) {
      console.error("Error fetching user profiles:", profilesError);
      return [];
    }

    // Create a map of user IDs to profile data
    const profileMap: Record<string, any> = {};
    profilesData.forEach(profile => {
      profileMap[profile.id] = profile;
    });

    // Process results
    const pollOptions = pollData.options as Record<string, string>;
    const optionsMap: Record<string, PollResults> = {};
    let totalVotes = 0;

    // Initialize results for each option
    Object.entries(pollOptions).forEach(([optionId, optionText]) => {
      optionsMap[optionId] = {
        optionId,
        optionText,
        votes: 0,
        percentage: 0,
        voters: []
      };
    });

    // Count votes for each option
    votesData.forEach((vote) => {
      const selectedOptions = vote.options as Record<string, boolean>;
      
      for (const optionId in selectedOptions) {
        if (selectedOptions[optionId] && optionsMap[optionId]) {
          optionsMap[optionId].votes += 1;
          totalVotes += 1;
          
          // Add voter information if available
          const profile = profileMap[vote.user_id];
          if (profile) {
            const voter: PollVoter = {
              userId: profile.id,
              firstName: profile.first_name,
              lastName: profile.last_name,
              imageUrl: profile.image_url
            };
            optionsMap[optionId].voters.push(voter);
          }
        }
      }
    });

    // Calculate percentages
    if (totalVotes > 0) {
      Object.values(optionsMap).forEach(option => {
        option.percentage = Math.round((option.votes / totalVotes) * 100);
      });
    }

    return Object.values(optionsMap);
  } catch (error) {
    console.error("Error calculating poll results:", error);
    return [];
  }
};
