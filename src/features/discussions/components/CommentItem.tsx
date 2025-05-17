
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Comment } from '@/types/discussions';
import { formatDistanceToNow } from 'date-fns';
import { Trash, Edit2, Reply } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useRole } from '@/features/auth/context/RoleContext';

interface CommentItemProps {
  comment: Comment;
  onEdit: (commentId: string, content: string) => Promise<boolean>;
  onDelete: (commentId: string) => Promise<boolean>;
  onReply?: (parentId: string, content: string) => Promise<boolean>;
  showReplyButton?: boolean;
  className?: string;
}

const CommentItem = ({
  comment,
  onEdit,
  onDelete,
  onReply,
  showReplyButton = true,
  className = '',
}: CommentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { isAdmin } = useRole();

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    
    try {
      setIsSubmitting(true);
      const success = await onEdit(comment.id, editContent);
      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error editing comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await onDelete(comment.id);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim() || !onReply) return;
    
    try {
      setIsSubmitting(true);
      const success = await onReply(comment.id, replyContent);
      if (success) {
        setReplyContent('');
        setIsReplying(false);
      }
    } catch (error) {
      console.error('Error posting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canModifyComment = user && (isAdmin || comment.user_id === user.id);

  return (
    <div className={`border rounded-md p-4 ${className}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-3">
            {comment.author?.imageUrl ? (
              <img
                src={comment.author.imageUrl}
                alt={`${comment.author.firstName}'s avatar`}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                {comment.author?.firstName?.[0]}{comment.author?.lastName?.[0]}
              </div>
            )}
          </div>
          <div>
            <p className="font-medium">
              {comment.author?.firstName} {comment.author?.lastName}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        {canModifyComment && (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsEditing(true);
                setEditContent(comment.content);
              }}
              className="h-8 px-2"
            >
              <Edit2 className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 px-2 text-red-500 hover:text-red-600"
            >
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        )}
      </div>
      
      {isEditing ? (
        <div className="mt-3 space-y-3">
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
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-3 whitespace-pre-wrap">{comment.content}</p>
      )}
      
      {showReplyButton && onReply && user && !isReplying && (
        <div className="mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsReplying(true)}
            className="text-xs"
          >
            <Reply className="h-3 w-3 mr-1" />
            Reply
          </Button>
        </div>
      )}
      
      {isReplying && (
        <div className="mt-3 space-y-3">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your reply..."
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
              {isSubmitting ? 'Posting...' : 'Post Reply'}
            </Button>
          </div>
        </div>
      )}
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 ml-8 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onReply}
              showReplyButton={false}
              className="border-muted"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
