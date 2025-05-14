
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MoreVertical, MessageCircle, Edit, Trash, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DiscussionComment } from "@/types/discussions";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import { getInitials } from "../utils/profileUtils";

interface CommentItemProps {
  comment: DiscussionComment;
  onReply: (content: string, parentId?: string) => Promise<any>;
  onEdit: (commentId: string, content: string) => Promise<any>;
  onDelete: (commentId: string) => Promise<boolean>;
}

const CommentItem = ({ comment, onReply, onEdit, onDelete }: CommentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { isAdmin } = useRole();
  
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };
  
  const handleEdit = async () => {
    if (!editContent.trim()) return;
    
    try {
      setIsSubmitting(true);
      await onEdit(comment.id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to edit comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
      try {
        setIsSubmitting(true);
        await onDelete(comment.id);
      } catch (error) {
        console.error("Failed to delete comment:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handleReply = async () => {
    if (!replyContent.trim()) return;
    
    try {
      setIsSubmitting(true);
      await onReply(replyContent, comment.id);
      setReplyContent("");
      setIsReplying(false);
    } catch (error) {
      console.error("Failed to reply to comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const canModifyComment = () => {
    if (!user) return false;
    return isAdmin || comment.createdBy === user.id;
  };
  
  return (
    <Card className={`${comment.parentId ? 'ml-8 mt-2' : ''}`}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              {comment.author?.imageUrl ? (
                <AvatarImage src={comment.author.imageUrl} alt={`${comment.author?.firstName} ${comment.author?.lastName}`} />
              ) : (
                <AvatarFallback>
                  {comment.author ? getInitials(comment.author.firstName, comment.author.lastName) : <User />}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="font-medium">
                {comment.author ? `${comment.author.firstName} ${comment.author.lastName}` : "Unknown User"}
              </div>
              <div className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</div>
            </div>
          </div>
          
          {canModifyComment() && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-500 hover:text-red-600">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleEdit}
                disabled={!editContent.trim() || isSubmitting}
              >
                {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{comment.content}</div>
        )}
      </CardContent>
      
      {!isEditing && !comment.parentId && user && (
        <CardFooter className="flex justify-start">
          {isReplying ? (
            <div className="space-y-2 w-full">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsReplying(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleReply}
                  disabled={!replyContent.trim() || isSubmitting}
                >
                  {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                  Reply
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center text-muted-foreground hover:text-foreground"
              onClick={() => setIsReplying(true)}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Reply
            </Button>
          )}
        </CardFooter>
      )}
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default CommentItem;
