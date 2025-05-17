
import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useDiscussions } from "@/features/discussions/hooks/useDiscussions";
import { usePolls } from "@/features/discussions/hooks/usePolls";
import { MessageSquare, Plus, PlusCircle, LineChart } from "lucide-react";
import DiscussionList from "@/features/discussions/components/DiscussionList";
import PollsList from "@/features/discussions/components/PollsList";
import NewTopicDialog from "@/features/discussions/components/NewTopicDialog";
import NewPollDialog from "@/features/discussions/components/NewPollDialog";
import { Spinner } from "@/components/ui/spinner";

const Discussions = () => {
  const { user } = useAuth();
  const [newTopicDialogOpen, setNewTopicDialogOpen] = useState(false);
  const [newPollDialogOpen, setNewPollDialogOpen] = useState(false);
  const [globalElectionId, setGlobalElectionId] = useState<string>("global");
  const { 
    topics, 
    loading: topicsLoading, 
    addTopic, 
    removeTopic 
  } = useDiscussions(globalElectionId);

  const { 
    polls, 
    loading: pollsLoading, 
    addPoll, 
    removePoll 
  } = usePolls(globalElectionId);

  // Create a handler for selecting a topic (stub for now)
  const handleSelectTopic = () => {
    // This is a placeholder - we'll implement topic selection functionality later
    console.log("Topic selected");
  };

  // Create a handler for selecting a poll (stub for now)
  const handleSelectPoll = () => {
    // This is a placeholder - we'll implement poll selection functionality later
    console.log("Poll selected");
  };

  // Create a handler for refreshing topics
  const handleRefreshTopics = () => {
    // This should call the loadTopics function from useDiscussions
    console.log("Refreshing topics");
  };

  // Handler for creating a topic that matches the required signature
  const handleCreateTopic = async (title: string, content: string) => {
    if (!user) {
      console.error("User not authenticated");
      return null;
    }
    
    try {
      return await addTopic(title, content);
    } catch (error) {
      console.error("Error creating topic:", error);
      return null;
    }
  };

  // Handler for creating a poll that matches the required signature
  const handleCreatePoll = async (
    question: string, 
    options: Record<string, string>, 
    description?: string,
    multipleChoice?: boolean,
    endsAt?: string
  ) => {
    if (!user) {
      console.error("User not authenticated");
      return null;
    }
    
    try {
      // Ensuring we pass parameters in the correct order and with the correct types
      // Passing null for topicId as we're creating from the polls tab
      return await addPoll(question, options, description || null, null, multipleChoice || false, endsAt || null);
    } catch (error) {
      console.error("Error creating poll:", error);
      return null;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Community Discussions</h1>
          <p className="text-muted-foreground">
            Participate in discussions and polls with the university community
          </p>
        </div>

        {user && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setNewTopicDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> New Discussion
            </Button>
            <Button 
              onClick={() => setNewPollDialogOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Create Poll
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="discussions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="discussions" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" /> Discussions
          </TabsTrigger>
          <TabsTrigger value="polls" className="flex items-center">
            <LineChart className="mr-2 h-4 w-4" /> Polls
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="discussions">
          <Card>
            <CardHeader>
              <CardTitle>Community Discussions</CardTitle>
              <CardDescription>
                Browse and participate in discussions across our platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topicsLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : topics.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-medium">No discussions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to start a discussion for the community
                  </p>
                  <Button onClick={() => setNewTopicDialogOpen(true)}>
                    Start a Discussion
                  </Button>
                </div>
              ) : (
                <DiscussionList 
                  topics={topics} 
                  isLoading={topicsLoading} 
                  onSelectTopic={handleSelectTopic} 
                  onCreateTopic={handleCreateTopic}
                  electionId={globalElectionId}
                  onRefresh={handleRefreshTopics}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="polls">
          <Card>
            <CardHeader>
              <CardTitle>Community Polls</CardTitle>
              <CardDescription>
                Browse and vote on polls across our platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pollsLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : polls.length === 0 ? (
                <div className="text-center py-8">
                  <LineChart className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-medium">No polls yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to create a poll for the community to vote on
                  </p>
                  <Button onClick={() => setNewPollDialogOpen(true)}>
                    Create a Poll
                  </Button>
                </div>
              ) : (
                <PollsList 
                  polls={polls} 
                  loading={pollsLoading} 
                  onSelectPoll={handleSelectPoll}
                  onCreatePoll={handleCreatePoll}
                  electionId={globalElectionId}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NewTopicDialog 
        isOpen={newTopicDialogOpen} 
        onClose={() => setNewTopicDialogOpen(false)} 
        onCreateTopic={handleCreateTopic}
        electionId={globalElectionId}
      />

      <NewPollDialog
        isOpen={newPollDialogOpen}
        onClose={() => setNewPollDialogOpen(false)}
        onCreatePoll={handleCreatePoll}
        electionId={globalElectionId}
      />
    </div>
  );
};

export default Discussions;
