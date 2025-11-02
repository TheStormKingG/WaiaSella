import React from 'react';
import { AppScreen } from '../types';
import { SalesIcon, InventoryIcon, ReportsIcon, ReorderIcon } from './Icons';

interface BottomNavProps {
  activeScreen: AppScreen;
  setActiveScreen: (screen: AppScreen) => void;
  hasLowStockItems: boolean;
}

const NavItem: React.FC<{
  label: AppScreen;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  showBadge?: boolean;
}> = ({ label, icon, isActive, onClick, showBadge }) => {
  return (
    <button 
      onClick={onClick} 
      className={`relative flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
        isActive ? 'text-blue-600' : 'text-gray-500'
      }`}
    >
      <div className="relative">
        {icon}
        {showBadge && (
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-600" />
        )}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen, hasLowStockItems }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-gray-800 border-t border-gray-700 flex items-center justify-around z-50">
      <NavItem
        label={AppScreen.Sales}
        icon={<SalesIcon className="w-6 h-6" />}
        isActive={activeScreen === AppScreen.Sales}
        onClick={() => setActiveScreen(AppScreen.Sales)}
      />
      <NavItem
        label={AppScreen.Inventory}
        icon={<InventoryIcon className="w-6 h-6" />}
        isActive={activeScreen === AppScreen.Inventory}
        onClick={() => setActiveScreen(AppScreen.Inventory)}
      />
      <NavItem
        label={AppScreen.Reports}
        icon={<ReportsIcon className="w-6 h-6" />}
        isActive={activeScreen === AppScreen.Reports}
        onClick={() => setActiveScreen(AppScreen.Reports)}
      />
      <NavItem
        label={AppScreen.Reorder}
        icon={<ReorderIcon className="w-6 h-6" />}
        isActive={activeScreen === AppScreen.Reorder}
        onClick={() => setActiveScreen(AppScreen.Reorder)}
        showBadge={hasLowStockItems}
      />
    </div>
  );
};

export default BottomNav;

