import React, { useState, useEffect } from 'react';
import { fetchPostById, fetchComments, createCommentApi, toggleLikeApi, deletePostApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CommentItem } from '../components/CommentItem';
import { PhotoUploader } from '../components/PhotoUploader';
import { ArrowLeft, Heart, MessageSquare, Eye, Pin, User as UserIcon, Trash2, Send } from 'lucide-react';

export const PostDetailPage = ({ postId, onBack }) => {
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [commentContent, setCommentContent] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [postData, commentsData] = await Promise.all([
        fetchPostById(postId),
        fetchComments(postId),
      ]);
      setPost(postData);
      setComments(commentsData);
      setLikeCount(postData.likeCount);
      setIsLiked(postData.isLiked || false);
    } catch (err) {
      console.error('Failed to load post details', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [postId]);

  const handlePhotoSelect = (file) => {
    setSelectedPhoto(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleLikePost = async () => {
    if (!user) {
      alert('Please log in to like posts');
      return;
    }
    try {
      const res = await toggleLikeApi(postId, undefined);
      setIsLiked(res.liked);
      setLikeCount(res.likeCount);
    } catch (err) {
      console.error('Failed to toggle post like', err);
    }
  };

  const handleTopLevelCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim() && !selectedPhoto) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('postId', postId.toString());
      formData.append('content', commentContent.trim());
      if (selectedPhoto) {
        formData.append('photo', selectedPhoto);
      }

      await createCommentApi(formData);
      setCommentContent('');
      setSelectedPhoto(null);
      setPreviewUrl(null);
      const updatedComments = await fetchComments(postId);
      setComments(updatedComments);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePostApi(postId);
      onBack();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post');
    }
  };

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading discussion thread...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <h2>Post not found</h2>
        <button type="button" className="btn btn-secondary" onClick={onBack} style={{ marginTop: '16px' }}>
          Back to Discussions
        </button>
      </div>
    );
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="container" style={{ maxWidth: '840px', padding: '24px 16px 60px' }}>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={onBack}
        style={{ marginBottom: '16px', gap: '6px' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Discussions</span>
      </button>

      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        {post.pinned && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-brand-yellow)', fontWeight: 700, fontSize: '0.8rem', marginBottom: '10px' }}>
            <Pin size={14} />
            <span>PINNED ANNOUNCEMENT</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span
            style={{
              background: 'var(--bg-badge)',
              color: 'var(--color-brand-yellow)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            {post.category.icon} {post.category.name}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--bg-input)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {post.author.avatar ? (
                <img src={post.author.avatar} alt={post.author.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <UserIcon size={18} style={{ color: 'var(--text-muted)' }} />
              )}
            </div>

            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{post.author.username}</span>
            <span className={`role-badge ${post.author.role.toLowerCase()}`}>{post.author.role}</span>
          </div>
        </div>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '12px', lineHeight: 1.3 }}>
          {post.title}
        </h1>

        <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
          Posted on {formattedDate}
        </div>

        <p style={{ fontSize: '1rem', color: 'var(--text-main)', whiteSpace: 'pre-line', marginBottom: '16px', lineHeight: 1.6 }}>
          {post.content}
        </p>

        {post.image && (
          <img src={post.image} alt="Post Attachment" className="post-media-full" />
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              type="button"
              onClick={handleLikePost}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: isLiked ? 'var(--color-brand-red)' : 'var(--text-muted)',
                fontSize: '0.95rem',
                fontWeight: 700,
              }}
            >
              <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              <span>{likeCount} Likes</span>
            </button>

            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>
              <MessageSquare size={18} />
              <span>{comments.length} Comments</span>
            </span>

            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              <Eye size={18} />
              <span>{post.views} Views</span>
            </span>
          </div>

          {(user?.id === post.author.id || user?.role === 'ADMIN') && (
            <button
              type="button"
              onClick={handleDeletePost}
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--color-brand-red)' }}
            >
              <Trash2 size={16} />
              <span>Delete Post</span>
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px' }}>
          Leave a Comment / Reply
        </h3>

        {user ? (
          <form onSubmit={handleTopLevelCommentSubmit}>
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Join the discussion... (Attach photos if relevant)"
              style={{ width: '100%', minHeight: '80px', marginBottom: '8px' }}
            />

            <PhotoUploader
              selectedFile={selectedPhoto}
              onFileSelect={handlePhotoSelect}
              previewUrl={previewUrl}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                <Send size={16} />
                <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
              </button>
            </div>
          </form>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Please log in to participate in this discussion thread.
          </p>
        )}
      </div>

      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>
          Comments & Replies ({comments.length})
        </h3>

        {comments.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            No comments yet. Start the conversation!
          </div>
        ) : (
          <div className="comment-thread-list">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                onCommentAdded={loadData}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
