
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface NewPollDialogProps {
  onCreatePoll: (
    question: string, 
    options: Record<string, string>, 
    description?: string,
    multipleChoice?: boolean,
    endsAt?: string
  ) => Promise<any>;
  isOpen?: boolean;
  onClose?: () => void;
  electionId: string;
}

const NewPollDialog = ({ 
  onCreatePoll, 
  isOpen: controlledIsOpen, 
  onClose,
  electionId 
}: NewPollDialogProps) => {
  const [isOpen, setIsOpen] = useState(controlledIsOpen || false);
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<Record<string, string>>(() => {
    const initialOptions: Record<string, string> = {};
    const id1 = uuidv4();
    const id2 = uuidv4();
    initialOptions[id1] = '';
    initialOptions[id2] = '';
    return initialOptions;
  });
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen);
    }
  }, [controlledIsOpen]);

  const handleOpenChange = (open: boolean) => {
    if (onClose && !open) {
      onClose();
    }
    setIsOpen(open);
  };

  const addOption = () => {
    setOptions(prev => {
      const newOptions = { ...prev };
      newOptions[uuidv4()] = '';
      return newOptions;
    });
  };

  const removeOption = (id: string) => {
    if (Object.keys(options).length <= 2) {
      toast({
        title: "Error",
        description: "A poll must have at least two options",
        variant: "destructive"
      });
      return;
    }
    
    setOptions(prev => {
      const newOptions = { ...prev };
      delete newOptions[id];
      return newOptions;
    });
  };

  const updateOption = (id: string, value: string) => {
    setOptions(prev => {
      const newOptions = { ...prev };
      newOptions[id] = value;
      return newOptions;
    });
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a poll question",
        variant: "destructive"
      });
      return;
    }

    // Check if any option is empty
    const hasEmptyOption = Object.values(options).some(option => !option.trim());
    if (hasEmptyOption) {
      toast({
        title: "Error",
        description: "All poll options must have text",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate options
    const optionValues = Object.values(options).map(o => o.trim().toLowerCase());
    const uniqueOptions = new Set(optionValues);
    if (uniqueOptions.size !== optionValues.length) {
      toast({
        title: "Error",
        description: "Poll options must be unique",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await onCreatePoll(
        question.trim(), 
        options, 
        description.trim() || undefined,
        multipleChoice
      );
      
      if (result) {
        setQuestion('');
        setDescription('');
        setOptions(() => {
          const newOptions: Record<string, string> = {};
          const id1 = uuidv4();
          const id2 = uuidv4();
          newOptions[id1] = '';
          newOptions[id2] = '';
          return newOptions;
        });
        setMultipleChoice(false);
        handleOpenChange(false);
        toast({
          title: "Success",
          description: "Poll created successfully"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to create poll: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Create a New Poll</DialogTitle>
          <DialogDescription>
            Create a poll to gather opinions on this election.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="p-6 pt-0 max-h-[calc(90vh-170px)]">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What would you like to ask?"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide additional context for your poll"
                className="min-h-[80px]"
              />
            </div>
            
            <div className="space-y-3">
              <Label>Options</Label>
              {Object.entries(options).map(([id, value]) => (
                <div key={id} className="flex items-center gap-2">
                  <Input
                    value={value}
                    onChange={(e) => updateOption(id, e.target.value)}
                    placeholder="Option text"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addOption}
                className="w-full mt-2"
              >
                Add Option
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="multipleChoice" 
                checked={multipleChoice} 
                onCheckedChange={(checked) => setMultipleChoice(!!checked)}
              />
              <Label htmlFor="multipleChoice">Allow multiple choices</Label>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="p-6 pt-2">
          <Button
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !question.trim()}
          >
            {isSubmitting ? 'Creating...' : 'Create Poll'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewPollDialog;
