import React, { useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { InventoryContext } from '../App';
import type { Product } from '../types';
import { CameraIcon } from '../components/Icons';
import AddProductModal, { AddProductFormValues } from '../components/AddProductModal';
import { CATEGORIES } from '../constants';
import { enhanceProductImage, NanoBananaError } from '../services/nanoBanana';

const InventoryScreen: React.FC = () => {
  const { inventory, setInventory } = useContext(InventoryContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [addSuccessMessage, setAddSuccessMessage] = useState<string | null>(null);

  const filteredInventory = useMemo(() => {
    if (!searchTerm) return inventory;
    return inventory.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, searchTerm]);

  const categories = useMemo(() => CATEGORIES.filter(cat => cat !== 'All'), []);

  useEffect(() => {
    if (!addSuccessMessage) return;
    const timeout = window.setTimeout(() => setAddSuccessMessage(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [addSuccessMessage]);

  const handleAddProduct = useCallback(
    async (values: AddProductFormValues) => {
      setIsSubmitting(true);
      setModalError(null);

      try {
        const { imageFile, cost, ...rest } = values;

        if (!imageFile) {
          throw new Error('A product image is required to run Nano Banana enhancement.');
        }

        const enhancement = await enhanceProductImage({
          imageFile,
          itemName: rest.name,
          category: rest.category,
          quality: 'hd',
        });

        const newProduct: Product = {
          id: `PROD-${Date.now()}`,
          name: rest.name,
          price: rest.price,
          stock: rest.stock,
          category: rest.category,
          reorderLevel: rest.reorderLevel,
          imageUrl: enhancement.imageUrl,
          ...(typeof cost === 'number' ? { cost } : {}),
        };

        setInventory(prev => [newProduct, ...prev]);
        setShowAddModal(false);
        setAddSuccessMessage(
          enhancement.source === 'enhanced'
            ? `Saved “${rest.name}” with a Nano Banana enhanced photo.`
            : `Saved “${rest.name}”, but Nano Banana fell back to the original photo.`
        );
        setSearchTerm('');
      } catch (error) {
        console.error('Failed to add product with Nano Banana enhancement', error);
        if (error instanceof NanoBananaError) {
          setModalError(error.message);
        } else if (error instanceof Error) {
          setModalError(error.message);
        } else {
          setModalError('Unexpected error while enhancing the product image.');
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [setInventory]
  );

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

      {addSuccessMessage && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {addSuccessMessage}
        </div>
      )}
      
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
      <button
        type="button"
        onClick={() => {
          setModalError(null);
          setShowAddModal(true);
        }}
        className="fixed bottom-20 right-4 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors z-40"
      >
        <CameraIcon className="w-6 h-6" />
      </button>

      <AddProductModal
        isOpen={showAddModal}
        categories={categories}
        isSubmitting={isSubmitting}
        error={modalError}
        onClose={() => {
          if (!isSubmitting) {
            setShowAddModal(false);
            setModalError(null);
          }
        }}
        onSubmit={handleAddProduct}
      />
    </div>
  );
};

export default InventoryScreen;

