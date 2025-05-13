
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
import { PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';

interface NewPollDialogProps {
  isOpen?: boolean;
  onClose: () => void;
  onCreatePoll: (
    question: string,
    options: Record<string, string>,
    description?: string,
    multipleChoice?: boolean,
    endsAt?: string
  ) => Promise<any>;
  electionId: string;
  topicId?: string;
}

const NewPollDialog = ({ 
  isOpen, 
  onClose, 
  onCreatePoll, 
  electionId,
  topicId 
}: NewPollDialogProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<{ id: string; text: string }[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
  ]);
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [endsAt, setEndsAt] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form state when dialog is opened
  useEffect(() => {
    if (isOpen) {
      setQuestion('');
      setDescription('');
      setOptions([
        { id: '1', text: '' },
        { id: '2', text: '' },
      ]);
      setMultipleChoice(false);
      setEndsAt(undefined);
    }
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      onClose();
    }
  };

  // Update internal state when isOpen changes
  useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  const handleAddOption = () => {
    setOptions([
      ...options,
      { id: crypto.randomUUID(), text: '' },
    ]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) {
      toast({
        title: "Error",
        description: "You need at least two options for a poll.",
        variant: "destructive",
      });
      return;
    }
    setOptions(options.filter((option) => option.id !== id));
  };

  const handleOptionChange = (id: string, text: string) => {
    setOptions(
      options.map((option) =>
        option.id === id ? { ...option, text } : option
      )
    );
  };

  const handleSubmit = async () => {
    // Validate form
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question for the poll.",
        variant: "destructive",
      });
      return;
    }

    const validOptions = options.filter((option) => option.text.trim());
    if (validOptions.length < 2) {
      toast({
        title: "Error",
        description: "Please enter at least two options for the poll.",
        variant: "destructive",
      });
      return;
    }

    const optionsObject: Record<string, string> = {};
    validOptions.forEach((option) => {
      optionsObject[option.id] = option.text.trim();
    });

    setIsSubmitting(true);

    try {
      await onCreatePoll(
        question.trim(),
        optionsObject,
        description.trim() || undefined,
        multipleChoice,
        endsAt ? endsAt.toISOString() : undefined
      );

      toast({
        title: "Success",
        description: "Poll created successfully!",
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to create poll: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen !== undefined ? isOpen : open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle>Create a New Poll</DialogTitle>
          <DialogDescription>
            Create a poll for users to vote on and gather opinions.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow pr-4 -mr-6 max-h-[calc(80vh-180px)] overflow-y-auto">
          <div className="space-y-4 py-2 pr-6">
            <div className="space-y-2">
              <Label htmlFor="question" className="text-right">
                Poll Question
              </Label>
              <Input
                id="question"
                placeholder="What would you like to ask?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-right">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Provide more context about the poll"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Poll Options</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddOption}
                  type="button"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
              
              {options.map((option) => (
                <div key={option.id} className="flex gap-2 items-center">
                  <Input
                    placeholder={`Option ${options.indexOf(option) + 1}`}
                    value={option.text}
                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => handleRemoveOption(option.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="multipleChoice">Allow Multiple Choices</Label>
                <Switch
                  id="multipleChoice"
                  checked={multipleChoice}
                  onCheckedChange={setMultipleChoice}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Poll End Date (Optional)</Label>
              <DateTimePicker
                date={endsAt}
                setDate={setEndsAt}
                showTimePicker
                className="w-full"
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#008f50] hover:bg-[#007a45]"
          >
            {isSubmitting ? 'Creating...' : 'Create Poll'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewPollDialog;
