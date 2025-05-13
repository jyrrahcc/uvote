
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pin, MessageSquare, Calendar } from "lucide-react";
import { DiscussionTopic } from "@/types/discussions";
import { formatDistanceToNow } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import NewTopicDialog from "./NewTopicDialog";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";

interface DiscussionListProps {
  topics: DiscussionTopic[];
  loading: boolean;
  onSelectTopic: (topic: DiscussionTopic) => void;
  onCreateTopic: (title: string, content: string) => Promise<DiscussionTopic | null>;
  electionId: string;
}

const DiscussionList = ({
  topics,
  loading,
  onSelectTopic,
  onCreateTopic,
  electionId,
}: DiscussionListProps) => {
  const [isNewTopicOpen, setIsNewTopicOpen] = useState(false);
  const { user } = useAuth();
  const { isVoter } = useRole();
  
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
        <span className="ml-3 text-lg">Loading discussions...</span>
      </div>
    );
  }

  const handleNewTopic = () => {
    setIsNewTopicOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Discussions</h2>
        {user && isVoter && (
          <Button 
            onClick={handleNewTopic}
            className="bg-[#008f50] hover:bg-[#007a45]"
          >
            <Plus size={16} className="mr-2" />
            New Topic
          </Button>
        )}
      </div>
      
      {topics.length === 0 ? (
        <Card className="text-center p-6">
          <p className="text-muted-foreground mb-4">
            No discussions have been started yet.
          </p>
          {user && isVoter && (
            <Button 
              onClick={handleNewTopic}
              className="bg-[#008f50] hover:bg-[#007a45]"
            >
              <Plus size={16} className="mr-2" />
              Start a Discussion
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => (
            <Card 
              key={topic.id} 
              className={`cursor-pointer hover:border-green-300 transition-colors ${
                topic.is_pinned ? 'border-green-200 bg-green-50' : ''
              }`}
              onClick={() => onSelectTopic(topic)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-lg">
                    {topic.is_pinned && <Pin size={16} className="inline mr-2 text-green-600" />}
                    {topic.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                {topic.content && (
                  <p className="text-muted-foreground line-clamp-2">{topic.content}</p>
                )}
              </CardContent>
              <CardFooter className="pt-0 text-xs text-muted-foreground">
                <div className="flex justify-between w-full">
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {formatDate(topic.created_at)}
                    <span className="mx-2">•</span>
                    <span>
                      By {topic.author?.first_name} {topic.author?.last_name}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare size={14} className="mr-1" />
                    {topic.view_count || 0} views
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <NewTopicDialog 
        isOpen={isNewTopicOpen}
        onClose={() => setIsNewTopicOpen(false)}
        onCreateTopic={onCreateTopic}
      />
    </div>
  );
};

export default DiscussionList;
