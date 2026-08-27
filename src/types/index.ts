export interface LoginCredentials {
  username: string;
  password?: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'CASHIER';
  assignedStore?: 'main' | 'sub';
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  size: string;
  color: string;
  currentQuantity: number;
  buyingPrice: number;
  sellingPrice: number;
  storeId: 'main' | 'sub';
}

export interface TransactionItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  size: string;
  color: string;
}

export type TransactionType =
  | 'PURCHASE'
  | 'RETURN_IN'
  | 'TRANSFER_IN'
  | 'SALE'
  | 'DAMAGE'
  | 'RETURN_TO_SUPPLIER'
  | 'TRANSFER_OUT';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  storeId: 'main' | 'sub';
  items: TransactionItem[];
  totalAmount: number;
  note?: string;
}

export interface DailyStockReport {
  date: string;
  storeId: 'main' | 'sub';
  productName: string;
  size: string;
  stockIn: number;
  stockOut: number;
  closingBalance: number;
}
