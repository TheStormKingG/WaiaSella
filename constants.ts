import type { Product, Sale } from './types';

export const CATEGORIES = ['All', 'Drinks', 'Personal Care', 'Groceries', 'Snacks', 'Produce'];

export const TAX_RATE = 0.16;

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Redbull',
    price: 2.50,
    stock: 15,
    category: 'Drinks',
    imageUrl: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&h=300&fit=crop',
    cost: 1.50,
    reorderLevel: 10
  },
  {
    id: '2',
    name: 'Shampoo',
    price: 5.00,
    stock: 25,
    category: 'Personal Care',
    imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=300&fit=crop',
    cost: 3.00,
    reorderLevel: 15
  },
  {
    id: '3',
    name: 'Powder Milk',
    price: 8.75,
    stock: 8,
    category: 'Groceries',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    cost: 5.50,
    reorderLevel: 10
  },
  {
    id: '4',
    name: 'Doritos',
    price: 1.25,
    stock: 50,
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1505075106905-fb052892c116?w=400&h=300&fit=crop',
    cost: 0.75,
    reorderLevel: 20
  },
  {
    id: '5',
    name: 'Olive Oil',
    price: 12.00,
    stock: 12,
    category: 'Groceries',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7ea07b5c5d5a?w=400&h=300&fit=crop',
    cost: 8.00,
    reorderLevel: 10
  },
  {
    id: '6',
    name: 'Water Bottle',
    price: 1.00,
    stock: 100,
    category: 'Drinks',
    imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=300&fit=crop',
    cost: 0.50,
    reorderLevel: 50
  },
  {
    id: '7',
    name: 'Green Tea',
    price: 3.50,
    stock: 30,
    category: 'Drinks',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    cost: 2.00,
    reorderLevel: 15
  },
  {
    id: '8',
    name: 'Apples',
    price: 0.75,
    stock: 40,
    category: 'Produce',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop',
    cost: 0.40,
    reorderLevel: 20
  }
];

export const MOCK_SALES_HISTORY: Sale[] = [
  {
    id: 'SALE-1',
    items: [
      { id: '1', name: 'Redbull', price: 2.50, quantity: 3 },
      { id: '4', name: 'Doritos', price: 1.25, quantity: 2 }
    ],
    subtotal: 10.00,
    tax: 1.60,
    total: 11.60,
    date: new Date()
  },
  {
    id: 'SALE-2',
    items: [
      { id: '3', name: 'Powder Milk', price: 8.75, quantity: 1 }
    ],
    subtotal: 8.75,
    tax: 1.40,
    total: 10.15,
    date: new Date()
  }
];

