import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import FilterModal from '../common/FilterModal';

interface MainLayoutProps {
  children: React.ReactNode;
  headerRight?: React.ReactNode; // Optional right side header content
  activePage: 'home' | 'watchlist' | 'company';
  selectedCompany: string | null;
  setSelectedCompany: (company: string | null) => void;
  onNavigate: (page: 'home' | 'watchlist' | 'company') => void;
  isDetailPanelOpen?: boolean; // Add prop to track detail panel state
  onCloseDetailPanel?: () => void; // Add callback to close detail panel
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  headerRight,
  activePage,
  selectedCompany,
  setSelectedCompany,
  onNavigate,
  isDetailPanelOpen = false,
  onCloseDetailPanel
}) => {
  // FIXED: Sidebar open by default and persist state across navigation
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebarExpanded');
    return saved !== null ? JSON.parse(saved) : true; // Default to true (open)
  });
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Persist sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarExpanded', JSON.stringify(sidebarExpanded));
  }, [sidebarExpanded]);
  
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Full page blur overlay when detail panel is open */}
      {isDetailPanelOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-sm bg-black/10 z-40 cursor-pointer" 
          onClick={onCloseDetailPanel}
        />
      )}

      {/* Header - Full Width with clean title display and subtle gradient */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-r from-white via-white to-gray-50/20 shadow-sm border-b border-gray-100">
        <div className="flex items-center h-16 px-6">
          {/* Left side - Sidebar toggle and MarketWire branding */}
          <div className={`flex items-center space-x-4 transition-all duration-300 ${sidebarExpanded ? 'w-64' : 'w-16'}`}>
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              title={sidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <Menu size={20} />
            </button>
            
            {/* MarketWire Logo - show when sidebar is expanded */}
            {sidebarExpanded && (
              <button 
                onClick={() => onNavigate('home')}
                className="font-black text-xl rounded-2xl flex items-center justify-center font-medium transition-opacity duration-300"
                title="MarketWire Home"
              >
                MarketWire
              </button>
            )}
          </div>
          
          {/* Center - Header content (search bar) */}
          <div className="flex-1 flex justify-center">
            {headerRight}
          </div>
          
          {/* Right side - Empty for balance */}
          <div className={`transition-all duration-300 ${sidebarExpanded ? 'w-64' : 'w-16'}`}></div>
        </div>
      </div>

      {/* Sidebar - Integrated, no floating appearance */}
      <Sidebar 
        activePage={activePage}
        selectedCompany={selectedCompany}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        onNavigate={onNavigate}
        onFilterClick={() => setShowFilterModal(true)}
      />
      
      {/* Main Content - Properly positioned relative to sidebar */}
      <div 
        className={`flex flex-col transition-all duration-300 ease-in-out ${
          sidebarExpanded ? 'ml-64' : 'ml-0'
        } flex-1 mt-16 overflow-hidden`}
      >
        {/* Main content - Uses full remaining space with subtle gradient background */}
        <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-br from-gray-50 to-gray-100/40">
          {children}
        </div>
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