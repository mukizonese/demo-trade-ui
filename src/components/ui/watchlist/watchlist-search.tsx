"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { SymbolSearch } from "@/components/ui/symbol-search"
import { useWatchlist } from '@/hooks/useWatchlist';
// Auth is handled by SharedAuthNav component

interface WatchListSearchProps {
  currentWatchlistId?: number;
}

export default function WatchListSearch({ currentWatchlistId = 1 }: WatchListSearchProps) {
    const [selectedSymbol, setSelectedSymbol] = useState<string>("");
    const { symbols, addSymbol, removeSymbol, isAddingSymbol, isRemovingSymbol, isAuthenticated, userRole } = useWatchlist(currentWatchlistId);
    // Auth is handled by SharedAuthNav component

    //Take value from children ie SymbolSearch
    const updateParentSymbol = (t : string) => {
      setSelectedSymbol(t);
   }

    const handleAddSymbol = () => {
        if (selectedSymbol && selectedSymbol.trim()) {
            // Check if we're at the 10 symbol limit
            if (symbols.length >= 10) {
                alert('Watchlist is full! Maximum 10 symbols allowed per watchlist.');
                return;
            }
            
            // Check if symbol already exists
            if (symbols.includes(selectedSymbol.trim().toUpperCase())) {
                alert('Symbol already exists in this watchlist!');
                return;
            }
            
            addSymbol(selectedSymbol.trim());
            setSelectedSymbol(""); // Clear the input after adding
        }
    };

    const handleRemoveSymbol = () => {
        if (selectedSymbol && selectedSymbol.trim()) {
            removeSymbol(selectedSymbol.trim());
            setSelectedSymbol(""); // Clear the input after removing
        }
    };

    return (
      <div className="space-y-2">
        {/* Search and Actions */}
        <div className="flex flex-row gap-2 sm:gap-3 w-full">
          <div className="flex-1 min-w-0">
              <SymbolSearch initialSymbol="HDFCBANK" updateParentSymbol={updateParentSymbol} />
          </div>
          <div className="flex gap-2 sm:gap-3 flex-shrink-0 w-auto">
              <Button 
                  variant="outline" 
                  size="sm"
                  className="w-10 h-10 text-lg font-bold flex-shrink-0"
                  onClick={handleAddSymbol}
                  disabled={isAddingSymbol || !selectedSymbol.trim() || symbols.length >= 10}
                  title={symbols.length >= 10 ? "Watchlist is full (max 10 symbols)" : "Add symbol"}
              >
                  +
              </Button>
              <Button 
                  variant="outline" 
                  size="sm"
                  className="w-10 h-10 text-lg font-bold flex-shrink-0"
                  onClick={handleRemoveSymbol}
                  disabled={isRemovingSymbol || !selectedSymbol.trim()}
                  title="Remove symbol from watchlist"
              >
                  -
              </Button>
          </div>
        </div>
        
        {/* Warning when approaching limit */}
        {symbols.length >= 8 && (
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md">
            ⚠️ Watchlist is getting full ({symbols.length}/10 symbols)
          </div>
        )}
        
        {/* {!isAuthenticated && (
            <div className="col-span-10 mt-2">
                <div className="text-center p-2 bg-blue-50 border border-blue-200 rounded-md">
                    <span className="text-sm text-blue-600">
                        👀 Guest Mode - Sign in to save your personal watchlist
                    </span>
                </div>
            </div>
        )} */}
      </div>
    );
}

export { WatchListSearch }