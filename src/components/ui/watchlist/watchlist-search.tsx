"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import Image from "next/image"
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
        <div className="grid grid-cols-10 flex gap-3 items-left flex-col sm:flex-row">
          <div className="col-span-6 ">
              <SymbolSearch initialSymbol="HDFCBANK" updateParentSymbol={updateParentSymbol} />
          </div>
          <div className="col-span-2 ">
              <Button 
                  variant="outline" 
                  className="ml-auto"
                  onClick={handleAddSymbol}
                  disabled={isAddingSymbol || !selectedSymbol.trim() || symbols.length >= 10}
                  title={symbols.length >= 10 ? "Watchlist is full (max 10 symbols)" : "Add symbol"}
              >
                  <Image
                       className="dark:invert"
                       src="/icons/circle-plus.svg"
                       alt="Add"
                       width={20}
                       height={20}
                       priority
                     />
              </Button>
          </div>
          <div className="col-span-2 ">
              <Button 
                  variant="outline" 
                  className="ml-auto"
                  onClick={handleRemoveSymbol}
                  disabled={isRemovingSymbol || !selectedSymbol.trim()}
              >
                  <Image
                       className="dark:invert"
                       src="/icons/circle-minus.svg"
                       alt="Rem"
                       width={20}
                       height={20}
                       priority
                     />
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