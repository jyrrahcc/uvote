
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Calendar, User, BarChart, Check, Clock, AlertTriangle } from "lucide-react";
import { Poll, PollResults } from "@/types/discussions";
import { formatDistanceToNow, format, isAfter } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface PollViewProps {
  poll: Poll | null;
  pollResults: PollResults[];
  userVote: string[] | null;
  loading: boolean;
  voteLoading: boolean;
  onBack: () => void;
  onVote: (pollId: string, selectedOptions: string[]) => Promise<boolean>;
  onClosePoll: (pollId: string) => Promise<Poll | null>;
  onDeletePoll: (pollId: string) => Promise<boolean>;
}

const PollView = ({
  poll,
  pollResults,
  userVote,
  loading,
  voteLoading,
  onBack,
  onVote,
  onClosePoll,
  onDeletePoll
}: PollViewProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const { user } = useAuth();
  const { isAdmin } = useRole();
  
  useEffect(() => {
    if (userVote) {
      setSelectedOptions(userVote);
    } else {
      setSelectedOptions([]);
    }
  }, [userVote]);
  
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };
  
  const isPollActive = () => {
    if (!poll) return false;
    if (poll.is_closed) return false;
    if (poll.ends_at) {
      return isAfter(new Date(poll.ends_at), new Date());
    }
    return true;
  };
  
  const handleOptionSelect = (optionId: string) => {
    if (poll?.multiple_choice) {
      // For multiple choice polls
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(selectedOptions.filter(id => id !== optionId));
      } else {
        setSelectedOptions([...selectedOptions, optionId]);
      }
    } else {
      // For single choice polls
      setSelectedOptions([optionId]);
    }
  };
  
  const handleVote = async () => {
    if (!poll || !user) return;
    
    if (selectedOptions.length === 0) {
      toast.error("Please select at least one option");
      return;
    }
    
    await onVote(poll.id, selectedOptions);
  };
  
  const handleClosePoll = async () => {
    if (!poll) return;
    
    if (window.confirm("Are you sure you want to close this poll? This will prevent further voting.")) {
      await onClosePoll(poll.id);
    }
  };
  
  const handleDeletePoll = async () => {
    if (!poll) return;
    
    if (window.confirm("Are you sure you want to delete this poll? This action cannot be undone.")) {
      const success = await onDeletePoll(poll.id);
      if (success) {
        onBack();
      }
    }
  };
  
  const canManagePoll = () => {
    if (!user || !poll) return false;
    return isAdmin || poll.created_by === user.id;
  };

  if (loading || !poll) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
        <span className="ml-3 text-lg">Loading poll...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Polls
        </Button>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <CardTitle className="text-xl">{poll.question}</CardTitle>
                  <div>
                    {poll.is_closed ? (
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full flex items-center">
                        <Clock size={14} className="mr-1" />
                        Closed
                      </span>
                    ) : !isPollActive() ? (
                      <span className="text-xs bg-amber-200 text-amber-700 px-2 py-1 rounded-full flex items-center">
                        <AlertTriangle size={14} className="mr-1" />
                        Expired
                      </span>
                    ) : (
                      <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded-full flex items-center">
                        <Check size={14} className="mr-1" />
                        Active
                      </span>
                    )}
                  </div>
                </div>
                <CardDescription className="flex items-center mt-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="mr-2">Created {formatDate(poll.created_at)}</span>
                  <span className="mx-1">•</span>
                  <User className="h-4 w-4 mr-1" />
                  <span>{poll.author?.first_name} {poll.author?.last_name}</span>
                </CardDescription>
                {poll.ends_at && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">End date:</span> {format(new Date(poll.ends_at), 'PPp')}
                  </div>
                )}
                {poll.multiple_choice && (
                  <div className="mt-1 text-sm text-blue-600">
                    <span>Multiple choice poll • Select one or more options</span>
                  </div>
                )}
              </div>
              
              {canManagePoll() && !poll.is_closed && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleClosePoll}
                  >
                    <Clock size={16} className="mr-1" />
                    Close Poll
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDeletePoll}
                    className="text-red-500 hover:text-red-600"
                  >
                    <AlertTriangle size={16} className="mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {poll.description && (
              <div className="mb-6 bg-muted p-4 rounded-md">
                <p className="whitespace-pre-wrap">{poll.description}</p>
              </div>
            )}
            
            <h3 className="text-lg font-medium flex items-center mb-4">
              <BarChart className="mr-2 h-5 w-5" />
              Poll Results
            </h3>
            
            {userVote ? (
              // Show results if user has voted
              <div className="space-y-4">
                {pollResults.map((result) => (
                  <div key={result.optionId} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className={`mr-2 ${userVote.includes(result.optionId) ? 'font-medium text-green-600' : ''}`}>
                          {result.optionText}
                          {userVote.includes(result.optionId) && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              Your vote
                            </span>
                          )}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {result.votes} {result.votes === 1 ? 'vote' : 'votes'} ({result.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={result.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              // Show voting form if user hasn't voted
              <div className="space-y-4">
                {isPollActive() ? (
                  poll.multiple_choice ? (
                    // Multiple choice poll
                    <div className="space-y-4">
                      {Object.entries(poll.options).map(([optionId, optionText]) => (
                        <div key={optionId} className="flex items-center space-x-2">
                          <Checkbox 
                            id={optionId}
                            checked={selectedOptions.includes(optionId)}
                            onCheckedChange={() => handleOptionSelect(optionId)}
                          />
                          <Label htmlFor={optionId}>{optionText}</Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Single choice poll
                    <RadioGroup 
                      value={selectedOptions[0] || ""} 
                      onValueChange={(value) => setSelectedOptions([value])}
                    >
                      <div className="space-y-4">
                        {Object.entries(poll.options).map(([optionId, optionText]) => (
                          <div key={optionId} className="flex items-center space-x-2">
                            <RadioGroupItem value={optionId} id={optionId} />
                            <Label htmlFor={optionId}>{optionText}</Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )
                ) : (
                  // Poll is closed or expired - show results for non-voters too
                  <div className="space-y-4">
                    {pollResults.map((result) => (
                      <div key={result.optionId} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <span>{result.optionText}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {result.votes} {result.votes === 1 ? 'vote' : 'votes'} ({result.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={result.percentage} className="h-2" />
                      </div>
                    ))}
                    
                    <div className="text-center text-amber-600 mt-6">
                      <AlertTriangle className="h-5 w-5 mx-auto mb-2" />
                      <p>{poll.is_closed ? "This poll is closed" : "This poll has expired"}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          
          {!userVote && isPollActive() && user && (
            <CardFooter className="border-t pt-4 flex justify-end">
              <Button 
                onClick={handleVote}
                className="bg-[#008f50] hover:bg-[#007a45]"
                disabled={selectedOptions.length === 0 || voteLoading}
              >
                {voteLoading ? <Spinner className="mr-2" /> : null}
                Vote Now
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PollView;
