import React, { useEffect, useState } from 'react';
import { fetchPosts, fetchCategories } from '../services/api';
import { PostCard } from '../components/PostCard';
import {
  Flame,
  Clock3,
  MessageCircle,
  Plus,
  Search,
  ChevronRight,
  Users,
  ShieldCheck,
} from 'lucide-react';

export const HomePage = ({
  searchQuery,
  onSelectPost,
  onOpenCreatePost,
}) => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);

    try {
      const [categoriesData, postsData] = await Promise.all([
        fetchCategories(),
        fetchPosts(selectedCategory, searchQuery, sortBy),
      ]);

      setCategories(categoriesData);
      setPosts(postsData);
    } catch (error) {
      console.error('Failed to load forum data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery, sortBy]);

  const activeCategory = categories.find(
    (category) => category.slug === selectedCategory
  );

  return (
    <div className="min-h-screen bg-[#0f1115]">
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:py-8">

        {/* HERO */}
        <section className="relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#ffc244]/15 via-[#181b20] to-[#00a082]/10 p-6 shadow-lg sm:p-8">
          {/* Decorative background */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#ffc244]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-20 h-56 w-56 rounded-full bg-[#00a082]/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            {/* Eyebrow */}
            <div className="mb-4 flex items-center gap-2 text-xs font-extrabold tracking-[0.16em] text-[#ffc244]">
              <span className="h-2 w-2 rounded-full bg-[#00a082] shadow-[0_0_10px_rgba(0,160,130,0.8)]" />
              COMMUNITY FORUM
            </div>

            <h1 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              Rider & Customer{' '}
              <span className="text-[#ffc244]">
                Community Hub
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
              Ask questions, share delivery experiences, discuss equipment,
              report issues, and connect with the community.
            </p>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={onOpenCreatePost}
                className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-[#ffc244] px-4 py-2.5 text-sm font-bold text-[#0f1115] shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#eab233]"
              >
                <Plus size={17} />
                Create discussion
              </button>

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MessageCircle size={16} className="text-[#00a082]" />
                <span>
                  {posts.length}{' '}
                  {posts.length === 1 ? 'discussion' : 'discussions'} available
                </span>
              </div>
            </div>
          </div>

          {/* Decorative forum mark */}
          <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 lg:block">
            <div className="flex h-40 w-40 items-center justify-center rounded-full border border-[#ffc244]/20 bg-[#ffc244]/5">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border border-[#00a082]/20 bg-[#00a082]/5">
                <MessageCircle
                  size={48}
                  strokeWidth={1.5}
                  className="text-[#ffc244]/60"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORY NAVIGATION */}
        <section className="mb-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.15em] text-[#00a082]">
                Browse discussions
              </span>

              <h2 className="mt-1 text-xl font-extrabold text-white">
                Categories
              </h2>
            </div>

            <div className="hidden items-center gap-2 text-xs text-gray-500 sm:flex">
              <Users size={14} />
              <span>{categories.length} categories</span>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {/* All Discussions */}
            <button
              type="button"
              onClick={() => setSelectedCategory('')}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-all ${
                selectedCategory === ''
                  ? 'border-[#ffc244] bg-[#ffc244] text-[#0f1115] shadow-sm'
                  : 'border-[#2e3440] bg-[#181b20] text-gray-300 hover:border-[#ffc244]/40 hover:bg-[#20242b]'
              }`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black/10 text-sm">
                <MessageCircle size={14} />
              </span>

              <span>All Discussions</span>

              <span
                className={`rounded-full px-1.5 py-0.5 text-[0.7rem] ${
                  selectedCategory === ''
                    ? 'bg-black/10 text-[#0f1115]'
                    : 'bg-[#2d3340] text-gray-400'
                }`}
              >
                {posts.length}
              </span>
            </button>

            {categories.map((category) => {
              const isActive = selectedCategory === category.slug;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? 'border-[#ffc244] bg-[#ffc244] text-[#0f1115] shadow-sm'
                      : 'border-[#2e3440] bg-[#181b20] text-gray-300 hover:border-[#ffc244]/40 hover:bg-[#20242b]'
                  }`}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black/10 text-sm">
                    {category.icon || ''}
                  </span>

                  <span>{category.name}</span>

                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[0.7rem] ${
                      isActive
                        ? 'bg-black/10 text-[#0f1115]'
                        : 'bg-[#2d3340] text-gray-400'
                    }`}
                  >
                    {category.postCount || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* CONTENT */}
        <section>
          {/* FEED HEADER */}
          <div className="mb-5 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {/* Breadcrumb */}
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                <span>Community</span>
                <ChevronRight size={14} />
                <span className="text-gray-400">
                  {activeCategory?.name || 'All Discussions'}
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-white sm:text-2xl">
                {activeCategory?.name || 'Latest discussions'}
              </h2>

              {searchQuery && (
                <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-400">
                  <Search size={14} className="text-[#ffc244]" />
                  <span>Results for</span>
                  <strong className="text-gray-200">
                    "{searchQuery}"
                  </strong>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <span className="hidden text-xs font-semibold text-gray-500 sm:block">
                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
              </span>

              <div className="flex rounded-xl border border-[#2e3440] bg-[#181b20] p-1">
                <button
                  type="button"
                  onClick={() => setSortBy('latest')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    sortBy === 'latest'
                      ? 'bg-[#ffc244] text-[#0f1115]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Clock3 size={14} />
                  Latest
                </button>

                <button
                  type="button"
                  onClick={() => setSortBy('popular')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    sortBy === 'popular'
                      ? 'bg-[#ffc244] text-[#0f1115]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Flame size={14} />
                  Popular
                </button>
              </div>
            </div>
          </div>

          {/* POST FEED */}
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <>
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-44 animate-pulse rounded-2xl border border-[#2e3440] bg-[#181b20]"
                  >
                    <div className="h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
                  </div>
                ))}
              </>
            ) : posts.length === 0 ? (
              <div className="rounded-2xl border border-[#2e3440] bg-[#181b20] px-6 py-14 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2d3340] text-gray-400">
                  <MessageCircle size={30} />
                </div>

                <h3 className="text-lg font-extrabold text-white">
                  No discussions found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">
                  There are no discussions matching your current filters.
                  Start a new conversation and get the community involved.
                </p>

                <button
                  type="button"
                  onClick={onOpenCreatePost}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#ffc244] px-4 py-2.5 text-sm font-bold text-[#0f1115] transition-all hover:-translate-y-0.5 hover:bg-[#eab233]"
                >
                  <Plus size={16} />
                  Start a discussion
                </button>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onClick={() => onSelectPost(post.id)}
                />
              ))
            )}
          </div>
        </section>

        {/* COMMUNITY FOOTER NOTE */}
        <div className="mt-8 flex items-center justify-center gap-2 border-t border-white/5 pt-6 text-xs text-gray-500">
          <ShieldCheck size={14} className="text-[#00a082]" />
          <span>Keep discussions respectful and useful for the community.</span>
        </div>
      </div>
    </div>
  );
};
