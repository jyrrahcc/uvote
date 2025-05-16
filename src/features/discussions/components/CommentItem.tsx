
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Trash, Edit, Check, X } from "lucide-react";
import { Comment } from "@/types/discussions";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CommentItemProps {
  comment: Comment;
  onDelete?: (commentId: string) => Promise<boolean>;
  onEdit?: (commentId: string, content: string) => Promise<Comment | null>;
  isReply?: boolean;
  showReplyButton?: boolean;
}

const CommentItem = ({
  comment,
  onDelete,
  onEdit,
  isReply = false,
  showReplyButton = false,
}: CommentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const { user } = useAuth();
  const { isAdmin } = useRole();
  
  const isOwner = user && comment.user_id === user.id;
  const canManage = isAdmin || isOwner;
  
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "??";
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
  };
  
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };
  
  const handleEdit = async () => {
    if (!onEdit || !editedContent.trim()) return;
    
    try {
      const success = await onEdit(comment.id, editedContent);
      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };
  
  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      setIsDeleting(true);
      await onDelete(comment.id);
    } catch (error) {
      console.error("Error deleting comment:", error);
      setIsDeleting(false);
    }
  };
  
  // Don't render deleted comments unless they have replies
  if (!comment || (!comment.content && (!comment.replies || comment.replies.length === 0))) {
    return null;
  }
  
  return (
    <div className={`mb-4 ${isReply ? "ml-8" : ""}`}>
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            {comment.author?.imageUrl ? (
              <AvatarImage src={comment.author.imageUrl} />
            ) : (
              <AvatarFallback>
                {getInitials(comment.author?.firstName, comment.author?.lastName)}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
              <div className="font-medium">
                {comment.author
                  ? `${comment.author.firstName} ${comment.author.lastName}`
                  : "Unknown User"}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {formatDate(comment.created_at)}
                </span>
                
                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isOwner && (
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={handleDelete}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedContent(comment.content);
                    }}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleEdit}>
                    <Check className="mr-1 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm">{comment.content}</div>
            )}
          </div>
        </div>
      </Card>
      
      {/* If the comment has replies, render them */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onDelete={onDelete}
              onEdit={onEdit}
              isReply={true}
              showReplyButton={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
