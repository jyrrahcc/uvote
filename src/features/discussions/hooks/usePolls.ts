
import { useState, useCallback } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Poll, PollResults } from '@/types/discussions';
import {
  getPolls,
  getPoll,
  createPoll,
  updatePoll,
  deletePoll,
  getPollResults,
  getUserVote,
  vote as castVote
} from '../services/pollService';
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
      const data = await getPolls(electionId);
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

  const loadPoll = async (pollId: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading poll details:", pollId);
      
      // Load poll details
      const poll = await getPoll(pollId);
      setSelectedPoll(poll);
      
      if (poll) {
        // Load poll results
        const results = await getPollResults(pollId);
        setPollResults(results);
        
        // Load user's vote if authenticated
        if (user) {
          const vote = await getUserVote(pollId);
          setUserVote(vote);
        } else {
          setUserVote(null);
        }
        
        return poll;
      }
      
      console.error("Failed to load poll, no data returned");
      toast({
        title: "Error",
        description: "Failed to load poll",
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
  
  const addPoll = async (
    question: string,
    options: Record<string, string>,
    description: string | null = null,
    topicId: string | null = null,
    multipleChoice: boolean = false,
    endsAt: string | null = null
  ) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a poll",
        variant: "destructive"
      });
      return null;
    }
    
    if (!electionId) {
      toast({
        title: "Error",
        description: "No election ID provided",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      console.log("Creating new poll:", { question, options, electionId });
      const poll = await createPoll(
        electionId,
        question,
        options,
        description,
        topicId,
        multipleChoice,
        endsAt
      );
      
      if (poll) {
        setPolls(prevPolls => [poll, ...prevPolls]);
        return poll;
      }
      
      toast({
        title: "Error",
        description: "Failed to create poll",
        variant: "destructive"
      });
      return null;
    } catch (error: any) {
      console.error("Error creating poll:", error);
      toast({
        title: "Error",
        description: `Failed to create poll: ${error.message}`,
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
        setPolls(prevPolls => prevPolls.filter(poll => poll.id !== pollId));
        return true;
      }
      
      toast({
        title: "Error",
        description: "Failed to delete poll",
        variant: "destructive"
      });
      return false;
    } catch (error: any) {
      console.error("Error deleting poll:", error);
      toast({
        title: "Error",
        description: `Failed to delete poll: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
  };
  
  const updateExistingPoll = async (pollId: string, updates: Partial<Poll>) => {
    try {
      console.log("Updating poll:", pollId, updates);
      const updatedPoll = await updatePoll(pollId, updates);
      
      if (updatedPoll) {
        // Update polls list
        setPolls(prevPolls => 
          prevPolls.map(poll => 
            poll.id === pollId ? updatedPoll : poll
          )
        );
        
        // Update selected poll if it's the one being updated
        if (selectedPoll?.id === pollId) {
          setSelectedPoll(updatedPoll);
        }
        
        return updatedPoll;
      }
      
      toast({
        title: "Error",
        description: "Failed to update poll",
        variant: "destructive"
      });
      return null;
    } catch (error: any) {
      console.error("Error updating poll:", error);
      toast({
        title: "Error",
        description: `Failed to update poll: ${error.message}`,
        variant: "destructive"
      });
      return null;
    }
  };
  
  const vote = async (pollId: string, options: string[]) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to vote",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      setVoteLoading(true);
      console.log("Voting in poll:", pollId, options);
      const success = await castVote(pollId, options);
      
      if (success) {
        // Update user's vote
        setUserVote(options);
        
        // Refresh poll results
        const results = await getPollResults(pollId);
        setPollResults(results);
        
        return true;
      }
      
      toast({
        title: "Error",
        description: "Failed to submit vote",
        variant: "destructive"
      });
      return false;
    } catch (error: any) {
      console.error("Error voting:", error);
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
    loadPolls,
    loadPoll,
    addPoll,
    updatePoll: updateExistingPoll,
    removePoll,
    vote
  };
};
