
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
                <DiscussionList topics={topics} onSelectTopic={() => {}} />
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
                <PollsList polls={polls} onSelectPoll={() => {}} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NewTopicDialog 
        isOpen={newTopicDialogOpen} 
        onClose={() => setNewTopicDialogOpen(false)} 
        onCreateTopic={addTopic}
        electionId={globalElectionId}
      />

      <NewPollDialog
        open={newPollDialogOpen}
        onOpenChange={setNewPollDialogOpen}
        onCreatePoll={addPoll}
      />
    </div>
  );
};

export default Discussions;
