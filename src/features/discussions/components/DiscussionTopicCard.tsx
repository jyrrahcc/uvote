
import { Calendar, MessageSquare, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DiscussionTopic } from "@/types/discussions";
import { Badge } from "@/components/ui/badge";

export interface DiscussionTopicCardProps {
  topic: DiscussionTopic;
  electionId: string;
  onClick: () => void;
}

const DiscussionTopicCard = ({ topic, electionId, onClick }: DiscussionTopicCardProps) => {
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getAuthorDisplay = () => {
    if (topic.author && topic.author.firstName && topic.author.lastName) {
      return `${topic.author.firstName} ${topic.author.lastName}`;
    } else if (topic.author && topic.author.firstName) {
      return topic.author.firstName;
    } else if (topic.author && topic.author.lastName) {
      return topic.author.lastName;
    }
    return "Anonymous User";
  };

  return (
    <Card 
      className="cursor-pointer hover:border-green-300 transition-colors"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            {topic.title}
          </CardTitle>
          <div className="flex gap-1.5">
            {topic.is_pinned && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Pinned
              </Badge>
            )}
            {topic.is_locked && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Locked
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {topic.content && (
          <p className="text-muted-foreground line-clamp-2">
            {topic.content}
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-0 text-xs text-muted-foreground">
        <div className="flex flex-wrap justify-between w-full">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            {formatDate(topic.created_at)}
            <span className="mx-2">•</span>
            <User size={14} className="mr-1" />
            <span>
              By {getAuthorDisplay()}
            </span>
          </div>
          <div className="flex items-center">
            <MessageSquare size={14} className="mr-1" />
            {topic.repliesCount || 0} {(topic.repliesCount === 1) ? 'reply' : 'replies'}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DiscussionTopicCard;
