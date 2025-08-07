'use client'

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";

interface HoldingData {
  symbol: string;
  currentValue: number;
  percentage: number;
  color: string;
}

interface HoldingsChartProps {
  holdingsData?: HoldingData[];
  totalValue?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function HoldingsChart({ holdingsData = [], totalValue = 0 }: HoldingsChartProps) {
  const { user, loading } = useSimpleAuth();
  const [chartData, setChartData] = useState<HoldingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHoldingsData = async () => {
    if (!user || loading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const hosturl = process.env.NEXT_PUBLIC_TRADING_API_URL;
      if (!hosturl) {
        throw new Error('API URL not configured');
      }

      const response = await fetch(`${hosturl}/tradingzone/holdings/my`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform API data to chart format
      const transformedData = data.transactionlist.map((item: any, index: number) => ({
        symbol: item.tckrSymb,
        currentValue: item.currValue,
        percentage: (item.currValue / data.totCurrValue) * 100,
        color: COLORS[index % COLORS.length]
      }));

      setChartData(transformedData);
    } catch (err) {
      console.error('Error fetching holdings data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch holdings data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && !loading) {
      fetchHoldingsData();
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading data</p>
          <p className="text-sm text-gray-600">{error}</p>
          <button 
            onClick={fetchHoldingsData}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading holdings data...</p>
        </div>
      </div>
    );
  }

  // If no data, show placeholder
  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">No holdings available</p>
          <p className="text-sm text-gray-500">
            Start trading to see your holdings distribution
          </p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.symbol}</p>
          <p className="text-sm text-gray-600">
            Value: ₹{formatCurrency(data.currentValue)}
          </p>
          <p className="text-sm text-gray-600">
            {data.percentage.toFixed(1)}% of portfolio
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ symbol, percentage }) => `${symbol} ${percentage.toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="currentValue"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

 