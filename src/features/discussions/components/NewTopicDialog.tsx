
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Discussion } from "@/types/discussions";

export interface NewTopicDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTopic: (title: string, content: string) => Promise<Discussion | null>;
  electionId: string;
}

const NewTopicDialog = ({ isOpen, onClose, onCreateTopic, electionId }: NewTopicDialogProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({ 
        title: "Error", 
        description: "Please enter a topic title",
        variant: "destructive" 
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      const result = await onCreateTopic(title, content);
      
      if (result) {
        toast({
          title: "Success!",
          description: "Your discussion topic has been created."
        });
        
        // Reset form and close dialog
        setTitle("");
        setContent("");
        onClose();
      }
    } catch (error) {
      console.error("Error creating topic:", error);
      toast({
        title: "Error",
        description: "Failed to create discussion topic. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Discussion Topic</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear, specific title"
              maxLength={100}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content (optional)</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your topic in detail"
              rows={6}
              disabled={isSubmitting}
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Creating...
                </>
              ) : (
                "Create Topic"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTopicDialog;
