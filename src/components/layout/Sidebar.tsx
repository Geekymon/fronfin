import React, { useState } from 'react';
import { Home, Star, Bell, Search, Menu, ChevronRight, Plus, Edit, AlertTriangle, MoreHorizontal, Trash2, Filter, ChevronDown, Heart } from 'lucide-react';
import { useWatchlist } from '../../context/WatchlistContext';
import { useFilters } from '../../context/FilterContext';
import CreateWatchlistModal from '../watchlist/CreateWatchlistModal.tsx';
import RenameWatchlistModal from '../watchlist/RenameWatchlistModal';
import ConfirmDeleteModal from '../watchlist/confirmDeleteModal';

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
  const { 
    watchlists, 
    activeWatchlistId, 
    setActiveWatchlistId, 
    createWatchlist,
    renameWatchlist,
    deleteWatchlist
  } = useWatchlist();
  
  // Use FilterContext for category and sentiment filtering
  const { setSelectedCategories, setSelectedSentiments, filters } = useFilters();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{id: string, x: number, y: number} | null>(null);
  
  // Categories expansion state
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [localSelectedCategories, setLocalSelectedCategories] = useState<string[]>(filters.selectedCategories || []);
  
  // Sentiment expansion state
  const [sentimentExpanded, setSentimentExpanded] = useState(true);
  const [localSelectedSentiments, setLocalSelectedSentiments] = useState<string[]>(filters.selectedSentiments || []);
  
  // Categories list
  const categories = [
    "Annual Report", "Agreements/MoUs", "Anti-dumping Duty", "Buyback",
    "Bonus/Stock Split", "Change in Address", "Change in MOA",
    "Clarifications/Confirmations", "Closure of Factory", "Concall Transcript",
    "Consolidation of Shares", "Credit Rating", "Debt Reduction",
    "Debt & Financing", "Delisting", "Demerger", "Change in KMP",
    "Demise of KMP", "Disruption of Operations", "Divestitures", "DRHP",
    "Expansion", "Financial Results", "Fundraise - Preferential Issue",
    "Fundraise - QIP", "Fundraise - Rights Issue", "Global Pharma Regulation",
    "Incorporation/Cessation of Subsidiary", "Increase in Share Capital",
    "Insolvency and Bankruptcy", "Interest Rates Updates", "Investor Presentation",
    "Investor/Analyst Meet", "Joint Ventures", "Litigation & Notices",
    "Mergers/Acquisitions", "Name Change", "New Order", "New Product",
    "One Time Settlement (OTS)", "Open Offer", "Operational Update", "PLI Scheme",
    "Procedural/Administrative", "Reduction in Share Capital",
    "Regulatory Approvals/Orders", "Trading Suspension", "USFDA", "Board Meeting",
    "AGM/EGM", "Dividend", "Corporate Action", "Management Changes",
    "Strategic Update", "Other"
  ];

  // Sentiment options
  const sentiments = ["Positive", "Negative", "Neutral"];

  // Handle create watchlist
  const handleCreateWatchlist = (name: string) => {
    createWatchlist(name);
    setShowCreateModal(false);
  };

  // Handle rename watchlist
  const handleRenameWatchlist = (newName: string) => {
    if (selectedWatchlistId) {
      renameWatchlist(selectedWatchlistId, newName);
      setShowRenameModal(false);
      setSelectedWatchlistId(null);
    }
  };

  // Handle delete watchlist
  const handleDeleteWatchlist = () => {
    if (selectedWatchlistId) {
      deleteWatchlist(selectedWatchlistId);
      setShowDeleteModal(false);
      setSelectedWatchlistId(null);
    }
  };

  // Handle watchlist click
  const handleWatchlistClick = (watchlistId: string) => {
    setActiveWatchlistId(watchlistId);
    onNavigate('watchlist', { watchlistId });
  };

  // Toggle category selection (local state)
  const toggleCategory = (category: string) => {
    if (localSelectedCategories.includes(category)) {
      setLocalSelectedCategories(localSelectedCategories.filter(c => c !== category));
    } else {
      setLocalSelectedCategories([...localSelectedCategories, category]);
    }
  };

  // Toggle sentiment selection (local state)
  const toggleSentiment = (sentiment: string) => {
    if (localSelectedSentiments.includes(sentiment)) {
      setLocalSelectedSentiments(localSelectedSentiments.filter(s => s !== sentiment));
    } else {
      setLocalSelectedSentiments([...localSelectedSentiments, sentiment]);
    }
  };

  // Apply selected category filters
  const applyCategoryFilters = () => {
    console.log('Applying category filters:', localSelectedCategories);
    setSelectedCategories(localSelectedCategories);
  };

  // Apply selected sentiment filters
  const applySentimentFilters = () => {
    console.log('Applying sentiment filters:', localSelectedSentiments);
    setSelectedSentiments(localSelectedSentiments);
  };

  // Clear category filters
  const clearCategoryFilters = () => {
    setLocalSelectedCategories([]);
    setSelectedCategories([]);
  };

  // Clear sentiment filters
  const clearSentimentFilters = () => {
    setLocalSelectedSentiments([]);
    setSelectedSentiments([]);
  };

  // Toggle categories section
  const toggleCategories = () => {
    if (!sidebarExpanded) {
      setSidebarExpanded(true);
    }
    setCategoriesExpanded(!categoriesExpanded);
  };

  // Toggle sentiment section
  const toggleSentimentSection = () => {
    if (!sidebarExpanded) {
      setSidebarExpanded(true);
    }
    setSentimentExpanded(!sentimentExpanded);
  };

  // Show context menu for a watchlist
  const handleWatchlistContextMenu = (e: React.MouseEvent, watchlistId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPos({
      id: watchlistId,
      x: e.clientX,
      y: e.clientY
    });
  };

  // Close context menu
  const closeContextMenu = () => {
    setContextMenuPos(null);
  };

  // Handle edit watchlist from context menu
  const handleEditWatchlist = (watchlistId: string) => {
    setSelectedWatchlistId(watchlistId);
    setShowRenameModal(true);
    closeContextMenu();
  };

  // Handle delete watchlist from context menu
  const handleConfirmDelete = (watchlistId: string) => {
    setSelectedWatchlistId(watchlistId);
    setShowDeleteModal(true);
    closeContextMenu();
  };

  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      closeContextMenu();
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Sync local categories with filter context when filters change
  React.useEffect(() => {
    setLocalSelectedCategories(filters.selectedCategories || []);
  }, [filters.selectedCategories]);

  // Sync local sentiments with filter context when filters change
  React.useEffect(() => {
    setLocalSelectedSentiments(filters.selectedSentiments || []);
  }, [filters.selectedSentiments]);

  return (
    <>
      <div 
        className={`fixed left-0 text-sm top-16 h-[calc(100%-4rem)] bg-white shadow-md z-10 transition-all duration-300 ease-in-out ${
          sidebarExpanded ? 'w-64' : 'w-16'
        }`}
      >
        <div className="flex flex-col h-full pt-6 pb-4 overflow-y-auto">
          {/* Navigation Section */}
          <div className={`flex flex-col ${sidebarExpanded ? 'px-3' : 'items-center'} space-y-2 mb-6`}>
            <button 
              className={`flex items-center ${sidebarExpanded ? 'justify-start px-4' : 'justify-center'} py-2 rounded-xl w-full ${
                activePage === 'home' && !selectedCompany ? 'text-black' : 'text-gray-400'
              } hover:bg-gray-100 transition-colors`}
              onClick={() => onNavigate('home')}
            >
              <Home size={20} />
              {sidebarExpanded && <span className="ml-3 font-medium">Home</span>}
            </button>
          </div>

          {/* FIXED: Filter Sections with proper spacing and alignment */}
          {sidebarExpanded && (
            <div className="px-3 mb-6">
              {/* Filter Section Header */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">Filters</h4>
              </div>

              {/* Categories Filter */}
              <div className="mb-4">
                <button 
                  className={`flex items-center justify-between w-full px-4 py-2 rounded-xl ${
                    categoriesExpanded ? 'text-black bg-gray-100' : 'text-gray-400'
                  } hover:bg-gray-100 transition-colors`}
                  onClick={toggleCategories}
                >
                  <div className="flex items-center">
                    <Filter size={18} />
                    <span className="ml-3 font-medium">Categories</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${categoriesExpanded ? 'rotate-180' : ''}`}
                  />
                </button>
                
                {/* Categories Content */}
                {categoriesExpanded && (
                  <div className="mt-3 px-1">
                    <div className="max-h-56 overflow-y-auto pr-1">
                      {categories.map(category => (
                        <label 
                          key={category} 
                          className="flex items-center px-3 py-2 rounded-lg cursor-pointer text-gray-600 hover:bg-gray-50 group transition-colors"
                        >
                          <input 
                            type="checkbox" 
                            checked={localSelectedCategories.includes(category)}
                            onChange={() => toggleCategory(category)}
                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black mr-3"
                          />
                          <span className="text-sm truncate">{category}</span>
                        </label>
                      ))}
                    </div>
                    
                    {/* Category action buttons */}
                    <div className="flex justify-between mt-3 px-3">
                      <button
                        className="text-sm font-medium text-gray-500 hover:text-gray-700"
                        onClick={clearCategoryFilters}
                      >
                        Clear
                      </button>
                      <button
                        className="px-3 py-1 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-900"
                        onClick={applyCategoryFilters}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* FIXED: Sentiment Filter - Positioned directly below Categories */}
              <div className="mb-4">
                <button 
                  className={`flex items-center justify-between w-full px-4 py-2 rounded-xl ${
                    sentimentExpanded ? 'text-black bg-gray-100' : 'text-gray-400'
                  } hover:bg-gray-100 transition-colors`}
                  onClick={toggleSentimentSection}
                >
                  <div className="flex items-center">
                    <Heart size={18} />
                    <span className="ml-3 font-medium">Sentiment</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${sentimentExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Sentiment Content */}
                {sentimentExpanded && (
                  <div className="mt-3 px-1">
                    <div className="space-y-1">
                      {sentiments.map(sentiment => (
                        <label 
                          key={sentiment} 
                          className="flex items-center px-3 py-2 rounded-lg cursor-pointer text-gray-600 hover:bg-gray-50 group transition-colors"
                        >
                          <input 
                            type="checkbox" 
                            checked={localSelectedSentiments.includes(sentiment)}
                            onChange={() => toggleSentiment(sentiment)}
                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black mr-3"
                          />
                          <span className="text-sm font-medium flex-1">{sentiment}</span>
                          {/* Visual indicator for sentiment */}
                          <span className={`w-2 h-2 rounded-full ${
                            sentiment === 'Positive' ? 'bg-green-500' :
                            sentiment === 'Negative' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}></span>
                        </label>
                      ))}
                    </div>
                    
                    {/* Sentiment action buttons */}
                    <div className="flex justify-between mt-3 px-3">
                      <button
                        className="text-sm font-medium text-gray-500 hover:text-gray-700"
                        onClick={clearSentimentFilters}
                      >
                        Clear
                      </button>
                      <button
                        className="px-3 py-1 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-900"
                        onClick={applySentimentFilters}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-4"></div>
            </div>
          )}
          
          {/* Watchlists Section */}
          {sidebarExpanded && (
            <div className="px-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Watchlists</h4>
                <button
                  className="p-1 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setShowCreateModal(true)}
                  title="Create New Watchlist"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                {watchlists.map(watchlist => (
                  <div 
                    key={watchlist.id} 
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer ${
                      activeWatchlistId === watchlist.id ? 'bg-gray-100 text-black' : 'text-gray-600 hover:bg-gray-50'
                    } group transition-colors`}
                    onClick={() => handleWatchlistClick(watchlist.id)}
                    onContextMenu={(e) => !watchlist.isDefault && handleWatchlistContextMenu(e, watchlist.id)}
                  >
                    <div className="flex items-center truncate">
                      {watchlist.name === "Real-Time Alerts" ? (
                        <AlertTriangle size={16} className="text-amber-500 mr-2 flex-shrink-0" />
                      ) : (
                        <Star size={16} className={`mr-2 flex-shrink-0 ${activeWatchlistId === watchlist.id ? 'text-gray-900' : 'text-gray-400'}`} />
                      )}
                      <span className="truncate">{watchlist.name}</span>
                      <span className="ml-2 text-xs text-gray-400">({watchlist.companies.length})</span>
                    </div>
                    
                    {!watchlist.isDefault && (
                      <button
                        className="p-1 text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWatchlistContextMenu(e, watchlist.id);
                        }}
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Create New Watchlist Button */}
              <button
                className="flex items-center justify-center w-full px-3 py-2 mt-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={16} className="mr-2" />
                <span>Create New Watchlist</span>
              </button>
            </div>
          )}
          
          {/* Collapsed View - Show icons only */}
          {!sidebarExpanded && (
            <div className="flex flex-col items-center pt-2 space-y-4">
              <button 
                className={`p-2 rounded-xl ${
                  activePage === 'watchlist' ? 'text-black bg-gray-100' : 'text-gray-400 hover:bg-gray-100'
                } transition-colors`}
                onClick={() => onNavigate('watchlist')}
                title="Watchlists"
              >
                <Star size={20} />
              </button>
              
              <button 
                className={`p-2 rounded-xl ${
                  categoriesExpanded ? 'text-black bg-gray-100' : 'text-gray-400 hover:bg-gray-100'
                } transition-colors`}
                onClick={toggleCategories}
                title="Categories"
              >
                <Filter size={20} />
              </button>

              <button 
                className={`p-2 rounded-xl ${
                  sentimentExpanded ? 'text-black bg-gray-100' : 'text-gray-400 hover:bg-gray-100'
                } transition-colors`}
                onClick={toggleSentimentSection}
                title="Sentiment"
              >
                <Heart size={20} />
              </button>
              
              <button 
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
                onClick={() => setShowCreateModal(true)}
                title="Create New Watchlist"
              >
                <Plus size={20} />
              </button>
            </div>
          )}
          
          {!sidebarExpanded && (
            <button 
              onClick={() => setSidebarExpanded(true)}
              className="absolute top-20 -right-3 p-1.5 bg-white rounded-full shadow-md text-gray-400 hover:text-gray-900"
            >
              <Menu size={14} />
            </button>
          )}
        </div>
      </div>
      
      {/* Context Menu */}
      {contextMenuPos && (
        <div 
          className="fixed z-50 bg-white rounded-lg shadow-float border border-gray-100 py-1 w-48"
          style={{ 
            top: contextMenuPos.y, 
            left: contextMenuPos.x,
            transform: `translate(${
              contextMenuPos.x + 200 > window.innerWidth ? '-100%' : '0'
            }, ${
              contextMenuPos.y + 120 > window.innerHeight ? '-50%' : '0'
            })`
          }}
        >
          <button
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => handleEditWatchlist(contextMenuPos.id)}
          >
            <Edit size={16} className="mr-2" />
            <span>Rename</span>
          </button>
          <button
            className="flex items-center w-full px-4 py-2 text-sm text-rose-600 hover:bg-gray-50"
            onClick={() => handleConfirmDelete(contextMenuPos.id)}
          >
            <Trash2 size={16} className="mr-2" />
            <span>Delete</span>
          </button>
        </div>
      )}
      
      {/* Create Watchlist Modal */}
      {showCreateModal && (
        <CreateWatchlistModal
          onClose={() => setShowCreateModal(false)}
          onCreateWatchlist={handleCreateWatchlist}
        />
      )}
      
      {/* Rename Watchlist Modal */}
      {showRenameModal && selectedWatchlistId && (
        <RenameWatchlistModal
          watchlistId={selectedWatchlistId}
          currentName={watchlists.find(w => w.id === selectedWatchlistId)?.name || ""}
          onClose={() => {
            setShowRenameModal(false);
            setSelectedWatchlistId(null);
          }}
          onRenameWatchlist={handleRenameWatchlist}
        />
      )}
      
      {/* Delete Watchlist Confirmation Modal */}
      {showDeleteModal && selectedWatchlistId && (
        <ConfirmDeleteModal
          watchlistName={watchlists.find(w => w.id === selectedWatchlistId)?.name || ""}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedWatchlistId(null);
          }}
          onConfirmDelete={handleDeleteWatchlist}
        />
      )}
    </>
  );
};

export default Sidebar;