import { Product } from './index';

export interface StockInRequest {
  type: 'PURCHASE' | 'CUSTOMER_RETURN' | 'TRANSFER_IN';
  invoiceNo?: string;
  supplierId?: string;
  customerInvoiceNo?: string;
  date: string;
  items: { productId: string; quantity: number; unitPrice?: number }[];
  note?: string;
}

export interface StockOutRequest {
  type: 'SALE' | 'RETURN_TO_SUPPLIER' | 'DAMAGE' | 'TRANSFER_OUT';
  invoiceNo?: string;
  customerName?: string;
  supplierId?: string;
  date: string;
  items: { productId: string; quantity: number; sellingPrice?: number }[];
  paymentMethod?: 'CASH' | 'CARD' | 'UPI';
  note?: string;
}

export interface DashboardSummary {
  totalProducts: number;
  lowStockCount: number;
  todaySales: number;
  totalStockValue: number;
  recentTransactions: any[];
  lowStockProducts: Product[];
}