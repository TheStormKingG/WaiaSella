import React, { useEffect, useMemo, useState } from 'react';
import type { Product } from '../types';
import { CATEGORIES } from '../constants';
import { enhanceProductImageWithNanoBanana } from '../services/imageEnhancer';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
}

const PRODUCT_CATEGORIES = CATEGORIES.filter(category => category !== 'All');

const defaultCategory = PRODUCT_CATEGORIES[0] ?? '';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Unable to read file as base64.'));
        return;
      }
      const [, base64] = reader.result.split(',');
      if (!base64) {
        reject(new Error('Invalid base64 data URL.'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
};

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Unable to read file as data URL.'));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
};

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onAddProduct }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName('');
    setCategory(defaultCategory);
    setPrice('');
    setCost('');
    setStock('');
    setReorderLevel('');
    setImageFile(null);
    setImagePreview(null);
    setErrorMessage(null);
    setIsEnriching(false);
  }, [isOpen]);

  const canSubmit = useMemo(() => {
    return Boolean(
      name.trim() &&
      category &&
      price &&
      stock &&
      reorderLevel &&
      imageFile &&
      !isEnriching
    );
  }, [name, category, price, stock, reorderLevel, imageFile, isEnriching]);

  const handleImageChange: React.ChangeEventHandler<HTMLInputElement> = async event => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    setImageFile(file);
    try {
      const previewUrl = await fileToDataUrl(file);
      setImagePreview(previewUrl);
    } catch (error) {
      console.error('Failed to create preview:', error);
      setImagePreview(null);
    }
  };

  const handleClose = () => {
    if (isEnriching) return;
    onClose();
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async event => {
    event.preventDefault();
    if (!imageFile) {
      setErrorMessage('Please attach a product photo.');
      return;
    }

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock, 10);
    const parsedReorderLevel = parseInt(reorderLevel, 10);
    const parsedCost = cost ? parseFloat(cost) : undefined;

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setErrorMessage('Enter a valid price.');
      return;
    }

    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      setErrorMessage('Enter a valid stock quantity.');
      return;
    }

    if (Number.isNaN(parsedReorderLevel) || parsedReorderLevel < 0) {
      setErrorMessage('Enter a valid reorder level.');
      return;
    }

    if (parsedCost !== undefined && (Number.isNaN(parsedCost) || parsedCost < 0)) {
      setErrorMessage('Enter a valid cost or leave it empty.');
      return;
    }

    setErrorMessage(null);
    setIsEnriching(true);

    try {
      const base64 = await fileToBase64(imageFile);

      let cleanedImageUrl: string | null = null;
      try {
        cleanedImageUrl = await enhanceProductImageWithNanoBanana({
          base64Image: base64,
          mimeType: imageFile.type || 'image/jpeg',
          itemName: name.trim(),
          category,
        });
      } catch (error) {
        console.warn('Nano Banana cleanup failed. Falling back to original photo.', error);
        cleanedImageUrl = `data:${imageFile.type || 'image/jpeg'};base64,${base64}`;
        setErrorMessage('Nano Banana cleanup had an issue. Using the original photo instead.');
      }

      const product: Product = {
        id: `PROD-${Date.now()}`,
        name: name.trim(),
        category,
        price: parsedPrice,
        stock: parsedStock,
        reorderLevel: parsedReorderLevel,
        imageUrl: cleanedImageUrl ?? '',
        cost: parsedCost,
      };

      onAddProduct(product);
      handleClose();
    } finally {
      setIsEnriching(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Add Product</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200"
            disabled={isEnriching}
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Product name</label>
            <input
              type="text"
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder="e.g. Organic Mango Juice"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={event => setCategory(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none"
            >
              {PRODUCT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={event => setPrice(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                placeholder="9.99"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Cost (optional)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={cost}
                onChange={event => setCost(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                placeholder="5.25"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={event => setStock(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                placeholder="25"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Reorder level</label>
              <input
                type="number"
                min="0"
                step="1"
                value={reorderLevel}
                onChange={event => setReorderLevel(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                placeholder="10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Product photo</label>
            <div className="flex items-center space-x-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-600 hover:file:bg-blue-100"
              />
            </div>
            {imagePreview && (
              <div className="pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Preview</p>
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="mt-1 h-40 w-full rounded-lg object-cover"
                />
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {isEnriching && (
            <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
              Polishing with Nano Banana for an HD product shot...
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
              disabled={isEnriching}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              disabled={!canSubmit}
            >
              {isEnriching ? 'Enhancing...' : 'Add product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;

