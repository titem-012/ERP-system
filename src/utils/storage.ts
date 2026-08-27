const STORAGE_KEYS = {
  PRODUCTS: 'cloth_shop_products',
  TRANSACTIONS: 'cloth_shop_transactions',
};

export const storage = {
  getProducts: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]'),
  setProducts: (products: any) => localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products)),
  getTransactions: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]'),
  setTransactions: (txns: any) => localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txns)),
  initMockData: () => {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      const mockProducts = [
        { id: '1', sku: 'MS-OX-101', name: 'Slim Fit Oxford Shirt', category: 'Shirts', size: 'L', color: 'Navy', buyingPrice: 25, sellingPrice: 59, reorderLevel: 10, currentQuantity: 89, supplierId: 'SUP-001', createdAt: new Date().toISOString() },
        { id: '2', sku: 'MS-OC-204', name: 'Wool Blend Overcoat', category: 'Outerwear', size: 'XL', color: 'Charcoal', buyingPrice: 80, sellingPrice: 199, reorderLevel: 5, currentQuantity: 5, supplierId: 'SUP-002', createdAt: new Date().toISOString() },
        { id: '3', sku: 'MS-TR-001', name: 'Trousers', category: 'Trousers', size: '32', color: 'Black', buyingPrice: 20, sellingPrice: 49, reorderLevel: 8, currentQuantity: 30, supplierId: 'SUP-001', createdAt: new Date().toISOString() },
        { id: '4', sku: 'MS-TS-002', name: 'T-Shirt', category: 'T-Shirts', size: 'M', color: 'White', buyingPrice: 10, sellingPrice: 29, reorderLevel: 15, currentQuantity: 10, supplierId: 'SUP-003', createdAt: new Date().toISOString() },
        { id: '5', sku: 'MS-JK-003', name: 'Jacket', category: 'Outerwear', size: 'L', color: 'Olive', buyingPrice: 45, sellingPrice: 99, reorderLevel: 5, currentQuantity: 10, supplierId: 'SUP-002', createdAt: new Date().toISOString() },
      ];
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(mockProducts));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    }
  }
};