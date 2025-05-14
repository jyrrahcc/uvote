
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, MessageSquare, Search } from "lucide-react";
import { toast } from "sonner";
import { DiscussionTopic } from "@/types/discussions";
import DiscussionTopicCard from "./DiscussionTopicCard";
import { useAuth } from "@/features/auth/context/AuthContext";
import { createDiscussionTopic } from "../services/discussionService";
import { formatDistanceToNow } from "date-fns";

// Update the NewTopicDialogProps interface to include electionId
interface NewTopicDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTopic: (title: string, content: string) => Promise<DiscussionTopic>;
  electionId: string;
}

const NewTopicDialog = ({ isOpen, onClose, onCreateTopic, electionId }: NewTopicDialogProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await onCreateTopic(title, content);
      setTitle("");
      setContent("");
      onClose();
      toast.success("Discussion topic created successfully");
    } catch (error) {
      console.error("Error creating topic:", error);
      toast.error("Failed to create discussion topic");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Discussion Topic</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="text-sm font-medium">
              Topic Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear, specific title for your discussion"
              className="mt-1"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="text-sm font-medium">
              Initial Post
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, questions, or information to start the discussion"
              className="mt-1 min-h-[150px]"
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Topic"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface DiscussionListProps {
  electionId: string;
  topics: DiscussionTopic[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectTopic: (topic: DiscussionTopic) => void;
}

const DiscussionList = ({ electionId, topics, isLoading, onRefresh, onSelectTopic }: DiscussionListProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { user } = useAuth();

  const handleCreateTopic = async (title: string, content: string) => {
    if (!user) throw new Error("User not authenticated");
    const newTopic = await createDiscussionTopic({
      title,
      content,
      electionId,
      userId: user.id,
    });
    onRefresh();
    return newTopic;
  };

  const filteredTopics = topics.filter((topic) => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "my-topics" && user) return matchesSearch && topic.createdBy === user.id;
    if (activeTab === "recent") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return matchesSearch && new Date(topic.createdAt) >= oneWeekAgo;
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
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>Loading discussions...</p>
            </div>
          ) : filteredTopics.length > 0 ? (
            <div className="space-y-4">
              {filteredTopics.map((topic) => (
                <DiscussionTopicCard
                  key={topic.id}
                  topic={topic}
                  electionId={electionId}
                  onSelectTopic={onSelectTopic}
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
