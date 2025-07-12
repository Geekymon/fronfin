import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import { categoryHierarchy } from '../../utils/categoryUtils';

interface FilterPanelProps {
  className?: string;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ className = '' }) => {
  // Use FilterContext for category and sentiment filtering
  const { setSelectedCategories, setSelectedSentiments, filters } = useFilters();
  
  // Categories expansion state
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [localSelectedCategories, setLocalSelectedCategories] = useState<string[]>(filters.selectedCategories || []);
  
  // Sentiment expansion state
  const [sentimentExpanded, setSentimentExpanded] = useState(true);
  const [localSelectedSentiments, setLocalSelectedSentiments] = useState<string[]>(filters.selectedSentiments || []);

  // Sector expansion state (frontend only)
  const [sectorExpanded, setSectorExpanded] = useState(true);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);

  // Market Cap expansion state (frontend only)
  const [marketCapExpanded, setMarketCapExpanded] = useState(true);
  const [selectedMarketCaps, setSelectedMarketCaps] = useState<string[]>([]);

  // Expansion states for each parent category
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

  // List of sectors
  const listOfSectors = [
    "IT Software & Services", "Hardware", "Telecom", "Fintech",
    "Banking", "Insurance", "Capital Markets", "Finance",
    "Healthcare Services", "Pharma & Biotech", "Medical Equipment",
    "Manufacturing", "Electrical Equipment", "Engineering", "Aerospace & Defense",
    "Metals & Mining", "Chemicals", "Construction Materials", "Paper & Forest",
    "Oil & Gas", "Power & Utilities", "Alternative Energy",
    "Food & Beverages", "Consumer Durables", "Personal Care", "Retail", "Textiles",
    "Automotive", "Transport Services", "Infrastructure",
    "Real Estate", "Construction",
    "Agriculture", "Fertilizers", "Commodities",
    "Media & Publishing", "Entertainment", "Diversified"
  ];

  // Market cap options
  const marketCapOptions = [
    "> ₹20,000 Cr",
    "₹5,000 - ₹20,000 Cr", 
    "₹500 - ₹5,000 Cr",
    "₹100 - ₹500 Cr",
    "< ₹100 Cr"
  ];

  // Sentiment options
  const sentiments = ["Positive", "Negative", "Neutral"];

  // Toggle functions
  const toggleParentCategory = (parentCategory: string) => {
    setParentCategoryExpansion(prev => ({
      ...prev,
      [parentCategory]: !prev[parentCategory]
    }));
  };

  const toggleCategory = (category: string) => {
    if (localSelectedCategories.includes(category)) {
      setLocalSelectedCategories(localSelectedCategories.filter(c => c !== category));
    } else {
      setLocalSelectedCategories([...localSelectedCategories, category]);
    }
  };

  const toggleSentiment = (sentiment: string) => {
    if (localSelectedSentiments.includes(sentiment)) {
      setLocalSelectedSentiments(localSelectedSentiments.filter(s => s !== sentiment));
    } else {
      setLocalSelectedSentiments([...localSelectedSentiments, sentiment]);
    }
  };

  const toggleSector = (sector: string) => {
    if (selectedSectors.includes(sector)) {
      setSelectedSectors(selectedSectors.filter(s => s !== sector));
    } else {
      setSelectedSectors([...selectedSectors, sector]);
    }
  };

  const toggleMarketCap = (marketCap: string) => {
    if (selectedMarketCaps.includes(marketCap)) {
      setSelectedMarketCaps(selectedMarketCaps.filter(m => m !== marketCap));
    } else {
      setSelectedMarketCaps([...selectedMarketCaps, marketCap]);
    }
  };

  // Apply and clear functions
  const applyCategoryFilters = () => {
    console.log('Applying category filters:', localSelectedCategories);
    setSelectedCategories(localSelectedCategories);
  };

  const applySentimentFilters = () => {
    console.log('Applying sentiment filters:', localSelectedSentiments);
    setSelectedSentiments(localSelectedSentiments);
  };

  const clearCategoryFilters = () => {
    setLocalSelectedCategories([]);
    setSelectedCategories([]);
  };

  const clearSentimentFilters = () => {
    setLocalSelectedSentiments([]);
    setSelectedSentiments([]);
  };

  const clearSectorFilters = () => {
    setSelectedSectors([]);
  };

  const clearMarketCapFilters = () => {
    setSelectedMarketCaps([]);
  };

  // Sync with filter context
  React.useEffect(() => {
    setLocalSelectedCategories(filters.selectedCategories || []);
  }, [filters.selectedCategories]);

  React.useEffect(() => {
    setLocalSelectedSentiments(filters.selectedSentiments || []);
  }, [filters.selectedSentiments]);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="p-4">
        {/* Filters Header */}
        <div className="flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 shadow-sm mb-4">
          <Filter size={18} className="mr-3" />
          Filters
        </div>

        {/* All filters */}
        <div className="space-y-6">
          
          {/* Categories Filter */}
          <div>
            <button 
              className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                categoriesExpanded 
                  ? 'bg-gradient-to-r from-gray-50 to-blue-50/30 text-gray-900' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setCategoriesExpanded(!categoriesExpanded)}
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
                      
                      {parentCategoryExpansion[parentCategory] && (
                        <div className="space-y-1 px-2">
                          {categoryData.items.map(subcategory => (
                            <label 
                              key={subcategory} 
                              className="flex items-center px-3 py-2 text-sm cursor-pointer text-gray-700 hover:bg-gray-50 rounded transition-colors"
                            >
                              <input 
                                type="checkbox" 
                                checked={localSelectedCategories.includes(subcategory)}
                                onChange={() => toggleCategory(subcategory)}
                                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black mr-3"
                              />
                              <span className="flex-1 font-medium text-xs">{subcategory}</span>
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: categoryData.backgroundColor }}
                              ></div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
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
              onClick={() => setSentimentExpanded(!sentimentExpanded)}
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
          
          {/* Sector Filter */}
          <div>
            <button 
              className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                sectorExpanded 
                  ? 'bg-gradient-to-r from-gray-50 to-purple-50/30 text-gray-900' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setSectorExpanded(!sectorExpanded)}
            >
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Sectors
                {selectedSectors.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">
                    {selectedSectors.length}
                  </span>
                )}
              </div>
              <ChevronDown
                size={14}
                className={`transition-transform ${sectorExpanded ? 'rotate-180' : ''}`}
              />
            </button>
            
            {sectorExpanded && (
              <div className="mt-3">
                <div className="max-h-60 overflow-y-auto space-y-1 border border-gray-100 rounded-lg p-2">
                  {listOfSectors.map(sector => (
                    <label 
                      key={sector} 
                      className="flex items-center px-3 py-2 text-sm cursor-pointer text-gray-700 hover:bg-gray-50 rounded transition-colors"
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedSectors.includes(sector)}
                        onChange={() => toggleSector(sector)}
                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-3"
                      />
                      <span className="flex-1 font-medium text-xs">{sector}</span>
                    </label>
                  ))}
                </div>
                
                <div className="flex items-center justify-between mt-3 px-3">
                  <button
                    className="text-xs font-medium text-gray-500 hover:text-gray-700"
                    onClick={clearSectorFilters}
                  >
                    Clear
                  </button>
                  <span className="text-xs text-gray-400">(Frontend only)</span>
                </div>
              </div>
            )}
          </div>

          {/* Market Cap Filter */}
          <div>
            <button 
              className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                marketCapExpanded 
                  ? 'bg-gradient-to-r from-gray-50 to-orange-50/30 text-gray-900' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setMarketCapExpanded(!marketCapExpanded)}
            >
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                Market Cap
                {selectedMarketCaps.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-800 rounded-full">
                    {selectedMarketCaps.length}
                  </span>
                )}
              </div>
              <ChevronDown
                size={14}
                className={`transition-transform ${marketCapExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {marketCapExpanded && (
              <div className="mt-3">
                <div className="space-y-1 border border-gray-100 rounded-lg p-2">
                  {marketCapOptions.map(marketCap => (
                    <label 
                      key={marketCap} 
                      className="flex items-center px-3 py-2 text-sm cursor-pointer text-gray-700 hover:bg-gray-50 rounded transition-colors"
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedMarketCaps.includes(marketCap)}
                        onChange={() => toggleMarketCap(marketCap)}
                        className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-3"
                      />
                      <span className="flex-1 font-medium">{marketCap}</span>
                    </label>
                  ))}
                </div>
                
                <div className="flex items-center justify-between mt-3 px-3">
                  <button
                    className="text-xs font-medium text-gray-500 hover:text-gray-700"
                    onClick={clearMarketCapFilters}
                  >
                    Clear
                  </button>
                  <span className="text-xs text-gray-400">(Frontend only)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;