export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  cost?: number;
  reorderLevel: number;
}

export interface SaleItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  date: Date;
}

export enum AppScreen {
  Sales = 'Sales',
  Inventory = 'Inventory',
  Reports = 'Reports',
  Reorder = 'Reorder'
}

