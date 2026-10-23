import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { PostDetailPage } from './pages/PostDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CreatePostModal } from './components/CreatePostModal';
import { fetchCategories } from './services/api';

const AppContent = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const syncPostFromUrl = () => {
      const postId = new URLSearchParams(window.location.search).get('post');
      if (postId && /^\d+$/.test(postId)) {
        setSelectedPostId(Number(postId));
        setCurrentView('post-detail');
      } else if (currentView === 'post-detail') {
        setCurrentView('home');
        setSelectedPostId(null);
      }
    };
    syncPostFromUrl();
    window.addEventListener('popstate', syncPostFromUrl);
    return () => window.removeEventListener('popstate', syncPostFromUrl);
  }, [currentView]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  const handleOpenCreateModal = () => {
    if (!user) {
      setCurrentView('login');
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleSelectPost = (postId) => {
    setSelectedPostId(postId);
    setCurrentView('post-detail');
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('post', postId);
    window.history.pushState({}, '', url);
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedPostId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('post');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        onSearch={(q) => {
          setSearchQuery(q);
          if (currentView !== 'home') handleBackToHome();
        }}
        onOpenCreateModal={handleOpenCreateModal}
        onNavigateHome={handleBackToHome}
        onNavigateAdmin={() => { handleBackToHome(); setCurrentView('admin'); }}
        onNavigateAuth={(type) => { handleBackToHome(); setCurrentView(type); }}
        onSelectPost={handleSelectPost}
        currentView={currentView}
      />

      <div style={{ flex: 1 }}>
        {currentView === 'home' && (
          <HomePage
            searchQuery={searchQuery}
            refreshToken={refreshToken}
            onSelectPost={handleSelectPost}
            onOpenCreatePost={handleOpenCreateModal}
            onRequestLogin={() => setCurrentView('login')}
          />
        )}

        {currentView === 'post-detail' && selectedPostId && (
          <PostDetailPage
            postId={selectedPostId}
            onBack={handleBackToHome}
            onRequestLogin={() => setCurrentView('login')}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            onSuccess={() => setCurrentView('home')}
            onSwitchToRegister={() => setCurrentView('register')}
          />
        )}

        {currentView === 'register' && (
          <RegisterPage
            onSuccess={() => setCurrentView('home')}
            onSwitchToLogin={() => setCurrentView('login')}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboardPage
            onBack={() => setCurrentView('home')}
          />
        )}
      </div>

      <CreatePostModal
        categories={categories}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={() => {
          setRefreshToken((value) => value + 1);
        }}
      />
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
