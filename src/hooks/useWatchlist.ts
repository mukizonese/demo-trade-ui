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

  // Get user's watchlist symbols
  const {
    data: symbols = [],
    isLoading: isLoadingSymbols,
    error: symbolsError,
    refetch: refetchSymbols
  } = useQuery({
    queryKey: ['watchlist-symbols', user?.id, watchlistId],
    queryFn: async () => {
      if (!user) {
        console.log('🔍 No user found, returning empty watchlist');
        // Return empty watchlist when no user is authenticated
        return [];
      }

      console.log('🔍 Current user:', user);
      console.log('🔍 User email:', user.email);
      console.log('🔍 User role:', user.role);

      // Use the authenticated endpoint
      const response = await fetch(`${hosturl}/tradingzone/watchlist/my/symbols?watchlistId=${watchlistId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const symbols = await response.json();
        console.log('🔍 Retrieved symbols:', symbols);
        return symbols;
      }
      console.log('🔍 Failed to fetch symbols');
      return [];
    },
    enabled: !!hosturl,
    refetchInterval: 5000, // Refetch every 5 seconds to prevent dropdown closing
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

      console.log('🔍 [TRADES] Current user:', user);
      console.log('🔍 [TRADES] User email:', user.email);
      console.log('🔍 [TRADES] User role:', user.role);
      console.log('🔍 [TRADES] Trade date:', tradeDate);

      // Use the authenticated endpoint
      const response = await fetch(`${hosturl}/tradingzone/watchlist/my/trades?date=${tradeDate}&watchlistId=${watchlistId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const trades = await response.json();
        console.log('🔍 [TRADES] Retrieved trades:', trades);
        return trades;
      }
      console.log('🔍 [TRADES] Failed to fetch trades');
      return [];
    },
    enabled: !!hosturl && !!getLatestTradeDate.data,
    refetchInterval: 5000, // Refetch every 5 seconds to prevent dropdown closing
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
    refetchSymbols,
    refetchWatchlists,
    isAuthenticated: !!user,
    userRole: user?.role
  };
} 