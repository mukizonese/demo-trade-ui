"use client"

import { createWatchlistColumns } from "./watchlist-columns"
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
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format, parseISO, toDate } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { LatestTradeDate } from "@/components/ui/tradeutil/trade-util"
import { useWatchlist } from '@/hooks/useWatchlist';
import { SharedAuthNav } from '@/components/ui/shared-auth-nav';
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
import { getCachedTradingUserId, clearTradingUserIdCache } from '@/lib/userMapping';

const queryClient = new QueryClient()

interface WatchListGridProps {
  currentWatchlistId: number;
  onWatchlistChange: (watchlistId: number) => void;
}

export default function WatchListGrid({ currentWatchlistId, onWatchlistChange }: WatchListGridProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
      <WatchListGridQuery currentWatchlistId={currentWatchlistId} onWatchlistChange={onWatchlistChange} />
    </QueryClientProvider>
  )
}

function WatchListGridQuery({ currentWatchlistId, onWatchlistChange }: WatchListGridProps) {
    const [tradeDate, setTradeDate] = React.useState<Date>()
    const [intervalMs, setIntervalMs] = React.useState(2000) // Default to 2 seconds
    const [value, setValue] = React.useState('')
    const [intervalSec, setIntervalSec] = React.useState(2000) // Default to 2 seconds
    const { user } = useSimpleAuth();

    // Auth is handled by SharedAuthNav component
    const { symbols, getWatchlistTrades, getLatestPrices, isAuthenticated, userRole, removeSymbol } = useWatchlist(currentWatchlistId);

    // Get user's holdings data
    const [holdingsData, setHoldingsData] = React.useState<any>(null);
    const [holdingsMap, setHoldingsMap] = React.useState<Map<string, number>>(new Map());

    // Fetch holdings data
    React.useEffect(() => {
      const fetchHoldings = async () => {
        try {
          // Clear cache to ensure we get the current user's ID
          clearTradingUserIdCache();
          const userId = await getCachedTradingUserId();
          
          const hosturl = process.env.NEXT_PUBLIC_TRADING_API_URL;
          const response = await fetch(`${hosturl}/tradingzone/holdings/${userId}`, {
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            setHoldingsData(data);
            
            // Create a map of symbol to quantity
            const map = new Map<string, number>();
            if (data.transactionlist) {
              data.transactionlist.forEach((holding: any) => {
                map.set(holding.tckrSymb, holding.avgQty || 0);
              });
            }
            setHoldingsMap(map);
          } else {
            console.error('🔍 [HOLDINGS] Failed to fetch holdings, status:', response.status);
          }
        } catch (error) {
          console.error('Failed to fetch holdings:', error);
        }
      };

      if (user && user.id) {
        fetchHoldings();
      } else {
        // User not authenticated, return empty array
      }
    }, [user]);

    const handleIntervalStringToInt = (value: string) => {
        setIntervalSec(parseInt(value))
    }

    const handleTradeDateChange = (selectedDate : Date)  => {
        setTradeDate(selectedDate)
    }

    // Use the latest trade date if no date is selected
    const tradeDateString = tradeDate ? format(tradeDate, "yyyy-MM-dd") : LatestTradeDate().substring(0, 10);

    // Get watchlist trades using the new hook
    const { 
        data: serverData, 
        isLoading, 
        error, 
        isFetching, 
        status 
    } = getWatchlistTrades;

    // Get latest prices for fallback
    const { 
        data: latestPrices = {}, 
        isLoading: isLoadingPrices 
    } = getLatestPrices;

    // Combine symbols with trade data
    const combinedData = useMemo(() => {
        if (!user || !user.id) {
          return [];
        }

        if (!symbols || symbols.length === 0) {
            return [];
        }

        if (!serverData || serverData.length === 0) {
            // Return placeholder data for symbols without trade data
            return symbols.map((symbol: string) => ({
                tckrSymb: symbol,
                lastPric: null,
                chngePric: null,
                chngePricPct: null,
                tradDt: new Date(),
                prvsClsgPric: null
            }));
        }

        // Create a map of trade data by symbol
        const tradesMap = new Map();
        serverData.forEach((trade: any) => {
            tradesMap.set(trade.tckrSymb, trade);
        });

        // Combine symbols with their trade data
        const combined = symbols.map((symbol: string) => {
            const trade = tradesMap.get(symbol);
            if (trade) {
                // Return the trade data if available
                return trade;
            } else {
                // Try to get latest price data as fallback
                const latestPrice = latestPrices[symbol];
                if (latestPrice && latestPrice.lastPric) {
                    // Use latest price data if available
                    return {
                        tckrSymb: symbol,
                        lastPric: latestPrice.lastPric,
                        chngePric: latestPrice.chngePric || 0,
                        chngePricPct: latestPrice.chngePricPct || 0,
                        tradDt: new Date(),
                        prvsClsgPric: latestPrice.prvsClsgPric || 0
                    };
                } else {
                    // Return a placeholder for symbols without any data
                    return {
                        tckrSymb: symbol,
                        lastPric: null,
                        chngePric: null,
                        chngePricPct: null,
                        tradDt: new Date(),
                        prvsClsgPric: null
                    };
                }
            }
        });

        return combined;
    }, [symbols, serverData, latestPrices, user]);

    if (status === 'pending' || isLoadingPrices) return <h1>Loading...</h1>
    if (status === 'error') return <span>Error: {error.message}</span>

    return (
        <div className="h-full flex flex-col">
            {/* DataTable takes up all available space */}
            <div className="flex-1 min-h-0">
                <DataTable 
                    columns={createWatchlistColumns(removeSymbol)} 
                    data={combinedData} 
                    onRemoveSymbol={removeSymbol}
                    holdingsMap={holdingsMap}
                />
            </div>
        </div>
    )
}

export { WatchListGrid }