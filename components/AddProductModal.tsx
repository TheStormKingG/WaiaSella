import React, { useEffect, useMemo, useState } from 'react';

export interface AddProductFormValues {
  name: string;
  price: number;
  cost?: number;
  stock: number;
  reorderLevel: number;
  category: string;
  imageFile?: File | null;
}

interface AddProductDraft {
  name: string;
  price: string;
  cost: string;
  stock: string;
  reorderLevel: string;
  category: string;
  imageFile?: File | null;
}

interface AddProductModalProps {
  isOpen: boolean;
  categories: string[];
  isSubmitting: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: AddProductFormValues) => Promise<void> | void;
}

const emptyForm = (defaultCategory: string): AddProductDraft => ({
  name: '',
  price: '',
  cost: '',
  stock: '1',
  reorderLevel: '5',
  category: defaultCategory,
  imageFile: null,
});

const preventPropagation = (event: React.MouseEvent<HTMLDivElement>) => {
  event.stopPropagation();
};

const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  categories,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}) => {
  const defaultCategory = useMemo(() => (categories[0] ? categories[0] : 'General'), [categories]);
  const [formValues, setFormValues] = useState<AddProductDraft>(() => emptyForm(defaultCategory));
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormValues(prev => ({
        ...emptyForm(defaultCategory),
        // Preserve category if user has already chosen one during this session
        category: prev.category ?? defaultCategory,
      }));
      setImagePreview(null);
    }
  }, [isOpen, defaultCategory]);

  useEffect(() => {
    if (!formValues.imageFile) {
      setImagePreview(null);
      return undefined;
    }

    const nextPreviewUrl = URL.createObjectURL(formValues.imageFile);
    setImagePreview(nextPreviewUrl);

    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [formValues.imageFile]);

  if (!isOpen) {
    return null;
  }

  const handleInputChange = (field: keyof AddProductFormValues) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = event.target.value;

    if (field === 'imageFile') {
      const file = (event.target as HTMLInputElement).files?.[0] ?? null;
      setFormValues(prev => ({ ...prev, imageFile: file }));
      return;
    }

    setFormValues(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { name, price, stock, reorderLevel, cost, category, imageFile } = formValues;

    if (!name.trim()) {
      alert('Please provide a product name.');
      return;
    }

    if (price.trim() === '' || Number.isNaN(Number(price))) {
      alert('Please provide a valid price.');
      return;
    }

    if (stock.trim() === '' || Number.isNaN(Number(stock))) {
      alert('Please provide a valid stock quantity.');
      return;
    }

    if (!imageFile) {
      alert('Please upload or capture a product photo to enhance.');
      return;
    }

    await onSubmit({
      name: name.trim(),
      price: Number(price),
      stock: Number(stock),
      reorderLevel: Number(reorderLevel || 0),
      cost: cost.trim() === '' ? undefined : Number(cost),
      category,
      imageFile,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
        onClick={preventPropagation}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add Inventory Item</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Product name</label>
            <input
              type="text"
              value={formValues.name}
              onChange={handleInputChange('name')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="e.g. Colombian Coffee Beans"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
              <select
                value={formValues.category}
                onChange={handleInputChange('category')}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                disabled={isSubmitting}
              >
                {categories.length === 0 && <option value="General">General</option>}
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formValues.price}
                  onChange={handleInputChange('price')}
                  className="w-full rounded-lg border border-gray-200 py-2 pl-7 pr-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="0.00"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Cost (optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formValues.cost}
                  onChange={handleInputChange('cost')}
                  className="w-full rounded-lg border border-gray-200 py-2 pl-7 pr-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="0.00"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Stock</label>
              <input
                type="number"
                min="0"
                step="1"
                value={formValues.stock}
                onChange={handleInputChange('stock')}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="0"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Reorder level</label>
              <input
                type="number"
                min="0"
                step="1"
                value={formValues.reorderLevel}
                onChange={handleInputChange('reorderLevel')}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="5"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Product photo</label>
            <p className="mb-2 text-xs text-gray-500">
              Upload or capture a photo. Nano Banana will upscale it into a photorealistic HD product shot.
            </p>
            <div className="flex items-center gap-4">
              <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-600 hover:border-blue-400 hover:text-blue-500">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleInputChange('imageFile')}
                  disabled={isSubmitting}
                />
                <span className="font-medium">Tap to upload or use camera</span>
                <span className="mt-1 text-xs text-gray-500">PNG or JPEG up to 10MB</span>
              </label>

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Selected preview"
                  className="h-24 w-24 rounded-xl object-cover shadow-sm ring-1 ring-gray-200"
                />
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enhancing…' : 'Add item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
