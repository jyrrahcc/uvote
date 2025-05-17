
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, MessageSquare, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import DiscussionTopicCard from "./DiscussionTopicCard";
import NewTopicDialog from "./NewTopicDialog";
import { useAuth } from "@/features/auth/context/AuthContext";
import { DiscussionTopic } from "@/types/discussions";

export interface DiscussionListProps {
  topics: DiscussionTopic[];
  isLoading: boolean;
  onSelectTopic: (topic: DiscussionTopic) => void;
  onCreateTopic: (title: string, content: string) => Promise<DiscussionTopic | null>;
  electionId: string;
  onRefresh: () => void;
}

const DiscussionList = ({
  topics,
  isLoading,
  onSelectTopic,
  onCreateTopic,
  electionId,
  onRefresh
}: DiscussionListProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { user } = useAuth();
  
  const handleCreateTopic = async (title: string, content: string) => {
    if (!user) throw new Error("User not authenticated");
    return onCreateTopic(title, content);
  };
  
  const filteredTopics = topics.filter((topic) => {
    const matchesSearch = 
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (topic.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "my-topics" && user) return matchesSearch && topic.created_by === user.id;
    if (activeTab === "recent") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return matchesSearch && new Date(topic.created_at) >= oneWeekAgo;
    }
    return matchesSearch;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search discussions..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Topic
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Topics</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          {user && <TabsTrigger value="my-topics">My Topics</TabsTrigger>}
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              <p>Loading discussions...</p>
            </div>
          ) : filteredTopics.length > 0 ? (
            <div className="space-y-4">
              {filteredTopics.map((topic) => (
                <DiscussionTopicCard
                  key={topic.id}
                  topic={topic}
                  electionId={electionId}
                  onClick={() => onSelectTopic(topic)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No discussions found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "No discussions match your search criteria"
                  : activeTab === "my-topics"
                  ? "You haven't created any discussion topics yet"
                  : "Be the first to start a discussion!"}
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Start a New Discussion
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <NewTopicDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCreateTopic={handleCreateTopic}
        electionId={electionId}
      />
    </div>
  );
};

export default DiscussionList;
