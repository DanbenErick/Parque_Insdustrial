import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MobileMenuSheet from './MobileMenuSheet';

const MobileBottomNav = ({ screens }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.substring(1) || 'dashboard';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Define main quick-access items. We'll pick max 4 items for bottom bar.
  const mainViews = ['dashboard', 'tenants', 'billing', 'payments'];
  
  const bottomScreens = screens.filter(s => mainViews.includes(s.view));
  // Sort them in the exact order as mainViews
  const sortedBottomScreens = bottomScreens.sort((a, b) => mainViews.indexOf(a.view) - mainViews.indexOf(b.view));

  const handleNavClick = (view) => {
    navigate(`/${view}`);
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[45] bg-surface/85 backdrop-blur-2xl border-t border-outline-variant/30 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] print:hidden">
        <div className="flex items-center justify-around px-2 py-1.5 h-16">
          {sortedBottomScreens.map((screen) => {
            const isActive = currentPath === screen.view;
            return (
              <button
                key={screen.view}
                onClick={() => handleNavClick(screen.view)}
                className="flex flex-col items-center justify-center w-[20%] gap-1 transition-all h-full"
              >
                <div className={`flex items-center justify-center w-14 h-8 rounded-full transition-colors ${isActive ? 'bg-primary text-on-primary shadow-sm shadow-primary/20' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
                  <span className={`material-symbols-outlined text-[24px] ${isActive ? 'scale-105' : ''}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                    {screen.icon}
                  </span>
                </div>
                <span className={`text-[10px] truncate w-full text-center tracking-tight transition-all ${isActive ? 'text-on-surface font-bold' : 'text-on-surface-variant font-medium'}`}>
                  {screen.name.split(' ')[0]}
                </span>
              </button>
            );
          })}

          {/* Menú button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center justify-center w-[20%] gap-1 transition-all h-full"
          >
            <div className={`flex items-center justify-center w-14 h-8 rounded-full transition-colors text-on-surface-variant hover:bg-surface-variant`}>
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </div>
            <span className="text-[10px] w-full text-center tracking-tight font-medium text-on-surface-variant">
              Menú
            </span>
          </button>
        </div>
      </div>

      <MobileMenuSheet 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        screens={screens} 
        currentPath={currentPath}
        onNavClick={handleNavClick}
      />
    </>
  );
};

export default MobileBottomNav;
