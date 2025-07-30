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
import { useState, useRef, useEffect } from 'react';

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
        const price = row.getValue("lastPric") as any;
        if (price === 0 || price === null || price === undefined || price === 'N/A') {
          return <span className="text-gray-400 text-xs lg:text-sm">N/A</span>;
        }
        return <span className="text-xs lg:text-sm">{String(price)}</span>;
      },
      size: 60,
    },
    {
        accessorKey: "chngePric",
        header: "Chg",
        size: 50,
        cell: ({ row }) => {
            const value = row.getValue("chngePric") as any;
            if (value === null || value === undefined || value === 'N/A') {
                return <span className="text-gray-400 text-xs lg:text-sm">N/A</span>;
            }
            const cp = parseFloat(value);
            if (cp === 0 || isNaN(cp)) {
                return <span className="text-gray-400 text-xs lg:text-sm">N/A</span>;
            } else if(cp < 0 ){
                return  <p className="text-red-600 text-xs lg:text-sm">{cp}</p> ;
            } else if (cp > 0 ){
                return  <p className="text-green-700 text-xs lg:text-sm">{cp}</p>  ;
            }
            return <span className="text-gray-400 text-xs lg:text-sm">N/A</span>;
        }
    },
    {
      accessorKey: "chngePricPct",
      header: "Chg%",
      size: 40,
        cell: ({ row }) => {
            const value = row.getValue("chngePricPct") as any;
            if (value === null || value === undefined || value === 'N/A') {
                return <span className="text-gray-400 text-xs lg:text-sm">N/A</span>;
            }
            const cp = parseFloat(value);
            if (cp === 0 || isNaN(cp)) {
                return <span className="text-gray-400 text-xs lg:text-sm">N/A</span>;
            } else if(cp < 0 ){
                return  <p className="text-red-600 text-xs lg:text-sm">{cp}</p> ;
            } else if (cp > 0 ){
                return  <p className="text-green-700 text-xs lg:text-sm">{cp}</p>  ;
            }
            return <span className="text-gray-400 text-xs lg:text-sm">N/A</span>;
        }
    },
  ];
};

// For backward compatibility
export const watchlistcolumns = createWatchlistColumns();