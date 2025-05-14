
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2 } from "lucide-react";
import { Poll } from "@/types";

interface NewPollDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePoll: (
    question: string,
    options: Record<string, string>,
    description?: string,
    multipleChoice?: boolean,
    endsAt?: string
  ) => Promise<Poll | null>;
  electionId: string;
}

const NewPollDialog = ({ isOpen, onClose, onCreatePoll, electionId }: NewPollDialogProps) => {
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<Record<string, string>>({
    "option1": "",
    "option2": ""
  });
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a poll question",
        variant: "destructive"
      });
      return;
    }
    
    // Filter out empty options
    const filteredOptions: Record<string, string> = {};
    let validOptionsCount = 0;
    
    Object.entries(options).forEach(([key, value]) => {
      if (value.trim()) {
        filteredOptions[key] = value.trim();
        validOptionsCount++;
      }
    });
    
    if (validOptionsCount < 2) {
      toast({
        title: "Error",
        description: "Please add at least two options",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      const result = await onCreatePoll(
        question.trim(),
        filteredOptions,
        description.trim() || undefined,
        multipleChoice
      );
      
      if (result) {
        resetForm();
        onClose();
        toast({
          title: "Success",
          description: "Poll created successfully",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error creating poll:", error);
      toast({
        title: "Error",
        description: "Failed to create poll",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleOptionChange = (optionKey: string, value: string) => {
    setOptions(prev => ({
      ...prev,
      [optionKey]: value
    }));
  };
  
  const addOption = () => {
    const newOptionKey = `option${Object.keys(options).length + 1}`;
    setOptions(prev => ({
      ...prev,
      [newOptionKey]: ""
    }));
  };
  
  const removeOption = (optionKey: string) => {
    if (Object.keys(options).length <= 2) {
      toast({
        title: "Error",
        description: "A poll must have at least two options",
        variant: "destructive"
      });
      return;
    }
    
    const newOptions = { ...options };
    delete newOptions[optionKey];
    setOptions(newOptions);
  };
  
  const resetForm = () => {
    setQuestion("");
    setDescription("");
    setOptions({
      "option1": "",
      "option2": ""
    });
    setMultipleChoice(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Poll</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="question" className="text-sm font-medium">
              Poll Question
            </label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              className="mt-1"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add additional context to your poll"
              className="mt-1"
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-medium">Poll Options</label>
            {Object.entries(options).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <Input
                  value={value}
                  onChange={(e) => handleOptionChange(key, e.target.value)}
                  placeholder={`Option ${key.replace('option', '')}`}
                  className="flex-1"
                  required
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeOption(key)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="mt-2"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="multiple-choice"
              checked={multipleChoice}
              onCheckedChange={setMultipleChoice}
            />
            <Label htmlFor="multiple-choice">Allow multiple selections</Label>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Poll"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewPollDialog;
