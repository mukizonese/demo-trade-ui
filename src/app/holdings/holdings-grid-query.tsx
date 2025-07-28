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
// Auth is handled by SharedAuthNav component
// Auth is handled by SharedAuthNav component
import { getCachedTradingUserId, clearTradingUserIdCache } from '@/lib/userMapping';
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
import { authErrorHandler } from '@/lib/auth-error-handler';
//import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

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
            return  <p className="text-lg font-sans  text-red-600" >{new Intl.NumberFormat('en-IN').format(cp)}</p> ;
        } else if (cp > 0 ){
            return  <p className="text-lg font-sans   text-green-700">{new Intl.NumberFormat('en-IN' ).format(cp)}</p>  ;
        } else if (cp == 0 ){
             return  <p >{cp}</p>  ;
         }
}
function formatNumberPcts(cp : number){
        if(cp < 0 ){
            return  <p className="text-sm font-sans  text-red-600" >{new Intl.NumberFormat('en-IN').format(cp)}   </p> ;
        } else if (cp > 0 ){
            return  <p className="text-sm font-sans   text-green-700">{new Intl.NumberFormat('en-IN').format(cp)}</p>  ;
        } else if (cp == 0 ){
             return  <p >{cp}</p>  ;
         }
}

function HoldingsExample({ userId }: { userId?: number }) {
      // Auth is handled by SharedAuthNav component
      const { user, loading } = useSimpleAuth();
      const hosturl = process.env.NEXT_PUBLIC_TRADING_API_URL;
      const queryClientHoldings = useQueryClient()
      const [intervalSec, setIntervalSec] = React.useState(10000) //10000 is 10s
      const [effectiveUserId, setEffectiveUserId] = React.useState<number | null>(null);

      // Get the authenticated user's trading user ID
      React.useEffect(() => {
        console.log('🔍 [HOLDINGS GRID] useEffect triggered with user:', user);
        console.log('🔍 [HOLDINGS GRID] user?.role:', user?.role);
        console.log('🔍 [HOLDINGS GRID] user?.id:', user?.id);
        console.log('🔍 [HOLDINGS GRID] loading:', loading);
        
        // Don't proceed if still loading
        if (loading) {
          console.log('🔍 [HOLDINGS GRID] Still loading, skipping...');
          return;
        }
        
        // Check if user is actually authenticated (not guest)
        const isAuthenticated = user && user.email && !user.email.includes('guest');
        console.log('🔍 [HOLDINGS GRID] Is authenticated:', isAuthenticated, 'User email:', user?.email);
        
        const getTradingUserId = async () => {
          try {
            console.log('🔍 [HOLDINGS GRID] Current user:', user);
            // Allow all authenticated users to view holdings, not just traders
            if (user && user.id && isAuthenticated) {
              // Clear cache to ensure we get the current user's ID
              clearTradingUserIdCache();
              const tradingUserId = await getCachedTradingUserId();
              console.log('🔍 [HOLDINGS GRID] Using trading user ID:', tradingUserId, 'for user:', user.email, 'user.id:', user.id, 'role:', user.role);
              setEffectiveUserId(tradingUserId);
              
              // Invalidate React Query cache for holdings
              queryClientHoldings.invalidateQueries({ queryKey: ['holdings'] });
            } else {
              // User is guest or not authenticated, don't fetch holdings
              console.log('🔍 [HOLDINGS GRID] User is guest or not authenticated, not fetching holdings');
              setEffectiveUserId(null);
            }
          } catch (error) {
            console.error('🔍 [HOLDINGS GRID] Failed to get trading user ID:', error);
            // Don't set default user ID - let the error propagate
            throw error;
          }
        };

        getTradingUserId().catch(error => {
          console.error('🔍 [HOLDINGS GRID] Error in getTradingUserId:', error);
          // The error will be handled by the error handler and shown as a toast
        });
      }, [user?.id, user?.email, user?.role, userId, loading]); // Remove healthCheckInterval from dependencies
      
      const fetchholdingssurl = hosturl ? hosturl + "/tradingzone/holdings/" + effectiveUserId : "";
      console.log("🔍 [HOLDINGS GRID] fetchholdingssurl > ", fetchholdingssurl);

    const { isLoading, error, data: serverData , isFetching , status } = useQuery({
        queryKey: ['holdings', effectiveUserId, user?.email], // Add user email to force refetch
           queryFn: async () => {
                  console.log('🔍 [HOLDINGS GRID] Fetching holdings for user ID:', effectiveUserId, 'URL:', fetchholdingssurl);
                  const response = await fetch(fetchholdingssurl);
                  if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                  }
                  const data = await response.json();
                  console.log("🔍 [HOLDINGS GRID] holdings data > ", data);
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
            return (
                <div className="text-center p-4">
                    <div className="text-red-600 mb-2">Error loading holdings:</div>
                    <div className="text-sm text-gray-600">{error?.message || 'Unknown error occurred'}</div>
                    <div className="text-xs text-gray-500 mt-2">URL: {fetchholdingssurl}</div>
                </div>
            );
        }

        // Handle undefined data
        if (!serverData) {
            return <div className="text-center p-4">No holdings data available</div>;
        }

        // Check if user is authenticated trader
        const isGuest = !user || user.role !== 'trader';

        // Debug function to clear all caches
        const debugClearCaches = () => {
          console.log('🔍 [DEBUG] Clearing all caches...');
          clearTradingUserIdCache();
          queryClientHoldings.clear();
          window.location.reload();
        };

      return (

        <div >
            <div className="grid grid-flow-row auto-rows-max gap-y-4">
                {isGuest && (
                  <div className="text-center p-2 bg-blue-50 border border-blue-200 rounded-md">
                    <span className="text-sm text-blue-600">
                      👀 Guest Mode - Upgrade to Trader for personalized holdings
                    </span>
                  </div>
                )}
                
                {/* Debug section */}
                {/* <div className="text-center p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <span className="text-sm text-yellow-600">
                    🔍 Debug: User ID {effectiveUserId || 'null'} | User: {user?.email} | Role: {user?.role} | Loading: {loading ? 'Yes' : 'No'}
                  </span>
                  <button 
                    onClick={debugClearCaches}
                    className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                  >
                    Clear Caches
                  </button>
                </div> */}
                
                <div >
                        <div className="grid grid-cols-8 flex gap-2 justify-items-center flex-col sm:flex-row">
                            <div className="col-span-2 ">
                                <span className="text-sm font-small">Total investment</span>
                                <p className="text-lg font-sans " >{new Intl.NumberFormat('en-IN').format(serverData.totInvestment)}</p>
                                <span className="text-small font-medium">
                                </span>

                            </div>
                            <div className="col-span-2 ">
                                <span className="text-sm font-small">Current value</span>
                                {formatNumbers(serverData.totCurrValue) }
                            </div>
                            <div className="col-span-2 ">
                                <span className="text-sm font-small">Day&apos;s P&L</span>
                                <span>{formatNumbers(serverData.totDayChng) }
                                {formatNumberPcts(serverData.totDayChngPct) }</span>
                            </div>
                            <div className="col-span-2 ">
                                <span className="text-sm font-small">Total P&L</span>
                                {formatNumbers(serverData.totNetChng) }
                                {formatNumberPcts(serverData.totNetChngPct) }
                            </div>
                        </div>
                </div>

                <div >
                    <DataTable columns={columns} data={serverData.transactionlist} />
                </div>
            </div>
        </div>
      );
}

export { HoldingsQueryGrid }