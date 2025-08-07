"use client"
import { MoreHorizontal } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import {Button} from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {BuyActionPopover} from "@/components/ui/action-popover/buy-action-popover"
import {SellActionPopover} from "@/components/ui/action-popover/sell-action-popover"
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { usePriceChangeEffectWithQuery } from '@/hooks/usePriceChangeEffectWithQuery';

// Price Cell Component for Watchlist
function PriceCell({ price, symbol }: { price: number; symbol: string }) {
    const { isChanged, changeType, flashClass } = usePriceChangeEffectWithQuery(price, symbol);
    
    // Debug logging on every render
    // console.log(`🔍 [WATCHLIST RENDER] Symbol: ${symbol}, Price: ${price}, isChanged: ${isChanged}, changeType: ${changeType}, flashClass: ${flashClass}`);
    
    if (price === 0 || price === null || price === undefined) {
        return <span className="text-gray-400 text-xs lg:text-sm">N/A</span>;
    }
    
    const baseClasses = "text-xs lg:text-sm transition-all duration-200";
    const changeClasses = isChanged ? flashClass : '';
    
    return (
        <span className={`${baseClasses} ${changeClasses}`}>
            {String(price)}
        </span>
    );
}

// Change Price Cell Component for Watchlist
function ChangePriceCell({ value }: { value: number }) {
    if (value === null || value === undefined) {
        return <span className="text-gray-400 text-xs lg:text-sm">N/A</span>;
    }
    const cp = parseFloat(value.toString());
    if (cp === 0 || isNaN(cp)) {
        return <span className="text-gray-400 text-xs lg:text-sm">N/A</span>;
    }
    
    if(cp < 0 ){
        return (
            <p className="text-red-600 text-xs lg:text-sm">
                {String(cp)}
            </p>
        );
    } else if (cp > 0 ){
        return (
            <p className="text-green-700 text-xs lg:text-sm">
                {String(cp)}
            </p>
        );
    } else if (cp == 0 ){
        return <p className="text-xs lg:text-sm">{cp}</p>;
    }
    return <span className="text-gray-400 text-xs lg:text-sm">N/A</span>;
}

// Change Percentage Cell Component for Watchlist
function ChangePercentageCell({ value }: { value: number }) {
    if (value === null || value === undefined) {
        return <span className="text-gray-400 text-xs lg:text-sm">N/A</span>;
    }
    const cp = parseFloat(value.toString());
    if (cp === 0 || isNaN(cp)) {
        return <span className="text-gray-400 text-xs lg:text-sm">N/A</span>;
    }
    
    if(cp < 0 ){
        return (
            <p className="text-red-600 text-xs lg:text-sm">
                {cp.toFixed(2)}%
            </p>
        );
    } else if (cp > 0 ){
        return (
            <p className="text-green-700 text-xs lg:text-sm">
                {cp.toFixed(2)}%
            </p>
        );
    } else if (cp == 0 ){
        return <p className="text-xs lg:text-sm">{cp.toFixed(2)}%</p>;
    }
    return <span className="text-gray-400 text-xs lg:text-sm">N/A</span>;
}

export type WatchList = {
   tradDt: Date
   tckrSymb: string
   prvsClsgPric: number
   lastPric: number
   chngePric: number
   chngePricPct: number
}

export const createWatchlistColumns = (onRemoveSymbol?: (symbol: string) => void): ColumnDef<WatchList>[] => {
  return [
    {
    accessorKey: "tckrSymb",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="text-xs lg:text-sm font-medium"
            >
              Symbol
              <ArrowUpDown className="ml-1 lg:ml-2 h-3 w-3 lg:h-4 lg:w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const symbol = row.getValue("tckrSymb") as string;
          return (
            <div className="font-medium text-xs lg:text-sm">
              {symbol}
            </div>
          );
        },
        size: 80,
    },
    {
      accessorKey: "lastPric",
      header: "LTP",
      cell: ({ row }) => {
        const price = row.getValue("lastPric") as number;
        const symbol = row.getValue("tckrSymb") as string;
        return <PriceCell price={price} symbol={symbol} />;
      },
      size: 60,
    },
    {
        accessorKey: "chngePric",
        header: "Chg",
        size: 50,
        cell: ({ row }) => {
            const value = row.getValue("chngePric") as number;
            return <ChangePriceCell value={value} />;
        }
    },
    {
      accessorKey: "chngePricPct",
      header: "Chg%",
      size: 40,
        cell: ({ row }) => {
            const value = row.getValue("chngePricPct") as number;
            return <ChangePercentageCell value={value} />;
        }
    },
  ];
};

// For backward compatibility
export const watchlistcolumns = createWatchlistColumns();