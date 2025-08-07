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
import { usePriceChangeEffectWithQuery } from '@/hooks/usePriceChangeEffectWithQuery';

// Price Cell Component for Trades
function PriceCell({ price, symbol }: { price: number; symbol: string }) {
    const { isChanged, changeType, flashClass } = usePriceChangeEffectWithQuery(price, symbol);
    
    if (price === 0 || price === null || price === undefined) {
        return <span className="text-gray-400">N/A</span>;
    }
    
    const baseClasses = "transition-all duration-200";
    const changeClasses = isChanged ? flashClass : '';
    
    return (
        <span className={`${baseClasses} ${changeClasses}`}>
            {String(price)}
        </span>
    );
}

// Change Price Cell Component for Trades
function ChangePriceCell({ value, currentPrice, symbol }: { value: number; currentPrice: number; symbol: string }) {
    const { isChanged, changeType, flashClass } = usePriceChangeEffectWithQuery(currentPrice, symbol);
    
    if (value === null || value === undefined) {
        return <span className="text-gray-400">N/A</span>;
    }
    const cp = parseFloat(value.toString());
    if (cp === 0 || isNaN(cp)) {
        return <span className="text-gray-400">N/A</span>;
    }
    
    const baseClasses = "transition-all duration-200";
    const changeClasses = isChanged ? flashClass : '';
    
    if(cp < 0 ){
        return (
            <p className={`text-red-600 ${baseClasses} ${changeClasses}`}>
                {String(cp)}
            </p>
        );
    } else if (cp > 0 ){
        return (
            <p className={`text-green-700 ${baseClasses} ${changeClasses}`}>
                {String(cp)}
            </p>
        );
    } else if (cp == 0 ){
        return <p>{cp}</p>;
    }
    return <span className="text-gray-400">N/A</span>;
}

// Change Percentage Cell Component for Trades
function ChangePercentageCell({ value, currentPrice, symbol }: { value: number; currentPrice: number; symbol: string }) {
    const { isChanged, changeType, flashClass } = usePriceChangeEffectWithQuery(currentPrice, symbol);
    
    if (value === null || value === undefined) {
        return <span className="text-gray-400">N/A</span>;
    }
    const cp = parseFloat(value.toString());
    if (cp === 0 || isNaN(cp)) {
        return <span className="text-gray-400">N/A</span>;
    }
    
    const baseClasses = "transition-all duration-200";
    const changeClasses = isChanged ? flashClass : '';
    
    if(cp < 0 ){
        return (
            <p className={`text-red-600 ${baseClasses} ${changeClasses}`}>
                {cp.toFixed(2)}%
            </p>
        );
    } else if (cp > 0 ){
        return (
            <p className={`text-green-700 ${baseClasses} ${changeClasses}`}>
                {cp.toFixed(2)}%
            </p>
        );
    } else if (cp == 0 ){
        return <p>{cp.toFixed(2)}%</p>;
    }
    return <span className="text-gray-400">N/A</span>;
}

export type Trade = {
   tradDt: Date
   tckrSymb: string
   finInstrmNm: string
   prvsClsgPric: number
   opnPric: number
   hghPric: number
   lwPric: number
   lastPric: number
   clsPric: number
   chngePric: number
   chngePricPct: number
}

export const columns: ColumnDef<Trade>[] = [
/*     {
    accessorKey: "tradDt",
    header: "Trade Date",
    }, */
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
    {
    accessorKey: "finInstrmNm",
    header: "Name",
    },
    {
    accessorKey: "prvsClsgPric",
    header: "Prev. Close Price",
    },
    {
    accessorKey: "opnPric",
    header: "Open Price",
    },
    {
    accessorKey: "hghPric",
    header: "High Price",
    },
    {
    accessorKey: "lwPric",
    header: "Low Price",
    },
    {
      accessorKey: "lastPric",
      header: "Last Traded Price",
      cell: ({ row }) => {
        const price = row.getValue("lastPric") as number;
        return <PriceCell price={price} symbol={row.original.tckrSymb} />;
      },
    },
/*     {
      accessorKey: "clsPric",
      header: "Close Price",
    }, */
    {
        accessorKey: "chngePric",
        header: "Change Price",
        cell: ({ row }) => {
            const value = row.getValue("chngePric") as number;
            const currentPrice = row.original.lastPric;
            return <ChangePriceCell value={value} currentPrice={currentPrice} symbol={row.original.tckrSymb} />;
        }
    },
    {
      accessorKey: "chngePricPct",
      header: "Change%",
        cell: ({ row }) => {
            const value = row.getValue("chngePricPct") as number;
            const currentPrice = row.original.lastPric;
            return <ChangePercentageCell value={value} currentPrice={currentPrice} symbol={row.original.tckrSymb} />;
        }
    },
      {
        id: "actions",
        cell: ({ row }) => {
          const trade = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>View trade details</DropdownMenuItem>
                <DropdownMenuSeparator />
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },

]