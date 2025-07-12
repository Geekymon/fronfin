import React, { useState } from 'react';
import { Home, Star, Bell, Search, Menu, ChevronRight, Plus, Edit, AlertTriangle, MoreHorizontal, Trash2, Filter, ChevronDown, Heart } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import FilterModal from '../common/FilterModal';
import { categoryHierarchy } from '../../utils/categoryUtils';

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

  // Expansion states for each parent category - ALL OPEN BY DEFAULT
  const [parentCategoryExpansion, setParentCategoryExpansion] = useState<{[key: string]: boolean}>({
    "Key Documents & Meetings": true,
    "Corporate Governance & Admin": true,
    "Corporate Actions": true,
    "Capital & Financing": true,
    "Strategic & Business Operations": true,
    "Financial Reporting & Ratings": true,
    "Regulatory & Legal": true,
    "Administrative Matters": true
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
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gradient-to-b from-white to-gray-50/30 border-r border-gray-200 z-20 transition-all duration-300 ease-in-out flex flex-col ${
        sidebarExpanded ? 'w-64' : 'w-0'
      }`}
    >
      {/* Sidebar content - only render when expanded */}
      <div className={`flex flex-col h-full overflow-hidden transition-opacity duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Navigation Section - Fixed at top with subtle gradient */}
        <div className="flex-none px-4 py-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50">
          <nav className="space-y-1">
            {/* Announcements Button */}
            <button 
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activePage === 'home' && !selectedCompany 
                  ? 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => onNavigate('home')}
            >
              <Home size={18} className="mr-3" />
              Announcements
            </button>

            {/* Watchlist Button */}
            <button 
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activePage === 'watchlist' 
                  ? 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => onNavigate('watchlist')}
            >
              <Star size={18} className="mr-3" />
              Watchlist
            </button>
          </nav>
        </div>

        {/* Filters Section - Scrollable content with subtle background gradient */}
        {activePage === 'home' && (
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-transparent to-gray-50/20">
            <div className="px-4 py-4">
              {/* Filters Header */}
              <button 
                className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors mb-3 ${
                  filtersExpanded 
                    ? 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setFiltersExpanded(!filtersExpanded)}
              >
                <div className="flex items-center">
                  <Filter size={18} className="mr-3" />
                  Filters
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${filtersExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {filtersExpanded && (
                <div className="space-y-6">
                  
                  {/* Categories Filter */}
                  <div>
                    <button 
                      className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        categoriesExpanded 
                          ? 'bg-gradient-to-r from-gray-50 to-blue-50/30 text-gray-900' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={toggleCategories}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        Categories
                        {localSelectedCategories.length > 0 && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {localSelectedCategories.length}
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${categoriesExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                    
                    {categoriesExpanded && (
                      <div className="mt-3">
                        <div className="max-h-80 overflow-y-auto space-y-1">
                          {Object.entries(categoryHierarchy).map(([parentCategory, categoryData]) => (
                            <div key={parentCategory}>
                              {/* Parent Category */}
                              <button
                                className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded transition-colors"
                                onClick={() => toggleParentCategory(parentCategory)}
                              >
                                <span className="truncate">{parentCategory}</span>
                                <ChevronRight
                                  size={12}
                                  className={`transition-transform ml-1 flex-none ${
                                    parentCategoryExpansion[parentCategory] ? 'rotate-90' : ''
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
                                        backgroundColor: categoryData.backgroundColor,
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
                        
                        {/* Category Actions */}
                        <div className="flex items-center justify-between mt-4 px-3">
                          <button
                            className="text-xs font-medium text-gray-500 hover:text-gray-700"
                            onClick={clearCategoryFilters}
                          >
                            Clear
                          </button>
                          <button
                            className="px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-black to-gray-900 rounded hover:from-gray-900 hover:to-black transition-all duration-200"
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
                      className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        sentimentExpanded 
                          ? 'bg-gradient-to-r from-gray-50 to-green-50/30 text-gray-900' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={toggleSentimentSection}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Sentiment
                        {localSelectedSentiments.length > 0 && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                            {localSelectedSentiments.length}
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${sentimentExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {sentimentExpanded && (
                      <div className="mt-3">
                        <div className="space-y-1">
                          {sentiments.map(sentiment => (
                            <label 
                              key={sentiment} 
                              className="flex items-center px-3 py-2 text-sm cursor-pointer text-gray-700 hover:bg-gray-50 rounded transition-colors"
                            >
                              <input 
                                type="checkbox" 
                                checked={localSelectedSentiments.includes(sentiment)}
                                onChange={() => toggleSentiment(sentiment)}
                                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black mr-3"
                              />
                              <span className="flex-1 font-medium">{sentiment}</span>
                              <span className={`w-2 h-2 rounded-full ${
                                sentiment === 'Positive' ? 'bg-green-500' :
                                sentiment === 'Negative' ? 'bg-red-500' : 'bg-yellow-500'
                              }`}></span>
                            </label>
                          ))}
                        </div>
                        
                        {/* Sentiment Actions */}
                        <div className="flex items-center justify-between mt-4 px-3">
                          <button
                            className="text-xs font-medium text-gray-500 hover:text-gray-700"
                            onClick={clearSentimentFilters}
                          >
                            Clear
                          </button>
                          <button
                            className="px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-black to-gray-900 rounded hover:from-gray-900 hover:to-black transition-all duration-200"
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;