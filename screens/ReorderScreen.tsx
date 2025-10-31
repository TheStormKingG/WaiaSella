

import React, { useContext, useMemo } from 'react';
import { InventoryContext } from '../App';

const ReorderItem: React.FC<{ name: string; stock: number; reorderLevel: number; imageUrl: string; }> = ({ name, stock, reorderLevel, imageUrl }) => (
    <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-4">
             <img src={imageUrl} alt={name} className="w-12 h-12 rounded-md object-cover"/>
            <div>
                <p className="font-semibold text-gray-800">{name}</p>
                <p className="text-sm text-gray-600">Reorder at: {reorderLevel}</p>
            </div>
        </div>
        <div>
            <p className="text-lg font-bold text-red-600">{stock}</p>
            <p className="text-xs text-right text-gray-600">in stock</p>
        </div>
    </div>
);

const ReorderScreen: React.FC = () => {
    const { inventory } = useContext(InventoryContext);
    
    const reorderList = useMemo(() => {
        return inventory.filter(p => p.stock <= p.reorderLevel);
    }, [inventory]);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Reorder List</h1>
            {reorderList.length > 0 ? (
                <div className="space-y-3">
                    {reorderList.map(item => (
                        <ReorderItem 
                            key={item.id} 
                            name={item.name} 
                            stock={item.stock} 
                            reorderLevel={item.reorderLevel}
                            imageUrl={item.imageUrl}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center mt-16">
                    <div className="mx-auto w-16 h-16 text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-gray-800">All Stocked Up!</h2>
                    <p className="text-gray-600 mt-1">No items need reordering at this time.</p>
                </div>
            )}
        </div>
    );
};

export default ReorderScreen;