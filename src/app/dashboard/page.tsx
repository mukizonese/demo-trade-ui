'use client'

import React, { useState, useEffect } from 'react';

import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HoldingsChart } from '@/components/ui/holdings-chart';
import { HoldingsHistoryChart } from '@/components/ui/holdings-history-chart';

export default function Dashboard() {
  const { user, loading } = useSimpleAuth();
  const [holdingsData, setHoldingsData] = useState<any>(null);
  const [holdingsLoading, setHoldingsLoading] = useState(false);
  const [holdingsError, setHoldingsError] = useState<string | null>(null);

  const fetchHoldingsData = async () => {
    if (!user || loading) return;
    
    setHoldingsLoading(true);
    setHoldingsError(null);
    
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
      setHoldingsData(data);
    } catch (err) {
      console.error('Error fetching holdings data:', err);
      setHoldingsError(err instanceof Error ? err.message : 'Failed to fetch holdings data');
    } finally {
      setHoldingsLoading(false);
    }
  };

  useEffect(() => {
    if (user && !loading) {
      fetchHoldingsData();
    }
  }, [user, loading]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };





  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Dashboard Container */}
      <div className="flex flex-col lg:flex-row">


        {/* Main Content Area */}
        <div className="flex-1 p-4 lg:p-6">
          {/* User Greeting */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Hi, {user?.email || 'User'}
            </h1>
            <p className="text-gray-600">Welcome to your trading dashboard</p>
          </div>



          {/* Holdings Overview with Chart */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 mb-6">
            {/* Holdings Chart */}
            <div className="xl:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Holdings Overview</CardTitle>
                  <CardDescription>
                    Distribution of your current holdings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HoldingsChart />
                </CardContent>
              </Card>
            </div>

            {/* Holdings Summary */}
            <div className="xl:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Holdings Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {holdingsLoading ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Value</span>
                          <span className="font-medium">Loading...</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Investment</span>
                          <span className="font-medium">Loading...</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total P&L</span>
                          <span className="font-medium text-green-600">Loading...</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">P&L %</span>
                          <span className="font-medium text-green-600">Loading...</span>
                        </div>
                      </>
                    ) : holdingsError ? (
                      <div className="text-center">
                        <p className="text-red-600 mb-2">Error loading data</p>
                        <p className="text-sm text-gray-600">{holdingsError}</p>
                        <button 
                          onClick={fetchHoldingsData}
                          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Retry
                        </button>
                      </div>
                    ) : holdingsData ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Value</span>
                          <span className="font-medium">
                            ₹{formatCurrency(holdingsData.totCurrValue || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Investment</span>
                          <span className="font-medium">
                            ₹{formatCurrency(holdingsData.totInvestment || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total P&L</span>
                          <span className={`font-medium ${(holdingsData.totPnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{formatCurrency(holdingsData.totPnl || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">P&L %</span>
                          <span className={`font-medium ${(holdingsData.totPnlPct || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercentage(holdingsData.totPnlPct || 0)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-600">No holdings data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Holdings Performance Chart */}
          <div className="mb-6">
            <HoldingsHistoryChart />
          </div>


        </div>
      </div>
    </div>
  );
}
