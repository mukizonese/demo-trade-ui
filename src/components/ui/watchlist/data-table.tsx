"use client"
import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Button} from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BuyActionPopover } from "@/components/ui/action-popover/buy-action-popover"
import { SellActionPopover } from "@/components/ui/action-popover/sell-action-popover"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRemoveSymbol?: (symbol: string) => void
  holdingsMap?: Map<string, number>
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRemoveSymbol,
  holdingsMap = new Map(),
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
      React.useState<VisibilityState>({})
  
  // Move popup state management to component level
  const [popupStates, setPopupStates] = React.useState<Map<string, { show: boolean; position: { x: number; y: number } }>>(new Map())
  const hideTimeoutRefs = React.useRef<Map<string, NodeJS.Timeout>>(new Map())

  const table = useReactTable({
    data,
    columns,

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      hideTimeoutRefs.current.forEach(timeout => {
        clearTimeout(timeout);
      });
      hideTimeoutRefs.current.clear();
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
        <div className="rounded-md border flex-1 overflow-auto">
          <Table className="h-full">
            <TableHeader className="sticky top-0 bg-white z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  const symb = row.getValue("tckrSymb") as string;
                  const popupState = popupStates.get(symb) || { show: false, position: { x: 0, y: 0 } };

                  const handleRowMouseEnter = (e: React.MouseEvent) => {
                    // Clear any existing hide timeout
                    const existingTimeout = hideTimeoutRefs.current.get(symb);
                    if (existingTimeout) {
                      clearTimeout(existingTimeout);
                      hideTimeoutRefs.current.delete(symb);
                    }

                    const rect = e.currentTarget.getBoundingClientRect();
                    const newPosition = {
                      x: rect.right - 15, // Move even closer to the grid
                      y: rect.top - 5
                    };
                    
                    setPopupStates(prev => new Map(prev).set(symb, { show: true, position: newPosition }));
                  };

                  const handleRowMouseLeave = () => {
                    // Add delay before hiding
                    const timeout = setTimeout(() => {
                      setPopupStates(prev => {
                        const newMap = new Map(prev);
                        const currentState = newMap.get(symb);
                        if (currentState) {
                          newMap.set(symb, { ...currentState, show: false });
                        }
                        return newMap;
                      });
                      hideTimeoutRefs.current.delete(symb);
                    }, 300);
                    
                    hideTimeoutRefs.current.set(symb, timeout);
                  };

                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="group hover:bg-gray-50 relative cursor-pointer"
                      onMouseEnter={handleRowMouseEnter}
                      onMouseLeave={handleRowMouseLeave}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                      
                      {/* Action Popup */}
                      {popupState.show && (
                        <div 
                          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2"
                          style={{
                            left: `${popupState.position.x}px`,
                            top: `${popupState.position.y}px`,
                          }}
                          onMouseEnter={() => {
                            // Clear hide timeout when hovering over popup
                            const existingTimeout = hideTimeoutRefs.current.get(symb);
                            if (existingTimeout) {
                              clearTimeout(existingTimeout);
                              hideTimeoutRefs.current.delete(symb);
                            }
                          }}
                          onMouseLeave={() => {
                            // Add delay when leaving popup
                            const timeout = setTimeout(() => {
                              setPopupStates(prev => {
                                const newMap = new Map(prev);
                                const currentState = newMap.get(symb);
                                if (currentState) {
                                  newMap.set(symb, { ...currentState, show: false });
                                }
                                return newMap;
                              });
                              hideTimeoutRefs.current.delete(symb);
                            }, 300);
                            hideTimeoutRefs.current.set(symb, timeout);
                          }}
                        >
                          <div className="flex space-x-1">
                            <BuyActionPopover 
                              symbol={symb as string} 
                              onActionClick={() => {
                                // Close popup when buy action is clicked
                                setPopupStates(prev => {
                                  const newMap = new Map(prev);
                                  const currentState = newMap.get(symb);
                                  if (currentState) {
                                    newMap.set(symb, { ...currentState, show: false });
                                  }
                                  return newMap;
                                });
                              }}
                            />
                            <SellActionPopover 
                              symbol={symb as string} 
                              holdqty={holdingsMap.get(symb as string) || 0}
                              onActionClick={() => {
                                // Close popup when sell action is clicked
                                setPopupStates(prev => {
                                  const newMap = new Map(prev);
                                  const currentState = newMap.get(symb);
                                  if (currentState) {
                                    newMap.set(symb, { ...currentState, show: false });
                                  }
                                  return newMap;
                                });
                              }}
                            />
                            <Button 
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0 text-xs font-medium hover:bg-blue-50"
                              title="View Chart"
                              onClick={() => {
                                // Close popup immediately when chart button is clicked
                                setPopupStates(prev => {
                                  const newMap = new Map(prev);
                                  const currentState = newMap.get(symb);
                                  if (currentState) {
                                    newMap.set(symb, { ...currentState, show: false });
                                  }
                                  return newMap;
                                });
                                // TODO: Add chart functionality here
                              }}
                            >
                              📊
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 text-xs font-medium"
                              onClick={() => {
                                // Close popup immediately when remove button is clicked
                                setPopupStates(prev => {
                                  const newMap = new Map(prev);
                                  const currentState = newMap.get(symb);
                                  if (currentState) {
                                    newMap.set(symb, { ...currentState, show: false });
                                  }
                                  return newMap;
                                });
                                onRemoveSymbol?.(symb as string);
                              }}
                              title="Remove symbol from watchlist"
                            >
                              🗑️
                            </Button>
                          </div>
                        </div>
                      )}
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
  </div>

  )
}
