"use client"

import { HoldingValue, columns } from "./columns-live"
import { DataTable } from "./data-table"
import React, { StrictMode, useEffect, useState, useMemo  } from 'react';
import { useForm } from "react-hook-form"
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { getCachedTradingUserId, clearTradingUserIdCache } from '@/lib/userMapping';
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
import { authErrorHandler } from '@/lib/auth-error-handler';
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button";
import { BuyActionPopover } from "@/components/ui/action-popover/buy-action-popover"
import { SellActionPopover } from "@/components/ui/action-popover/sell-action-popover"

const queryClientHoldings = new QueryClient()

export type Holdings = {

    totInvestment: number
    totCurrValue: number
    totPnl: number
    totPnlPct: number
    totNetChng: number
    totNetChngPct: number
    totDayChng: number
    totDayChngPct: number

    transactionlist : HoldingValue[]

}

export default function HoldingsQueryGrid() {

  return (
    <QueryClientProvider client={queryClientHoldings}>
      {/**<ReactQueryDevtools /> */}
      <HoldingsExample />
    </QueryClientProvider>
  )
}

function formatNumbers(cp : number){
        if(cp < 0 ){
            return  <span className="text-base font-bold text-red-600" >{new Intl.NumberFormat('en-IN').format(cp)}</span> ;
        } else if (cp > 0 ){
            return  <span className="text-base font-bold text-green-700">{new Intl.NumberFormat('en-IN' ).format(cp)}</span>  ;
        } else if (cp == 0 ){
             return  <span className="text-base font-bold text-gray-900">{cp}</span>  ;
         }
}
function formatNumberPcts(cp : number){
        if(cp < 0 ){
            return  <span className="text-xs font-medium text-red-600" >{new Intl.NumberFormat('en-IN').format(cp)}%</span> ;
        } else if (cp > 0 ){
            return  <span className="text-xs font-medium text-green-700">{new Intl.NumberFormat('en-IN').format(cp)}%</span>  ;
        } else if (cp == 0 ){
             return  <span className="text-xs font-medium text-gray-600">{cp}%</span>  ;
         }
}

