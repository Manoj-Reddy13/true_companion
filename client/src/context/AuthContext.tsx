import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types/index.js';
import { authApi } from '../services/api.js';
import { getSocket, disconnectSocket } from '../services/socket.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (identifier: string, password?: string) => Promise<void>;
  register: (data: {
    anonymousUsername?: string;
    nickname?: string;
    email?: string;
    password?: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('true_companion_token')
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const refreshMe = async () => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await authApi.getMe();
      if (data.success && data.user) {
        setUser(data.user);
        getSocket(token);
      }
    } catch (err) {
      console.warn('Session expired or invalid token');
      localStorage.removeItem('true_companion_token');
      setToken(null);
      setUser(null);
      disconnectSocket();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, [token]);

  const login = async (identifier: string, password?: string) => {
    const data = await authApi.login(identifier, password);
    if (data.success && data.token) {
      localStorage.setItem('true_companion_token', data.token);
      setToken(data.token);
      setUser(data.user);
      getSocket(data.token);
      closeAuthModal();
    }
  };

  const register = async (regData: {
    anonymousUsername?: string;
    nickname?: string;
    email?: string;
    password?: string;
  }) => {
    const data = await authApi.register(regData);
    if (data.success && data.token) {
      localStorage.setItem('true_companion_token', data.token);
      setToken(data.token);
      setUser(data.user);
      getSocket(data.token);
      closeAuthModal();
    }
  };

  const logout = () => {
    localStorage.removeItem('true_companion_token');
    setToken(null);
    setUser(null);
    disconnectSocket();
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        updateUser,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
