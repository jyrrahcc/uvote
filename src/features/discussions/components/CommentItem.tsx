
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { DiscussionComment } from "@/types/discussions";
import { MessageSquare, Edit, Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";

interface CommentItemProps {
  comment: DiscussionComment;
  onReply: (content: string, parentId: string) => Promise<any>;
  onEdit: (commentId: string, content: string) => Promise<any>;
  onDelete: (commentId: string) => Promise<boolean>;
}

const CommentItem = ({ comment, onReply, onEdit, onDelete }: CommentItemProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editContent, setEditContent] = useState(comment.content);
  const { user } = useAuth();
  const { isAdmin } = useRole();
  
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyContent.trim()) return;
    
    try {
      await onReply(replyContent, comment.id);
      setReplyContent("");
      setIsReplying(false);
    } catch (error) {
      console.error("Failed to reply:", error);
    }
  };
  
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editContent.trim()) return;
    
    try {
      await onEdit(comment.id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to edit comment:", error);
    }
  };
  
  const handleDeleteComment = async () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      await onDelete(comment.id);
    }
  };
  
  const canEditDelete = () => {
    if (!user) return false;
    return isAdmin || comment.user_id === user.id;
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex gap-4">
          <Avatar>
            {comment.author?.image_url ? (
              <AvatarImage src={comment.author.image_url} />
            ) : (
              <AvatarFallback>
                {comment.author ? 
                  getInitials(comment.author.first_name, comment.author.last_name) : 
                  "U"
                }
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {comment.author?.first_name} {comment.author?.last_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(comment.created_at)}
                </p>
              </div>
              
              {canEditDelete() && (
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      setIsEditing(true);
                      setEditContent(comment.content);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7 text-red-500"
                    onClick={handleDeleteComment}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="mt-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="mb-2"
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Save
                  </Button>
                </div>
              </form>
            ) : (
              <p className="mt-2 whitespace-pre-wrap">{comment.content}</p>
            )}
            
            {/* Reply button */}
            {!isReplying && user && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2"
                onClick={() => setIsReplying(true)}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Reply
              </Button>
            )}
            
            {/* Reply form */}
            {isReplying && (
              <form onSubmit={handleReplySubmit} className="mt-4">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="mb-2"
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsReplying(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    size="sm"
                    disabled={!replyContent.trim()}
                  >
                    Reply
                  </Button>
                </div>
              </form>
            )}
            
            {/* Nested replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 space-y-4">
                <Separator className="my-2" />
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      {reply.author?.image_url ? (
                        <AvatarImage src={reply.author.image_url} />
                      ) : (
                        <AvatarFallback className="text-xs">
                          {reply.author ? 
                            getInitials(reply.author.first_name, reply.author.last_name) : 
                            "U"
                          }
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">
                            {reply.author?.first_name} {reply.author?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(reply.created_at)}
                          </p>
                        </div>
                        
                        {(isAdmin || reply.user_id === user?.id) && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-7 w-7 text-red-500"
                            onClick={() => onDelete(reply.id)}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm mt-1">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentItem;
