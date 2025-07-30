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
import { useSimpleAuth } from "@/contexts/SimpleAuthContext"
import { useToast } from "@/hooks/use-toast"
import { useChartPanel } from '@/contexts/ChartPanelContext';

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
  const { openChartPanel } = useChartPanel();
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
      React.useState<VisibilityState>({})
  
  // Move popup state management to component level
  const [popupStates, setPopupStates] = React.useState<Map<string, { show: boolean; position: { x: number; y: number } }>>(new Map())
  const hideTimeoutRefs = React.useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Get auth context
  const { user, loading } = useSimpleAuth()
  const isGuest = !user || user.role === 'guest'
  const { toast } = useToast()

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      const timeouts = Array.from(hideTimeoutRefs.current.values());
      timeouts.forEach(timeout => {
        clearTimeout(timeout);
      });
      hideTimeoutRefs.current.clear();
    };
  }, []);

  // Handle clicking outside popups to close them
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.popup-content') && !target.closest('tr')) {
        // Clicked outside popup and outside table row, close all popups
        setPopupStates(new Map());
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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

  // Wait for auth to load to prevent hydration mismatch
  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="rounded-md border flex-1 overflow-auto">
          <Table className="h-full">
            <TableHeader className="sticky top-0 bg-white z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="text-xs lg:text-sm">
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
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2 px-2 lg:py-3 lg:px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-sm">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  const showPopup = (symbol: string, event?: React.MouseEvent) => {
    // Clear all existing hide timeouts
    const timeouts = Array.from(hideTimeoutRefs.current.values());
    timeouts.forEach(timeout => {
      clearTimeout(timeout);
    });
    hideTimeoutRefs.current.clear();
    
    // Calculate position for fixed popup
    let position = { x: 0, y: 0 };
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect();
      const popupWidth = 220; // Approximate popup width
      const availableSpace = window.innerWidth - rect.right;
      
      if (availableSpace >= popupWidth) {
        // Enough space on the right - position closer to the row
        position = { x: rect.right - 120, y: rect.top };
      } else {
        // Not enough space, position to the left - closer to the row
        position = { x: rect.left - popupWidth + 250, y: rect.top };
      }
    }
    
    // Clear all existing popups and show only the new one
    setPopupStates(new Map([[symbol, { show: true, position }]]));
  };

  const hidePopup = (symbol: string, delay: number = 300) => {
    const timeout = setTimeout(() => {
      setPopupStates(prev => {
        const newMap = new Map(prev);
        newMap.delete(symbol);
        return newMap;
      });
      hideTimeoutRefs.current.delete(symbol);
    }, delay);
    
    hideTimeoutRefs.current.set(symbol, timeout);
  };

  return (
    <div className="h-full flex flex-col">
        <div className="rounded-md border flex-1 overflow-visible">
          <Table className="h-full">
            <TableHeader className="sticky top-0 bg-white z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="text-xs lg:text-sm">
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
                  const ltp = row.getValue("lastPric") as number;
                  const popupState = popupStates.get(symb) || { show: false, position: { x: 0, y: 0 } };

                  const handleRowMouseEnter = (e: React.MouseEvent) => {
                    // Show popup on hover for both desktop and mobile
                    showPopup(symb, e);
                  };

                  const handleRowMouseLeave = () => {
                    // Hide popup when leaving row for both desktop and mobile
                    hidePopup(symb);
                  };

                  const handleRowClick = (e: React.MouseEvent) => {
                    // Remove click behavior - now using hover for both mobile and desktop
                    // Keep this for any future click-specific functionality if needed
                  };

                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="group hover:bg-gray-50 relative cursor-pointer text-xs lg:text-sm"
                      onMouseEnter={handleRowMouseEnter}
                      onMouseLeave={handleRowMouseLeave}
                      onClick={handleRowClick}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-2 px-2 lg:py-3 lg:px-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                      
                      {/* Action Popup */}
                      {popupState.show && (
                        <div 
                          className="fixed z-50 bg-white border border-gray-200 rounded shadow-lg p-0.5 popup-content"
                          style={{
                            maxWidth: 'none',
                            minWidth: '200px',
                            whiteSpace: 'nowrap',
                            overflow: 'visible',
                            top: popupState.position.y,
                            left: popupState.position.x,
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
                            hidePopup(symb);
                          }}
                          onClick={(e) => {
                            // Prevent popup from closing when clicking inside it
                            e.stopPropagation();
                          }}
                        >
                          <div className="flex flex-nowrap gap-0.5">
                            {isGuest ? (
                              <>
                                <button 
                                  className="px-1 py-0 text-xs font-medium text-blue-600 border border-blue-400 rounded hover:bg-blue-50 h-5"
                                  onClick={() => {
                                    hidePopup(symb);
                                    toast({
                                      title: "Guest Mode - Cannot Buy",
                                      description: "Please sign in and upgrade to trader role to buy stocks.",
                                      variant: "default",
                                    });
                                  }}
                                >
                                  B
                                </button>
                                <button 
                                  className="px-1 py-0 text-xs font-medium text-red-600 border border-red-400 rounded hover:bg-red-50 h-5"
                                  onClick={() => {
                                    hidePopup(symb);
                                    toast({
                                      title: "Guest Mode - Cannot Sell",
                                      description: "Please sign in and upgrade to trader role to sell stocks.",
                                      variant: "default",
                                    });
                                  }}
                                >
                                  S
                                </button>
                              </>
                            ) : (
                              <>
                                <BuyActionPopover 
                                  symbol={symb as string} 
                                  price={ltp}
                                  onActionClick={() => {
                                    // Close popup immediately when action is clicked
                                    setPopupStates(prev => {
                                      const newMap = new Map(prev);
                                      newMap.delete(symb);
                                      return newMap;
                                    });
                                  }}
                                />
                                <SellActionPopover 
                                  symbol={symb as string} 
                                  price={ltp}
                                  holdqty={holdingsMap.get(symb as string) || 0}
                                  onActionClick={() => {
                                    // Close popup immediately when action is clicked
                                    setPopupStates(prev => {
                                      const newMap = new Map(prev);
                                      newMap.delete(symb);
                                      return newMap;
                                    });
                                  }}
                                />
                              </>
                            )}
                            <Button 
                              size="sm"
                              variant="outline"
                              className="h-5 w-5 p-0 text-xs font-medium hover:bg-blue-50"
                              title="View Chart"
                              onClick={() => {
                                // Close popup immediately when chart button is clicked
                                hidePopup(symb);
                                // Open chart panel with selected symbol
                                openChartPanel(symb);
                              }}
                            >
                              📊
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              className="h-5 w-5 p-0 text-red-600 hover:bg-red-50 text-xs font-medium"
                              onClick={() => {
                                // Close popup immediately when remove button is clicked
                                hidePopup(symb);
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
                  <TableCell colSpan={columns.length} className="h-24 text-center text-sm">
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
