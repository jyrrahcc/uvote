
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Pin, LockClosedIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Discussion } from "@/types/discussions";

interface DiscussionTopicCardProps {
  topic: Discussion;
  electionId: string;
  onClick: () => void;
}

const DiscussionTopicCard = ({ topic, electionId, onClick }: DiscussionTopicCardProps) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold line-clamp-2 pr-8 flex-grow">
            {topic.is_pinned && (
              <Pin className="inline-block h-4 w-4 mr-1.5 mb-0.5 text-amber-500" />
            )}
            {topic.is_locked && (
              <LockClosedIcon className="inline-block h-4 w-4 mr-1.5 mb-0.5 text-gray-500" />
            )}
            {topic.title}
          </h3>
        </div>
        
        {topic.content && (
          <p className="text-muted-foreground mt-2 line-clamp-2">{topic.content}</p>
        )}
      </CardContent>
      
      <CardFooter className="px-4 py-3 border-t flex justify-between items-center text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={topic.author?.imageUrl} />
            <AvatarFallback className="text-xs">
              {topic.author ? getInitials(topic.author.firstName, topic.author.lastName) : '??'}
            </AvatarFallback>
          </Avatar>
          <span>
            {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
            {topic.author && ` by ${topic.author.firstName} ${topic.author.lastName}`}
          </span>
        </div>
        
        <div className="flex items-center">
          <MessageSquare className="h-4 w-4 mr-1" />
          <span>{topic.repliesCount || 0} replies</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DiscussionTopicCard;
