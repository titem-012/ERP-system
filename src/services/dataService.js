// src/services/dataService.js
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api',
  headers: { 'Content-Type': 'application/json' },
});

// Auto‑attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ===== PRODUCTS =====
export const getProducts = async () => {
  const res = await API.get('/products');
  return res.data;
};

export const createProduct = async (productData) => {
  const res = await API.post('/products', productData);
  return res.data;
};

export const updateProduct = async (id, productData) => {
  const res = await API.put(`/products/${id}`, productData);
  return res.data;
};

export const deleteProduct = async (id) => {
  await API.delete(`/products/${id}`);
};

// ===== TRANSACTIONS =====
export const getTransactions = async (storeId = null) => {
  const url = storeId ? `/transactions/store/${storeId}` : '/transactions';
  const res = await API.get(url);
  return res.data;
};

export const createTransaction = async (txData) => {
  const res = await API.post('/transactions', txData);
  return res.data;
};

export const updateTransaction = async (id, txData) => {
  const res = await API.put(`/transactions/${id}`, txData);
  return res.data;
};

export const deleteTransaction = async (id) => {
  await API.delete(`/transactions/${id}`);
};

// ===== USERS (Cashiers) =====
export const getCashiers = async () => {
  const res = await API.get('/users/cashiers');
  return res.data;
};

export const createCashier = async (userData) => {
  const res = await API.post('/users/cashier', userData);
  return res.data;
};

export const deleteUser = async (id) => {
  await API.delete(`/users/${id}`);
};

// ===== AUTH =====
export const login = async (username, password) => {
  const res = await API.post('/auth/login', { username, password });
  const { token, user } = res.data;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  return user;
};

export const register = async (userData) => {
  const res = await API.post('/auth/register', userData);
  const { token, user } = res.data;
  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
  return user;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};