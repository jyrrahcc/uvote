import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDiscussions } from "./hooks/useDiscussions";
import { usePolls } from "./hooks/usePolls";
import { useParams } from "react-router-dom";

// Components
import DiscussionList from "./components/DiscussionList";
import TopicView from "./components/TopicView";
import PollsList from "./components/PollsList";
import PollView from "./components/PollView";
import { DiscussionTopic, Poll } from "@/types/discussions";
import { toast } from "@/hooks/use-toast"; // Updated import path

interface DiscussionsPageProps {
  electionId?: string;
}

const DiscussionsPage = ({ electionId }: DiscussionsPageProps) => {
  const params = useParams<{ electionId: string }>();
  const finalElectionId = electionId || params?.electionId || "";
  const [activeTab, setActiveTab] = useState("discussions");
  const [viewingTopic, setViewingTopic] = useState(false);
  const [viewingPoll, setViewingPoll] = useState(false);
  
  // Add initial logging
  useEffect(() => {
    console.log("🔍 DiscussionsPage mounted with props electionId:", electionId);
    console.log("🔍 DiscussionsPage params electionId:", params?.electionId);
    console.log("🔍 DiscussionsPage finalElectionId:", finalElectionId);
  }, [electionId, params?.electionId, finalElectionId]);
  
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
  
  // Ensure we have an electionId and load data properly
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
    }, 100);
    
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
  
  const handleSelectTopic = async (topic: DiscussionTopic) => {
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
  
  // Wrapper function to match expected signature in DiscussionList
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
    const result = await addTopic(finalElectionId, title, content || null);
    
    if (result) {
      console.log("✅ Topic created successfully, reloading topics");
      // Reload topics to ensure we're displaying the latest data
      await loadTopics();
    } else {
      console.error("📛 Failed to create topic");
    }
    
    return result;
  };
  
  // Log loading states
  useEffect(() => {
    console.log("🔍 Discussion loading state:", discussionLoading);
  }, [discussionLoading]);
  
  useEffect(() => {
    console.log("🔍 Poll loading state:", pollLoading);
  }, [pollLoading]);
  
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
              onCreatePoll={addPoll}
            />
          ) : (
            <DiscussionList
              topics={topics}
              loading={discussionLoading}
              onSelectTopic={handleSelectTopic}
              onCreateTopic={handleCreateTopic}
              electionId={finalElectionId}
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
              onClosePoll={(pollId) => updatePoll(pollId, { is_closed: true })}
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
