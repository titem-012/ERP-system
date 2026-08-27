import API from './api';
import { User, LoginCredentials } from '../types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    const res = await API.post('/auth/login', credentials);
    const { token, user } = res.data;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set cookies for Next.js Middleware route guards
      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Strict`;
      document.cookie = `role=${user.role}; path=/; max-age=86400; SameSite=Strict`;
      document.cookie = `storeId=${user.assignedStore || ''}; path=/; max-age=86400; SameSite=Strict`;
    }
    return user;
  },

  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear cookies
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'storeId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  },

  getCurrentUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  getCashiers: async (): Promise<User[]> => {
    const res = await API.get('/users/cashiers');
    return res.data;
  },

  createCashier: async (userData: Omit<User, 'id'> & { password?: string }): Promise<User> => {
    const res = await API.post('/users/cashier', userData);
    return res.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await API.delete(`/users/${id}`);
  },
};
