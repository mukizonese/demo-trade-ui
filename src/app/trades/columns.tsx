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
    {
    accessorKey: "tradDt",
    header: "Trade Date",
    },
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
    },
    {
      accessorKey: "clsPric",
      header: "Close Price",
    },
    {
        accessorKey: "chngePric",
        header: "Change Price",
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
      header: "Change%",
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