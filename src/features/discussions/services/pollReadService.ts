import { supabase } from "@/integrations/supabase/client";
import { Poll, PollVote } from "@/types";
import { transformPollData } from "./pollTransformUtils";
import { Json } from "@/integrations/supabase/types";

// Fetch all polls for a specific election
export const fetchPollsForElection = async (electionId: string): Promise<Poll[]> => {
  try {
    // First fetch the polls
    const { data: pollsData, error: pollsError } = await supabase
      .from('polls')
      .select('*')
      .eq('election_id', electionId)
      .order('created_at', { ascending: false });
      
    if (pollsError) throw pollsError;
    
    if (!pollsData || pollsData.length === 0) {
      return [];
    }
    
    // Get unique creator IDs
    const creatorIds = [...new Set(pollsData.map(poll => poll.created_by))];
    
    // Fetch profiles for all creators
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, image_url')
      .in('id', creatorIds);
      
    if (profilesError) throw profilesError;
    
    // Create a map of creator profiles
    const creatorProfiles = new Map();
    if (profilesData) {
      profilesData.forEach(profile => {
        creatorProfiles.set(profile.id, {
          id: profile.id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          imageUrl: profile.image_url
        });
      });
    }
    
    // Transform the poll data with creator information
    return pollsData.map(poll => transformPollData(poll, creatorProfiles.get(poll.created_by)));
  } catch (error) {
    console.error("Error fetching polls for election:", error);
    throw error;
  }
};

// Fetch a specific poll by ID
export const fetchPollById = async (pollId: string): Promise<Poll | null> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .eq('id', pollId)
      .single();
    
    if (error) throw error;
    
    if (!data) return null;
    
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
    
    return transformPollData(data, creator);
  } catch (error) {
    console.error("Error fetching poll:", error);
    throw error;
  }
};

// Fetch all votes for a specific poll
export const fetchVotesForPoll = async (pollId: string): Promise<PollVote[]> => {
  try {
    const { data, error } = await supabase
      .from('poll_votes')
      .select('*')
      .eq('poll_id', pollId);
    
    if (error) throw error;
    
    // Process the options to ensure they are properly typed as Record<string, boolean>
    return (data || []).map(vote => {
      // Ensure options is properly typed as Record<string, boolean>
      let parsedOptions: Record<string, boolean> = {};
      
      // Handle different possible formats of the options
      if (typeof vote.options === 'string') {
        try {
          parsedOptions = JSON.parse(vote.options);
        } catch (e) {
          console.error("Error parsing options string:", e);
        }
      } else if (vote.options && typeof vote.options === 'object') {
        // If it's already an object, cast it to the right type
        parsedOptions = vote.options as Record<string, boolean>;
      }
      
      return {
        id: vote.id,
        pollId: vote.poll_id,
        userId: vote.user_id,
        options: parsedOptions,
        createdAt: vote.created_at
      };
    });
  } catch (error) {
    console.error("Error fetching poll votes:", error);
    throw error;
  }
};

// Check if a user has voted on a poll
export const hasUserVotedOnPoll = async (pollId: string, userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking if user has voted:", error);
    throw error;
  }
};

// Get polls for a specific discussion topic
export const fetchPollsForTopic = async (topicId: string): Promise<Poll[]> => {
  try {
    // First fetch the polls
    const { data: pollsData, error: pollsError } = await supabase
      .from('polls')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: false });
      
    if (pollsError) throw pollsError;
    
    if (!pollsData || pollsData.length === 0) {
      return [];
    }
    
    // Get unique creator IDs
    const creatorIds = [...new Set(pollsData.map(poll => poll.created_by))];
    
    // Fetch profiles for all creators
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, image_url')
      .in('id', creatorIds);
      
    if (profilesError) throw profilesError;
    
    // Create a map of creator profiles
    const creatorProfiles = new Map();
    if (profilesData) {
      profilesData.forEach(profile => {
        creatorProfiles.set(profile.id, {
          id: profile.id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          imageUrl: profile.image_url
        });
      });
    }
    
    // Transform the poll data with creator information
    return pollsData.map(poll => transformPollData(poll, creatorProfiles.get(poll.created_by)));
  } catch (error) {
    console.error("Error fetching polls for topic:", error);
    throw error;
  }
};

// Create aliases for existing functions to maintain compatibility with usePolls.ts
export const getPolls = fetchPollsForElection;
export const getPoll = fetchPollById;

// Function to get poll results
export const getPollResults = async (pollId: string) => {
  try {
    // Fetch the poll to get options
    const poll = await fetchPollById(pollId);
    if (!poll) throw new Error("Poll not found");
    
    // Fetch all votes for this poll
    const { data: votes, error } = await supabase
      .from('poll_votes')
      .select('user_id, options')
      .eq('poll_id', pollId);
      
    if (error) throw error;
    
    // Get unique voter IDs
    const voterIds = [...new Set(votes.map(vote => vote.user_id))];
    
    // Fetch profiles for all voters
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, image_url')
      .in('id', voterIds);
      
    if (profilesError) throw profilesError;
    
    // Create a map of voter profiles
    const voterProfiles = new Map();
    if (profiles) {
      profiles.forEach(profile => {
        voterProfiles.set(profile.id, {
          userId: profile.id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          imageUrl: profile.image_url
        });
      });
    }
    
    // Initialize results structure
    const results = Object.entries(poll.options).map(([optionId, optionText]) => {
      return {
        optionId,
        optionText,
        votes: 0,
        percentage: 0,
        voters: []
      };
    });
    
    // Count votes
    let totalVotes = 0;
    votes.forEach(vote => {
      const options = vote.options;
      
      Object.entries(options).forEach(([optionId, selected]) => {
        if (selected) {
          const resultOption = results.find(r => r.optionId === optionId);
          if (resultOption) {
            resultOption.votes += 1;
            totalVotes += 1;
            
            // Add voter info if available
            if (voterProfiles.has(vote.user_id)) {
              resultOption.voters.push(voterProfiles.get(vote.user_id));
            }
          }
        }
      });
    });
    
    // Calculate percentages
    if (totalVotes > 0) {
      results.forEach(result => {
        result.percentage = Math.round((result.votes / totalVotes) * 100);
      });
    }
    
    return results;
  } catch (error) {
    console.error("Error calculating poll results:", error);
    throw error;
  }
};

// Function to get user vote
export const getUserVote = async (pollId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('poll_votes')
      .select('options')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) throw error;
    
    if (!data) return null;
    
    // Convert options object to array of selected option IDs
    return Object.entries(data.options)
      .filter(([_, selected]) => selected)
      .map(([optionId]) => optionId);
  } catch (error) {
    console.error("Error fetching user vote:", error);
    throw error;
  }
};
