
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  reorderLevel: number;
  imageUrl: string;
}

export interface SaleItem extends Product {
  quantity: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  tax: number;
  subtotal: number;
  date: Date;
}

export enum AppScreen {
  Sales = 'Sales',
  Inventory = 'Inventory',
  Reports = 'Reports',
  Reorder = 'Reorder',
}
