
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
  const activeClasses = isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600';
  return (
    <button onClick={onClick} className={`relative flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${activeClasses}`}>
      <div className="relative">
        {icon}
        {showBadge && (
          <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" />
        )}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen, hasLowStockItems }) => {
  const navItems = [
    { label: AppScreen.Sales, icon: <SalesIcon className="w-6 h-6" /> },
    { label: AppScreen.Inventory, icon: <InventoryIcon className="w-6 h-6" /> },
    { label: AppScreen.Reports, icon: <ReportsIcon className="w-6 h-6" /> },
    { label: AppScreen.Reorder, icon: <ReorderIcon className="w-6 h-6" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center h-full">
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            isActive={activeScreen === item.label}
            onClick={() => setActiveScreen(item.label)}
            showBadge={item.label === AppScreen.Reorder ? hasLowStockItems : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default BottomNav;