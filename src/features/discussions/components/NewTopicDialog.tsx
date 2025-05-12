
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

interface NewTopicDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTopic: (title: string, content: string) => Promise<any>;
}

const NewTopicDialog = ({ isOpen, onClose, onCreateTopic }: NewTopicDialogProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log("Submitting new topic:", { title, content });
      
      const result = await onCreateTopic(title, content);
      console.log("Topic creation result:", result);
      
      if (result) {
        setTitle("");
        setContent("");
        onClose();
      }
    } catch (error: any) {
      console.error("Error in dialog when creating topic:", error);
      setError(error.message || "Failed to create topic");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Discussion Topic</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter topic title"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content (Optional)</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter topic content"
              rows={5}
              disabled={loading}
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#008f50] hover:bg-[#007a45]" disabled={loading}>
              {loading ? <Spinner className="mr-2" /> : null}
              Create Topic
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTopicDialog;
