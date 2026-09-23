import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  PlusCircle,
  LogOut,
  User as UserIcon,
  ShieldAlert,
  Bike,
} from 'lucide-react';

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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#181b20]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-4 py-3">

        {/* Brand */}
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex shrink-0 items-center gap-2.5 font-extrabold tracking-tight transition-opacity hover:opacity-90"
        >
          <span className="flex items-center text-[#ffc244]">
            <Bike size={28} strokeWidth={2.5} />
          </span>

          <span className="text-[1.25rem] text-white sm:text-[1.35rem]">
            Glovo{' '}
            <span className="text-[#ffc244]">
              Forum
            </span>
          </span>

          <span className="hidden rounded-full bg-[#ffc244] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-[#0f1115] sm:inline-flex">
            Community
          </span>
        </button>

        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative mx-auto hidden w-full max-w-[440px] md:block"
        >
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder="Search posts, rider tips, app issues..."
            className="h-10 w-full rounded-xl border border-[#2e3440] bg-[#242932] py-2 pl-10 pr-4 text-sm text-gray-100 placeholder:text-gray-500 transition-colors focus:border-[#ffc244] focus:outline-none"
          />
        </form>

        {/* Actions */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {user ? (
            <>
              {/* New Post */}
              <button
                type="button"
                onClick={onOpenCreateModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ffc244] px-3.5 py-2 text-sm font-bold text-[#0f1115] transition-all hover:-translate-y-0.5 hover:bg-[#eab233]"
              >
                <PlusCircle size={18} />
                <span className="hidden sm:inline">New Post</span>
              </button>

              {/* Admin */}
              {user.role === 'ADMIN' && (
                <button
                  type="button"
                  onClick={onNavigateAdmin}
                  title="Admin Dashboard"
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors ${
                    currentView === 'admin'
                      ? 'border-[#ffc244] bg-[#ffc244] text-[#0f1115]'
                      : 'border-[#2e3440] bg-[#2d3340] text-gray-100 hover:bg-[#20242b]'
                  }`}
                >
                  <ShieldAlert
                    size={18}
                    className={
                      currentView === 'admin'
                        ? 'text-[#0f1115]'
                        : 'text-[#ff5a5f]'
                    }
                  />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}

              {/* User */}
              <div className="ml-1 flex items-center gap-2 border-l border-[#2e3440] pl-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2d3340]"
                  title={`${user.username} (${user.role})`}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon size={20} className="text-gray-200" />
                  )}
                </div>

                <div className="hidden min-w-0 flex-col items-start sm:flex">
                  <span className="max-w-[120px] truncate text-[0.85rem] font-bold leading-tight text-white">
                    {user.username}
                  </span>

                  <span
                    className={`mt-0.5 rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold leading-none ${
                      user.role === 'ADMIN'
                        ? 'border border-[#ff5a5f]/30 bg-[#ff5a5f]/15 text-[#ff5a5f]'
                        : user.role === 'RIDER'
                          ? 'border border-[#00a082]/30 bg-[#00a082]/15 text-[#00a082]'
                          : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                {/* Logout */}
                <button
                  type="button"
                  onClick={logout}
                  title="Log out"
                  className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#2e3440] bg-[#2d3340] text-gray-300 transition-colors hover:bg-[#20242b] hover:text-white"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateAuth('login')}
                className="inline-flex items-center justify-center rounded-xl border border-[#2e3440] bg-[#2d3340] px-3.5 py-2 text-sm font-semibold text-gray-100 transition-colors hover:bg-[#20242b]"
              >
                Log In
              </button>

              <button
                type="button"
                onClick={() => onNavigateAuth('register')}
                className="inline-flex items-center justify-center rounded-xl bg-[#ffc244] px-3.5 py-2 text-sm font-bold text-[#0f1115] transition-all hover:-translate-y-0.5 hover:bg-[#eab233]"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="border-t border-white/5 px-4 py-2.5 md:hidden">
        <form
          onSubmit={handleSearchSubmit}
          className="relative mx-auto w-full max-w-[1200px]"
        >
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder="Search discussions..."
            className="h-10 w-full rounded-xl border border-[#2e3440] bg-[#242932] py-2 pl-10 pr-4 text-sm text-gray-100 placeholder:text-gray-500 focus:border-[#ffc244] focus:outline-none"
          />
        </form>
      </div>
    </header>
  );
};
