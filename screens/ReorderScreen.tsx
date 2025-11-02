import React, { useContext, useMemo } from 'react';
import { InventoryContext } from '../App';
import { CheckIcon } from '../components/Icons';

const ReorderScreen: React.FC = () => {
  const { inventory } = useContext(InventoryContext);

  const lowStockItems = useMemo(() => {
    return inventory.filter(p => p.stock <= p.reorderLevel);
  }, [inventory]);

  if (lowStockItems.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 pb-20">
        <div className="bg-gray-100 rounded-full p-6 mb-4">
          <CheckIcon className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">All Stocked Up!</h2>
        <p className="text-gray-600 text-center">No items need reordering at this time.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Reorder List</h1>
      <div className="space-y-3">
        {lowStockItems.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 truncate">{item.name}</h3>
                <p className="text-sm text-red-600">Stock: {item.stock} (Reorder at: {item.reorderLevel})</p>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold">
              Reorder
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReorderScreen;

