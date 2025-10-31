

import React, { useState, useContext, useRef, useMemo, useEffect } from 'react';
import { InventoryContext } from '../App';
import type { Product } from '../types';
import { CameraIcon, ArrowLeftIcon, AllIcon, DrinksIcon, PersonalCareIcon, GroceriesIcon, SnacksIcon, ProduceIcon, CategoryIcon, PencilIcon, TrashIcon, PlusIcon, CloseIcon, PlusCircleIcon, TagIcon, HomeIcon, DesktopComputerIcon, BookOpenIcon, GiftIcon, SparklesIcon, CogIcon } from '../components/Icons';
import { extractInventoryFromImage } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';

type IconProps = { className?: string; };

const defaultCategoryStyles: { [key: string]: { icon: React.FC<IconProps>; color: string; } } = {
  'All': { icon: AllIcon, color: 'bg-slate-500' },
  'Drinks': { icon: DrinksIcon, color: 'bg-blue-500' },
  'Personal Care': { icon: PersonalCareIcon, color: 'bg-pink-500' },
  'Groceries': { icon: GroceriesIcon, color: 'bg-emerald-500' },
  'Snacks': { icon: SnacksIcon, color: 'bg-amber-500' },
  'Produce': { icon: ProduceIcon, color: 'bg-lime-600' },
};

const iconComponents: { [key: string]: React.FC<IconProps> } = {
    AllIcon, DrinksIcon, PersonalCareIcon, GroceriesIcon, SnacksIcon, ProduceIcon, CategoryIcon,
    TagIcon, HomeIcon, DesktopComputerIcon, BookOpenIcon, GiftIcon, SparklesIcon
};

const selectableIcons = [
    { name: 'CategoryIcon', component: CategoryIcon },
    { name: 'TagIcon', component: TagIcon },
    { name: 'HomeIcon', component: HomeIcon },
    { name: 'DesktopComputerIcon', component: DesktopComputerIcon },
    { name: 'BookOpenIcon', component: BookOpenIcon },
    { name: 'GiftIcon', component: GiftIcon },
    { name: 'SparklesIcon', component: SparklesIcon },
    { name: 'GroceriesIcon', component: GroceriesIcon },
];

const CUSTOM_CATEGORY_COLORS = ['bg-indigo-500', 'bg-purple-500', 'bg-cyan-500', 'bg-teal-500', 'bg-rose-500'];

interface CustomCategory {
    name: string;
    icon: string;
    color: string;
}

const StockLevelBar: React.FC<{ stock: number; reorderLevel: number }> = ({ stock, reorderLevel }) => {
    const barColor = stock <= reorderLevel ?
        (stock === 0 ? 'bg-red-500' : 'bg-yellow-500') :
        'bg-green-500';

    const maxForBar = Math.max(stock, reorderLevel * 2, 1);

    const stockPercentage = (stock / maxForBar) * 100;
    const reorderPercentage = (reorderLevel / maxForBar) * 100;

    return (
        <div className="relative w-full h-3 bg-gray-200 rounded-full" title={`Stock: ${stock} / Reorder at: ${reorderLevel}`}>
            <div
                className={`absolute h-full rounded-full ${barColor}`}
                style={{ width: `${stockPercentage}%` }}
            ></div>
            {reorderPercentage <= 100 && (
                <div
                    className="absolute top-0 h-full w-0.5 bg-slate-700 opacity-70"
                    style={{ left: `${reorderPercentage}%` }}
                ></div>
            )}
        </div>
    );
};


const ProductListItem: React.FC<{ product: Product; onEdit: (product: Product) => void; }> = ({ product, onEdit }) => {
    return (
        <button onClick={() => onEdit(product)} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between gap-4 w-full text-left hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4 flex-shrink-0 max-w-[50%]">
                <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-md object-cover"/>
                <div>
                    <p className="font-semibold text-gray-800 truncate">{product.name}</p>
                    <p className="text-sm text-gray-600">${product.price.toFixed(2)}</p>
                </div>
            </div>
            <div className="flex-grow flex flex-col justify-center">
                <StockLevelBar stock={product.stock} reorderLevel={product.reorderLevel} />
                <div className="flex justify-between text-xs text-gray-600 mt-1 px-1">
                    <span className="opacity-80">Low: {product.reorderLevel}</span>
                    <span className="font-medium">Stock: {product.stock}</span>
                </div>
            </div>
            <PencilIcon className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0"/>
        </button>
    );
};