function HoldingsExample({ userId }: { userId?: number }) {
      // Auth is handled by SharedAuthNav component
      const { user, loading } = useSimpleAuth();
      const { toast } = useToast();
      
      const hosturl = process.env.NEXT_PUBLIC_TRADING_API_URL;
      const queryClientHoldings = useQueryClient();
      const [intervalSec, setIntervalSec] = React.useState(10000) //10000 is 10s
      const [effectiveUserId, setEffectiveUserId] = React.useState<number | null>(null);

      // Get the authenticated user's trading user ID
      React.useEffect(() => {
        // Don't proceed if still loading
        if (loading) {
          return;
        }
        
        // Allow all authenticated users (including guests) to view holdings
        const isAuthenticated = user && user.id;
        
        const getTradingUserId = async () => {
          try {
            // Allow all authenticated users to view holdings, including guests
            if (user && user.id && isAuthenticated) {
              // Clear cache to ensure we get the current user's ID
              clearTradingUserIdCache();
              const tradingUserId = await getCachedTradingUserId();
              setEffectiveUserId(tradingUserId);
              
              // Invalidate React Query cache for holdings
              queryClientHoldings.invalidateQueries({ queryKey: ['holdings'] });
            } else {
              // User is guest or not authenticated, don't fetch holdings
              setEffectiveUserId(null);
            }
          } catch (error) {
            console.error('Failed to get trading user ID:', error);
            // Don't set default user ID - let the error propagate
            throw error;
          }
        };

        getTradingUserId().catch((error) => {
          // The error will be handled by the error handler and shown as a toast
        });
      }, [user?.id, user?.email, user?.role, userId, loading, queryClientHoldings, user]); // Add missing dependencies
      
      const fetchholdingssurl = hosturl ? hosturl + "/tradingzone/holdings/" + effectiveUserId : "";

      const { isLoading, error, data: serverData , isFetching , status } = useQuery({
        queryKey: ['holdings', effectiveUserId, user?.email], // Add user email to force refetch
           queryFn: async () => {
                  const response = await fetch(fetchholdingssurl);
                  if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                  }
                  const data = await response.json();
                  return data;
            },
            refetchInterval: intervalSec,
            enabled: !!hosturl && !!fetchholdingssurl && effectiveUserId !== null, // Only run query if hosturl is defined and user ID is available
      })

      // Check if hosturl is defined
      if (!hosturl) {
        return <div className="text-center p-4">Error: NEXT_PUBLIC_TRADING_API_URL is not configured</div>;
      }



        // Handle case when no user ID is available (guest or unauthenticated)
        if (effectiveUserId === null) {
            return (
                <div className="text-center p-4">
                    <div className="text-blue-600 mb-2">No Holdings Available</div>
                    <div className="text-sm text-gray-600">Please sign in to view your personalized holdings</div>
                </div>
            );
        }

        // Handle loading states
        if (isLoading) {
            return <div className="text-center p-4">Loading holdings data...</div>;
        }

        // Handle error states
        if (error) {
            console.error('🔍 [HOLDINGS GRID] Error fetching holdings:', error);
            
            // Check if it's a 502 Bad Gateway error (service not ready)
            if (error.message && error.message.includes('502')) {
                return (
                    <div className="text-center p-4">
                        <div className="text-orange-600 mb-2">⚠️ Services Starting Up</div>
                        <div className="text-sm text-gray-600 mb-4">
                            The trading services are currently starting up. Please wait a moment and refresh the page.
                        </div>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            Refresh Page
                        </button>
                    </div>
                );
            }
            
            return (
                <div className="text-center p-4">
                    <div className="text-red-600 mb-2">Error loading holdings</div>
                    <div className="text-sm text-gray-600">
                        {error.message || 'An unexpected error occurred'}
                    </div>
                </div>
            );
        }

        // Handle undefined data
        if (!serverData) {
            return <div className="text-center p-4">No holdings data available</div>;
        }

        // Check if user is authenticated trader
        const isGuest = !user || user.role !== 'trader';

        // Wait for auth to load to prevent hydration mismatch
        if (loading) {
            return <div className="text-center p-4">Loading authentication...</div>;
        }

        // Debug function to clear all caches
        const debugClearCaches = () => {
          //console.log('🔍 [DEBUG] Clearing all caches...');
          clearTradingUserIdCache();
          queryClientHoldings.clear();
          window.location.reload();
        };

      return (

        <div className="w-full holdings-container">
            <div className="grid grid-flow-row auto-rows-max gap-y-4 holdings-content">
                {isGuest && (
                  <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-sm text-blue-600">
                      👀 Guest Mode - You can view holdings but cannot buy/sell. Upgrade to Trader for trading.
                    </span>
                  </div>
                )}
                
                {/* Summary Section - Improved */}
                <div className="bg-white rounded-lg border p-4 mb-4 w-full holdings-summary">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                            <span className="text-xs font-medium text-gray-600 block mb-1">Total Investment</span>
                            <p className="text-base font-bold text-gray-900">{new Intl.NumberFormat('en-IN').format(serverData.totInvestment)}</p>
                        </div>
                        <div className="text-center">
                            <span className="text-xs font-medium text-gray-600 block mb-1">Current Value</span>
                            <div className="text-base font-bold">{formatNumbers(serverData.totCurrValue)}</div>
                        </div>
                        <div className="text-center">
                            <span className="text-xs font-medium text-gray-600 block mb-1">Day&apos;s P&L</span>
                            <div className="text-base font-bold">
                                {formatNumbers(serverData.totDayChng)}
                                <div className="text-xs">{formatNumberPcts(serverData.totDayChngPct)}</div>
                            </div>
                        </div>
                        <div className="text-center">
                            <span className="text-xs font-medium text-gray-600 block mb-1">Total P&L</span>
                            <div className="text-base font-bold">
                                {formatNumbers(serverData.totNetChng)}
                                <div className="text-xs">{formatNumberPcts(serverData.totNetChngPct)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile: Card-based layout, Desktop: Original table layout */}
                <div className="lg:hidden">
                    {/* Mobile Holdings List - Card-based layout like Zerodha */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Holdings ({serverData.transactionlist.length})</h3>
                        </div>
                        
                        <div className="max-h-[60vh] overflow-y-auto space-y-3">
                            {serverData.transactionlist.map((holding: any, index: number) => (
                                <div key={index} className="bg-white rounded-lg border p-4 shadow-sm">
                                    {/* Stock Header */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-bold text-base">{holding.tckrSymb}</h4>
                                            <p className="text-sm text-gray-600">Qty: {holding.avgQty}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            {isGuest ? (
                                                <>
                                                    <button 
                                                        onClick={() => {
                                                            toast({
                                                                title: "Guest Mode - Cannot Buy",
                                                                description: "Please sign in and upgrade to trader role to buy stocks.",
                                                                variant: "default",
                                                            });
                                                        }}
                                                        className="px-1.5 py-0.5 text-xs font-medium text-blue-600 border border-blue-400 rounded hover:bg-blue-50"
                                                    >
                                                        B
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            toast({
                                                                title: "Guest Mode - Cannot Sell",
                                                                description: "Please sign in and upgrade to trader role to sell stocks.",
                                                                variant: "default",
                                                            });
                                                        }}
                                                        className="px-1.5 py-0.5 text-xs font-medium text-red-600 border border-red-400 rounded hover:bg-red-50"
                                                    >
                                                        S
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <BuyActionPopover symbol={holding.tckrSymb} />
                                                    <SellActionPopover symbol={holding.tckrSymb} holdqty={holding.avgQty} />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Key Metrics - Now in single row */}
                                    <div className="grid grid-cols-4 gap-2 mb-3">
                                        <div>
                                            <span className="text-xs text-gray-600">Avg. Cost</span>
                                            <p className="text-sm font-medium">{new Intl.NumberFormat('en-IN').format(holding.avgCost)}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-600">LTP</span>
                                            <p className="text-sm font-medium">{new Intl.NumberFormat('en-IN').format(holding.lastPric)}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-600">Invested</span>
                                            <p className="text-sm font-medium">{new Intl.NumberFormat('en-IN').format(holding.totCost)}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-600">Cur. Val</span>
                                            <p className="text-sm font-medium">{new Intl.NumberFormat('en-IN').format(holding.currValue)}</p>
                                        </div>
                                    </div>
                                    
                                    {/* P&L Section */}
                                    <div className="border-t pt-1">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-xs text-gray-600">P&L</span>
                                                <div className="text-sm font-bold">
                                                    {holding.pnl < 0 ? (
                                                        <span className="text-red-600">{new Intl.NumberFormat('en-IN').format(holding.pnl)}</span>
                                                    ) : (
                                                        <span className="text-green-700">{new Intl.NumberFormat('en-IN').format(holding.pnl)}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-gray-600">Net Chg.</span>
                                                <div className="text-sm font-bold">
                                                    {holding.netChngPct < 0 ? (
                                                        <span className="text-red-600">{holding.netChngPct.toFixed(2)}%</span>
                                                    ) : (
                                                        <span className="text-green-700">{holding.netChngPct.toFixed(2)}%</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-gray-600">Day Chg.</span>
                                                <div className="text-sm font-bold">
                                                    {holding.dayChngPct < 0 ? (
                                                        <span className="text-red-600">{holding.dayChngPct.toFixed(2)}%</span>
                                                    ) : (
                                                        <span className="text-green-700">{holding.dayChngPct.toFixed(2)}%</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Desktop: Original table layout */}
                <div className="hidden lg:block">
                    <div className="bg-white rounded-lg border w-full">
                        <DataTable columns={columns} data={serverData.transactionlist} />
                    </div>
                </div>
            </div>
        </div>
      );
}

export { HoldingsQueryGrid }