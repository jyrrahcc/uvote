
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BarChart, User, Calendar, Check, Clock } from "lucide-react";
import { Poll } from "@/types/discussions";
import { formatDistanceToNow, format, isAfter } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import NewPollDialog from "./NewPollDialog";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";

interface PollsListProps {
  polls: Poll[];
  loading: boolean;
  onSelectPoll: (poll: Poll) => void;
  onCreatePoll: (
    question: string,
    options: Record<string, string>,
    description?: string,
    topicId?: string,
    multipleChoice?: boolean,
    endsAt?: string
  ) => Promise<Poll | null>;
  electionId: string;
}

const PollsList = ({
  polls,
  loading,
  onSelectPoll,
  onCreatePoll,
  electionId,
}: PollsListProps) => {
  const [isNewPollOpen, setIsNewPollOpen] = useState(false);
  const { user } = useAuth();
  const { isVoter } = useRole();
  
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };
  
  const isPollActive = (poll: Poll) => {
    if (poll.is_closed) return false;
    if (poll.ends_at) {
      return isAfter(new Date(poll.ends_at), new Date());
    }
    return true;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
        <span className="ml-3 text-lg">Loading polls...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Polls</h2>
        {user && isVoter && (
          <Button 
            onClick={() => setIsNewPollOpen(true)}
            className="bg-[#008f50] hover:bg-[#007a45]"
          >
            <Plus size={16} className="mr-2" />
            Create Poll
          </Button>
        )}
      </div>
      
      {polls.length === 0 ? (
        <Card className="text-center p-6">
          <p className="text-muted-foreground mb-4">
            No polls have been created yet.
          </p>
          {user && isVoter && (
            <Button 
              onClick={() => setIsNewPollOpen(true)}
              className="bg-[#008f50] hover:bg-[#007a45]"
            >
              <Plus size={16} className="mr-2" />
              Create Poll
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <Card 
              key={poll.id} 
              className={`cursor-pointer hover:border-green-300 transition-colors ${
                poll.is_closed ? 'border-gray-200 bg-gray-50' : 
                isPollActive(poll) ? '' : 'border-amber-200 bg-amber-50'
              }`}
              onClick={() => onSelectPoll(poll)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-lg">
                    {poll.question}
                  </CardTitle>
                  <div className="flex items-center">
                    {poll.is_closed ? (
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full flex items-center">
                        <Clock size={12} className="mr-1" />
                        Closed
                      </span>
                    ) : !isPollActive(poll) ? (
                      <span className="text-xs bg-amber-200 text-amber-700 px-2 py-1 rounded-full flex items-center">
                        <Clock size={12} className="mr-1" />
                        Expired
                      </span>
                    ) : (
                      <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded-full flex items-center">
                        <Check size={12} className="mr-1" />
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                {poll.description && (
                  <p className="text-muted-foreground line-clamp-2">{poll.description}</p>
                )}
                <div className="mt-2 text-sm">
                  <span className="font-medium">Options:</span> {Object.keys(poll.options).length}
                </div>
                {poll.ends_at && (
                  <div className="mt-1 text-sm">
                    <span className="font-medium">Ends:</span> {format(new Date(poll.ends_at), 'PPp')}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0 text-xs text-muted-foreground">
                <div className="flex justify-between w-full">
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {formatDate(poll.created_at)}
                    <span className="mx-2">•</span>
                    <User size={14} className="mr-1" />
                    <span>
                      By {poll.author?.first_name} {poll.author?.last_name}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <BarChart size={14} className="mr-1" />
                    View Results
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <NewPollDialog 
        isOpen={isNewPollOpen}
        onClose={() => setIsNewPollOpen(false)}
        onCreatePoll={onCreatePoll}
      />
    </div>
  );
};

export default PollsList;
