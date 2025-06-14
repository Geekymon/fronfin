import React, { useState } from 'react';
import { Home, Star, Bell, Search, Menu, ChevronRight, Plus, Edit, AlertTriangle, MoreHorizontal, Trash2, Filter, ChevronDown, Heart } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import FilterModal from '../common/FilterModal';

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
  // Use FilterContext for category and sentiment filtering
  const { setSelectedCategories, setSelectedSentiments, filters } = useFilters();
  
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
            {/* Announcements Button */}
            <button 
              className={`flex items-center ${sidebarExpanded ? 'justify-start px-4' : 'justify-center'} py-2 rounded-xl w-full ${
                activePage === 'home' && !selectedCompany ? 'text-black bg-blue-100' : 'text-black'
              } hover:bg-blue-50 transition-colors`}
              onClick={() => onNavigate('home')}
            >
              <Home size={20} />
              {sidebarExpanded && <span className="ml-3 font-medium">Announcements</span>}
            </button>

            {/* Watchlist Button */}
            <button 
              className={`flex items-center ${sidebarExpanded ? 'justify-start px-4' : 'justify-center'} py-2 rounded-xl w-full ${
                activePage === 'watchlist' ? 'text-black bg-blue-100' : 'text-black'
              } hover:bg-blue-50 transition-colors`}
              onClick={() => onNavigate('watchlist')}
            >
              <Star size={20} />
              {sidebarExpanded && <span className="ml-3 font-medium">Watchlist</span>}
            </button>
          </div>

          {/* Filter Sections - Only show on Announcements page */}
          {sidebarExpanded && activePage === 'home' && (
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

              {/* Sentiment Filter - Positioned directly below Categories */}
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
    </>
  );
};

export default Sidebar;