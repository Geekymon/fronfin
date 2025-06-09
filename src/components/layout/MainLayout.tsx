import React, { useState } from 'react';
import Sidebar from './Sidebar';
import FilterModal from '../common/FilterModal';

interface MainLayoutProps {
  children: React.ReactNode;
  headerRight?: React.ReactNode; // Optional right side header content
  activePage: 'home' | 'watchlist' | 'company';
  selectedCompany: string | null;
  setSelectedCompany: (company: string | null) => void;
  onNavigate: (page: 'home' | 'watchlist' | 'company') => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  headerRight,
  activePage,
  selectedCompany,
  setSelectedCompany,
  onNavigate
}) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // FIXED: Clean page title without company name in header
  const getPageTitle = () => {
    switch (activePage) {
      case 'watchlist':
        return ' Watchlist';
      case 'company':
        return ' Company Details'; // FIXED: Generic title instead of company name
      default:
        return ' Announcement Dashboard';
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Header - Full Width with clean title display */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Left side - MarketWire branding + Clean Page Title */}
          <div className="flex items-center space-x-4">
            {/* MarketWire Logo */}
            <button 
              onClick={() => onNavigate('home')}
              className="font-black text-xl rounded-2xl flex items-center justify-center font-medium"
              title="MarketWire Home"
            >
              MarketWire
            </button>
            
            {/* Clean Page Title without company name */}
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 ml-60">
                {getPageTitle()}
              </h1>
            </div>
          </div>
          
          {/* Right side - Header content passed as prop */}
          <div className="flex items-center">
            {headerRight}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar 
        activePage={activePage}
        selectedCompany={selectedCompany}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        onNavigate={onNavigate}
        onFilterClick={() => setShowFilterModal(true)}
      />
      
      {/* Main Content - Adjusted for fixed header and sidebar */}
      <div 
        className={`flex flex-col transition-all duration-300 ${sidebarExpanded ? 'ml-64' : 'ml-16'} flex-1 mt-16`}
      >
        {/* Main content */}
        {children}
      </div>
      
      {/* Filter Modal */}
      {showFilterModal && (
        <FilterModal 
          onClose={() => setShowFilterModal(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;