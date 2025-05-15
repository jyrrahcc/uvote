
import { supabase } from "@/integrations/supabase/client";
import { Poll, PollVote } from "@/types";
import { transformPollData } from "./pollTransformUtils";

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
    
    return data || [];
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
