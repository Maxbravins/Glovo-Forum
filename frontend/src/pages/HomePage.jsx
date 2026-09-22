import React, { useState, useEffect } from 'react';
import { fetchPosts, fetchCategories } from '../services/api';
import { PostCard } from '../components/PostCard';
import { Flame, Clock, Sparkles, MessageCircle, ShieldCheck } from 'lucide-react';

export const HomePage = ({ searchQuery, onSelectPost, onOpenCreatePost }) => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [catsData, postsData] = await Promise.all([
        fetchCategories(),
        fetchPosts(selectedCategory, searchQuery, sortBy),
      ]);
      setCategories(catsData);
      setPosts(postsData);
    } catch (err) {
      console.error('Failed to load forum home page data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="container main-layout">
      <aside className="sidebar-left" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.5px', marginBottom: '12px' }}>
            Categories
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              type="button"
              onClick={() => setSelectedCategory('')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: selectedCategory === '' ? 'var(--color-brand-yellow)' : 'transparent',
                color: selectedCategory === '' ? 'var(--text-inverse)' : 'var(--text-main)',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              <span>🌐 All Discussions</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: selectedCategory === cat.slug ? 'var(--color-brand-yellow)' : 'transparent',
                  color: selectedCategory === cat.slug ? 'var(--text-inverse)' : 'var(--text-main)',
                  fontWeight: selectedCategory === cat.slug ? 700 : 500,
                  fontSize: '0.9rem',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{cat.icon || '💬'}</span>
                  <span>{cat.name}</span>
                </span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{cat.postCount}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(255,194,68,0.15) 0%, rgba(0,160,130,0.15) 100%)',
            border: '1px solid rgba(255,194,68,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            padding: '24px',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
              Welcome to Glovo Rider & Customer Hub 🛵
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Share delivery experiences, ask questions, upload gear photos, and reply to community discussions.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenCreatePost}
            style={{ whiteSpace: 'nowrap' }}
          >
            <Sparkles size={16} />
            <span>Create Thread</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            {posts.length} {posts.length === 1 ? 'Post' : 'Posts'} Found
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setSortBy('latest')}
              className={`btn btn-sm ${sortBy === 'latest' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Clock size={14} />
              <span>Latest</span>
            </button>
            <button
              type="button"
              onClick={() => setSortBy('popular')}
              className={`btn btn-sm ${sortBy === 'popular' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Flame size={14} />
              <span>Popular</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Loading forum posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <MessageCircle size={40} style={{ color: 'var(--text-dim)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>No posts found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Be the first to start a conversation in this category!
            </p>
            <button type="button" className="btn btn-primary" onClick={onOpenCreatePost}>
              Create New Post
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onClick={() => onSelectPost(post.id)} />
          ))
        )}
      </main>

      <aside className="sidebar-right" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-brand-green)', fontWeight: 800, fontSize: '0.9rem', marginBottom: '10px' }}>
            <ShieldCheck size={18} />
            <span>Community Rules</span>
          </div>
          <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Be respectful to fellow riders & customers.</li>
            <li>No offensive or spam content.</li>
            <li>Use appropriate categories for your queries.</li>
            <li>Photo uploads must be relevant to the discussion.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
};
