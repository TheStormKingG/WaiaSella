import React, { useState, useMemo } from 'react';
import BottomNav from './components/BottomNav';
import SalesScreen from './screens/SalesScreen';
import InventoryScreen from './screens/InventoryScreen';
import ReportsScreen from './screens/ReportsScreen';
import ReorderScreen from './screens/ReorderScreen';
import type { Product, Sale } from './types';
import { AppScreen } from './types';
import { MOCK_PRODUCTS, MOCK_SALES_HISTORY } from './constants';

export const InventoryContext = React.createContext<{
  inventory: Product[];
  setInventory: React.Dispatch<React.SetStateAction<Product[]>>;
}>({ inventory: [], setInventory: () => {} });

export const SalesContext = React.createContext<{
  salesHistory: Sale[];
  setSalesHistory: React.Dispatch<React.SetStateAction<Sale[]>>;
}>({ salesHistory: [], setSalesHistory: () => {} });

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<AppScreen>(AppScreen.Sales);
  const [inventory, setInventory] = useState<Product[]>(MOCK_PRODUCTS);
  const [salesHistory, setSalesHistory] = useState<Sale[]>(MOCK_SALES_HISTORY);
  
  const inventoryContextValue = useMemo(() => ({ inventory, setInventory }), [inventory]);
  const salesContextValue = useMemo(() => ({ salesHistory, setSalesHistory }), [salesHistory]);

  const lowStockCount = useMemo(() => {
    return inventory.filter(p => p.stock <= p.reorderLevel).length;
  }, [inventory]);

  const renderScreen = () => {
    switch (activeScreen) {
      case AppScreen.Sales:
        return <SalesScreen />;
      case AppScreen.Inventory:
        return <InventoryScreen />;
      case AppScreen.Reports:
        return <ReportsScreen />;
      case AppScreen.Reorder:
        return <ReorderScreen />;
      default:
        return <SalesScreen />;
    }
  };

  return (
    <InventoryContext.Provider value={inventoryContextValue}>
      <SalesContext.Provider value={salesContextValue}>
        <div className="h-screen w-screen bg-white flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto pb-16">
            {renderScreen()}
          </main>
          <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} hasLowStockItems={lowStockCount > 0} />
        </div>
      </SalesContext.Provider>
    </InventoryContext.Provider>
  );
};

export default App;

