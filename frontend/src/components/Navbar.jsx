import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, PlusCircle, LogOut, User as UserIcon, ShieldAlert, Bike } from 'lucide-react';

export const Navbar = ({
  onSearch,
  onOpenCreateModal,
  onNavigateHome,
  onNavigateAdmin,
  onNavigateAuth,
  currentView,
}) => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button type="button" onClick={onNavigateHome} className="brand-logo">
            <span style={{ color: 'var(--color-brand-yellow)', display: 'flex', alignItems: 'center' }}>
              <Bike size={28} />
            </span>
            <span>Glovo <span style={{ color: 'var(--color-brand-yellow)' }}>Forum</span></span>
            <span className="brand-badge">Community</span>
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ flex: '1', maxWidth: '440px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder="Search posts, rider tips, app issues..."
            style={{ width: '100%', paddingLeft: '40px', height: '40px' }}
          />
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onOpenCreateModal}
              >
                <PlusCircle size={18} />
                <span>New Post</span>
              </button>

              {user.role === 'ADMIN' && (
                <button
                  type="button"
                  className={`btn ${currentView === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={onNavigateAdmin}
                  title="Admin Dashboard"
                >
                  <ShieldAlert size={18} style={{ color: 'var(--color-brand-red)' }} />
                  <span>Admin</span>
                </button>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px', borderLeft: '1px solid var(--border-color)' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--bg-badge)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                  title={`${user.username} (${user.role})`}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <UserIcon size={20} style={{ color: 'var(--text-main)' }} />
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.2 }}>{user.username}</span>
                  <span className={`role-badge ${user.role.toLowerCase()}`} style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                    {user.role}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="btn btn-secondary btn-sm"
                  style={{ marginLeft: '6px', padding: '6px' }}
                  title="Log out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onNavigateAuth('login')}
              >
                Log In
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onNavigateAuth('register')}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
