import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, Loader2, MessageCircle, Mail, Reply, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { commentService, isFirestorePermissionDenied } from '@/services/firestoreService';
import { mockComments, type Comment } from '@/data/mockData';
import { toast } from 'sonner';

export function UserComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadData();
    
    // Auto-refresh comments every 10 seconds to see new user submissions
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    setPermissionDenied(false);
    try {
      const data = await commentService.getAll();
      setComments(data.length > 0 ? data : mockComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      if (isFirestorePermissionDenied(error)) {
        setPermissionDenied(true);
        setComments([]);
        toast.error('Firebase permissions blocked. Allow admin read/write to comments in Firestore rules.');
      } else {
        setComments(mockComments);
      }
    }
    setLoading(false);
  };

  const handleMarkAsRead = async (id: string) => {
    setProcessingId(id);
    try {
      const success = await commentService.markAsRead(id);
      if (success) {
        setComments(prev => prev.map(c => c.id === id ? { ...c, status: 'read' } : c));
        toast.success('Marked as read');
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error(
        isFirestorePermissionDenied(error)
          ? 'Firebase permissions blocked. Allow admin update on comments.'
          : 'Failed to update status'
      );
    }
    setProcessingId(null);
  };

  const handleMarkAsReplied = async (id: string, customReply?: string) => {
    const reply = customReply || replyText.trim();
    if (!reply) {
      toast.error('Please enter a reply message');
      return;
    }

    setProcessingId(id);
    try {
      const success = await commentService.markAsReplied(id, reply, 'Admin');
      if (success) {
        setComments(prev => prev.map(c => c.id === id ? { 
          ...c, 
          status: 'replied',
          reply,
          repliedBy: 'Admin',
          repliedAt: new Date().toISOString()
        } : c));
        toast.success('Reply sent successfully');
        setReplyingTo(null);
        setReplyText('');
      } else {
        toast.error('Failed to send reply');
      }
    } catch (error) {
      toast.error(
        isFirestorePermissionDenied(error)
          ? 'Firebase permissions blocked. Allow admin update on comments.'
          : 'Failed to send reply'
      );
    }
    setProcessingId(null);
  };

  const handleQuickReply = (id: string) => {
    handleMarkAsReplied(id, 'Thank you for your question. We have reviewed it and will get back to you soon.');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    setProcessingId(id);
    try {
      const success = await commentService.delete(id);
      if (success) {
        setComments(prev => prev.filter(c => c.id !== id));
        toast.success('Comment deleted');
      } else {
        toast.error('Failed to delete comment');
      }
    } catch (error) {
      toast.error(
        isFirestorePermissionDenied(error)
          ? 'Firebase permissions blocked. Allow admin delete on comments.'
          : 'Failed to delete comment'
      );
    }
    setProcessingId(null);
  };

  const getStatusBadge = (status: Comment['status']) => {
    switch (status) {
      case 'unread':
        return <span className="badge-warning">Unread</span>;
      case 'read':
        return <span className="badge-info">Read</span>;
      case 'replied':
        return <span className="badge-success">Replied</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Firestore permissions are blocking Comments read/write for this account.
        </p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No user comments</p>
      </div>
    );
  }

  const unreadCount = comments.filter(c => c.status === 'unread').length;

  return (
    <div className="space-y-4">
      <h2 className="section-header">
        User Comments ({comments.length})
        {unreadCount > 0 && (
          <span className="ml-2 px-2 py-0.5 text-xs bg-destructive text-destructive-foreground rounded-full">
            {unreadCount} new
          </span>
        )}
      </h2>
      
      {comments.map((comment, index) => (
        <motion.div
          key={comment.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`card-farmer ${comment.status === 'unread' ? 'border-l-4 border-l-primary' : ''}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="mb-2">
                {comment.subject && (
                  <h4 className="font-semibold text-foreground">{comment.subject}</h4>
                )}
                <p className="text-foreground">{comment.message || comment.commentText}</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {comment.userName && <span>👤 {comment.userName}</span>}
                {comment.userEmail && <span>📧 {comment.userEmail}</span>}
                {(comment.location || comment.category) && <span>•</span>}
                {comment.location && <span>📍 {comment.location}</span>}
                {comment.category && <span>🏷️ {comment.category}</span>}
                <span>•</span>
                <span>📅 {new Date(comment.submittedAt || comment.createdAt || '').toLocaleDateString()}</span>
              </div>

              {/* Show existing reply if any */}
              {comment.reply && comment.status === 'replied' && (
                <div className="mt-4 p-3 bg-accent/20 rounded-lg border-l-4 border-l-accent">
                  <div className="flex items-center gap-2 mb-2">
                    <Reply className="w-4 h-4 text-accent-foreground" />
                    <span className="text-sm font-medium text-accent-foreground">
                      Admin Reply {comment.repliedAt && `• ${new Date(comment.repliedAt).toLocaleDateString()}`}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{comment.reply}</p>
                </div>
              )}
            </div>
            {getStatusBadge(comment.status)}
          </div>
          
          {/* Reply Interface */}
          <AnimatePresence>
            {replyingTo === comment.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-3"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Reply className="w-4 h-4" />
                  Replying to {comment.userName}
                </div>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  className="min-h-[100px] resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    variant="farmer"
                    size="sm"
                    onClick={() => handleMarkAsReplied(comment.id)}
                    disabled={processingId === comment.id || !replyText.trim()}
                  >
                    {processingId === comment.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send Reply
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex gap-2 mt-4">
            {comment.status === 'unread' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAsRead(comment.id)}
                disabled={processingId === comment.id}
              >
                {processingId === comment.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Mark Read
              </Button>
            )}
            {comment.status !== 'replied' && replyingTo !== comment.id && (
              <>
                <Button
                  variant="farmer"
                  size="sm"
                  onClick={() => {
                    setReplyingTo(comment.id);
                    setReplyText('');
                  }}
                >
                  <Reply className="w-4 h-4" />
                  Reply
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickReply(comment.id)}
                  disabled={processingId === comment.id}
                >
                  {processingId === comment.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  Quick Reply
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(comment.id)}
              disabled={processingId === comment.id}
              className="ml-auto"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
