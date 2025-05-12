
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, PlusCircle } from 'lucide-react';

interface NewPollDialogProps {
  onCreatePoll: (
    question: string, 
    options: Record<string, string>, 
    description?: string, 
    multipleChoice?: boolean,
    endsAt?: string
  ) => Promise<any>;
  disabled?: boolean;
  electionId: string;
  topicId?: string;
}

const NewPollDialog = ({ 
  onCreatePoll, 
  disabled = false,
  electionId,
  topicId
}: NewPollDialogProps) => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<{ id: string; text: string }[]>([
    { id: '1', text: '' },
    { id: '2', text: '' }
  ]);
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddOption = () => {
    setOptions([
      ...options,
      { id: `${Date.now()}`, text: '' }
    ]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) {
      toast.error('A poll must have at least 2 options');
      return;
    }
    setOptions(options.filter(option => option.id !== id));
  };

  const updateOptionText = (id: string, text: string) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, text } : option
    ));
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      toast.error('Please enter a poll question');
      return;
    }

    const optionsValid = options.every(option => option.text.trim() !== '');
    if (!optionsValid) {
      toast.error('All poll options must have text');
      return;
    }

    const optionsObject = options.reduce((acc, option, index) => {
      acc[option.id] = option.text;
      return acc;
    }, {} as Record<string, string>);

    try {
      setIsSubmitting(true);
      const result = await onCreatePoll(
        question.trim(),
        optionsObject,
        description.trim() || undefined,
        multipleChoice
      );
      
      if (result) {
        setQuestion('');
        setDescription('');
        setOptions([
          { id: '1', text: '' },
          { id: '2', text: '' }
        ]);
        setMultipleChoice(false);
        setOpen(false);
        toast.success('Poll created successfully');
      } else {
        toast.error('Failed to create poll');
      }
    } catch (error: any) {
      toast.error(`Error creating poll: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          New Poll
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Create a New Poll</DialogTitle>
          <DialogDescription>
            Get feedback from voters with a poll.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="p-6 pt-0 max-h-[600px]">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question" className="text-right">
                Question
              </Label>
              <Input
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What's your question?"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-right">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide some context for your poll"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-right">
                Poll Options
              </Label>
              <div className="space-y-3">
                {options.map((option) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <Input
                      value={option.text}
                      onChange={(e) => updateOptionText(option.id, e.target.value)}
                      placeholder={`Option ${options.findIndex(o => o.id === option.id) + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(option.id)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleAddOption}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="multipleChoice"
                checked={multipleChoice}
                onCheckedChange={(checked) => setMultipleChoice(checked === true)}
              />
              <Label htmlFor="multipleChoice">
                Allow multiple choices
              </Label>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="p-6 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Poll'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewPollDialog;
