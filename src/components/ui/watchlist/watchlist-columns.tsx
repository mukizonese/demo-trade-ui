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

export type WatchList = {
   tradDt: Date
   tckrSymb: string
   prvsClsgPric: number
   lastPric: number
   chngePric: number
   chngePricPct: number
}

export const watchlistcolumns: ColumnDef<WatchList>[] = [
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
    },
    {
        accessorKey: "chngePric",
        header: "Chg",
        size: 50,
        cell: ({ row }) => {
            const cp = parseFloat(row.getValue("chngePric"))
            if(cp < 0 ){
                return  <p className="text-red-600">{cp}</p> ;
            } else if (cp > 0 ){
                return  <p className="text-green-700">{cp}</p>  ;
            }
        }
    },
    {
      accessorKey: "chngePricPct",
      header: "Chg%",
      size: 30,
        cell: ({ row }) => {
            const cp = parseFloat(row.getValue("chngePricPct"))
            if(cp < 0 ){
                return  <p className="text-red-600">{cp}</p> ;
            } else if (cp > 0 ){
                return  <p className="text-green-700">{cp}</p>  ;
            }
        }
    },
      {
        id: "actions",
        cell: ({ row }) => {
          const symb = row.getValue("tckrSymb");

          return (
            <BuyActionPopover symbol={symb}/>
          )
        },
      },
]