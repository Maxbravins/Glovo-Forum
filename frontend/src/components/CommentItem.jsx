import React, { useState } from 'react';
import { createCommentApi, toggleLikeApi, deleteCommentApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PhotoUploader } from './PhotoUploader';
import { Heart, Reply, Trash2, User as UserIcon, CornerDownRight } from 'lucide-react';

export const CommentItem = ({ comment, postId, onCommentAdded }) => {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);

  const handlePhotoSelect = (file) => {
    setSelectedPhoto(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('Please log in to like comments');
      return;
    }
    try {
      const res = await toggleLikeApi(undefined, comment.id);
      setIsLiked(res.liked);
      setLikeCount(res.likeCount);
    } catch (err) {
      console.error('Failed to like comment', err);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() && !selectedPhoto) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('postId', postId.toString());
      formData.append('parentId', comment.id.toString());
      formData.append('content', replyText.trim());
      if (selectedPhoto) {
        formData.append('photo', selectedPhoto);
      }

      await createCommentApi(formData);
      setReplyText('');
      setSelectedPhoto(null);
      setPreviewUrl(null);
      setShowReplyForm(false);
      onCommentAdded();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteCommentApi(comment.id);
      onCommentAdded();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  const formattedDate = new Date(comment.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="comment-node">
      <div className="comment-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--bg-badge)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {comment.user.avatar ? (
                <img src={comment.user.avatar} alt={comment.user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <UserIcon size={18} style={{ color: 'var(--text-muted)' }} />
              )}
            </div>

            <div>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', marginRight: '6px' }}>
                {comment.user.username}
              </span>
              <span className={`role-badge ${comment.user.role.toLowerCase()}`}>
                {comment.user.role}
              </span>
            </div>
          </div>

          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            {formattedDate}
          </span>
        </div>

        <p style={{ color: 'var(--text-main)', fontSize: '0.93rem', whiteSpace: 'pre-line', marginBottom: '8px' }}>
          {comment.content}
        </p>

        {comment.image && (
          <div style={{ marginTop: '8px', marginBottom: '10px' }}>
            <img
              src={comment.image}
              alt="Comment attachment"
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
          <button
            type="button"
            onClick={handleLike}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: isLiked ? 'var(--color-brand-red)' : 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{likeCount}</span>
          </button>

          {user && (
            <button
              type="button"
              onClick={() => setShowReplyForm(!showReplyForm)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--color-brand-yellow)',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              <Reply size={15} />
              <span>Reply</span>
            </button>
          )}

          {(user?.id === comment.userId || user?.role === 'ADMIN') && (
            <button
              type="button"
              onClick={handleDelete}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--text-dim)',
                fontSize: '0.82rem',
                marginLeft: 'auto',
              }}
              title="Delete comment"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {showReplyForm && (
          <form onSubmit={handleReplySubmit} style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-brand-yellow)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
              <CornerDownRight size={14} />
              <span>Replying to @{comment.user.username}</span>
            </div>

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              style={{ width: '100%', minHeight: '60px' }}
            />

            <PhotoUploader
              selectedFile={selectedPhoto}
              onFileSelect={handlePhotoSelect}
              previewUrl={previewUrl}
            />

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowReplyForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Posting...' : 'Post Reply'}
              </button>
            </div>
          </form>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="nested-replies-container">
          {comment.replies.map((childReply) => (
            <CommentItem
              key={childReply.id}
              comment={childReply}
              postId={postId}
              onCommentAdded={onCommentAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
};
