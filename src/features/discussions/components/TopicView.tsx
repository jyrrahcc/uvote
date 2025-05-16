
import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ChevronLeft, Pin, Lock, MoreVertical, Trash, Edit, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import CommentItem from "./CommentItem";
import { Discussion, Comment } from "@/types/discussions";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import { DlsudProfile } from "@/types";

interface TopicViewProps {
  topic: Discussion | null;
  comments: Comment[];
  loading: boolean;
  commentLoading: boolean;
  onBack: () => void;
  onAddComment: (topicId: string, content: string, parentId?: string) => Promise<Comment | null>;
  onEditComment: (commentId: string, content: string) => Promise<Comment | null>;
  onDeleteComment: (commentId: string) => Promise<boolean>;
  onDeleteTopic: (topicId: string) => Promise<boolean>;
  onEditTopic: (topicId: string, updates: Partial<Discussion>) => Promise<Discussion | null>;
}

const TopicView = ({
  topic,
  comments,
  loading,
  commentLoading,
  onBack,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onDeleteTopic,
  onEditTopic
}: TopicViewProps) => {
  const [commentContent, setCommentContent] = useState("");
  const [isDeletingTopic, setIsDeletingTopic] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(topic?.title || "");
  const [editContent, setEditContent] = useState(topic?.content || "");
  const { user } = useAuth();
  const { isAdmin } = useRole();
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };
  
  const handleAddComment = async () => {
    if (!commentContent.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    
    if (!topic) {
      toast({
        title: "Error",
        description: "Topic not loaded.",
        variant: "destructive",
      });
      return;
    }
    
    await onAddComment(topic.id, commentContent);
    setCommentContent(""); // Clear the input after successful comment
  };
  
  const handleDeleteTopic = async () => {
    setIsDeletingTopic(true);
    try {
      if (topic) {
        await onDeleteTopic(topic.id);
        toast({
          title: "Success",
          description: "Topic deleted successfully.",
        });
        onBack(); // Navigate back after successful deletion
      }
    } catch (error) {
      console.error("Error deleting topic:", error);
      toast({
        title: "Error",
        description: "Failed to delete topic. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingTopic(false);
    }
  };
  
  const handleEditTopic = async () => {
    if (!topic) return;
    
    try {
      const updates = {
        title: editTitle,
        content: editContent
      };
      
      await onEditTopic(topic.id, updates);
      toast({
        title: "Success",
        description: "Topic updated successfully.",
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating topic:", error);
      toast({
        title: "Error",
        description: "Failed to update topic. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (loading || !topic) {
    return <div className="text-center py-8">Loading discussion...</div>;
  }
  
  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Discussions
      </Button>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex justify-between items-start p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center">
              {topic.is_pinned && (
                <Pin className="inline-block h-4 w-4 mr-1.5 mb-0.5 text-amber-500" />
              )}
              {topic.is_locked && (
                <Lock className="inline-block h-4 w-4 mr-1.5 mb-0.5 text-gray-500" />
              )}
              {topic.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(topic.created_at), {
                addSuffix: true,
              })}{" "}
              by {topic.author?.firstName} {topic.author?.lastName}
            </p>
            {topic.content && (
              <p className="mt-2 text-muted-foreground">{topic.content}</p>
            )}
          </div>
          
          {(user?.id === topic.created_by || isAdmin) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open dropdown menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Topic
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    toast({
                      title: "Feature not implemented",
                      description: "This feature is under development.",
                    })
                  }
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Report Topic
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDeleteTopic}
                  disabled={isDeletingTopic}
                  className="text-red-500 focus:text-red-500"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Topic
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="p-6 border-t">
          <h2 className="text-lg font-semibold tracking-tight mb-4">Comments</h2>
          
          {comments.length === 0 ? (
            <Alert>
              <AlertTitle>No comments yet</AlertTitle>
              <AlertDescription>Be the first to comment!</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onDelete={onDeleteComment}
                  onEdit={onEditComment}
                />
              ))}
            </div>
          )}
          
          <div className="mt-6">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={(user as DlsudProfile)?.image_url} />
                <AvatarFallback className="text-xs">
                  {user ? getInitials((user as DlsudProfile)?.first_name || '', (user as DlsudProfile)?.last_name || '') : '??'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium leading-none">
                {(user as DlsudProfile)?.first_name} {(user as DlsudProfile)?.last_name}
              </span>
            </div>
            <div className="mt-2">
              <Textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Add your comment..."
                className="w-full"
              />
              <Button
                onClick={handleAddComment}
                disabled={commentLoading}
                className="mt-2"
              >
                {commentLoading ? "Adding..." : "Add Comment"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Dialog open={isEditDialogOpen} onOpenChange={() => setIsEditDialogOpen(false)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Discussion Topic</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="content" className="text-right">
                Content
              </Label>
              <Textarea
                id="content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleEditTopic}>
              Update Topic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TopicView;
