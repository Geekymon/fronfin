import React, { useState, useEffect } from 'react';
import { fetchStockPriceData, StockPriceData } from '../../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calendar, ArrowDown, ArrowUp, Loader, AlertTriangle, RefreshCw } from 'lucide-react';

interface StockPriceChartProps {
  symbol: string;
  isin: string; // Required ISIN for the new API
  exchange?: string;
}

type TimeRange = '1w' | '1m' | '3m' | '6m' | '1y' | 'max';

const StockPriceChart: React.FC<StockPriceChartProps> = ({ 
  symbol, 
  isin,
  exchange = 'NSE' 
}) => {
  const [historicalData, setHistoricalData] = useState<StockPriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('1m');
  const [priceChange, setPriceChange] = useState<{ value: number; percentage: number }>({ value: 0, percentage: 0 });
  const [retryCount, setRetryCount] = useState(0);
  
  const fetchHistoricalData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching historical data for ${symbol} (ISIN: ${isin}) with range: ${selectedTimeRange}`);
      
      // Fetch data from the API with the selected time range
      const data = await fetchStockPriceData(isin, selectedTimeRange);
      
      if (data.length === 0) {
        setError('No historical data available for this time range');
        setHistoricalData([]);
        setPriceChange({ value: 0, percentage: 0 });
      } else {
        setHistoricalData(data);
        
        // Calculate price change between first and last data points
        if (data.length > 1) {
          const firstPrice = data[0].close;
          const lastPrice = data[data.length - 1].close;
          const change = lastPrice - firstPrice;
          const changePercentage = (change / firstPrice) * 100;
          
          setPriceChange({
            value: parseFloat(change.toFixed(2)),
            percentage: parseFloat(changePercentage.toFixed(2))
          });
        } else {
          setPriceChange({ value: 0, percentage: 0 });
        }
      }
    } catch (err) {
      console.error('Error fetching historical data:', err);
      setError('Failed to fetch historical data. Please try again.');
      setHistoricalData([]);
      setPriceChange({ value: 0, percentage: 0 });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isin) {
      fetchHistoricalData();
    }
  }, [isin, selectedTimeRange, retryCount]);
  
  // Format date for x-axis based on time range
  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    
    switch (selectedTimeRange) {
      case '1w':
        return date.toLocaleDateString([], { weekday: 'short' });
      case '1m':
        return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
      case '3m':
      case '6m':
        return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
      case '1y':
        return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
      case 'max':
        return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
      default:
        return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }
  };
  
  // Calculate tick count based on time range
  const getTickCount = () => {
    switch (selectedTimeRange) {
      case '1w':
        return 7;
      case '1m':
        return 6;
      case '3m':
        return 6;
      case '6m':
        return 6;
      case '1y':
        return 8;
      case 'max':
        return 8;
      default:
        return 6;
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
    const ranges: Array<{value: TimeRange, label: string}> = [
      { value: '1w', label: '1W' },
      { value: '1m', label: '1M' },
      { value: '3m', label: '3M' },
      { value: '6m', label: '6M' },
      { value: '1y', label: '1Y' },
      { value: 'max', label: 'MAX' }
    ];
    
    return (
      <div className="flex space-x-1 mb-4">
        {ranges.map(range => (
          <button
            key={range.value}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              selectedTimeRange === range.value 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedTimeRange(range.value)}
            disabled={isLoading}
          >
            {range.label}
          </button>
        ))}
      </div>
    );
  };
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Get time range description
  const getTimeRangeDescription = () => {
    switch (selectedTimeRange) {
      case '1w':
        return 'Last 7 days';
      case '1m':
        return 'Last 30 days';
      case '3m':
        return 'Last 3 months';
      case '6m':
        return 'Last 6 months';
      case '1y':
        return 'Last year';
      case 'max':
        return 'All available data';
      default:
        return 'Last 30 days';
    }
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
            <div className="text-gray-500">No historical data available for {getTimeRangeDescription().toLowerCase()}</div>
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
                tickCount={getTickCount()}
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
        {getTimeRangeDescription()}
        {historicalData.length > 0 && (
          <span className="ml-2">• {historicalData.length} data points</span>
        )}
      </div>
    </div>
  );
};

export default StockPriceChart;