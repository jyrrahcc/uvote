import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, BarChart } from "lucide-react";
import { Poll } from "@/types/discussions";
import { formatDistanceToNow } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import NewPollDialog from "./NewPollDialog";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import { toast } from "@/hooks/use-toast";

interface PollsListProps {
  polls: Poll[];
  loading: boolean;
  onSelectPoll: (poll: Poll) => void;
  onCreatePoll: (question: string, options: Record<string, string>, description?: string, multipleChoice?: boolean, endsAt?: string) => Promise<Poll | null>;
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

  const handleCreatePoll = async (
    question: string, 
    options: Record<string, string>, 
    description?: string,
    multipleChoice?: boolean,
    endsAt?: string
  ) => {
    return onCreatePoll(question, options, description, multipleChoice, endsAt);
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
            New Poll
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
              Create a Poll
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <Card 
              key={poll.id} 
              className="cursor-pointer hover:border-green-300 transition-colors"
              onClick={() => onSelectPoll(poll)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {poll.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                {poll.description && (
                  <p className="text-muted-foreground line-clamp-2">{poll.description}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {Object.keys(poll.options).length} options
                  </span>
                  {poll.multiple_choice && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      Multiple Choice
                    </span>
                  )}
                  {poll.is_closed && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      Closed
                    </span>
                  )}
                  {poll.ends_at && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                      Ends {formatDate(poll.ends_at)}
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0 text-xs text-muted-foreground">
                <div className="flex justify-between w-full">
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {formatDate(poll.created_at)}
                    <span className="mx-2">•</span>
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
        onCreatePoll={handleCreatePoll}
        electionId={electionId}
      />
    </div>
  );
};

export default PollsList;