const OcrReviewModal: React.FC<{ items: Partial<Product>[]; onConfirm: (items: Partial<Product>[]) => void; onClose: () => void }> = ({ items, onConfirm, onClose }) => {
    const [reviewedItems, setReviewedItems] = useState<Partial<Product>[]>(items);
    
    return (
         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Review Scanned Items</h2>
                <div className="max-h-96 overflow-y-auto space-y-2">
                    {Array.isArray(reviewedItems) && reviewedItems.map((item, index) => (
                        <div key={index} className="grid grid-cols-3 gap-2 p-2 border rounded text-gray-800">
                            <span className="col-span-2">{item.name || 'N/A'}</span>
                            <span className="text-right">Qty: {item.stock || 0}</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
                    <button onClick={() => onConfirm(reviewedItems)} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Add to Inventory</button>
                </div>
            </div>
        </div>
    );
};

const ProductDetailModal: React.FC<{ product: Product; onSave: (product: Product) => void; onDelete: (productId: string) => void; onClose: () => void; categories: string[]; }> = ({ product, onSave, onDelete, onClose, categories }) => {
    const [formData, setFormData] = useState<Product>(product);
    const [stockToAdd, setStockToAdd] = useState('');
    const imageInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        setFormData(product);
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumberInput = (e.target as HTMLInputElement).type === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumberInput ? parseFloat(value) || 0 : value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result) {
                    setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddStock = () => {
        const amount = parseInt(stockToAdd, 10);
        if (!isNaN(amount) && amount > 0) {
            setFormData(prev => ({ ...prev, stock: prev.stock + amount }));
            setStockToAdd('');
        }
    };
    
    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${product.name}? This action cannot be undone.`)) {
            onDelete(product.id);
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-40" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative" onClick={e => e.stopPropagation()}>
                 <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-4 mb-6">
                    <div className="relative group w-20 h-20 flex-shrink-0">
                        <img src={formData.imageUrl} alt={formData.name} className="w-20 h-20 rounded-lg object-cover"/>
                        <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-lg transition-opacity"
                            aria-label="Change product image"
                        >
                            <CameraIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>
                     <input
                        type="file"
                        ref={imageInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{formData.name}</h2>
                        <p className="text-gray-600">Editing Product Details</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600">Product Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 mt-1 border rounded-lg"/>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-600">Category</label>
                         <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full p-2 mt-1 border rounded-lg bg-white"
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="text-sm font-medium text-gray-600">Price</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-2 mt-1 border rounded-lg"/>
                        </div>
                        <div>
                             <label className="text-sm font-medium text-gray-600">Cost</label>
                            <input type="number" name="cost" value={formData.cost} onChange={handleChange} className="w-full p-2 mt-1 border rounded-lg"/>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-sm font-medium text-gray-600">Current Stock</label>
                                <p className="w-full p-2 mt-1 font-bold text-lg text-gray-800">{formData.stock}</p>
                            </div>
                            <div>
                                 <label className="text-sm font-medium text-gray-600">Low Stock at</label>
                                <input type="number" name="reorderLevel" value={formData.reorderLevel} onChange={handleChange} className="w-full p-2 mt-1 border rounded-lg"/>
                            </div>
                        </div>
                         <div className="mt-3 flex items-center gap-2">
                            <input type="number" placeholder="Add Qty" value={stockToAdd} onChange={e => setStockToAdd(e.target.value)} className="w-full p-2 border rounded-lg" />
                            <button onClick={handleAddStock} className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 flex items-center justify-center gap-1">
                                <PlusIcon className="w-4 h-4" /> Add
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                    <button onClick={handleDelete} className="px-4 py-2 text-red-600 font-semibold hover:bg-red-50 rounded-lg flex items-center gap-2">
                        <TrashIcon className="w-5 h-5"/> Delete Item
                    </button>
                    <button onClick={() => onSave(formData)} className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReassignAndDeleteModal: React.FC<{
    categoryName: string;
    products: Product[];
    availableCategories: string[];
    onClose: () => void;
    onConfirm: (assignments: Record<string, string>) => void;
}> = ({ categoryName, products, availableCategories, onClose, onConfirm }) => {
    const [assignments, setAssignments] = useState<Record<string, string>>({});

    const handleAssignmentChange = (productId: string, newCategory: string) => {
        setAssignments(prev => ({ ...prev, [productId]: newCategory }));
    };

    const allProductsAssigned = products.length === Object.keys(assignments).length;

    const handleConfirm = () => {
        if (allProductsAssigned) {
            onConfirm(assignments);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6">
                <h2 className="text-xl font-bold mb-2 text-gray-800">Delete Category: {categoryName}</h2>
                <p className="text-gray-700 mb-4">To delete this category, please reassign its {products.length} products to other categories.</p>
                <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
                    {products.map(product => (
                        <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                            <div className="flex items-center gap-3">
                                <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                                <span className="font-medium text-gray-800">{product.name}</span>
                            </div>
                            <select
                                value={assignments[product.id] || ''}
                                onChange={(e) => handleAssignmentChange(product.id, e.target.value)}
                                className="p-2 border rounded-lg bg-white"
                            >
                                <option value="" disabled>Select new category</option>
                                {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    ))}
                </div>
                 <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
                    <button onClick={handleConfirm} disabled={!allProductsAssigned} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400">
                        Confirm & Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

const InventoryScreen: React.FC = () => {
    const { inventory, setInventory } = useContext(InventoryContext);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scannedItems, setScannedItems] = useState<Partial<Product>[] | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isEditingCategoryName, setIsEditingCategoryName] = useState(false);
    const [editingCategoryNameInput, setEditingCategoryNameInput] = useState('');
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);
        try {
            const base64Image = await fileToBase64(file);
            const extractedItems = await extractInventoryFromImage(base64Image);
            setScannedItems(extractedItems);
        } catch (err) {
            setError('Failed to process image. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };
    
    const handleConfirmOcr = (items: Partial<Product>[]) => {
        const newProducts: Product[] = items.map(item => ({
            id: `PROD-${Date.now()}-${Math.random()}`,
            name: item.name || 'Unknown Item',
            category: item.category || 'Uncategorized',
            price: item.price || 0,
            cost: item.cost || 0,
            stock: item.stock || 0,
            reorderLevel: item.reorderLevel || 5,
            imageUrl: `https://picsum.photos/seed/${item.name || 'product'}/200`
        }));
        setInventory(prev => [...prev, ...newProducts]);
        setScannedItems(null);
    };

    const handleSaveProduct = (updatedProduct: Product) => {
        setInventory(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        setEditingProduct(null);
    };
    
    const handleDeleteProduct = (productId: string) => {
        setInventory(prev => prev.filter(p => p.id !== productId));
        setEditingProduct(null);
    };

    const allCategoryNames = useMemo<string[]>(() => ['All', ...Array.from(new Set([...Object.keys(defaultCategoryStyles).filter(c => c !== 'All'), ...inventory.map(p => p.category), ...customCategories.map(c => c.name)]))], [inventory, customCategories]);
    const uniqueCategories = useMemo<string[]>(() => [...new Set([...inventory.map(p => p.category), ...customCategories.map(c => c.name)])], [inventory, customCategories]);
    
    const handleStartCategoryEdit = () => {
        if (selectedCategory) {
            setIsEditingCategoryName(true);
            setEditingCategoryNameInput(selectedCategory);
        }
    };

    const handleCancelCategoryEdit = () => {
        setIsEditingCategoryName(false);
        setEditingCategoryNameInput('');
    };

    const handleSaveCategoryEdit = () => {
        const oldName = selectedCategory;
        const newName = editingCategoryNameInput.trim();
        
        if (!newName || !oldName || oldName === newName) {
            handleCancelCategoryEdit();
            return;
        }

        if (allCategoryNames.find(c => c.toLowerCase() === newName.toLowerCase())) {
            alert(`Category "${newName}" already exists.`);
            return;
        }
        
        // Update custom category if it exists
        setCustomCategories(prev => prev.map(c => c.name === oldName ? { ...c, name: newName } : c));
        
        // Update products
        setInventory(prev => prev.map(p => p.category === oldName ? { ...p, category: newName } : p));
        
        setSelectedCategory(newName);
        handleCancelCategoryEdit();
    };
    
    const handleConfirmReassignmentAndDelete = (assignments: Record<string, string>) => {
        const categoryToRemove = categoryToDelete;
        if (!categoryToRemove) return;

        // Reassign products
        setInventory(prevInventory =>
            prevInventory.map(p =>
                assignments[p.id] ? { ...p, category: assignments[p.id] } : p
            )
        );

        // Delete custom category if it exists
        setCustomCategories(prev => prev.filter(c => c.name !== categoryToRemove));

        // Close modal and go back to category list
        setCategoryToDelete(null);
        setSelectedCategory(null);
    };

    const productsInCategoryToDelete = useMemo(() => {
        if (!categoryToDelete) return [];
        return inventory.filter(p => p.category === categoryToDelete);
    }, [inventory, categoryToDelete]);


    const displayedProducts = useMemo(() => {
        if (!selectedCategory) return [];
        return inventory.filter(p =>
            (selectedCategory === 'All' || p.category === selectedCategory) &&
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [inventory, selectedCategory, searchTerm]);

    const groupedProducts = useMemo<Record<string, Product[]>>(() => {
        return displayedProducts.reduce<Record<string, Product[]>>((acc, product) => {
            const category = product.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(product);
            return acc;
        }, {});
    }, [displayedProducts]);


    return (
        <div className="p-4">
            {isLoading && (
                <div className="fixed inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50">
                    <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                    <p className="mt-4 text-lg font-semibold text-gray-700">AI is analyzing your document...</p>
                </div>
            )}
            {scannedItems && <OcrReviewModal items={scannedItems} onConfirm={handleConfirmOcr} onClose={() => setScannedItems(null)} />}
            {editingProduct && <ProductDetailModal product={editingProduct} onSave={handleSaveProduct} onDelete={handleDeleteProduct} onClose={() => setEditingProduct(null)} categories={uniqueCategories} />}
            {categoryToDelete && (
                <ReassignAndDeleteModal
                    categoryName={categoryToDelete}
                    products={productsInCategoryToDelete}
                    availableCategories={allCategoryNames.filter(c => c !== 'All' && c !== categoryToDelete)}
                    onClose={() => setCategoryToDelete(null)}
                    onConfirm={handleConfirmReassignmentAndDelete}
                />
            )}
            
            {selectedCategory === null ? (
                <>
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Inventory Categories</h1>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                        {allCategoryNames.sort().map(cat => {
                            const defaultStyle = defaultCategoryStyles[cat];
                            const customStyle = customCategories.find(c => c.name === cat);
                            const iconName = customStyle?.icon || (defaultStyle ? Object.keys(defaultCategoryStyles).find(key => defaultCategoryStyles[key].icon === defaultStyle.icon) : null);
                            const IconComponent = (iconName && iconComponents[iconName]) || CategoryIcon;
                            const color = customStyle?.color || defaultStyle?.color || 'bg-gray-400';

                            return (
                                <button 
                                    key={cat} 
                                    onClick={() => { setSelectedCategory(cat); setSearchTerm(''); }}
                                    className="flex flex-col items-center gap-2 text-center group"
                                >
                                    <div className={`w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg transition-transform transform group-hover:scale-105 ${color}`}>
                                        <IconComponent className='w-12 h-12 text-white' />
                                    </div>
                                    <span className="font-semibold text-gray-700 text-sm">{cat}</span>
                                </button>
                            );
                        })}
                        <button
                            onClick={() => alert("Please add a new category from within an existing one for now.")}
                            className="flex flex-col items-center gap-2 text-center group"
                        >
                            <div className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg transition-transform transform group-hover:scale-105 bg-gray-100 border-2 border-dashed border-gray-400 hover:border-blue-500 hover:bg-gray-200">
                                <PlusCircleIcon className="w-12 h-12 text-gray-500 group-hover:text-blue-600" />
                            </div>
                            <span className="font-semibold text-gray-700 text-sm">Add Category</span>
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex items-center gap-2 mb-4">
                        <button onClick={() => setSelectedCategory(null)} className="p-2 rounded-full hover:bg-gray-200 flex-shrink-0">
                            <ArrowLeftIcon className="w-6 h-6 text-gray-700"/>
                        </button>
                        {isEditingCategoryName ? (
                            <div className="flex items-center gap-2 w-full">
                                <input
                                    type="text"
                                    value={editingCategoryNameInput}
                                    onChange={e => setEditingCategoryNameInput(e.target.value)}
                                    className="text-2xl font-bold text-gray-800 border-b-2 border-blue-500 focus:outline-none w-full"
                                    autoFocus
                                />
                                <button onClick={handleSaveCategoryEdit} className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600">Save</button>
                                <button onClick={handleCancelCategoryEdit} className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 flex-grow min-w-0">
                                <h1 className="text-2xl font-bold text-gray-800 truncate">{selectedCategory}</h1>
                                {selectedCategory !== 'All' && (
                                    <>
                                        <button onClick={handleStartCategoryEdit} className="p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-blue-600">
                                            <PencilIcon className="w-5 h-5"/>
                                        </button>
                                        <button onClick={() => setCategoryToDelete(selectedCategory)} className="p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-red-600">
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <input
                        type="text"
                        placeholder={`Search in ${selectedCategory}...`}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-2 mb-4 border rounded-lg"
                    />
                    {error && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-4">{error}</p>}
                    
                    {selectedCategory === 'All' ? (
                        <div className="space-y-6">
                            {Object.entries(groupedProducts)
                                .sort(([catA], [catB]) => catA.localeCompare(catB))
                                .map(([category, products]) => (
                                <div key={category}>
                                    <h2 className="text-lg font-semibold text-gray-700 pb-2 mb-3 border-b-2 border-gray-200">{category}</h2>
                                    <div className="space-y-3">
                                        {products.map(p => <ProductListItem key={p.id} product={p} onEdit={setEditingProduct} />)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {displayedProducts.length > 0 ? (
                                displayedProducts.map(p => <ProductListItem key={p.id} product={p} onEdit={setEditingProduct} />)
                             ) : (
                                <p className="text-center text-gray-700 mt-12">No items found in this category.</p>
                            )}
                        </div>
                    )}
                </>
            )}
            
            <div className="fixed bottom-20 right-4 flex flex-col items-center space-y-3">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110"
                    aria-label="Scan Invoice with AI"
                >
                    <CameraIcon className="w-7 h-7" />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    capture="environment"
                />
            </div>
        </div>
    );
};

export default InventoryScreen;