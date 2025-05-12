
import { useState } from "react";
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
    removeComment
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
    vote
  } = usePolls(finalElectionId);
  
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
    return addPoll(question, options, description || null, null, multipleChoice, endsAt || null);
  };
  
  // Wrapper function to match expected signature in DiscussionList
  const handleCreateTopic = async (title: string, content: string) => {
    const result = await addTopic(finalElectionId, title, content);
    return result as DiscussionTopic;
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
