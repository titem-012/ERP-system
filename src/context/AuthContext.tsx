'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { User } from '@/types';
import { authService } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  createCashier: (cashierData: Omit<User, 'id'> & { password?: string }) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  getCashiersList: () => Promise<User[]>;
  lang: 'en' | 'am';
  setLang: (lang: 'en' | 'am') => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLangState] = useState<'en' | 'am'>('en');
  const [darkMode, setDarkModeState] = useState<boolean>(true);

  // Load user, language, and theme from localStorage on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }

    if (typeof window !== 'undefined') {
      const storedLang = localStorage.getItem('cloth_shop_lang');
      if (storedLang === 'en' || storedLang === 'am') {
        setLangState(storedLang);
      }

      const storedTheme = localStorage.getItem('cloth_shop_theme');
      if (storedTheme !== null) {
        setDarkModeState(storedTheme === 'true');
      }
    }
    setLoading(false);
  }, []);

  // Update theme class on HTML element when darkMode changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (darkMode) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    }
  }, [darkMode]);

  const setLang = (newLang: 'en' | 'am') => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cloth_shop_lang', newLang);
    }
  };

  const setDarkMode = (newDark: boolean) => {
    setDarkModeState(newDark);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cloth_shop_theme', String(newDark));
    }
  };

  // Login
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const loggedInUser = await authService.login({ username, password });
      setUser(loggedInUser);
      toast.success(lang === 'en' ? `Welcome, ${loggedInUser.fullName || loggedInUser.username}!` : `እንኳን ደህና መጡ፣ ${loggedInUser.fullName || loggedInUser.username}!`);
      return true;
    } catch (error: any) {
      // Fallback for demonstration mode if backend API is offline
      if (username === 'admin' && password === 'admin123' && !error.response) {
        const demoUser: User = {
          id: 'demo-admin-id',
          username: 'admin',
          fullName: 'Main Store Admin',
          email: 'admin@echomenswear.com',
          role: 'ADMIN',
          assignedStore: 'main',
        };
        setUser(demoUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', 'demo-jwt-token');
          localStorage.setItem('user', JSON.stringify(demoUser));
          document.cookie = `token=demo-jwt-token; path=/; max-age=86400; SameSite=Strict`;
          document.cookie = `role=ADMIN; path=/; max-age=86400; SameSite=Strict`;
          document.cookie = `storeId=main; path=/; max-age=86400; SameSite=Strict`;
        }
        toast.success(lang === 'en' ? 'Logged in as Demo Admin!' : 'እንደ ማሳያ አስተዳዳሪ ገብተዋል!');
        return true;
      } else if (username === 'cashier' && password === 'cashier123' && !error.response) {
        const demoUser: User = {
          id: 'demo-cashier-id',
          username: 'cashier',
          fullName: 'Bole Cashier',
          email: 'cashier@echomenswear.com',
          role: 'CASHIER',
          assignedStore: 'main',
        };
        setUser(demoUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', 'demo-jwt-token');
          localStorage.setItem('user', JSON.stringify(demoUser));
          document.cookie = `token=demo-jwt-token; path=/; max-age=86400; SameSite=Strict`;
          document.cookie = `role=CASHIER; path=/; max-age=86400; SameSite=Strict`;
          document.cookie = `storeId=main; path=/; max-age=86400; SameSite=Strict`;
        }
        toast.success(lang === 'en' ? 'Logged in as Demo Cashier!' : 'እንደ ማሳያ ገንዘብ ያዢ ገብተዋል!');
        return true;
      }

      // Extract the exact error message from Spring Boot
      let message = lang === 'en' ? 'Invalid username or password' : 'የተሳሳተ የተጠቃሚ ስም ወይም የይለፍ ቃል';
      
      if (error.response && error.response.data) {
        // If Spring Boot returns a plain string (like "Attempt 3 of 5")
        if (typeof error.response.data === 'string') {
          message = error.response.data;
        } else if (error.response.data.message) {
          message = error.response.data.message;
        }
      }

      // WE MUST THROW THIS ERROR SO THE LOGIN PAGE CAN CATCH IT AND SHOW THE RED BANNER
      throw new Error(message);
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success(lang === 'en' ? 'Logged out successfully' : 'በተሳካ ሁኔታ ወጥተዋል');
  };

  // Admin: create cashier
  const createCashier = async (
    cashierData: Omit<User, 'id'> & { password?: string }
  ): Promise<boolean> => {
    if (!user || user.role !== 'ADMIN') {
      toast.error(lang === 'en' ? 'Only admins can create cashiers.' : 'አስተዳዳሪዎች ብቻ ገንዘብ ያዢዎችን መፍጠር ይችላሉ።');
      return false;
    }
    try {
      await authService.createCashier(cashierData);
      toast.success(lang === 'en' ? `Cashier ${cashierData.fullName || cashierData.username} created successfully.` : `ገንዘብ ያዢ ${cashierData.fullName || cashierData.username} በተሳካ ሁኔታ ተፈጥሯል።`);
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || (lang === 'en' ? 'Failed to create cashier.' : 'ገንዘብ ያዢ መፍጠር አልተሳካም።');
      toast.error(message);
      return false;
    }
  };

  // Admin: delete user
  const deleteUser = async (userId: string): Promise<boolean> => {
    if (!user || user.role !== 'ADMIN') {
      toast.error(lang === 'en' ? 'Only admins can delete users.' : 'አስተዳዳሪዎች ብቻ ተጠቃሚዎችን መሰረዝ ይችላሉ።');
      return false;
    }
    if (userId === user.id) {
      toast.error(lang === 'en' ? 'You cannot delete yourself.' : 'ራስዎን መሰረዝ አይችሉም።');
      return false;
    }
    try {
      await authService.deleteUser(userId);
      toast.success(lang === 'en' ? 'User deleted successfully.' : 'ተጠቃሚው በተሳካ ሁኔታ ተሰርዟል።');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || (lang === 'en' ? 'Failed to delete user.' : 'ተጠቃሚውን መሰረዝ አልተሳካም።');
      toast.error(message);
      return false;
    }
  };

  // Admin: get all cashiers
  const getCashiersList = async (): Promise<User[]> => {
    try {
      return await authService.getCashiers();
    } catch (error) {
      console.error('Error fetching cashiers:', error);
      return [];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        createCashier,
        deleteUser,
        getCashiersList,
        lang,
        setLang,
        darkMode,
        setDarkMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}