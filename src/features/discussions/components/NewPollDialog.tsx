
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Plus, X, CalendarIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NewPollDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePoll: (
    question: string,
    options: Record<string, string>,
    description?: string,
    multipleChoice?: boolean,
    endsAt?: string
  ) => Promise<any>;
}

const NewPollDialog = ({ isOpen, onClose, onCreatePoll }: NewPollDialogProps) => {
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<Record<string, string>>(() => {
    const initialOptions: Record<string, string> = {};
    initialOptions[uuidv4()] = "";
    initialOptions[uuidv4()] = "";
    return initialOptions;
  });
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const addOption = () => {
    setOptions(prev => ({
      ...prev,
      [uuidv4()]: ""
    }));
  };
  
  const removeOption = (id: string) => {
    if (Object.keys(options).length <= 2) {
      return; // Keep at least 2 options
    }
    
    const newOptions = { ...options };
    delete newOptions[id];
    setOptions(newOptions);
  };
  
  const updateOption = (id: string, value: string) => {
    setOptions(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!question.trim()) {
      setError("Question is required");
      return;
    }
    
    // Check if all options have values
    const hasEmptyOptions = Object.values(options).some(value => !value.trim());
    if (hasEmptyOptions) {
      setError("All options must have a value");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Format options - remove empty values
      const validOptions = Object.entries(options).reduce((acc, [id, value]) => {
        if (value.trim()) {
          acc[id] = value.trim();
        }
        return acc;
      }, {} as Record<string, string>);
      
      const result = await onCreatePoll(
        question,
        validOptions,
        description || undefined,
        multipleChoice,
        date ? date.toISOString() : undefined
      );
      
      if (result) {
        resetForm();
        onClose();
      }
    } catch (error: any) {
      setError(error.message || "Failed to create poll");
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setQuestion("");
    setDescription("");
    const initialOptions: Record<string, string> = {};
    initialOptions[uuidv4()] = "";
    initialOptions[uuidv4()] = "";
    setOptions(initialOptions);
    setMultipleChoice(false);
    setDate(undefined);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
      }
      onClose();
    }}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Poll</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What is your poll question?"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add additional context for your question"
                rows={2}
                disabled={loading}
              />
            </div>
            
            <div className="space-y-3">
              <Label>Options</Label>
              {Object.entries(options).map(([id, value]) => (
                <div key={id} className="flex gap-2">
                  <Input
                    value={value}
                    onChange={(e) => updateOption(id, e.target.value)}
                    placeholder="Enter an option"
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(id)}
                    disabled={Object.keys(options).length <= 2 || loading}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={loading}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="multiple-choice"
                checked={multipleChoice}
                onCheckedChange={setMultipleChoice}
                disabled={loading}
              />
              <Label htmlFor="multiple-choice">Allow multiple choices</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date">Poll End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                    disabled={loading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                If no end date is selected, the poll will remain open until manually closed.
              </p>
            </div>
            
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#008f50] hover:bg-[#007a45]" disabled={loading}>
                {loading ? <Spinner className="mr-2" /> : null}
                Create Poll
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NewPollDialog;
