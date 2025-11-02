import React, { useState, useContext, useMemo } from 'react';
import { InventoryContext, SalesContext } from '../App';
import type { SaleItem, Product, Sale } from '../types';
import { CATEGORIES, TAX_RATE } from '../constants';
import { PlusIcon, MinusIcon, TrashIcon } from '../components/Icons';

const ProductCard: React.FC<{ product: Product; onAddToCart: (product: Product) => void }> = ({ product, onAddToCart }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col w-full h-full">
    <div className="w-full h-24 bg-gray-50 overflow-hidden relative">
      <img 
        src={product.imageUrl} 
        alt={product.name} 
        className="w-full h-full object-cover"
      />
    </div>
    <div className="p-3 flex flex-col flex-grow min-h-0">
      <h3 className="font-semibold text-sm text-gray-800 truncate mb-1">{product.name}</h3>
      <p className="text-xs text-gray-500 mb-2">{product.stock} in stock</p>
      <div className="mt-auto flex justify-between items-center pt-2">
        <p className="font-bold text-blue-600 text-sm">${product.price.toFixed(2)}</p>
        <button 
          onClick={() => onAddToCart(product)} 
          className="bg-blue-500 text-white rounded-full p-1.5 hover:bg-blue-600 transition-colors flex-shrink-0 shadow-sm"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

const CartItem: React.FC<{ 
  item: SaleItem; 
  onUpdateQuantity: (id: string, quantity: number) => void; 
  onRemove: (id: string) => void; 
}> = ({ item, onUpdateQuantity, onRemove }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-200">
    <div className="flex-1">
      <p className="font-semibold text-sm text-gray-800">{item.name}</p>
      <p className="text-xs text-gray-500">${item.price.toFixed(2)}</p>
    </div>
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-1">
        <button 
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} 
          className="p-1 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
        >
          <MinusIcon className="w-3 h-3"/>
        </button>
        <span className="w-8 text-center font-medium text-gray-800">{item.quantity}</span>
        <button 
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} 
          className="p-1 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
        >
          <PlusIcon className="w-3 h-3"/>
        </button>
      </div>
      <p className="w-16 text-right font-semibold text-sm text-gray-800">
        ${(item.price * item.quantity).toFixed(2)}
      </p>
      <button 
        onClick={() => onRemove(item.id)} 
        className="text-red-500 hover:text-red-700 p-1"
      >
        <TrashIcon className="w-5 h-5"/>
      </button>
    </div>
  </div>
);

const SalesScreen: React.FC = () => {
  const { inventory, setInventory } = useContext(InventoryContext);
  const { setSalesHistory } = useContext(SalesContext);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  const filteredProducts = useMemo(() => {
    return inventory.filter(p =>
      (activeCategory === 'All' || p.category === activeCategory) &&
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, activeCategory, searchTerm]);
  
  const cartSubtotal = useMemo(() => 
    cart.reduce((acc, item) => acc + item.price * item.quantity, 0), 
    [cart]
  );
  const cartTax = cartSubtotal * TAX_RATE;
  const cartTotal = cartSubtotal + cartTax;

  const handleAddToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveFromCart(id);
    } else {
      setCart(cart.map(item => item.id === id ? { ...item, quantity } : item));
    }
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleCompleteSale = () => {
    if (cart.length === 0) return;

    const newSale: Sale = {
      id: `SALE-${Date.now()}`,
      items: cart,
      subtotal: cartSubtotal,
      tax: cartTax,
      total: cartTotal,
      date: new Date(),
    };

    setSalesHistory(prev => [...prev, newSale]);
    
    // Update inventory
    setInventory(prevInventory => {
      return prevInventory.map(product => {
        const cartItem = cart.find(item => item.id === product.id);
        if (cartItem) {
          return { ...product, stock: product.stock - cartItem.quantity };
        }
        return product;
      });
    });

    setLastSale(newSale);
    setCart([]);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 3000);
  };

  return (
    <>
      {/* Success Modal */}
      {showSuccessModal && lastSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 text-center">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Sale Complete!</h2>
            <p className="text-gray-600 mb-4">Receipt ID: {lastSale.id}</p>
            <p className="text-xl font-bold text-blue-600 mb-4">${lastSale.total.toFixed(2)}</p>
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700"
            >
              New Sale
            </button>
          </div>
        </div>
      )}

      <div className="p-4 md:p-6">
        {/* Desktop Layout: 2 columns */}
        <div className="hidden md:grid md:grid-cols-3 md:gap-6 md:h-[calc(100vh-4rem)]">
          {/* Product Selection - 2/3 width */}
          <div className="md:col-span-2 md:flex md:flex-col">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Sales</h1>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-3 mb-3 bg-gray-100 border-0 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex space-x-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${
                    activeCategory === cat 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 flex-1 overflow-y-auto">
              {filteredProducts.map(p => (
                <div key={p.id} className="w-full">
                  <ProductCard product={p} onAddToCart={handleAddToCart} />
                </div>
              ))}
            </div>
          </div>

          {/* Cart - 1/3 width */}
          <div className="md:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 md:flex md:flex-col md:h-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4 p-4 border-b border-gray-200">Current Order</h2>
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {cart.length > 0 ? (
                <div className="space-y-0">
                  {cart.map(item => (
                    <CartItem 
                      key={item.id} 
                      item={item} 
                      onUpdateQuantity={handleUpdateQuantity} 
                      onRemove={handleRemoveFromCart} 
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Your cart is empty.</p>
              )}
            </div>
            <div className="border-t border-gray-200 p-4 space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Tax</span>
                <span>${cartTax.toFixed(2)}</span>
              </div>
              <button 
                onClick={handleCompleteSale}
                disabled={cart.length === 0}
                className="w-full bg-gray-400 text-white font-bold py-3 rounded-lg hover:bg-gray-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Complete Sale
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Layout: Stacked */}
        <div className="md:hidden">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Sales</h1>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-3 mb-3 bg-gray-100 border-0 rounded-lg text-gray-800 placeholder-gray-500"
          />
          <div className="flex space-x-2 overflow-x-auto pb-3 mb-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap ${
                  activeCategory === cat 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {filteredProducts.map(p => (
              <div key={p.id} className="w-full">
                <ProductCard product={p} onAddToCart={handleAddToCart} />
              </div>
            ))}
          </div>
          
          {/* Mobile Cart */}
          {cart.length > 0 && (
            <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 max-h-64 overflow-y-auto">
              <h3 className="font-bold text-gray-800 mb-2">Cart ({cart.length})</h3>
              <div className="space-y-2 mb-3">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-800">{item.name} x{item.quantity}</span>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-800">Total:</span>
                <span className="font-bold text-blue-600">${cartTotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={handleCompleteSale}
                className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700"
              >
                Complete Sale
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SalesScreen;

