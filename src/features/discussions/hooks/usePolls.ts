
import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Poll, PollResults } from '@/types/discussions';
import { 
  fetchPolls,
  fetchPollById,
  createPoll,
  updatePoll,
  deletePoll,
  votePoll,
  getUserVote,
  getPollResults
} from '../services/pollService';
import { supabase } from '@/integrations/supabase/client';

export const usePolls = (electionId: string) => {
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [pollResults, setPollResults] = useState<PollResults[]>([]);
  const [userVote, setUserVote] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [voteLoading, setVoteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!electionId) return;
    
    const loadPolls = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPolls(electionId);
        setPolls(data);
      } catch (error) {
        console.error("Error loading polls:", error);
        setError("Failed to load polls");
      } finally {
        setLoading(false);
      }
    };
    
    loadPolls();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('poll-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'polls',
        filter: `election_id=eq.${electionId}`
      }, () => {
        loadPolls();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [electionId]);
  
  const loadPoll = async (pollId: string) => {
    try {
      setLoading(true);
      setError(null);
      const poll = await fetchPollById(pollId);
      setSelectedPoll(poll);
      
      if (poll) {
        await loadPollResults(pollId);
        await loadUserVote(pollId);
      }
      
      return poll;
    } catch (error) {
      console.error("Error loading poll:", error);
      setError("Failed to load poll");
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const loadPollResults = async (pollId: string) => {
    try {
      const results = await getPollResults(pollId);
      setPollResults(results);
    } catch (error) {
      console.error("Error loading poll results:", error);
    }
  };
  
  const loadUserVote = async (pollId: string) => {
    if (!user) {
      setUserVote(null);
      return;
    }
    
    try {
      const vote = await getUserVote(pollId);
      setUserVote(vote);
    } catch (error) {
      console.error("Error loading user vote:", error);
      setUserVote(null);
    }
  };
  
  const addPoll = async (
    question: string, 
    options: Record<string, string>,
    description?: string,
    topicId?: string,
    multipleChoice: boolean = false,
    endsAt?: string
  ) => {
    try {
      if (!user) {
        throw new Error("You must be logged in to create a poll");
      }
      
      const newPoll = await createPoll(
        electionId,
        question,
        options,
        description || null,
        topicId || null,
        multipleChoice,
        endsAt || null
      );
      
      if (newPoll) {
        setPolls(prevPolls => [newPoll, ...prevPolls]);
        return newPoll;
      }
      return null;
    } catch (error: any) {
      setError(error.message || "Failed to create poll");
      return null;
    }
  };
  
  const updateExistingPoll = async (pollId: string, updates: Partial<Poll>) => {
    try {
      const updatedPoll = await updatePoll(pollId, updates);
      if (updatedPoll) {
        setPolls(prevPolls => 
          prevPolls.map(poll => 
            poll.id === pollId ? { ...poll, ...updatedPoll } : poll
          )
        );
        
        if (selectedPoll?.id === pollId) {
          setSelectedPoll(prevPoll => prevPoll ? { ...prevPoll, ...updatedPoll } : null);
        }
        
        return updatedPoll;
      }
      return null;
    } catch (error: any) {
      setError(error.message || "Failed to update poll");
      return null;
    }
  };
  
  const removePoll = async (pollId: string) => {
    try {
      const success = await deletePoll(pollId);
      if (success) {
        setPolls(prevPolls => prevPolls.filter(poll => poll.id !== pollId));
        if (selectedPoll?.id === pollId) {
          setSelectedPoll(null);
        }
        return true;
      }
      return false;
    } catch (error: any) {
      setError(error.message || "Failed to delete poll");
      return false;
    }
  };
  
  const vote = async (pollId: string, selectedOptions: string[]) => {
    try {
      if (!user) {
        throw new Error("You must be logged in to vote");
      }
      
      setVoteLoading(true);
      const success = await votePoll(pollId, selectedOptions);
      
      if (success) {
        setUserVote(selectedOptions);
        await loadPollResults(pollId);
        return true;
      }
      return false;
    } catch (error: any) {
      setError(error.message || "Failed to vote");
      return false;
    } finally {
      setVoteLoading(false);
    }
  };

  return {
    polls,
    selectedPoll,
    pollResults,
    userVote,
    loading,
    voteLoading,
    error,
    loadPoll,
    addPoll,
    updatePoll: updateExistingPoll,
    removePoll,
    vote,
    loadPollResults
  };
};
