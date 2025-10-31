import type { Product, Sale } from './types';

export const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Redbull', category: 'Drinks', price: 2.50, cost: 1.20, stock: 15, reorderLevel: 10, imageUrl: 'https://picsum.photos/seed/Redbull/200' },
  { id: '2', name: 'Shampoo', category: 'Personal Care', price: 5.00, cost: 2.50, stock: 25, reorderLevel: 10, imageUrl: 'https://picsum.photos/seed/Shampoo/200' },
  { id: '3', name: 'Powder Milk', category: 'Groceries', price: 8.75, cost: 5.00, stock: 8, reorderLevel: 5, imageUrl: 'https://picsum.photos/seed/Milk/200' },
  { id: '4', name: 'Doritos', category: 'Snacks', price: 1.25, cost: 0.50, stock: 50, reorderLevel: 20, imageUrl: 'https://picsum.photos/seed/Doritos/200' },
  { id: '5', name: 'Olive Oil', category: 'Groceries', price: 12.00, cost: 8.00, stock: 12, reorderLevel: 5, imageUrl: 'https://picsum.photos/seed/Oil/200' },
  { id: '6', name: 'Water Bottle', category: 'Drinks', price: 1.00, cost: 0.30, stock: 100, reorderLevel: 30, imageUrl: 'https://picsum.photos/seed/Water/200' },
  { id: '7', name: 'Green Tea', category: 'Drinks', price: 3.50, cost: 1.50, stock: 30, reorderLevel: 15, imageUrl: 'https://picsum.photos/seed/Tea/200' },
  { id: '8', name: 'Apples', category: 'Produce', price: 0.75, cost: 0.30, stock: 40, reorderLevel: 10, imageUrl: 'https://picsum.photos/seed/Apples/200' },
];

// Helper to generate sales data
const generateSale = (id: string, daysAgo: number, items: { productIndex: number, quantity: number }[]): Sale => {
    const saleItems = items.map(i => ({
        ...MOCK_PRODUCTS[i.productIndex],
        quantity: i.quantity,
    }));
    const subtotal = saleItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = subtotal * 0.16;
    const total = subtotal + tax;
    
    return {
        id,
        items: saleItems,
        subtotal,
        tax,
        total,
        date: new Date(Date.now() - 86400000 * daysAgo),
    };
};

export const MOCK_SALES_HISTORY: Sale[] = [
    generateSale('S1', 85, [{ productIndex: 0, quantity: 5 }, { productIndex: 3, quantity: 10 }]),
    generateSale('S2', 82, [{ productIndex: 2, quantity: 2 }, { productIndex: 6, quantity: 4 }]),
    generateSale('S3', 75, [{ productIndex: 1, quantity: 3 }, { productIndex: 5, quantity: 12 }]),
    generateSale('S4', 70, [{ productIndex: 7, quantity: 20 }, { productIndex: 4, quantity: 2 }]),
    generateSale('S5', 65, [{ productIndex: 0, quantity: 8 }, { productIndex: 6, quantity: 6 }]),
    generateSale('S6', 60, [{ productIndex: 3, quantity: 15 }]),
    generateSale('S7', 55, [{ productIndex: 2, quantity: 3 }, { productIndex: 5, quantity: 5 }]),
    generateSale('S8', 50, [{ productIndex: 1, quantity: 2 }, { productIndex: 4, quantity: 1 }, { productIndex: 7, quantity: 10 }]),
    generateSale('S9', 45, [{ productIndex: 0, quantity: 10 }, { productIndex: 3, quantity: 5 }, { productIndex: 5, quantity: 10 }]),
    generateSale('S10', 40, [{ productIndex: 6, quantity: 8 }]),
    generateSale('S11', 35, [{ productIndex: 2, quantity: 4 }, { productIndex: 1, quantity: 1 }]),
    generateSale('S12', 30, [{ productIndex: 7, quantity: 30 }, { productIndex: 4, quantity: 3 }]),
    generateSale('S13', 25, [{ productIndex: 0, quantity: 7 }, { productIndex: 5, quantity: 8 }]),
    generateSale('S14', 20, [{ productIndex: 3, quantity: 20 }, { productIndex: 6, quantity: 5 }]),
    generateSale('S15', 15, [{ productIndex: 2, quantity: 1 }, { productIndex: 1, quantity: 4 }]),
    generateSale('S16', 10, [{ productIndex: 4, quantity: 5 }, { productIndex: 7, quantity: 15 }]),
    generateSale('S17', 5, [{ productIndex: 0, quantity: 12 }, { productIndex: 5, quantity: 15 }]),
    generateSale('S18', 2, [{ productIndex: 3, quantity: 8 }, { productIndex: 6, quantity: 10 }]),
];


export const CATEGORIES = ['All', ...Array.from(new Set(MOCK_PRODUCTS.map(p => p.category)))];
export const TAX_RATE = 0.16;