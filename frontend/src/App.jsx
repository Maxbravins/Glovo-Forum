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
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        onSearch={(q) => {
          setSearchQuery(q);
          if (currentView !== 'home') setCurrentView('home');
        }}
        onOpenCreateModal={handleOpenCreateModal}
        onNavigateHome={() => setCurrentView('home')}
        onNavigateAdmin={() => setCurrentView('admin')}
        onNavigateAuth={(type) => setCurrentView(type)}
        currentView={currentView}
      />

      <div style={{ flex: 1 }}>
        {currentView === 'home' && (
          <HomePage
            searchQuery={searchQuery}
            onSelectPost={handleSelectPost}
            onOpenCreatePost={handleOpenCreateModal}
          />
        )}

        {currentView === 'post-detail' && selectedPostId && (
          <PostDetailPage
            postId={selectedPostId}
            onBack={() => setCurrentView('home')}
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
          if (currentView === 'home') {
            setSearchQuery((prev) => prev);
          }
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
