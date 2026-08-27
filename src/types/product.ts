export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  size: string;
  color: string;
  fabric: string;
  buyingPrice: number;
  sellingPrice: number;
  gstRate: number;
  supplierId: string;
  supplierName?: string;
  reorderLevel: number;
  currentQuantity: number;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFormData {
  sku: string;
  name: string;
  category: string;
  size: string;
  color: string;
  fabric: string;
  buyingPrice: number;
  sellingPrice: number;
  gstRate: number;
  supplierId: string;
  reorderLevel: number;
  currentQuantity?: number;
  imageUrl?: string;
}