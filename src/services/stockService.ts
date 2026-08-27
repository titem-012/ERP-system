import API from './api';
import { Product, Transaction } from '../types';

export const stockService = {
  getProducts: async (storeId?: 'main' | 'sub'): Promise<Product[]> => {
    const url = storeId ? `/products/store/${storeId}` : '/products';
    const res = await API.get(url);
    return res.data;
  },

  createProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const res = await API.post('/products', productData);
    return res.data;
  },

  updateProduct: async (id: string, productData: Partial<Product>): Promise<Product> => {
    const res = await API.put(`/products/${id}`, productData);
    return res.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await API.delete(`/products/${id}`);
  },

  getTransactions: async (storeId?: 'main' | 'sub'): Promise<Transaction[]> => {
    const url = storeId ? `/transactions/store/${storeId}` : '/transactions';
    const res = await API.get(url);
    return res.data;
  },

  createTransaction: async (txData: {
    type: string;
    storeId: 'main' | 'sub';
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      size: string;
      color: string;
    }>;
    totalAmount: number;
    note?: string;
  }): Promise<Transaction> => {
    const res = await API.post('/transactions', txData);
    return res.data;
  },

  updateTransaction: async (id: string, txData: Partial<Transaction>): Promise<Transaction> => {
    const res = await API.put(`/transactions/${id}`, txData);
    return res.data;
  },

  deleteTransaction: async (id: string): Promise<void> => {
    await API.delete(`/transactions/${id}`);
  },
};
