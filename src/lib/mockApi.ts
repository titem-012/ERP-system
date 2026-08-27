import { storage } from '@/utils/storage';
import { v4 as uuidv4 } from 'uuid';

// Helper to generate unique ID
const generateId = () => uuidv4();

export const mockApi = {
  // Auth (mock)
  login: async (username: string, password: string) => {
    return {
      token: 'mock-jwt-token',
      user: { id: '1', name: username || 'Admin', email: 'admin@shop.com', role: 'ADMIN' }
    };
  },

  // Products
  getProducts: async () => {
    return storage.getProducts();
  },
  getProduct: async (id: string) => {
    return storage.getProducts().find((p: any) => p.id === id);
  },
  createProduct: async (data: any) => {
    const products = storage.getProducts();
    const newProduct = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    products.push(newProduct);
    storage.setProducts(products);
    return newProduct;
  },
  updateProduct: async (id: string, data: any) => {
    const products = storage.getProducts();
    const index = products.findIndex((p: any) => p.id === id);
    if (index === -1) throw new Error('Product not found');
    products[index] = { ...products[index], ...data };
    storage.setProducts(products);
    return products[index];
  },
  deleteProduct: async (id: string) => {
    const products = storage.getProducts();
    storage.setProducts(products.filter((p: any) => p.id !== id));
  },

  // Stock IN
  addStockIn: async (transaction: any) => {
    const transactions = storage.getTransactions();
    const newTxn = { ...transaction, id: generateId() };
    transactions.push(newTxn);
    storage.setTransactions(transactions);

    // Increase product quantities
    const products = storage.getProducts();
    for (const item of transaction.items) {
      const prod = products.find((p: any) => p.id === item.productId);
      if (prod) {
        prod.currentQuantity += item.quantity;
      }
    }
    storage.setProducts(products);
    return newTxn;
  },

  // Stock OUT (decrease quantities)
  addStockOut: async (transaction: any) => {
    const transactions = storage.getTransactions();
    const newTxn = { ...transaction, id: generateId() };
    transactions.push(newTxn);
    storage.setTransactions(transactions);

    const products = storage.getProducts();
    for (const item of transaction.items) {
      const prod = products.find((p: any) => p.id === item.productId);
      if (prod) {
        const newQty = prod.currentQuantity - item.quantity;
        if (newQty < 0) throw new Error(`Insufficient stock for ${prod.name}`);
        prod.currentQuantity = newQty;
      }
    }
    storage.setProducts(products);
    return newTxn;
  },

  // Stock adjustment (physical count)
  adjustStock: async (productId: string, physicalCount: number, reason: string) => {
    const products = storage.getProducts();
    const prod = products.find((p: any) => p.id === productId);
    if (!prod) throw new Error('Product not found');
    const oldQty = prod.currentQuantity;
    prod.currentQuantity = physicalCount;
    storage.setProducts(products);

    const transactions = storage.getTransactions();
    transactions.push({
      id: generateId(),
      type: 'ADJUSTMENT',
      date: new Date().toISOString(),
      items: [{ productId, quantity: Math.abs(physicalCount - oldQty), unitPrice: 0 }],
      totalAmount: 0,
      note: reason
    });
    storage.setTransactions(transactions);
  },

  // Dashboard stats
  getDashboardStats: async () => {
    const products = storage.getProducts();
    const transactions = storage.getTransactions();
    const today = new Date().toISOString().split('T')[0];
    const todaySales = transactions
      .filter((t: any) => t.type === 'SALE' && t.date.startsWith(today))
      .reduce((sum: number, t: any) => sum + t.totalAmount, 0);
    const lowStockCount = products.filter((p: any) => p.currentQuantity <= p.reorderLevel).length;
    const totalStockValue = products.reduce((sum: number, p: any) => sum + (p.currentQuantity * p.buyingPrice), 0);
    const recentTransactions = transactions.slice(-20).reverse();
    const lowStockProducts = products.filter((p: any) => p.currentQuantity <= p.reorderLevel);
    return {
      totalProducts: products.length,
      lowStockCount,
      todaySales,
      totalStockValue,
      averageOrderValue: todaySales / (transactions.filter((t: any) => t.type === 'SALE' && t.date.startsWith(today)).length || 1),
      totalOrdersToday: transactions.filter((t: any) => t.type === 'SALE' && t.date.startsWith(today)).length,
      recentTransactions,
      lowStockProducts
    };
  },

  // Reports (mock)
  getSalesWeekly: async () => {
    const transactions = storage.getTransactions();
    const sales = transactions.filter((t: any) => t.type === 'SALE');
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({ date: day, amount: Math.floor(Math.random() * 5000) + 1000 }));
  },
  getTopProducts: async () => {
    const transactions = storage.getTransactions();
    const sales = transactions.filter((t: any) => t.type === 'SALE');
    const productSales: Record<string, { sold: number; revenue: number }> = {};
    for (const sale of sales) {
      for (const item of sale.items) {
        if (!productSales[item.productId]) productSales[item.productId] = { sold: 0, revenue: 0 };
        productSales[item.productId].sold += item.quantity;
        productSales[item.productId].revenue += (item.unitPrice || 0) * item.quantity;
      }
    }
    const products = storage.getProducts();
    const top = Object.entries(productSales).map(([id, data]) => {
      const prod = products.find((p: any) => p.id === id);
      return { id, name: prod?.name || id, sku: prod?.sku || id, totalSold: data.sold, revenue: data.revenue };
    }).sort((a, b) => b.totalSold - a.totalSold).slice(0, 5);
    return top;
  },
  getStockByCategory: async () => {
    const products = storage.getProducts();
    const categories: Record<string, number> = {};
    for (const p of products) {
      const value = p.currentQuantity * p.buyingPrice;
      categories[p.category] = (categories[p.category] || 0) + value;
    }
    return Object.entries(categories).map(([category, value]) => ({ category, value }));
  }
};