
export enum Role {
  ADMIN = 'ADMIN',
  STOCK = 'STOCK',
  CASHIER = 'CAJERO'
}

export enum ProductCategory {
  INDUMENTARIA = 'Indumentaria',
  CALZADO = 'Calzado',
  ACCESORIOS = 'Accesorios'
}

export enum MovementType {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
  AJUSTE = 'AJUSTE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string;
}

export interface Brand {
  id: string;
  name: string;
  type?: 'Indumentaria' | 'Calzado' | 'Mixto';
}

export interface Variant {
  id: string;
  productId: string;
  size: string;
  color: string;
  stock: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brandId: string;
  category: ProductCategory;
  subCategory: string; // e.g., 'Remeras', 'Zapatillas'
  description: string;
  price: number; // Public Sale Price
  cost: number; // Unit Cost
  active: boolean;
  variants: Variant[];
}

export interface StockMovement {
  id: string;
  type: MovementType;
  productId: string;
  variantId: string;
  quantity: number;
  date: string;
  userId: string;
  origin: string;
  notes?: string;
}

export interface SaleItem {
  productId: string;
  variantId: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  date: string;
  userId: string;
  items: SaleItem[];
  total: number;
  paymentMethod: 'EFECTIVO';
}

export interface CashClose {
  id: string;
  date: string; // ISO Date YYYY-MM-DD
  fullTimestamp: string;
  userId: string;
  reportedAmount: number;
  systemAmount: number;
  difference: number;
  notes?: string;
}
