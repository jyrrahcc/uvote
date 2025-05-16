
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, Calendar, User, Pin, Lock, Edit, Trash } from "lucide-react";
import { Discussion, Comment } from "@/types/discussions";
import { formatDistanceToNow, format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import CommentItem from "./CommentItem";

interface TopicViewProps {
  topic: Discussion | null;
  comments: Comment[];
  loading: boolean;
  commentLoading: boolean;
  onBack: () => void;
  onAddComment: (topicId: string, content: string, parentId?: string | null) => Promise<boolean>;
  onEditComment: (commentId: string, content: string) => Promise<boolean>;
  onDeleteComment: (commentId: string) => Promise<boolean>;
  onDeleteTopic: (topicId: string) => Promise<boolean>;
  onEditTopic: (topicId: string, updates: Partial<Discussion>) => Promise<any>;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { isAdmin, isVoter } = useRole();
  
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentContent.trim() || !topic) return;
    
    try {
      const success = await onAddComment(topic.id, commentContent);
      if (success) {
        setCommentContent("");
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };
  
  const handleTogglePin = async () => {
    if (!topic) return;
    await onEditTopic(topic.id, { is_pinned: !topic.is_pinned });
  };
  
  const handleToggleLock = async () => {
    if (!topic) return;
    await onEditTopic(topic.id, { is_locked: !topic.is_locked });
  };
  
  const handleDeleteTopic = async () => {
    if (!topic) return;
    
    if (window.confirm("Are you sure you want to delete this topic? This action cannot be undone.")) {
      const success = await onDeleteTopic(topic.id);
      if (success) {
        onBack();
      }
    }
  };

  const handleStartEdit = () => {
    if (!topic) return;
    setEditTitle(topic.title);
    setEditContent(topic.content || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!topic || !editTitle.trim()) return;
    
    try {
      setIsSubmitting(true);
      await onEditTopic(topic.id, { 
        title: editTitle,
        content: editContent.trim() ? editContent : null
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update topic:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const canManageTopic = () => {
    if (!user || !topic) return false;
    return isAdmin || topic.created_by === user.id;
  };

  if (loading || !topic) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
        <span className="ml-3 text-lg">Loading topic...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Discussions
        </Button>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4 w-full">
                    <div>
                      <label htmlFor="topicTitle" className="block text-sm font-medium mb-1">Topic Title</label>
                      <input
                        id="topicTitle"
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        placeholder="Enter topic title"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-xl flex items-center">
                      {topic.is_pinned && <Pin size={18} className="mr-2 text-green-600" />}
                      {topic.is_locked && <Lock size={18} className="mr-2 text-yellow-600" />}
                      {topic.title}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="mr-2">Posted {format(new Date(topic.created_at), 'PPp')}</span>
                      <span className="mx-1">•</span>
                      <User className="h-4 w-4 mr-1" />
                      <span>{topic.author?.firstName} {topic.author?.lastName}</span>
                    </CardDescription>
                  </>
                )}
              </div>
              
              {canManageTopic() && !isEditing && (
                <div className="flex gap-2 flex-wrap justify-end">
                  {isAdmin && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleTogglePin}
                      >
                        <Pin size={16} className={`mr-1 ${topic.is_pinned ? 'text-green-600' : ''}`} />
                        {topic.is_pinned ? 'Unpin' : 'Pin'}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleToggleLock}
                      >
                        <Lock size={16} className={`mr-1 ${topic.is_locked ? 'text-yellow-600' : ''}`} />
                        {topic.is_locked ? 'Unlock' : 'Lock'}
                      </Button>
                    </>
                  )}
                  
                  {(isAdmin || topic.created_by === user?.id) && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleStartEdit}
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleDeleteTopic}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash size={16} className="mr-1" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="topicContent" className="block text-sm font-medium mb-1">Topic Content</label>
                  <Textarea
                    id="topicContent"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[150px]"
                    placeholder="Enter topic content (optional)"
                  />
                </div>
              </div>
            ) : (
              topic.content ? (
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{topic.content}</p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">No content provided</p>
              )
            )}
          </CardContent>
          
          {isEditing && (
            <CardFooter className="border-t pt-4 flex justify-end space-x-2">
              <Button 
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEdit}
                disabled={!editTitle.trim() || isSubmitting}
                className="bg-[#008f50] hover:bg-[#007a45]"
              >
                {isSubmitting ? <Spinner className="mr-2" /> : null}
                Save Changes
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-medium mb-4 flex items-center">
          <MessageCircle className="mr-2 h-5 w-5" />
          Comments ({comments.length})
        </h3>
        
        {user && isVoter && !topic.is_locked && (
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="space-y-4">
              <Textarea
                placeholder="Write a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button 
                  type="submit"
                  className="bg-[#008f50] hover:bg-[#007a45]"
                  disabled={!commentContent.trim() || commentLoading}
                >
                  {commentLoading ? <Spinner className="mr-2" /> : null}
                  Post Comment
                </Button>
              </div>
            </div>
          </form>
        )}
        
        {commentLoading ? (
          <div className="flex justify-center py-6">
            <Spinner className="h-6 w-6" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 border rounded-lg bg-muted/30">
            <p className="text-muted-foreground">No comments yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onEdit={onEditComment}
                onDelete={onDeleteComment}
                showReplyButton={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicView;
