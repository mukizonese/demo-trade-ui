"use client"
import React, { StrictMode, useEffect, useState, useMemo ,forwardRef } from 'react';
import { Check, ChevronsUpDown } from "lucide-react"
import Image from "next/image";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function SymbolSearch<SearchProp>(props : any){

    const [selectedSymbol , setSelectedSymbol] =React.useState(props.initialSymbol)

    var hosturl = process.env.NEXT_PUBLIC_FETCH_URL;
    var fetchSymbolListurl =  hosturl + "/tradingzone/trades/symbols/";
    console.log(" fetchSymbolListurl : ",fetchSymbolListurl);

    const [symbolsData, setSymbolsData] = useState([])

        const fetchSymbols = () => {
            fetch(fetchSymbolListurl)
              .then(response => {
                return response.json()
              })
              .then(data => {
                setSymbolsData(data)
              })
        }

       useEffect(() => {
          props.updateParentSymbol(selectedSymbol)
       }, [selectedSymbol]);


        useEffect(() => {
            fetchSymbols()
        }, [])

    const symbols = symbolsData;
    const [open, setOpen] = React.useState(false)


      return (
            <div>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                          id="searchSymbolButton"
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-[180px] justify-between"
                        >
                            {selectedSymbol === selectedSymbol ? selectedSymbol : "Search Symbol"}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[150px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search Symbol..." />
                        <CommandList>
                          <CommandEmpty>No Symbols found.</CommandEmpty>
                          <CommandGroup>
                            {symbols.map((symbol) => (
                              <CommandItem
                                key={symbol}
                                value={symbol}
                                onSelect={(currentValue) => {
                                  setSelectedSymbol(currentValue === selectedSymbol ? "" : currentValue)
                                  setOpen(false)
                                }}
                              >
                                {symbol}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    selectedSymbol === symbol ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
        </div>

      );

}

export { SymbolSearch }