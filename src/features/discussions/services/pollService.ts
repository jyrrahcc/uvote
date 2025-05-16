
import { Poll, PollVote, PollResults, DbPoll, DbPollVote } from '@/types/discussions';
import { transformPollData } from './pollTransformUtils';
import { supabase } from '@/integrations/supabase/client';
import { fetchPollById, getPollResults as fetchPollResults, hasUserVotedOnPoll } from './pollReadService';
import { createNewPoll, updateExistingPoll, deletePollAndVotes, submitVote } from './pollWriteService';

// Re-export read functions
export const getPolls = async (electionId: string): Promise<Poll[]> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .eq('election_id', electionId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map((poll: DbPoll) => {
      const transformedPoll = transformPollData(poll);
      return transformedPoll;
    });
  } catch (error) {
    console.error('Error fetching polls:', error);
    throw error;
  }
};

export const getPoll = async (pollId: string, userId?: string): Promise<Poll | null> => {
  return fetchPollById(pollId, userId);
};

export const getPollResults = async (pollId: string): Promise<PollResults[]> => {
  try {
    const poll = await fetchPollResults(pollId);
    if (!poll || !poll.options) return [];
    
    return poll.options.map(option => ({
      optionId: option.id,
      optionText: option.text,
      votes: option.votes || 0,
      percentage: option.percentage || 0
    }));
  } catch (error) {
    console.error('Error getting poll results:', error);
    throw error;
  }
};

export const getUserVote = async (pollId: string, userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('poll_votes')
      .select('options')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    if (!data) return [];
    
    // Convert options object to array of selected option IDs
    const selectedOptions: string[] = [];
    const options = data.options as Record<string, boolean>;
    
    Object.entries(options).forEach(([optionId, isSelected]) => {
      if (isSelected) {
        selectedOptions.push(optionId);
      }
    });
    
    return selectedOptions;
  } catch (error) {
    console.error('Error fetching user vote:', error);
    throw error;
  }
};

// Re-export write functions
export const createPoll = createNewPoll;
export const updatePoll = updateExistingPoll;
export const deletePoll = deletePollAndVotes;
export const voteOnPoll = submitVote;
