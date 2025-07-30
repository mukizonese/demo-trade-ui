import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { useState } from 'react';

interface WatchlistData {
  [key: string]: string[];
}

export function useWatchlist(watchlistId: number = 1) {
  //console.log('🔍 [HOOK] useWatchlist hook is being called with watchlistId:', watchlistId);
  const { user } = useSimpleAuth();
  const queryClient = useQueryClient();
  
  const hosturl = process.env.NEXT_PUBLIC_TRADING_API_URL;
  const [defaultSymbolsLoaded, setDefaultSymbolsLoaded] = useState(false);

  // Get watchlist symbols
  const { data: symbols = [], isLoading: isLoadingSymbols, error: symbolsError, refetch: refetchSymbols } = useQuery({
    queryKey: ['watchlist-symbols', user?.id, watchlistId],
    queryFn: async () => {
      if (!user || !user.id) {
        return [];
      }

      try {
        //console.log('🔍 [WATCHLIST] Fetching symbols for watchlist:', watchlistId);
        const response = await fetch(`${hosturl}/tradingzone/watchlist/my/symbols?watchlistId=${watchlistId}`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const symbols = await response.json();
          //console.log('🔍 [WATCHLIST] Retrieved symbols:', symbols);
          
          // Check if these are default symbols (first time loading) - only for watchlist ID 1
          const defaultSymbols = ['CHEMPLASTS', 'HDFCBANK', 'RELIANCE', 'SWIGGY', 'INFY'];
          const hasDefaultSymbols = defaultSymbols.every((symbol: any) => 
            symbols.includes(symbol.tckrSymb)
          );
          
          if (watchlistId === 1 && hasDefaultSymbols && symbols.length === defaultSymbols.length && !defaultSymbolsLoaded) {
            setDefaultSymbolsLoaded(true);
            //console.log('🔍 [WATCHLIST] Default symbols loaded for first time on watchlist 1');
          }
          
          return symbols;
        }
        
        // Handle 502 Bad Gateway error specifically
        if (response.status === 502) {
          console.log('🔍 [WATCHLIST] Services not ready (502), returning empty symbols');
          return [];
        }
        
        console.log('🔍 [WATCHLIST] Failed to fetch symbols, status:', response.status);
        return [];
      } catch (error) {
        console.error('Error fetching symbols:', error);
        return [];
      }
    },
    enabled: !!hosturl && !!user,
    refetchInterval: 10000, // Refetch every 10 seconds - reduced from 3s to prevent excessive calls
    refetchIntervalInBackground: true,
  });

  // Get all user's watchlists
  const {
    data: watchlists = {},
    isLoading: isLoadingWatchlists,
    error: watchlistsError,
    refetch: refetchWatchlists
  } = useQuery({
    queryKey: ['watchlists', user?.id],
    queryFn: async () => {
      if (!user) {
        return {};
      }

      const response = await fetch(`${hosturl}/tradingzone/watchlist/my/watchlists`, {
        credentials: 'include'
      });
      if (response.ok) {
        return await response.json();
      }
      return {};
    },
    enabled: !!user && !!hosturl,
    refetchInterval: 5000, // Refetch every 5 seconds to prevent dropdown closing
    refetchIntervalInBackground: true,
  });

  // Add symbol to watchlist
  const addSymbolMutation = useMutation({
    mutationFn: async (symbol: string) => {
      if (!user) {
        throw new Error('No user authenticated');
      }

      // Use the authenticated endpoint
      const response = await fetch(`${hosturl}/tradingzone/watchlist/my/add/${symbol}?watchlistId=${watchlistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      return response.json();
    },
    onSuccess: () => {
      // Immediately refetch the symbols and watchlists
      queryClient.invalidateQueries({ queryKey: ['watchlist-symbols', user?.id, watchlistId] });
      queryClient.invalidateQueries({ queryKey: ['watchlists', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['watchlist-trades', user?.id, watchlistId] });
      queryClient.invalidateQueries({ queryKey: ['latest-prices'] });
    },
  });

  // Remove symbol from watchlist
  const removeSymbolMutation = useMutation({
    mutationFn: async (symbol: string) => {
      if (!user) {
        throw new Error('No user authenticated');
      }

      // Use the authenticated endpoint
      const response = await fetch(`${hosturl}/tradingzone/watchlist/my/remove/${symbol}?watchlistId=${watchlistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      return response.json();
    },
    onSuccess: () => {
      // Immediately refetch the symbols and watchlists
      queryClient.invalidateQueries({ queryKey: ['watchlist-symbols', user?.id, watchlistId] });
      queryClient.invalidateQueries({ queryKey: ['watchlists', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['watchlist-trades', user?.id, watchlistId] });
      queryClient.invalidateQueries({ queryKey: ['latest-prices'] });
    },
  });

  // Get latest trade date
  const getLatestTradeDate = useQuery({
    queryKey: ['latest-trade-date'],
    queryFn: async () => {
      const response = await fetch(`${hosturl}/tradingzone/trades/latestdate/`);
      if (response.ok) {
        return await response.text();
      }
      return null;
    },
    enabled: !!hosturl,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchIntervalInBackground: true,
  });

  // Get watchlist trades
  const getWatchlistTrades = useQuery({
    queryKey: ['watchlist-trades', user?.id, watchlistId, getLatestTradeDate.data],
    queryFn: async () => {
      const tradeDate = getLatestTradeDate.data || '2025-07-21 00:00:00'; // fallback to latest known date
      
      if (!user) {
        console.log('🔍 [TRADES] No user found, returning empty trades');
        // Return empty trades when no user is authenticated
        return [];
      }

      //console.log('🔍 [TRADES] Current user:', user);
      //console.log('🔍 [TRADES] User email:', user.email);
      //console.log('🔍 [TRADES] User role:', user.role);
      //console.log('🔍 [TRADES] Trade date:', tradeDate);

      try {
        // Use the authenticated endpoint
        const response = await fetch(`${hosturl}/tradingzone/watchlist/my/trades?date=${tradeDate}&watchlistId=${watchlistId}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const trades = await response.json();
          //console.log('🔍 [TRADES] Retrieved trades:', trades);
          return trades;
        }
        
        // Handle 502 Bad Gateway error specifically
        if (response.status === 502) {
          console.log('🔍 [TRADES] Services not ready (502), returning empty trades');
          return [];
        }
        
        console.log('🔍 [TRADES] Failed to fetch trades, status:', response.status);
        return [];
      } catch (error) {
        console.error('Error fetching trades:', error);
        return [];
      }
    },
    enabled: !!hosturl && !!getLatestTradeDate.data,
    refetchInterval: 10000, // Refetch every 10 seconds - reduced from 3s to prevent excessive calls
    refetchIntervalInBackground: true,
  });

  // Get latest prices for symbols (fallback for symbols without trade data)
  const getLatestPrices = useQuery({
    queryKey: ['latest-prices', symbols],
    queryFn: async () => {
      if (!symbols || symbols.length === 0) {
        return {};
      }

      const pricesMap: { [key: string]: any } = {};
      
      // Fetch latest prices for each symbol
      const pricePromises = symbols.map(async (symbol: string) => {
        try {
          const response = await fetch(`${hosturl}/tradingzone/watchlist/latestprice/${symbol}`);
          if (response.ok) {
            const priceData = await response.json();
            pricesMap[symbol] = priceData;
          }
        } catch (error) {
          console.log(`🔍 [LATEST PRICES] Failed to fetch price for ${symbol}:`, error);
        }
      });

      await Promise.all(pricePromises);
      //console.log('🔍 [LATEST PRICES] Retrieved prices:', pricesMap);
      return pricesMap;
    },
    enabled: !!hosturl && !!symbols && symbols.length > 0,
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchIntervalInBackground: true,
  });

  return {
    symbols,
    watchlists,
    isLoadingSymbols,
    isLoadingWatchlists,
    symbolsError,
    watchlistsError,
    addSymbol: addSymbolMutation.mutate,
    removeSymbol: removeSymbolMutation.mutate,
    isAddingSymbol: addSymbolMutation.isPending,
    isRemovingSymbol: removeSymbolMutation.isPending,
    getWatchlistTrades,
    getLatestPrices,
    refetchSymbols,
    refetchWatchlists,
    isAuthenticated: !!user,
    userRole: user?.role,
    defaultSymbolsLoaded
  };
} 