
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, User } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DiscussionTopic } from "@/types/discussions";
import { Link } from "react-router-dom";

interface DiscussionTopicCardProps {
  topic: DiscussionTopic;
  electionId: string;
  onSelectTopic?: (topic: DiscussionTopic) => void;
}

const DiscussionTopicCard = ({ topic, electionId, onSelectTopic }: DiscussionTopicCardProps) => {
  const { title, content, createdAt, author, repliesCount = 0 } = topic;

  // Handle click event if onSelectTopic is provided, otherwise use Link navigation
  const handleCardClick = () => {
    if (onSelectTopic) {
      onSelectTopic(topic);
    }
  };

  const cardContent = (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <div className="flex items-center mr-4">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={author?.imageUrl || ""} alt={author ? `${author.firstName} ${author.lastName}` : "Unknown"} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span>
              {author ? `${author.firstName} ${author.lastName}` : "Unknown user"}
            </span>
          </div>
          <span className="text-xs">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <p className="line-clamp-2 text-muted-foreground">
          {content}
        </p>
      </CardContent>
      <CardFooter className="pt-2 text-sm text-muted-foreground">
        <div className="flex items-center">
          <MessageSquare className="h-4 w-4 mr-1" />
          <span>
            {repliesCount} {repliesCount === 1 ? "reply" : "replies"}
          </span>
        </div>
      </CardFooter>
    </Card>
  );

  // If onSelectTopic is provided, make the card clickable; otherwise wrap it in a Link
  return onSelectTopic ? (
    <div onClick={handleCardClick}>{cardContent}</div>
  ) : (
    <Link to={`/elections/${electionId}/discussions/${topic.id}`}>
      {cardContent}
    </Link>
  );
};

export default DiscussionTopicCard;
