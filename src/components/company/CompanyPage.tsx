import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Star, Check, ExternalLink, Calendar, 
  BarChart2, FileText, Info, Users, Tag, Briefcase
} from 'lucide-react';
import MainLayout from '../layout/MainLayout';
import { fetchAnnouncements, ProcessedAnnouncement, Company, fetchStockPriceData, StockPriceData } from '../../api';
import AnnouncementList from '../announcements/AnnouncementList';
import DetailPanel from '../announcements/DetailPanel';
import { useWatchlist } from '../../context/WatchlistContext';
import { useFilters } from '../../context/FilterContext';
import StockPriceChart from './StockPriceChart';
import CreateWatchlistModal from '../watchlist/CreateWatchlistModal.tsx';

interface CompanyPageProps {
  company: Company;
  onNavigate: (page: 'home' | 'watchlist' | 'company', params?: any) => void;
  onBack: () => void;
}

type TabType = 'overview' | 'financials' | 'announcements' | 'about';

// FIXED: Compact announcement card component for company page (clickable preview, no company name)
const CompanyAnnouncementRow: React.FC<{
  announcement: ProcessedAnnouncement;
  isSaved: boolean;
  onSave: (id: string) => void;
  onClick: (announcement: ProcessedAnnouncement) => void;
}> = ({ announcement, isSaved, onSave, onClick }) => {
  // Extract clean preview text without company name and markdown formatting
  const getPreviewText = (summary: string, companyName: string): string => {
    // Remove company name from the beginning
    let cleaned = summary.replace(new RegExp(`^${companyName}:?\\s*`, 'i'), '');
    
    // Remove markdown formatting for preview
    cleaned = cleaned
      .replace(/\*\*Category:\*\*.*?(?=\*\*|$)/is, '') // Remove category line
      .replace(/\*\*Headline:\*\*\s*/i, '') // Remove headline prefix
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
      .replace(/`(.*?)`/g, '$1') // Remove code formatting
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove link formatting, keep text
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
    
    // Return first 120 characters for preview
    return cleaned.length > 120 ? cleaned.substring(0, 120) + '...' : cleaned;
  };

  const previewText = getPreviewText(announcement.summary, announcement.company);

  return (
    <div 
      className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
      onClick={() => onClick(announcement)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Category and Date */}
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              announcement.sentiment === 'Positive' ? 'bg-emerald-100 text-emerald-800' :
              announcement.sentiment === 'Negative' ? 'bg-rose-100 text-rose-800' :
              'bg-amber-100 text-amber-800'
            }`}>
              {announcement.category}
            </span>
            <span className="text-xs text-gray-500">{announcement.displayDate}</span>
          </div>
          
          {/* Preview Text - FIXED: No company name, compact preview only */}
          <div className="text-sm text-gray-700 leading-relaxed">
            <p className="overflow-hidden" 
               style={{
                 display: '-webkit-box',
                 WebkitLineClamp: 2,
                 WebkitBoxOrient: 'vertical' as any
               }}>
              {previewText}
            </p>
          </div>
        </div>
        
        {/* Save Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSave(announcement.id);
          }}
          className="ml-4 p-2 rounded-lg hover:bg-gray-100 transition-colors opacity-60 group-hover:opacity-100"
        >
          <Star size={16} className={`${isSaved ? 'fill-current text-amber-500' : 'text-gray-400'}`} />
        </button>
      </div>
    </div>
  );
};

const CompanyPage: React.FC<CompanyPageProps> = ({ company, onNavigate, onBack }) => {
  // State management
  const [announcements, setAnnouncements] = useState<ProcessedAnnouncement[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<ProcessedAnnouncement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedFilings, setSavedFilings] = useState<string[]>([]);
  const [showSavedFilings, setShowSavedFilings] = useState(false);
  const [stockPriceData, setStockPriceData] = useState<StockPriceData[]>([]);
  const [stockDataLoading, setStockDataLoading] = useState(false);
  const [stockDataError, setStockDataError] = useState<string | null>(null);
  const [watchlistDropdownOpen, setWatchlistDropdownOpen] = useState(false);
  const [showCreateWatchlistModal, setShowCreateWatchlistModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  const { 
    watchlists, 
    addToWatchlist, 
    isWatched, 
    createWatchlist
  } = useWatchlist();
  
  const { filters, setSearchTerm, setDateRange, setSelectedCompany } = useFilters();
  
  // Load saved filings from localStorage
  useEffect(() => {
    const savedItems = localStorage.getItem('savedFilings');
    if (savedItems) {
      setSavedFilings(JSON.parse(savedItems));
    }
  }, []);
  
  // Update localStorage when savedFilings changes
  useEffect(() => {
    localStorage.setItem('savedFilings', JSON.stringify(savedFilings));
  }, [savedFilings]);
  
  // Fetch announcements for this company
  useEffect(() => {
    const loadAnnouncements = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await fetchAnnouncements(filters.dateRange.start, filters.dateRange.end);
        // Filter for this company only
        const companyAnnouncements = data.filter(item => 
          item.company === company.name || item.ticker === company.symbol
        );
        setAnnouncements(companyAnnouncements);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load announcements. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAnnouncements();
  }, [company, filters.dateRange]);
  
  // Fetch stock price data using the new API
  useEffect(() => {
    const loadStockData = async () => {
      if (!company.isin) {
        console.log('No ISIN available for stock data');
        return;
      }

      setStockDataLoading(true);
      setStockDataError(null);
      
      try {
        console.log(`Fetching stock data for ISIN: ${company.isin}`);
        const data = await fetchStockPriceData(company.isin);
        setStockPriceData(data);
      } catch (error) {
        console.error('Error fetching stock data:', error);
        setStockDataError('Failed to load stock price data');
      } finally {
        setStockDataLoading(false);
      }
    };
    
    loadStockData();
  }, [company.isin]);
  
  // Toggle saved filing function
  const toggleSavedFiling = (id: string) => {
    setSavedFilings(prevSavedFilings => {
      if (prevSavedFilings.includes(id)) {
        return prevSavedFilings.filter(filingId => filingId !== id);
      } else {
        return [...prevSavedFilings, id];
      }
    });
  };
  
  // Handle announcement click
  const handleAnnouncementClick = (announcement: ProcessedAnnouncement) => {
    setSelectedDetail(announcement);
  };
  
  // Format large numbers with commas and abbreviations
  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(2) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    }
    return num.toString();
  };
  
  // Handle adding company to a specific watchlist
  const handleAddToWatchlist = (watchlistId: string) => {
    addToWatchlist(company, watchlistId);
    setWatchlistDropdownOpen(false);
  };
  
  // Handle creating a new watchlist and adding the company to it
  const handleCreateWatchlist = (name: string) => {
    const newWatchlist = createWatchlist(name);
    addToWatchlist(company, newWatchlist.id);
    setShowCreateWatchlistModal(false);
    setWatchlistDropdownOpen(false);
  };

  // Tab definitions
  const tabs: Array<{id: TabType, label: string, icon: React.ReactNode}> = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 size={16} /> },
    { id: 'financials', label: 'Financials', icon: <FileText size={16} /> },
    { id: 'announcements', label: 'Announcements', icon: <Info size={16} /> },
    { id: 'about', label: 'About', icon: <Briefcase size={16} /> },
  ];
  
  // Create header right content
  const headerRight = (
    <div className="flex items-center space-x-4">
      <div className="relative">
        <button
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium bg-black text-white hover:bg-gray-900"
          onClick={() => setWatchlistDropdownOpen(!watchlistDropdownOpen)}
        >
          <Star size={16} className={isWatched(company.id) ? "fill-current" : ""} />
          <span>{isWatched(company.id) ? "In Watchlist" : "Add to Watchlist"}</span>
        </button>
        
        {watchlistDropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-float border border-gray-100 z-30 overflow-hidden">
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                Your Watchlists
              </div>
              
              {watchlists.map(watchlist => {
                const isInWatchlist = isWatched(company.id, watchlist.id);
                
                return (
                  <button
                    key={watchlist.id}
                    className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => handleAddToWatchlist(watchlist.id)}
                    disabled={isInWatchlist}
                  >
                    <div className="flex items-center">
                      <Star size={16} className={`mr-2 ${isInWatchlist ? 'text-amber-500 fill-current' : ''}`} />
                      <span>{watchlist.name}</span>
                    </div>
                    {isInWatchlist && <Check size={16} className="text-emerald-500" />}
                  </button>
                );
              })}
              
              <div className="border-t border-gray-100 my-1"></div>
              
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-black font-medium hover:bg-gray-50"
                onClick={() => {
                  setShowCreateWatchlistModal(true);
                  setWatchlistDropdownOpen(false);
                }}
              >
                <Star size={16} className="mr-2" />
                <span>Create New Watchlist</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      <a
        href={`https://www.nseindia.com/get-quotes/equity?symbol=${encodeURIComponent(company.symbol)}`}
        target="_blank"
        rel="noopener noreferrer" 
        className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50"
      >
        <ExternalLink size={16} />
        <span>View on NSE</span>
      </a>
    </div>
  );
  
  return (
    <MainLayout
      activePage="company"
      selectedCompany={company.name}
      setSelectedCompany={setSelectedCompany}
      headerRight={headerRight}
      onNavigate={onNavigate}
    >
      <div className="flex flex-col h-full overflow-auto">
        {/* Company header with key metrics */}
        <div className="bg-white border-b border-gray-100 px-6 py-6">
          <div className="flex items-center mb-6">
            <button
              className="mr-4 p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900"
              onClick={onBack}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              {/* FIXED: Company name shown in page body, not header */}
              <h1 className="text-2xl font-semibold text-gray-900">{company.name}</h1>
              <div className="flex items-center mt-1">
                <span className="px-2.5 py-0.5 text-sm font-medium rounded-full bg-black text-white">{company.symbol}</span>
                {company.industry && (
                  <span className="ml-2 px-2.5 py-0.5 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
                    {company.industry}
                  </span>
                )}
              </div>
            </div>
            
            {/* Display current price if available from stock data */}
            {stockPriceData.length > 0 && (
              <div className="ml-auto flex items-end">
                <div className="text-right">
                  <div className="text-3xl font-bold">₹{stockPriceData[stockPriceData.length - 1].close.toFixed(2)}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Latest Price
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Tabs navigation */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-4 flex items-center space-x-2 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id 
                      ? 'text-black border-b-2 border-black' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-t-lg'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Tab content */}
        <div className="bg-gray-50 flex-1 p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Chart section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <StockPriceChart symbol={company.symbol} isin={company.isin} />
              </div>
              
              {/* Stock metrics from API data */}
              {stockPriceData.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Price Range</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Low</span>
                      <span className="text-sm text-gray-500">High</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">₹{Math.min(...stockPriceData.map(d => d.close)).toFixed(2)}</span>
                      <span className="text-sm font-medium">₹{Math.max(...stockPriceData.map(d => d.close)).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Latest Price</h3>
                    <div className="text-lg font-medium">₹{stockPriceData[stockPriceData.length - 1].close.toFixed(2)}</div>
                    <div className="mt-2 text-xs text-gray-500">
                      As of {stockPriceData[stockPriceData.length - 1].date}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Data Points</h3>
                    <div className="text-lg font-medium">{stockPriceData.length}</div>
                    <div className="mt-2 text-xs text-gray-500">
                      Historical records
                    </div>
                  </div>
                </div>
              )}
              
              {/* Recent announcements preview */}
              {announcements.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Recent Announcements</h3>
                    <button 
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                      onClick={() => setActiveTab('announcements')}
                    >
                      View all
                    </button>
                  </div>
                  {announcements.slice(0, 3).map(announcement => (
                    <CompanyAnnouncementRow
                      key={announcement.id}
                      announcement={announcement}
                      isSaved={savedFilings.includes(announcement.id)}
                      onSave={toggleSavedFiling}
                      onClick={handleAnnouncementClick}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Financials Tab */}
          {activeTab === 'financials' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 pb-0">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Historical Performance</h2>
                  <p className="text-sm text-gray-500 mb-6">Stock price movement over time</p>
                </div>
                <StockPriceChart symbol={company.symbol} isin={company.isin} />
              </div>

              {stockPriceData.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Price Statistics</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Price Metrics</h3>
                      <table className="w-full">
                        <tbody className="divide-y divide-gray-100">
                          <tr>
                            <td className="py-2 text-sm text-gray-500">Current Price</td>
                            <td className="py-2 text-sm font-medium text-right">₹{stockPriceData[stockPriceData.length - 1].close.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm text-gray-500">Highest</td>
                            <td className="py-2 text-sm font-medium text-right">₹{Math.max(...stockPriceData.map(d => d.close)).toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm text-gray-500">Lowest</td>
                            <td className="py-2 text-sm font-medium text-right">₹{Math.min(...stockPriceData.map(d => d.close)).toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Data Information</h3>
                      <table className="w-full">
                        <tbody className="divide-y divide-gray-100">
                          <tr>
                            <td className="py-2 text-sm text-gray-500">Records</td>
                            <td className="py-2 text-sm font-medium text-right">{stockPriceData.length}</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm text-gray-500">From</td>
                            <td className="py-2 text-sm font-medium text-right">{stockPriceData[0]?.date}</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm text-gray-500">To</td>
                            <td className="py-2 text-sm font-medium text-right">{stockPriceData[stockPriceData.length - 1]?.date}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Announcements Tab - CLEANED UP */}
          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {/* REMOVED: Redundant "Company Announcements" title */}
                
                {isLoading ? (
                  <div className="py-16 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black"></div>
                  </div>
                ) : error ? (
                  <div className="py-16 flex items-center justify-center">
                    <div className="text-red-500">{error}</div>
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center">
                    <div className="text-gray-500 mb-4">No announcements found for this company</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {announcements.map(announcement => (
                      <CompanyAnnouncementRow
                        key={announcement.id}
                        announcement={announcement}
                        isSaved={savedFilings.includes(announcement.id)}
                        onSave={toggleSavedFiling}
                        onClick={handleAnnouncementClick}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Information</h2>
                
                <div className="grid grid-cols-2 gap-6 mt-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                      <Briefcase size={16} className="mr-2" />
                      Basic Information
                    </h3>
                    <table className="w-full">
                      <tbody className="divide-y divide-gray-100">
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Company Name</td>
                          <td className="py-2 text-sm font-medium text-right">{company.name}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Symbol</td>
                          <td className="py-2 text-sm font-medium text-right">{company.symbol}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Industry</td>
                          <td className="py-2 text-sm font-medium text-right">{company.industry || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm text-gray-500">ISIN</td>
                          <td className="py-2 text-sm font-medium text-right">{company.isin || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                      <Users size={16} className="mr-2" />
                      Market Information
                    </h3>
                    <table className="w-full">
                      <tbody className="divide-y divide-gray-100">
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Listed Exchange</td>
                          <td className="py-2 text-sm font-medium text-right">NSE</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Data Points</td>
                          <td className="py-2 text-sm font-medium text-right">{stockPriceData.length || 0}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Announcements</td>
                          <td className="py-2 text-sm font-medium text-right">{announcements.length}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* FIXED: Blur entire background including header when detail panel is open */}
      {selectedDetail && (
        <>
          {/* Backdrop that blurs everything behind */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-md z-20"
            onClick={() => setSelectedDetail(null)}
          ></div>
          
          {/* Detail Panel */}
          <div className="fixed top-0 right-0 w-2/3 h-full bg-white shadow-xl z-30 border-l border-gray-200 overflow-auto">
            <DetailPanel 
              announcement={selectedDetail}
              isSaved={savedFilings.includes(selectedDetail.id)}
              onClose={() => setSelectedDetail(null)}
              onSave={toggleSavedFiling}
              onViewAllAnnouncements={() => {}}
            />
          </div>
        </>
      )}
      
      {/* Create Watchlist Modal */}
      {showCreateWatchlistModal && (
        <CreateWatchlistModal
          onClose={() => setShowCreateWatchlistModal(false)}
          onCreateWatchlist={handleCreateWatchlist}
        />
      )}
    </MainLayout>
  );
};

export default CompanyPage;