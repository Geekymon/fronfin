import React from 'react';
import { Home, Star, BarChart3, TrendingUp } from 'lucide-react';

interface SidebarProps {
  activePage: 'home' | 'watchlist' | 'company';
  selectedCompany: string | null;
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
  onNavigate: (page: 'home' | 'watchlist' | 'company', params?: {watchlistId?: string}) => void;
  onFilterClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  selectedCompany,
  sidebarExpanded,
  setSidebarExpanded,
  onNavigate,
  onFilterClick
}) => {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      
      {/* Navigation Section - Vertically centered with light styling */}
      <div className="flex-1 flex items-center justify-center py-8 px-6">
        <nav className="w-full space-y-2">
          {/* Announcements Button */}
          <button 
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              activePage === 'home' && !selectedCompany 
                ? 'bg-gray-100 text-gray-900 shadow-sm' 
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
            onClick={() => onNavigate('home')}
          >
            <Home size={18} className="mr-3" />
            Announcements
          </button>

          {/* Watchlist Button */}
          <button 
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              activePage === 'watchlist' 
                ? 'bg-gray-100 text-gray-900 shadow-sm' 
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
            onClick={() => onNavigate('watchlist')}
          >
            <Star size={18} className="mr-3" />
            Watchlist
          </button>

          {/* Market Data Button - Placeholder */}
          <button 
            className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors text-gray-400 cursor-not-allowed"
            disabled
            title="Coming Soon"
          >
            <BarChart3 size={18} className="mr-3" />
            Market Data
            <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              Soon
            </span>
          </button>

          {/* Smart Money Button - Placeholder */}
          <button 
            className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors text-gray-400 cursor-not-allowed"
            disabled
            title="Coming Soon"
          >
            <TrendingUp size={18} className="mr-3" />
            Smart Money
            <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              Soon
            </span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;