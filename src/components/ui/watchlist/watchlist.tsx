'use client'
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WatchListGrid from "./watchlist-grid"
import WatchListSearch from "./watchlist-search"
import { useWatchlist } from '@/hooks/useWatchlist';
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react';
import { authErrorHandler } from '@/lib/auth-error-handler';
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { WelcomeMessage } from "./welcome-message"

export default function WatchList() {
  const [currentWatchlistId, setCurrentWatchlistId] = useState(1);
  const { watchlists, isLoadingWatchlists, defaultSymbolsLoaded } = useWatchlist();
  const queryClient = useQueryClient();
  const hosturl = process.env.NEXT_PUBLIC_TRADING_API_URL;
  const { user } = useSimpleAuth();

  // Create watchlist mutation
  const createWatchlistMutation = useMutation({
    mutationFn: async (watchlistId: number) => {
      const response = await fetch(`${hosturl}/tradingzone/watchlist/my/watchlist/${watchlistId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const result = await response.json();
      return { success: result, watchlistId };
    },
    onSuccess: (data, watchlistId) => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      // Switch to the newly created watchlist
      setCurrentWatchlistId(watchlistId);
    },
    onError: (error) => {
      console.error('🔍 [WATCHLIST] Create watchlist error:', error);
    }
  });

  // Delete watchlist mutation
  const deleteWatchlistMutation = useMutation({
    mutationFn: async (watchlistId: number) => {
      const response = await fetch(`${hosturl}/tradingzone/watchlist/my/watchlist/${watchlistId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const result = await response.json();
      return { success: result, watchlistId };
    },
    onSuccess: (data, watchlistId) => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      // If we deleted the currently selected watchlist, switch to watchlist 1
      if (currentWatchlistId === watchlistId) {
        setCurrentWatchlistId(1);
      }
    },
  });

  const handleCreateWatchlist = async () => {
    // Find the next available watchlist ID
    const existingIds = Object.keys(watchlists || {}).map(key => {
      const parts = key.split(':');
      return parts.length > 1 ? parseInt(parts[1]) : parseInt(key);
    });
    const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    
    if (nextId <= 5) {
      createWatchlistMutation.mutate(nextId);
    }
  };

  const handleDeleteWatchlist = async (watchlistId: number) => {
    if (confirm(`Are you sure you want to delete Watchlist ${watchlistId}? This action cannot be undone.`)) {
      deleteWatchlistMutation.mutate(watchlistId);
    }
  };

  // Get available watchlist IDs
  const availableWatchlistIds = Object.keys(watchlists || {}).map(key => {
    // Backend returns keys like "2:1" (tradingUserId:watchlistId)
    const parts = key.split(':');
    return parts.length > 1 ? parseInt(parts[1]) : parseInt(key);
  }).sort((a, b) => a - b);
  const canCreateNew = availableWatchlistIds.length < 5;
  
  return (
    <div className="flex flex-col h-full bg-white rounded-lg border">
      {/* Welcome Message */}
      <div className="p-3 lg:p-4 border-b">
        <WelcomeMessage defaultSymbolsLoaded={defaultSymbolsLoaded} watchlistId={currentWatchlistId} />
      </div>
      
      {/* Main Content Area - Takes up most of the space */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="p-3 lg:p-4 border-b">
          <WatchListSearch currentWatchlistId={currentWatchlistId}/>
        </div>
        <div className="flex-1 min-h-0 p-3 lg:p-4">
          <WatchListGrid currentWatchlistId={currentWatchlistId} onWatchlistChange={setCurrentWatchlistId}/>
        </div>
      </div>

      {/* Watchlist Tabs at Bottom - Mobile Responsive */}
      <div className="border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between px-3 py-2 lg:px-4 lg:py-3">
          <div className="flex items-center space-x-1 overflow-x-auto flex-1">
            {availableWatchlistIds.map((watchlistId) => {
              // Find the correct key for this watchlist ID
              const watchlistKey = Object.keys(watchlists || {}).find(key => {
                const parts = key.split(':');
                return parts.length > 1 && parseInt(parts[1]) === watchlistId;
              });
              const symbolCount = watchlistKey ? (watchlists[watchlistKey]?.length || 0) : 0;
              const isActive = currentWatchlistId === watchlistId;
              
              return (
                <div key={watchlistId} className="flex items-center flex-shrink-0">
                  {watchlistId !== 1 ? (
                    // Non-default watchlists: Right-click to show delete action
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={() => setCurrentWatchlistId(watchlistId)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            // Show delete confirmation on right-click
                            handleDeleteWatchlist(watchlistId);
                          }}
                          className={`px-2 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                            isActive 
                              ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                          title={`Click to switch to Watchlist ${watchlistId}. Right-click to delete.`}
                        >
                          {watchlistId}
                          {symbolCount > 0 && (
                            <span className="ml-1 text-xs text-gray-500">({symbolCount})</span>
                          )}
                        </button>
                      </DropdownMenuTrigger>
                    </DropdownMenu>
                  ) : (
                    // Default watchlist: Just clickable, no delete option
                    <button
                      onClick={() => setCurrentWatchlistId(watchlistId)}
                      className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                        isActive 
                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {watchlistId}
                      {symbolCount > 0 && (
                        <span className="ml-1 text-xs text-gray-500">({symbolCount})</span>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
            
            {/* Create new watchlist button */}
            {canCreateNew && (
              <button
                onClick={handleCreateWatchlist}
                disabled={createWatchlistMutation.isPending}
                className="px-2 py-1 text-xs font-medium text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 rounded transition-colors flex items-center flex-shrink-0"
                title="Create new watchlist"
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
          </div>
          
          {/* Watchlist info */}
          <div className="text-xs text-gray-500 flex-shrink-0 ml-2">
            {availableWatchlistIds.length > 0 ? `${availableWatchlistIds.length}/5` : '0/5'}
          </div>
        </div>
      </div>
    </div>
  );
}

export { WatchList }