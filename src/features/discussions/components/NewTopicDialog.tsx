
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
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NewTopicDialogProps {
  onCreateTopic: (title: string, content: string) => Promise<any>;
  disabled?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const NewTopicDialog = ({ 
  onCreateTopic, 
  disabled = false, 
  isOpen, 
  onClose 
}: NewTopicDialogProps) => {
  const [open, setOpen] = useState(isOpen || false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle controlled and uncontrolled state
  const handleOpenChange = (newOpenState: boolean) => {
    if (onClose && !newOpenState) {
      onClose();
    }
    setOpen(newOpenState);
  };

  // Update internal state when isOpen changes
  useState(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  });

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a topic title');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Submitting new topic:", { title, content });
      const result = await onCreateTopic(title.trim(), content.trim());
      
      if (result) {
        console.log("Topic creation result:", result);
        setTitle('');
        setContent('');
        handleOpenChange(false);
        toast.success('Topic created successfully');
      } else {
        console.error("Failed to create topic: No result returned");
        toast.error('Failed to create topic');
      }
    } catch (error: any) {
      console.error("Error in topic dialog submission:", error);
      toast.error(`Error creating topic: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen !== undefined ? isOpen : open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" disabled={disabled}>
          New Topic
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Create a New Topic</DialogTitle>
          <DialogDescription>
            Start a discussion on this election.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="p-6 pt-0 max-h-[500px]">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Topic title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content" className="text-right">
                Content
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What would you like to discuss?"
                className="min-h-[150px]"
              />
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="p-6 pt-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting || !title.trim()}>
            {isSubmitting ? 'Creating...' : 'Create Topic'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewTopicDialog;
