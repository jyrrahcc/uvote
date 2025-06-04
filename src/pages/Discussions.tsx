
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useDiscussions } from "@/features/discussions/hooks/useDiscussions";
import { usePolls } from "@/features/discussions/hooks/usePolls";
import { MessageSquare, Plus, PlusCircle, LineChart, AlertCircle } from "lucide-react";
import DiscussionList from "@/features/discussions/components/DiscussionList";
import PollsList from "@/features/discussions/components/PollsList";
import NewTopicDialog from "@/features/discussions/components/NewTopicDialog";
import NewPollDialog from "@/features/discussions/components/NewPollDialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

const Discussions = () => {
  const { user, isAuthenticated } = useAuth();
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

  // Authentication check handlers
  const handleRequireAuth = (action: string) => {
    if (!isAuthenticated) {
      toast.error("Authentication Required", {
        description: `You must be logged in to ${action}. Please sign in to continue.`,
      });
      return false;
    }
    return true;
  };

  // Create a handler for selecting a topic (stub for now)
  const handleSelectTopic = () => {
    console.log("Topic selected");
  };

  // Create a handler for selecting a poll (stub for now)
  const handleSelectPoll = () => {
    console.log("Poll selected");
  };

  // Create a handler for refreshing topics
  const handleRefreshTopics = () => {
    console.log("Refreshing topics");
  };

  // Handler for creating a topic that matches the required signature
  const handleCreateTopic = async (title: string, content: string) => {
    if (!handleRequireAuth("create discussions")) return null;
    
    try {
      const result = await addTopic(title, content);
      if (result) {
        toast.success("Discussion Created", {
          description: "Your discussion has been created successfully.",
        });
        setNewTopicDialogOpen(false);
      }
      return result;
    } catch (error) {
      console.error("Error creating topic:", error);
      toast.error("Failed to Create Discussion", {
        description: "There was an error creating your discussion. Please try again.",
      });
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
    if (!handleRequireAuth("create polls")) return null;
    
    try {
      const result = await addPoll(question, options, description || null, null, multipleChoice || false, endsAt || null);
      if (result) {
        toast.success("Poll Created", {
          description: "Your poll has been created successfully.",
        });
        setNewPollDialogOpen(false);
      }
      return result;
    } catch (error) {
      console.error("Error creating poll:", error);
      toast.error("Failed to Create Poll", {
        description: "There was an error creating your poll. Please try again.",
      });
      return null;
    }
  };

  // Handler for opening dialogs with authentication check
  const handleOpenNewTopicDialog = () => {
    if (handleRequireAuth("create discussions")) {
      setNewTopicDialogOpen(true);
    }
  };

  const handleOpenNewPollDialog = () => {
    if (handleRequireAuth("create polls")) {
      setNewPollDialogOpen(true);
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

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleOpenNewTopicDialog}
          >
            <Plus className="mr-2 h-4 w-4" /> New Discussion
          </Button>
          <Button 
            onClick={handleOpenNewPollDialog}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Create Poll
          </Button>
        </div>
      </div>

      {!isAuthenticated && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You are viewing discussions as a guest. <strong>Sign in</strong> to create discussions, polls, and participate in the community.
          </AlertDescription>
        </Alert>
      )}

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
                  <Button onClick={handleOpenNewTopicDialog}>
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
                  <Button onClick={handleOpenNewPollDialog}>
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

      {isAuthenticated && (
        <>
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
        </>
      )}
    </div>
  );
};

export default Discussions;
