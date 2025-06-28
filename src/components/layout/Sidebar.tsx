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
  
  // Filter group expansion state
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  
  // Categories expansion state
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [localSelectedCategories, setLocalSelectedCategories] = useState<string[]>(filters.selectedCategories || []);
  
  // Sentiment expansion state
  const [sentimentExpanded, setSentimentExpanded] = useState(true);
  const [localSelectedSentiments, setLocalSelectedSentiments] = useState<string[]>(filters.selectedSentiments || []);
  
  // Categories organized into parent categories with subcategories
  const categoryHierarchy = {
    "Key Documents & Meetings": {
      color: "#D1FAE4",
      textColor: "#065F46",
      items: ["Annual Report", "Investor/Analyst Meet", "Investor Presentation", "Concall Transcript"]
    },
    "Corporate Governance & Admin": {
      color: "#FFE4E5",
      textColor: "#991B1B",
      items: ["Change in KMP", "Name Change", "Demise of KMP", "Change in Address", "Change in MOA"]
    },
    "Corporate Actions": {
      color: "#FEF2C7",
      textColor: "#92400E",
      items: ["Mergers/Acquisitions", "Bonus/Stock Split", "Divestitures", "Buyback", "Consolidation of Shares", "Demerger", "Joint Ventures", "Incorporation/Cessation of Subsidiary", "Open Offer"]
    },
    "Capital & Financing": {
      color: "#DBEAFE",
      textColor: "#1E40AF",
      items: ["Fundraise - Rights Issue", "Fundraise - Preferential Issue", "Increase in Share Capital", "Fundraise - QIP", "DRHP", "Reduction in Share Capital", "Debt & Financing", "Debt Reduction", "Interest Rates Updates", "One Time Settlement (OTS)"]
    },
    "Strategic & Business Operations": {
      color: "#FCE7F3",
      textColor: "#BE185D",
      items: ["Agreements/MoUs", "Expansion", "Operational Update", "New Order", "New Product", "Closure of Factory", "Disruption of Operations", "PLI Scheme"]
    },
    "Financial Reporting & Ratings": {
      color: "#EDE9FE",
      textColor: "#5B21B6",
      items: ["Financial Results", "Credit Rating"]
    },
    "Regulatory & Legal": {
      color: "#FFF7ED",
      textColor: "#C2410C",
      items: ["Regulatory Approvals/Orders", "USFDA", "Global Pharma Regulation", "Litigation & Notices", "Insolvency and Bankruptcy", "Anti-dumping Duty", "Delisting", "Trading Suspension", "Clarifications/Confirmations"]
    },
    "Administrative Matters": {
      color: "#E2E8F0",
      textColor: "#475569",
      items: ["Procedural/Administrative", "Board Meeting", "AGM/EGM", "Dividend", "Corporate Action", "Management Changes", "Strategic Update", "Other"]
    }
  };

  // Expansion states for each parent category
  const [parentCategoryExpansion, setParentCategoryExpansion] = useState<{[key: string]: boolean}>({
    "Key Documents & Meetings": false,
    "Corporate Governance & Admin": false,
    "Corporate Actions": false,
    "Capital & Financing": false,
    "Strategic & Business Operations": false,
    "Financial Reporting & Ratings": false,
    "Regulatory & Legal": false,
    "Administrative Matters": false
  });

  // Toggle parent category expansion
  const toggleParentCategory = (parentCategory: string) => {
    setParentCategoryExpansion(prev => ({
      ...prev,
      [parentCategory]: !prev[parentCategory]
    }));
  };

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
    <div 
      className={`fixed left-0 text-sm top-16 h-[calc(100%-4rem)] z-10 transition-all duration-300 ease-in-out ${
        sidebarExpanded ? 'w-64 opacity-100 visible' : 'w-0 opacity-0 invisible'
      }`}
    >
      {/* Single container wrapper with rounded corners and shadow */}
      <div className="h-full m-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col h-full pt-6 pb-4 overflow-y-auto">
          
          {/* GROUP 1: Navigation Buttons (Always visible, no collapse) */}
          <div className="px-3 mb-6">
            <div className="space-y-2">
              {/* Announcements Button */}
              <button 
                className={`flex items-center justify-start px-4 py-2 rounded-xl w-full ${
                  activePage === 'home' && !selectedCompany ? 'text-black bg-blue-100' : 'text-black'
                } hover:bg-blue-50 transition-colors`}
                onClick={() => onNavigate('home')}
              >
                <Home size={20} />
                <span className="ml-3 font-medium">Announcements</span>
              </button>

              {/* Watchlist Button */}
              <button 
                className={`flex items-center justify-start px-4 py-2 rounded-xl w-full ${
                  activePage === 'watchlist' ? 'text-black bg-blue-100' : 'text-black'
                } hover:bg-blue-50 transition-colors`}
                onClick={() => onNavigate('watchlist')}
              >
                <Star size={20} />
                <span className="ml-3 font-medium">Watchlist</span>
              </button>
            </div>
          </div>

          {/* GROUP 2: Filters Section (Collapsible, Only show on Announcements page) */}
          {activePage === 'home' && (
            <div className="px-3 flex-1">
              <button 
                className={`flex items-center justify-between w-full px-4 py-2 rounded-xl mb-4 ${
                  filtersExpanded ? 'text-black bg-gray-100' : 'text-gray-400'
                } hover:bg-gray-100 transition-colors`}
                onClick={() => setFiltersExpanded(!filtersExpanded)}
              >
                <div className="flex items-center">
                  <Filter size={18} />
                  <span className="ml-3 font-medium">Filters</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${filtersExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {filtersExpanded && (
                <div className="space-y-4">
                  {/* Categories Filter */}
                  <div>
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
                    
                    {categoriesExpanded && (
                      <div className="mt-3 px-1">
                        <div className="max-h-80 overflow-y-auto pr-1 space-y-4">
                          {Object.entries(categoryHierarchy).map(([parentCategory, categoryData]) => (
                            <div key={parentCategory} className="space-y-2">
                              {/* Parent Category Header */}
                              <button
                                className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                onClick={() => toggleParentCategory(parentCategory)}
                              >
                                <span className="text-sm font-medium text-gray-700">{parentCategory}</span>
                                <ChevronDown
                                  size={14}
                                  className={`transition-transform text-gray-400 ${
                                    parentCategoryExpansion[parentCategory] ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>
                              
                              {/* Subcategories as Pills */}
                              {parentCategoryExpansion[parentCategory] && (
                                <div className="flex flex-wrap gap-2 px-2">
                                  {categoryData.items.map(subcategory => (
                                    <button
                                      key={subcategory}
                                      onClick={() => toggleCategory(subcategory)}
                                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                        localSelectedCategories.includes(subcategory)
                                          ? 'ring-2 ring-gray-400'
                                          : 'hover:opacity-80'
                                      }`}
                                      style={{
                                        backgroundColor: categoryData.color,
                                        color: categoryData.textColor
                                      }}
                                    >
                                      {subcategory}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-between mt-4 px-3">
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

                  {/* Sentiment Filter */}
                  <div>
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
                              <span className={`w-2 h-2 rounded-full ${
                                sentiment === 'Positive' ? 'bg-green-500' :
                                sentiment === 'Negative' ? 'bg-red-500' : 'bg-yellow-500'
                              }`}></span>
                            </label>
                          ))}
                        </div>
                        
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;