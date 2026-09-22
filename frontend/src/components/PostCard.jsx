import React, { useState } from 'react';
import { toggleLikeApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Eye, MessageSquare, Heart, Pin, User as UserIcon } from 'lucide-react';

export const PostCard = ({ post, onClick }) => {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in to like posts');
      return;
    }
    try {
      const res = await toggleLikeApi(post.id, undefined);
      setIsLiked(res.liked);
      setLikeCount(res.likeCount);
    } catch (err) {
      console.error('Failed to toggle post like', err);
    }
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="card" onClick={onClick} style={{ cursor: 'pointer' }}>
      {post.pinned && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-brand-yellow)', fontWeight: 700, fontSize: '0.8rem', marginBottom: '8px' }}>
          <Pin size={14} />
          <span>PINNED ANNOUNCEMENT</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span
          style={{
            background: 'var(--bg-badge)',
            color: 'var(--color-brand-yellow)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 700,
          }}
        >
          {post.category.icon} {post.category.name}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
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
              <UserIcon size={14} style={{ color: 'var(--text-muted)' }} />
            )}
          </div>

          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{post.author.username}</span>
          <span className={`role-badge ${post.author.role.toLowerCase()}`}>{post.author.role}</span>
        </div>
      </div>

      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)', lineHeight: 1.3 }}>
        {post.title}
      </h3>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {post.content}
      </p>

      {post.image && (
        <div style={{ marginBottom: '12px', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '220px', border: '1px solid var(--border-color)' }}>
          <img src={post.image} alt="Post attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            type="button"
            onClick={handleLike}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: isLiked ? 'var(--color-brand-red)' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{likeCount}</span>
          </button>

          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
            <MessageSquare size={16} />
            <span>{post.commentCount}</span>
          </span>

          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            <Eye size={16} />
            <span>{post.views}</span>
          </span>
        </div>

        <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          {formattedDate}
        </span>
      </div>
    </div>
  );
};
