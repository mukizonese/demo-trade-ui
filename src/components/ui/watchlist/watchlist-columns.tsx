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
/*
    {
    accessorKey: "tradDt",
    //visible: false,
    header: "Trade Date",
    },
 */
    {
    accessorKey: "tckrSymb",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Symbol
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
    },
/*     {
    accessorKey: "prvsClsgPric",
    header: "Prev. Close Price",
    }, */
    {
      accessorKey: "lastPric",
      header: "LTP",
      cell: ({ row }) => {
        const price = row.getValue("lastPric");
        if (price === 0 || price === null || price === undefined || price === 'N/A') {
          return <span className="text-gray-400">N/A</span>;
        }
        return price;
      }
    },
    {
        accessorKey: "chngePric",
        header: "Chg",
        size: 50,
        cell: ({ row }) => {
            const value = row.getValue("chngePric") as any;
            if (value === null || value === undefined || value === 'N/A') {
                return <span className="text-gray-400">N/A</span>;
            }
            const cp = parseFloat(value);
            if (cp === 0 || isNaN(cp)) {
                return <span className="text-gray-400">N/A</span>;
            } else if(cp < 0 ){
                return  <p className="text-red-600">{cp}</p> ;
            } else if (cp > 0 ){
                return  <p className="text-green-700">{cp}</p>  ;
            }
            return <span className="text-gray-400">N/A</span>;
        }
    },
    {
      accessorKey: "chngePricPct",
      header: "Chg%",
      size: 30,
        cell: ({ row }) => {
            const value = row.getValue("chngePricPct") as any;
            if (value === null || value === undefined || value === 'N/A') {
                return <span className="text-gray-400">N/A</span>;
            }
            const cp = parseFloat(value);
            if (cp === 0 || isNaN(cp)) {
                return <span className="text-gray-400">N/A</span>;
            } else if(cp < 0 ){
                return  <p className="text-red-600">{cp}</p> ;
            } else if (cp > 0 ){
                return  <p className="text-green-700">{cp}</p>  ;
            }
            return <span className="text-gray-400">N/A</span>;
        }
    },
  ];
};

// For backward compatibility
export const watchlistcolumns = createWatchlistColumns();