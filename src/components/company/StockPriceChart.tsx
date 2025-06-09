import React, { useState, useEffect } from 'react';
import { fetchStockPriceData, StockPriceData } from '../../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calendar, ArrowDown, ArrowUp, Loader, AlertTriangle, RefreshCw } from 'lucide-react';

interface StockPriceChartProps {
  symbol: string;
  isin: string; // Required ISIN for the new API
  exchange?: string;
}

type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y' | 'MAX';

const StockPriceChart: React.FC<StockPriceChartProps> = ({ 
  symbol, 
  isin,
  exchange = 'NSE' 
}) => {
  const [historicalData, setHistoricalData] = useState<StockPriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('1M');
  const [priceChange, setPriceChange] = useState<{ value: number; percentage: number }>({ value: 0, percentage: 0 });
  const [retryCount, setRetryCount] = useState(0);
  
  const fetchHistoricalData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching historical data for ${symbol} (ISIN: ${isin})`);
      
      // Fetch data from the new API endpoint
      const data = await fetchStockPriceData(isin);
      
      if (data.length === 0) {
        setError('No historical data available for this stock');
        setHistoricalData([]);
      } else {
        // Filter data based on selected time range
        const filteredData = filterDataByTimeRange(data, selectedTimeRange);
        setHistoricalData(filteredData);
        
        // Calculate price change
        if (filteredData.length > 1) {
          const firstPrice = filteredData[0].close;
          const lastPrice = filteredData[filteredData.length - 1].close;
          const change = lastPrice - firstPrice;
          const changePercentage = (change / firstPrice) * 100;
          
          setPriceChange({
            value: parseFloat(change.toFixed(2)),
            percentage: parseFloat(changePercentage.toFixed(2))
          });
        }
      }
    } catch (err) {
      console.error('Error fetching historical data:', err);
      setError('Failed to fetch historical data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on time range
  const filterDataByTimeRange = (data: StockPriceData[], range: TimeRange): StockPriceData[] => {
    if (data.length === 0) return data;

    const now = new Date();
    let cutoffDate: Date;

    switch (range) {
      case '1W':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1M':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3M':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6M':
        cutoffDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1Y':
        cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'MAX':
        return data; // Return all data
      default:
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return data.filter(point => new Date(point.date) >= cutoffDate);
  };
  
  useEffect(() => {
    if (isin) {
      fetchHistoricalData();
    }
  }, [isin, selectedTimeRange, retryCount]);
  
  // Format date for x-axis
  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    
    if (selectedTimeRange === '1W' || selectedTimeRange === '1M') {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
    }
  };
  
  // Format tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(data.date);
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
          <p className="text-gray-500 text-xs mb-1">
            {date.toLocaleDateString([], { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric'
            })}
          </p>
          <p className="font-medium">₹{data.close.toFixed(2)}</p>
        </div>
      );
    }
    
    return null;
  };
  
  // Time range selector
  const TimeRangeSelector = () => {
    const ranges: TimeRange[] = ['1W', '1M', '3M', '6M', '1Y', 'MAX'];
    
    return (
      <div className="flex space-x-1 mb-4">
        {ranges.map(range => (
          <button
            key={range}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              selectedTimeRange === range 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedTimeRange(range)}
          >
            {range}
          </button>
        ))}
      </div>
    );
  };
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Show loading state if no ISIN provided
  if (!isin) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-medium text-gray-900">Price History</h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="text-gray-500">No ISIN available for price data</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-medium text-gray-900">Price History</h3>
        <TimeRangeSelector />
      </div>
      
      {!isLoading && historicalData.length > 0 && (
        <div className="mb-4 flex items-baseline">
          <span className="text-2xl font-semibold mr-2">
            ₹{historicalData[historicalData.length - 1].close.toFixed(2)}
          </span>
          <span className={`text-sm font-medium flex items-center ${
            priceChange.value >= 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {priceChange.value >= 0 ? (
              <ArrowUp size={14} className="mr-1" />
            ) : (
              <ArrowDown size={14} className="mr-1" />
            )}
            {priceChange.value >= 0 ? '+' : ''}{priceChange.value.toFixed(2)} ({priceChange.percentage.toFixed(2)}%)
          </span>
        </div>
      )}
      
      <div className="h-64">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader className="animate-spin h-8 w-8 text-gray-400" />
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
            <div className="text-gray-600 mb-4 text-center">{error}</div>
            <button 
              onClick={handleRetry}
              className="flex items-center px-4 py-2 text-sm font-medium bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw size={14} className="mr-2" />
              Try Again
            </button>
          </div>
        ) : historicalData.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-gray-500">No historical data available</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={historicalData}
              margin={{
                top: 5,
                right: 5,
                left: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxis}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
              />
              <YAxis 
                domain={['auto', 'auto']}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={priceChange.value >= 0 ? "#10b981" : "#f43f5e"} 
                    stopOpacity={0.2} 
                  />
                  <stop 
                    offset="95%" 
                    stopColor={priceChange.value >= 0 ? "#10b981" : "#f43f5e"} 
                    stopOpacity={0} 
                  />
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="close" 
                stroke={priceChange.value >= 0 ? "#10b981" : "#f43f5e"} 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-500 flex items-center justify-center">
        <Calendar size={12} className="mr-1" />
        {selectedTimeRange === '1W' ? 'Last 7 days' : 
         selectedTimeRange === '1M' ? 'Last 30 days' : selectedTimeRange === '3M' ? 'Last 3 months' :
         selectedTimeRange === '6M' ? 'Last 6 months' : selectedTimeRange === '1Y' ? 'Last year' : 'All available data'}
      </div>
    </div>
  );
};

export default StockPriceChart;