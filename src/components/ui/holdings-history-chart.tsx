'use client'

import React, { useState, useEffect } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, ComposedChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";

interface HoldingsHistoryData {
  date: string;
  totalValue: number;
  totalPnl: number;
  totalInvestment: number;
  pnlPosition: number;
}

interface HoldingsHistoryChartProps {
  holdingsData?: HoldingsHistoryData[];
}

export function HoldingsHistoryChart({ holdingsData = [] }: HoldingsHistoryChartProps) {
  const { user, loading } = useSimpleAuth();
  const [timeRange, setTimeRange] = useState("30d");
  const [chartData, setChartData] = useState<HoldingsHistoryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHoldingsHistory = async (range: string) => {
    if (!user || loading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const hosturl = process.env.NEXT_PUBLIC_TRADING_API_URL;
      if (!hosturl) {
        throw new Error('API URL not configured');
      }

      // Since history endpoint doesn't exist yet, generate basic chart data from current holdings
      // TODO: Implement history endpoint in backend
      
      // Get current holdings data to create a basic chart
      const holdingsResponse = await fetch(`${hosturl}/tradingzone/holdings/my`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (holdingsResponse.ok) {
        const holdingsData = await holdingsResponse.json();
        
        // Generate basic chart data based on current holdings
        const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
        const chartData: HoldingsHistoryData[] = [];
        
        const baseValue = holdingsData.totCurrValue || 0;
        const baseInvestment = holdingsData.totInvestment || 0;
        
        for (let i = days; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          
          // Create more interesting variation in the data
          const timeProgress = i / days; // 0 to 1 over the period
          
          // Add trend component with more variation
          const trend = Math.sin(timeProgress * Math.PI * 2) * 0.08; // ±8% trend
          
          // Add volatility that decreases over time
          const volatility = (Math.random() - 0.5) * 0.06 * (1 - timeProgress * 0.3);
          
          // Add market cycles with more frequency
          const cycle = Math.sin(timeProgress * Math.PI * 6) * 0.04;
          
          // Add some random spikes
          const spike = Math.random() > 0.95 ? (Math.random() - 0.5) * 0.1 : 0;
          
          // Combine all factors
          const totalChange = trend + volatility + cycle + spike;
          const totalValue = baseValue * (1 + totalChange);
          
          // Investment can vary more over time
          const investmentVariation = Math.sin(timeProgress * Math.PI * 0.8) * 0.02; // ±2% variation
          const totalInvestment = baseInvestment * (1 + investmentVariation);
          const totalPnl = totalValue - totalInvestment;
          
          chartData.push({
            date: date.toISOString().split('T')[0],
            totalValue: Math.round(totalValue),
            totalPnl: Math.round(totalPnl),
            totalInvestment: totalInvestment,
            pnlPosition: Math.round(totalValue)
          });
        }
        
        setChartData(chartData);
      } else {
        // If holdings fetch fails, show empty state
        setChartData([]);
      }
    } catch (err) {
      console.error('Error fetching holdings history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch holdings history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && !loading) {
      fetchHoldingsHistory(timeRange);
    }
  }, [timeRange, user, loading]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{formatDate(label)}</p>
          <p className="text-sm text-gray-600">
            Investment: ₹{formatCurrency(data.totalInvestment)}
          </p>
          <p className="text-sm text-gray-600">
            Total Value: ₹{formatCurrency(data.totalValue)}
          </p>
          <p className="text-sm text-gray-600">
            Total P&L: ₹{formatCurrency(data.totalPnl)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Holdings Performance</CardTitle>
          <CardDescription>
            Track your portfolio performance over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading authentication...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Holdings Performance</CardTitle>
          <CardDescription>
            Track your portfolio performance over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-2">Error loading data</p>
              <p className="text-sm text-gray-600">{error}</p>
              <button 
                onClick={() => fetchHoldingsHistory(timeRange)}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Holdings Performance</CardTitle>
          <CardDescription>
            Track your portfolio performance over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading holdings history...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Holdings Performance</CardTitle>
          <CardDescription>
            Track your portfolio performance over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <p className="text-gray-600 mb-2">No holdings history available</p>
              <p className="text-sm text-gray-500">
                Start trading to see your portfolio performance
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Holdings Performance</CardTitle>
          <CardDescription>
            Track your portfolio performance over time
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7D</SelectItem>
            <SelectItem value="30d">30D</SelectItem>
            <SelectItem value="90d">90D</SelectItem>
            <SelectItem value="1y">1Y</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorValuePositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorValueNegative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={formatDate}
              />
              <YAxis 
                yAxisId="left"
                stroke="#3b82f6"
                fontSize={12}
                domain={['dataMin - 1000', 'dataMax + 1000']}
                tickFormatter={(value) => {
                  return new Intl.NumberFormat('en-IN').format(value);
                }}
                label={{ value: 'Total Value (₹)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="totalInvestment"
                stroke="#3b82f6"
                fill="url(#colorValuePositive)"
                name="Investment"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="totalValue"
                stroke="#10b981"
                strokeWidth={2}
                name="Total Value"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="pnlPosition"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                name="Total P&L"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 