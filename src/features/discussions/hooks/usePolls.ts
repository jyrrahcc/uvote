
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Poll, PollResults } from '@/types/discussions';
import { 
  fetchPolls,
  fetchPollById,
  createPoll,
  updatePoll,
  deletePoll,
  votePoll,
  fetchUserVote,
  fetchPollResults
} from '../services/pollService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const usePolls = (electionId: string) => {
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [pollResults, setPollResults] = useState<PollResults[]>([]);
  const [userVote, setUserVote] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [voteLoading, setVoteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPolls = useCallback(async () => {
    if (!electionId) {
      console.error("No election ID provided, skipping polls load");
      setPolls([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log("Loading polls for election:", electionId);
      const data = await fetchPolls(electionId);
      console.log("Loaded polls:", data);
      setPolls(data);
    } catch (error: any) {
      console.error("Error loading polls:", error);
      setError("Failed to load polls");
      toast({
        title: "Error",
        description: "Failed to load polls",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [electionId]);

  useEffect(() => {
    if (!electionId) return;
    
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
        console.log("Detected change in polls, reloading...");
        loadPolls();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [electionId, loadPolls]);
  
  const loadPoll = async (pollId: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading poll details:", pollId);
      const poll = await fetchPollById(pollId);
      setSelectedPoll(poll);
      
      if (poll) {
        await loadPollResults(pollId);
        await loadUserVote(pollId);
        return poll;
      }
      
      console.error("Failed to load poll, no data returned");
      toast({
        title: "Error",
        description: "Failed to load poll details",
        variant: "destructive"
      });
      return null;
    } catch (error: any) {
      console.error("Error loading poll:", error);
      setError("Failed to load poll");
      toast({
        title: "Error",
        description: `Failed to load poll: ${error.message}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const loadPollResults = async (pollId: string) => {
    try {
      console.log("Loading poll results for:", pollId);
      const results = await fetchPollResults(pollId);
      console.log("Poll results:", results);
      setPollResults(results);
    } catch (error: any) {
      console.error("Error loading poll results:", error);
      toast({
        title: "Error",
        description: `Failed to load poll results: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  const loadUserVote = async (pollId: string) => {
    if (!user) {
      setUserVote(null);
      return;
    }
    
    try {
      console.log("Loading user vote for poll:", pollId);
      const vote = await fetchUserVote(pollId);
      console.log("User vote:", vote);
      setUserVote(vote?.options as string[] || null);
    } catch (error: any) {
      console.error("Error loading user vote:", error);
      setUserVote(null);
    }
  };
  
  const addPoll = async (
    question: string, 
    options: Record<string, string>,
    description?: string,
    topicId?: string | null,
    multipleChoice: boolean = false,
    endsAt?: string
  ) => {
    try {
      if (!user) {
        const errorMsg = "You must be logged in to create a poll";
        setError(errorMsg);
        toast({
          title: "Authentication Error",
          description: errorMsg,
          variant: "destructive"
        });
        return null;
      }
      
      if (!electionId) {
        const errorMsg = "No election ID provided";
        setError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        return null;
      }

      console.log("Creating new poll:", { 
        electionId, 
        question, 
        options, 
        description, 
        topicId, 
        multipleChoice 
      });
      
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
        console.log("Poll created successfully:", newPoll);
        setPolls(prevPolls => [newPoll, ...prevPolls]);
        await loadPolls(); // Reload polls to ensure we have the latest data
        return newPoll;
      } else {
        console.error("Failed to create poll: No poll data returned");
        toast({
          title: "Error",
          description: "Failed to create poll",
          variant: "destructive"
        });
        return null;
      }
    } catch (error: any) {
      console.error("Error creating poll:", error);
      setError(error.message || "Failed to create poll");
      toast({
        title: "Error",
        description: `Failed to create poll: ${error.message}`,
        variant: "destructive"
      });
      return null;
    }
  };
  
  const updateExistingPoll = async (pollId: string, updates: Partial<Poll>) => {
    try {
      console.log("Updating poll:", pollId, updates);
      const updatedPoll = await updatePoll(pollId, updates);
      if (updatedPoll) {
        console.log("Poll updated successfully:", updatedPoll);
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
      
      console.error("Failed to update poll: No poll data returned");
      toast({
        title: "Error",
        description: "Failed to update poll",
        variant: "destructive"
      });
      return null;
    } catch (error: any) {
      console.error("Error updating poll:", error);
      setError(error.message || "Failed to update poll");
      toast({
        title: "Error",
        description: `Failed to update poll: ${error.message}`,
        variant: "destructive"
      });
      return null;
    }
  };
  
  const removePoll = async (pollId: string) => {
    try {
      console.log("Deleting poll:", pollId);
      const success = await deletePoll(pollId);
      if (success) {
        console.log("Poll deleted successfully");
        setPolls(prevPolls => prevPolls.filter(poll => poll.id !== pollId));
        if (selectedPoll?.id === pollId) {
          setSelectedPoll(null);
        }
        return true;
      }
      
      console.error("Failed to delete poll");
      toast({
        title: "Error",
        description: "Failed to delete poll",
        variant: "destructive"
      });
      return false;
    } catch (error: any) {
      console.error("Error deleting poll:", error);
      setError(error.message || "Failed to delete poll");
      toast({
        title: "Error",
        description: `Failed to delete poll: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
  };
  
  const vote = async (pollId: string, selectedOptions: string[]) => {
    try {
      if (!user) {
        const errorMsg = "You must be logged in to vote";
        setError(errorMsg);
        toast({
          title: "Authentication Error",
          description: errorMsg,
          variant: "destructive"
        });
        return false;
      }
      
      setVoteLoading(true);
      console.log("Voting in poll:", pollId, "with options:", selectedOptions);
      const success = await votePoll(pollId, selectedOptions);
      
      if (success) {
        console.log("Vote recorded successfully");
        setUserVote(selectedOptions);
        await loadPollResults(pollId);
        return true;
      }
      
      console.error("Failed to record vote");
      toast({
        title: "Error",
        description: "Failed to record your vote",
        variant: "destructive"
      });
      return false;
    } catch (error: any) {
      console.error("Error voting:", error);
      setError(error.message || "Failed to vote");
      toast({
        title: "Error",
        description: `Failed to vote: ${error.message}`,
        variant: "destructive"
      });
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
    loadPolls,
    addPoll,
    updatePoll: updateExistingPoll,
    removePoll,
    vote,
    loadPollResults
  };
};
