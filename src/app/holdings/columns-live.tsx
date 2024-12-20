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

export type HoldingValue = {
    tckrSymb : string
    avgQty : number
    avgCost : number
    totCost : number
    lastPric : number
    prvsClsgPric : number
    chngePric : number
    currValue : number
    pnl : number

    netChng : number
    netChngPct : number
    dayChng : number
    dayChngPct : number

}


export const columns: ColumnDef<HoldingValue>[] = [
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
        id: "buyactions",
        cell: ({ row }) => {
          const symb = row.getValue("tckrSymb");

          return (
            <div className="grid grid-flow-col auto-cols-max gap-x-1">
            <BuyActionPopover symbol={symb}/>
            </div>
          )
        },
      },
      {
        id: "sellactions",
        cell: ({ row }) => {
          const symb = row.getValue("tckrSymb");

          return (
            <div className="grid grid-flow-col auto-cols-max gap-x-1">
            <SellActionPopover symbol={symb} holdqty={row.getValue("avgQty")}/>
            </div>
          )
        },
      },
    {
    accessorKey: "avgQty",
        header: "Qty",
    },
    {
    accessorKey: "avgCost",
        header: "Avg. Cost",
        cell: ({ row }) => {
            const cp = parseFloat(row.getValue("avgCost"))
            return  new Intl.NumberFormat('en-IN').format(cp) ;
        }

    },
    {
    accessorKey: "totCost",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Total Cost
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
            const cp = parseFloat(row.getValue("totCost"))
            return  new Intl.NumberFormat('en-IN').format(cp) ;
        }

    },
    {
      accessorKey: "lastPric",
        header: "LTP",
        cell: ({ row }) => {
            const cp = parseFloat(row.getValue("lastPric"))
            return  new Intl.NumberFormat('en-IN').format(cp) ;
        }
    },
    {
    accessorKey: "currValue",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Current Value
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
            const cp = parseFloat(row.getValue("currValue"))
            return  new Intl.NumberFormat('en-IN').format(cp) ;
        }
    },
    {
        accessorKey: "dayChng",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Day P&L
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
            const cp = parseFloat(row.getValue("dayChng"))
            if(cp < 0 ){
                return  <p className="text-red-600">{new Intl.NumberFormat('en-IN').format(cp)}</p> ;
            } else if (cp > 0 ){
                return  <p className="text-green-700">{new Intl.NumberFormat('en-IN').format(cp)}</p>  ;
            } else if (cp == 0 ){
                 return  <p >{cp}</p>  ;
             }
        }
    },

    {
      accessorKey: "dayChngPct",
      header: "Day Change%",
        cell: ({ row }) => {
            const cp = parseFloat(row.getValue("dayChngPct"))
            if(cp < 0 ){
                return  <p className="text-red-600">{cp}</p> ;
            } else if (cp > 0 ){
                return  <p className="text-green-700">{cp}</p>  ;
            } else if (cp == 0 ){
                 return  <p >{cp}</p>  ;
             }
        }
    },
    {
        accessorKey: "pnl",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Net P&L
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
            const cp = parseFloat(row.getValue("pnl"))
            if(cp < 0 ){
                return  <p className="text-red-600">{new Intl.NumberFormat('en-IN').format(cp)}</p> ;
            } else if (cp > 0 ){
                return  <p className="text-green-700">{new Intl.NumberFormat('en-IN').format(cp)}</p>  ;
            } else if (cp == 0 ){
                 return  <p >{cp}</p>  ;
             }
        }
    },
    {
      accessorKey: "netChngPct",
      header: "Net Change%",
        cell: ({ row }) => {
            const cp = parseFloat(row.getValue("netChngPct"))
            if(cp < 0 ){
                return  <p className="text-red-600">{cp}</p> ;
            } else if (cp > 0 ){
                return  <p className="text-green-700">{cp}</p>  ;
            } else if (cp == 0 ){
                return  <p >{cp}</p>  ;
            }
        }
    },

      {
        id: "actions",
        cell: ({ row }) => {
          const trade = row.original

          return (
            <DropdownMenu modal={false}>
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