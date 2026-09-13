import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: 'ADMIN' | 'CUSTOMER') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smartstay_user');
    return saved ? JSON.parse(saved) : {
      id: 1,
      name: 'Rajesh Sharma (Revenue Director)',
      email: 'admin@smartstay.com',
      role: 'ADMIN',
      created_at: new Date().toISOString()
    };
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('smartstay_token'));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      setUser(res.data.user);
      setToken(res.data.access_token);
      localStorage.setItem('smartstay_token', res.data.access_token);
      localStorage.setItem('smartstay_user', JSON.stringify(res.data.user));
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smartstay_token');
    localStorage.removeItem('smartstay_user');
  };

  const switchRole = async (targetRole: 'ADMIN' | 'CUSTOMER') => {
    const email = targetRole === 'ADMIN' ? 'admin@smartstay.com' : 'customer@smartstay.com';
    const pwd = targetRole === 'ADMIN' ? 'admin123' : 'customer123';
    const ok = await login(email, pwd);
    if (!ok) {
      // Fallback local mock user switch
      const fallbackUser: User = targetRole === 'ADMIN' ? {
        id: 1,
        name: 'Rajesh Sharma (Revenue Director)',
        email: 'admin@smartstay.com',
        role: 'ADMIN',
        created_at: new Date().toISOString()
      } : {
        id: 2,
        name: 'Ananya Verma',
        email: 'customer@smartstay.com',
        role: 'CUSTOMER',
        created_at: new Date().toISOString()
      };
      setUser(fallbackUser);
      localStorage.setItem('smartstay_user', JSON.stringify(fallbackUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
