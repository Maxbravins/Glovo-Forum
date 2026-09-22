import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  updateUserAvatar: () => {},
  isLoading: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('glovo_forum_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        console.error('Session expired or invalid token');
        localStorage.removeItem('glovo_forum_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = (newToken, newUser) => {
    localStorage.setItem('glovo_forum_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('glovo_forum_token');
    setToken(null);
    setUser(null);
  };

  const updateUserAvatar = (newAvatar) => {
    if (user) {
      setUser({ ...user, avatar: newAvatar });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUserAvatar, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
