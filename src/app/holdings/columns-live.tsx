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
import { TradeDetailsModal } from "@/components/ui/trade-details-modal"
import { useState } from "react"

// Wrapper component for the actions cell to handle modal state
function ActionsCell({ trade }: { trade: HoldingValue }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-6 w-6 lg:h-8 lg:w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-3 w-3 lg:h-4 lg:w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsModalOpen(true)}>
            View trade details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
      
      <TradeDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        symbol={trade.tckrSymb}
        totalQty={trade.avgQty}
        ltp={trade.lastPric}
      />
    </>
  )
}

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
        id: "buyactions",
        header: "B",
        cell: ({ row }) => {
          const symb = row.getValue("tckrSymb");

          return (
            <div className="grid grid-flow-col auto-cols-max gap-x-1">
              <BuyActionPopover symbol={symb}/>
            </div>
          )
        },
        size: 25,
      },
      {
        id: "sellactions",
        header: "S",
        cell: ({ row }) => {
          const symb = row.getValue("tckrSymb");

          return (
            <div className="grid grid-flow-col auto-cols-max gap-x-1">
              <SellActionPopover symbol={symb} holdqty={row.getValue("avgQty")}/>
            </div>
          )
        },
        size: 25,
      },
    {
    accessorKey: "avgQty",
        header: "Qty",
        cell: ({ row }) => {
          const qty = row.getValue("avgQty") as number;
          return <span className="text-xs lg:text-sm">{qty}</span>;
        },
        size: 50,
    },
    {
    accessorKey: "avgCost",
        header: "Avg. Cost",
        cell: ({ row }) => {
            const cp = parseFloat(row.getValue("avgCost"))
            return <span className="text-xs lg:text-sm">{new Intl.NumberFormat('en-IN').format(cp)}</span>;
        },
        size: 80,
    },
    {
    accessorKey: "totCost",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="text-xs lg:text-sm font-medium"
            >
              Total Cost
              <ArrowUpDown className="ml-1 lg:ml-2 h-3 w-3 lg:h-4 lg:w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
            const cp = parseFloat(row.getValue("totCost"))
            return <span className="text-xs lg:text-sm">{new Intl.NumberFormat('en-IN').format(cp)}</span>;
        },
        size: 90,
    },
    {
      accessorKey: "lastPric",
        header: "LTP",
        cell: ({ row }) => {
            const cp = parseFloat(row.getValue("lastPric"))
            return <span className="text-xs lg:text-sm">{new Intl.NumberFormat('en-IN').format(cp)}</span>;
        },
        size: 70,
    },
    {
    accessorKey: "currValue",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="text-xs lg:text-sm font-medium"
            >
              Current Value
              <ArrowUpDown className="ml-1 lg:ml-2 h-3 w-3 lg:h-4 lg:w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
            const cp = parseFloat(row.getValue("currValue"))
            return <span className="text-xs lg:text-sm">{new Intl.NumberFormat('en-IN').format(cp)}</span>;
        },
        size: 90,
    },
    {
        accessorKey: "dayChng",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="text-xs lg:text-sm font-medium"
            >
              Day P&L
              <ArrowUpDown className="ml-1 lg:ml-2 h-3 w-3 lg:h-4 lg:w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
            const cp = parseFloat(row.getValue("dayChng"))
            if(cp < 0 ){
                return  <p className="text-red-600 text-xs lg:text-sm">{new Intl.NumberFormat('en-IN').format(cp)}</p> ;
            } else if (cp > 0 ){
                return  <p className="text-green-700 text-xs lg:text-sm">{new Intl.NumberFormat('en-IN').format(cp)}</p>  ;
            } else if (cp == 0 ){
                 return  <p className="text-xs lg:text-sm">{cp}</p>  ;
             }
        },
        size: 70,
    },

    {
      accessorKey: "dayChngPct",
      header: "Day%",
        cell: ({ row }) => {
            const cp = parseFloat(row.getValue("dayChngPct"))
            if(cp < 0 ){
                return  <p className="text-red-600 text-xs lg:text-sm">{cp}</p> ;
            } else if (cp > 0 ){
                return  <p className="text-green-700 text-xs lg:text-sm">{cp}</p>  ;
            } else if (cp == 0 ){
                 return  <p className="text-xs lg:text-sm">{cp}</p>  ;
             }
        },
        size: 50,
    },
    {
        accessorKey: "pnl",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="text-xs lg:text-sm font-medium"
            >
              Net P&L
              <ArrowUpDown className="ml-1 lg:ml-2 h-3 w-3 lg:h-4 lg:w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
            const cp = parseFloat(row.getValue("pnl"))
            if(cp < 0 ){
                return  <p className="text-red-600 text-xs lg:text-sm">{new Intl.NumberFormat('en-IN').format(cp)}</p> ;
            } else if (cp > 0 ){
                return  <p className="text-green-700 text-xs lg:text-sm">{new Intl.NumberFormat('en-IN').format(cp)}</p>  ;
            } else if (cp == 0 ){
                 return  <p className="text-xs lg:text-sm">{cp}</p>  ;
             }
        },
        size: 80,
    },
    {
      accessorKey: "netChngPct",
      header: "Net%",
        cell: ({ row }) => {
            const cp = parseFloat(row.getValue("netChngPct"))
            if(cp < 0 ){
                return  <p className="text-red-600 text-xs lg:text-sm">{cp}</p> ;
            } else if (cp > 0 ){
                return  <p className="text-green-700 text-xs lg:text-sm">{cp}</p>  ;
            } else if (cp == 0 ){
                return  <p className="text-xs lg:text-sm">{cp}</p>  ;
            }
        },
        size: 50,
    },

      {
        id: "actions",
        cell: ({ row }) => {
          const trade = row.original
          return <ActionsCell trade={trade} />
        },
        size: 40,
      },

]