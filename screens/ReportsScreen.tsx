import React, { useContext, useMemo } from 'react';
import { SalesContext, InventoryContext } from '../App';
import type { Sale } from '../types';

const ReportsScreen: React.FC = () => {
  const { salesHistory } = useContext(SalesContext);
  const { inventory } = useContext(InventoryContext);

  const metrics = useMemo(() => {
    const totalSales = salesHistory.reduce((sum, sale) => sum + sale.total, 0);
    const totalProfit = salesHistory.reduce((sum, sale) => {
      const saleProfit = sale.items.reduce((itemProfit, item) => {
        const product = inventory.find(p => p.id === item.id);
        if (product && product.cost) {
          return itemProfit + (item.price - product.cost) * item.quantity;
        }
        return itemProfit;
      }, 0);
      return sum + saleProfit;
    }, 0);
    const transactions = salesHistory.length;
    const lowStockItems = inventory.filter(p => p.stock <= p.reorderLevel).length;

    return { totalSales, totalProfit, transactions, lowStockItems };
  }, [salesHistory, inventory]);

  const topSellingItems = useMemo(() => {
    const itemCounts = new Map<string, { name: string; count: number; imageUrl: string }>();
    
    salesHistory.forEach(sale => {
      sale.items.forEach(item => {
        const existing = itemCounts.get(item.id);
        if (existing) {
          existing.count += item.quantity;
        } else {
          const product = inventory.find(p => p.id === item.id);
          if (product) {
            itemCounts.set(item.id, {
              name: item.name,
              count: item.quantity,
              imageUrl: product.imageUrl
            });
          }
        }
      });
    });

    return Array.from(itemCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [salesHistory, inventory]);

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Reports</h1>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Sales</p>
          <p className="text-2xl font-bold text-gray-800">${metrics.totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Profit</p>
          <p className="text-2xl font-bold text-gray-800">${metrics.totalProfit.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Transactions</p>
          <p className="text-2xl font-bold text-gray-800">{metrics.transactions}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
          <p className="text-2xl font-bold text-gray-800">{metrics.lowStockItems}</p>
        </div>
      </div>

      {/* Top Selling Items */}
      <h2 className="text-xl font-bold text-gray-800 mb-3">Top Selling Items</h2>
      <div className="space-y-3">
        {topSellingItems.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
              <span className="font-semibold text-gray-800 truncate">{item.name}</span>
            </div>
            <span className="font-bold text-blue-600 text-sm flex-shrink-0 ml-3">
              {item.count} sold
            </span>
          </div>
        ))}
        {topSellingItems.length === 0 && (
          <p className="text-gray-500 text-center py-8">No sales data available.</p>
        )}
      </div>
    </div>
  );
};

export default ReportsScreen;

