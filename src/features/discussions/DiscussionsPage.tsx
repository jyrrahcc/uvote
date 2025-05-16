import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDiscussions } from "./hooks/useDiscussions";
import { usePolls } from "./hooks/usePolls";
import { useParams } from "react-router-dom";
import { useRole } from "@/features/auth/context/RoleContext";
import { useAuth } from "@/features/auth/context/AuthContext";
import { checkUserEligibility } from "@/utils/eligibilityUtils";
import { supabase } from "@/integrations/supabase/client";

// Components
import DiscussionList from "./components/DiscussionList";
import TopicView from "./components/TopicView";
import PollsList from "./components/PollsList";
import PollView from "./components/PollView";
import { Discussion, Poll } from "@/types/discussions";
import { toast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";

interface DiscussionsPageProps {
  electionId?: string;
}

const DiscussionsPage = ({ electionId }: DiscussionsPageProps) => {
  const params = useParams<{ electionId: string }>();
  const finalElectionId = electionId || params?.electionId || "";
  const [activeTab, setActiveTab] = useState("discussions");
  const [viewingTopic, setViewingTopic] = useState(false);
  const [viewingPoll, setViewingPoll] = useState(false);
  const [election, setElection] = useState<any>(null);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [eligibilityReason, setEligibilityReason] = useState<string | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);
  
  const { isAdmin, isVoter } = useRole();
  const { user } = useAuth();

  // Add better error logging for debugging
  useEffect(() => {
    console.log("🔍 DiscussionsPage mounted with props electionId:", electionId);
    console.log("🔍 DiscussionsPage params electionId:", params?.electionId);
    console.log("🔍 DiscussionsPage finalElectionId:", finalElectionId);
  }, [electionId, params?.electionId, finalElectionId]);
  
  // Fetch election details for eligibility check
  useEffect(() => {
    const fetchElection = async () => {
      if (!finalElectionId) return;
      
      try {
        const { data, error } = await supabase
          .from('elections')
          .select('*')
          .eq('id', finalElectionId)
          .maybeSingle();
          
        if (error) throw error;
        if (data) {
          setElection(data);
        }
      } catch (error) {
        console.error("Error fetching election:", error);
        toast({
          title: "Error",
          description: "Could not fetch election details",
          variant: "destructive"
        });
      }
    };
    
    fetchElection();
  }, [finalElectionId]);
  
  // Check user eligibility when election data is available
  useEffect(() => {
    const checkEligibility = async () => {
      if (!election || !user) {
        setEligibilityLoading(false);
        return;
      }
      
      try {
        setEligibilityLoading(true);
        const { isEligible, reason } = await checkUserEligibility(user.id, election);
        
        console.log("Eligibility check result:", { isEligible, reason });
        
        setIsEligible(isEligible);
        setEligibilityReason(reason);
        setEligibilityChecked(true);
      } catch (error) {
        console.error("Error checking eligibility:", error);
        setIsEligible(false);
        setEligibilityReason("Error checking eligibility");
      } finally {
        setEligibilityLoading(false);
      }
    };
    
    checkEligibility();
  }, [election, user, isAdmin]);
  
  const {
    topics,
    selectedTopic,
    comments,
    loading: discussionLoading,
    commentLoading,
    loadTopic,
    addTopic,
    updateTopic,
    removeTopic,
    addComment,
    editComment,
    removeComment,
    loadTopics
  } = useDiscussions(finalElectionId);
  
  const {
    polls,
    selectedPoll,
    pollResults,
    userVote,
    loading: pollLoading,
    voteLoading,
    loadPoll,
    addPoll,
    updatePoll,
    removePoll,
    vote,
    loadPolls
  } = usePolls(finalElectionId);

  // Log topics and polls whenever they change
  useEffect(() => {
    console.log("🔍 Current topics in DiscussionsPage:", topics);
  }, [topics]);
  
  useEffect(() => {
    console.log("🔍 Current polls in DiscussionsPage:", polls);
  }, [polls]);
  
  // Make the initial data loading more robust
  useEffect(() => {
    if (!finalElectionId) {
      console.error("📛 No election ID provided to DiscussionsPage");
      toast({
        title: "Error",
        description: "No election ID provided",
        variant: "destructive"
      });
      return;
    }
    
    console.log("🔄 Initial data load in DiscussionsPage for election ID:", finalElectionId);
    
    // Add a small delay before loading to ensure all hooks are properly initialized
    const loadTimer = setTimeout(() => {
      console.log("🔄 Executing delayed loadTopics and loadPolls");
      loadTopics();
      loadPolls();
    }, 300); // Increased delay for better hook initialization
    
    return () => {
      clearTimeout(loadTimer);
    };
  }, [finalElectionId, loadTopics, loadPolls]);
  
  const handleBackToDiscussions = () => {
    setViewingTopic(false);
  };
  
  const handleBackToPolls = () => {
    setViewingPoll(false);
  };
  
  const handleSelectTopic = async (topic: Discussion) => {
    console.log("🔄 Selecting topic:", topic.id);
    await loadTopic(topic.id);
    setViewingTopic(true);
  };
  
  const handleSelectPoll = async (poll: Poll) => {
    console.log("🔄 Selecting poll:", poll.id);
    await loadPoll(poll.id);
    setViewingPoll(true);
  };
  
  const handleCreatePoll = async (
    question: string, 
    options: Record<string, string>,
    description?: string,
    multipleChoice: boolean = false,
    endsAt?: string
  ) => {
    console.log("🔄 Creating poll:", { question, options, description, multipleChoice, endsAt });
    // Pass null as topicId since we're creating from the polls tab
    const result = await addPoll(question, options, description || null, null, multipleChoice, endsAt || null);
    if (result) {
      console.log("✅ Poll created successfully, reloading polls");
      // Reload polls to ensure we're displaying the latest data
      await loadPolls();
    }
    return result;
  };
  
  // Wrapper function to create a topic
  const handleCreateTopic = async (title: string, content: string) => {
    if (!finalElectionId) {
      console.error("📛 No election ID provided for topic creation");
      toast({
        title: "Error",
        description: "No election ID provided",
        variant: "destructive"
      });
      return null;
    }
    
    console.log("🔄 Creating topic with:", { title, content, electionId: finalElectionId });
    const result = await addTopic(title, content);
    
    if (result) {
      console.log("✅ Topic created successfully, reloading topics");
      // Reload topics to ensure we're displaying the latest data
      await loadTopics();
    } else {
      console.error("📛 Failed to create topic");
    }
    
    return result;
  };
  
  // Show loading state while checking eligibility
  if (eligibilityLoading) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <Spinner className="mr-2 h-6 w-6" />
        <span>Checking access...</span>
      </div>
    );
  }
  
  // Show access denied message if user is not eligible and isn't an admin
  if (eligibilityChecked && !isEligible && !isAdmin) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-amber-800 mb-2">Access Restricted</h2>
          <p className="text-amber-700 mb-4">
            {eligibilityReason || "You don't have permission to view discussions for this election."}
          </p>
          {!user && (
            <p className="text-amber-700">
              Please log in to participate in discussions.
            </p>
          )}
          {user && !isVoter && (
            <p className="text-amber-700">
              Your account needs to be verified before you can participate in discussions.
            </p>
          )}
        </div>
      </div>
    );
  }
  
  // Wrapper function to handle poll update
  const handleUpdatePoll = async (pollId: string, updates: Partial<Poll>) => {
    // Convert camelCase to snake_case for poll updates
    const snakeCaseUpdates: Partial<Poll> = {};
    
    if (updates.isClosed !== undefined) snakeCaseUpdates.is_closed = updates.isClosed;
    if (updates.multipleChoice !== undefined) snakeCaseUpdates.multiple_choice = updates.multipleChoice;
    if (updates.endsAt !== undefined) snakeCaseUpdates.ends_at = updates.endsAt;
    
    // Add any other fields that might need conversion
    Object.keys(updates).forEach(key => {
      if (!['isClosed', 'multipleChoice', 'endsAt'].includes(key)) {
        snakeCaseUpdates[key] = updates[key];
      }
    });
    
    return updatePoll(pollId, snakeCaseUpdates);
  };
  
  // Show main discussions content for eligible users
  return (
    <div className="container mx-auto py-8 px-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
          <TabsTrigger value="polls">Polls</TabsTrigger>
        </TabsList>
        
        <TabsContent value="discussions">
          {viewingTopic ? (
            <TopicView
              topic={selectedTopic}
              comments={comments}
              loading={discussionLoading}
              commentLoading={commentLoading}
              onBack={handleBackToDiscussions}
              onAddComment={addComment}
              onEditComment={editComment}
              onDeleteComment={removeComment}
              onDeleteTopic={removeTopic}
              onEditTopic={updateTopic}
            />
          ) : (
            <DiscussionList
              topics={topics}
              isLoading={discussionLoading}
              onSelectTopic={handleSelectTopic}
              onCreateTopic={handleCreateTopic}
              electionId={finalElectionId}
              onRefresh={loadTopics}
            />
          )}
        </TabsContent>
        
        <TabsContent value="polls">
          {viewingPoll ? (
            <PollView
              poll={selectedPoll}
              pollResults={pollResults}
              userVote={userVote}
              loading={pollLoading}
              voteLoading={voteLoading}
              onBack={handleBackToPolls}
              onVote={vote}
              onClosePoll={(pollId) => handleUpdatePoll(pollId, { is_closed: true })}
              onDeletePoll={removePoll}
            />
          ) : (
            <PollsList
              polls={polls}
              loading={pollLoading}
              onSelectPoll={handleSelectPoll}
              onCreatePoll={handleCreatePoll}
              electionId={finalElectionId}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DiscussionsPage;
