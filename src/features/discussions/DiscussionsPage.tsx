
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
import { toast } from "@/hooks/use-toast";

interface DiscussionsPageProps {
  electionId?: string;
}

const DiscussionsPage = ({ electionId }: DiscussionsPageProps) => {
  const params = useParams<{ electionId: string }>();
  const finalElectionId = electionId || params?.electionId || "";
  const [activeTab, setActiveTab] = useState("discussions");
  const [viewingTopic, setViewingTopic] = useState(false);
  const [viewingPoll, setViewingPoll] = useState(false);
  
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
  
  // Ensure we have an electionId and load data properly
  useEffect(() => {
    if (!finalElectionId) {
      toast({
        title: "Error",
        description: "No election ID provided",
        variant: "destructive"
      });
      return;
    }
    
    // Initial load
    loadTopics();
    loadPolls();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalElectionId]);
  
  const handleBackToDiscussions = () => {
    setViewingTopic(false);
  };
  
  const handleBackToPolls = () => {
    setViewingPoll(false);
  };
  
  const handleSelectTopic = async (topic: DiscussionTopic) => {
    await loadTopic(topic.id);
    setViewingTopic(true);
  };
  
  const handleSelectPoll = async (poll: Poll) => {
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
    // Pass null as topicId since we're creating from the polls tab
    const result = await addPoll(question, options, description || null, null, multipleChoice, endsAt || null);
    if (result) {
      // Reload polls to ensure we're displaying the latest data
      await loadPolls();
    }
    return result;
  };
  
  // Wrapper function to match expected signature in DiscussionList
  const handleCreateTopic = async (title: string, content: string) => {
    if (!finalElectionId) {
      toast({
        title: "Error",
        description: "No election ID provided",
        variant: "destructive"
      });
      return null;
    }
    
    const result = await addTopic(finalElectionId, title, content || null);
    if (result) {
      // Reload topics to ensure we're displaying the latest data
      await loadTopics();
    }
    return result;
  };
  
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
