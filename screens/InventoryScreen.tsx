import React, { useState, useContext, useMemo } from 'react';
import { InventoryContext } from '../App';
import type { Product } from '../types';
import { CameraIcon } from '../components/Icons';

const InventoryScreen: React.FC = () => {
  const { inventory } = useContext(InventoryContext);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInventory = useMemo(() => {
    if (!searchTerm) return inventory;
    return inventory.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, searchTerm]);

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Inventory</h1>
      <input
        type="text"
        placeholder="Search inventory..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full p-3 mb-4 bg-gray-100 border-0 rounded-lg text-gray-800 placeholder-gray-500"
      />
      
      <div className="space-y-3">
        {filteredInventory.map(item => (
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
                <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex-shrink-0 ml-4">
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-20 right-4 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors z-40">
        <CameraIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default InventoryScreen;

