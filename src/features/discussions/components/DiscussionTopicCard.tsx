import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Pin, Lock, Calendar, User } from "lucide-react";
import { DiscussionTopic } from "@/types/discussions";

interface DiscussionTopicCardProps {
  topic: DiscussionTopic;
  onSelect: (topic: DiscussionTopic) => void;
}

const DiscussionTopicCard = ({ topic, onSelect }: DiscussionTopicCardProps) => {
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={() => onSelect(topic)}
    >
      <CardHeader>
        <CardTitle className="flex items-center">
          {topic.is_pinned && <Pin size={16} className="mr-2 text-green-600" />}
          {topic.is_locked && <Lock size={16} className="mr-2 text-yellow-600" />}
          {topic.title}
        </CardTitle>
        <CardDescription className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          <span className="mr-2">Posted {formatDate(topic.created_at)}</span>
          <span className="mx-1">•</span>
          <User className="h-4 w-4 mr-1" />
          <span>{topic.author?.firstName} {topic.author?.lastName}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {topic.content ? (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {topic.content}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No content provided</p>
        )}
      </CardContent>
      <CardFooter className="justify-between items-center">
        <div className="flex items-center">
          <MessageSquare className="mr-1 h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {topic.replies_count || 0} {topic.replies_count === 1 ? "reply" : "replies"}
          </span>
        </div>
        {topic.is_pinned && (
          <Badge variant="secondary">
            Pinned
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
};

export default DiscussionTopicCard;
