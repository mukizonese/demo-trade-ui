"use client"

import { Trade, columns } from "./columns-live"
import { DataTable } from "./data-table"
//import React, { useEffect, useState } from 'react';
import React, { StrictMode, useEffect, useState, useMemo  } from 'react';
import { useForm } from "react-hook-form"
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format, parseISO, toDate } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"



const queryClient = new QueryClient()

export default function TradesQueryGrid() {

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
      <Example/>
    </QueryClientProvider>
  )
}


function Example() {

        var hosturl = process.env.NEXT_PUBLIC_TRADING_API_URL;

        const [tradeDate, setTradeDate] = React.useState<Date>(new Date("2024-12-02"))
        const [tradeDateString, setTradeDateString] = useState("2024-12-02 00:00:00")
        const queryClient = useQueryClient()
        const [intervalMs, setIntervalMs] = React.useState(10000)
        const [intervalSec, setIntervalSec] = React.useState(10000) //10000 is 10s - matched with dummy service

        // Fetch latest trade date using React Query
        const { data: latestDate, isLoading: isLoadingLatestDate } = useQuery({
            queryKey: ['latestTradeDate'],
            queryFn: async () => {
                const response = await fetch(hosturl + "/tradingzone/trades/latestdate/");
                if (!response.ok) {
                    throw new Error('Failed to fetch latest trade date');
                }
                return response.json();
            },
            refetchInterval: 10000, // Refetch every 10 seconds - matched with dummy service
        });

        // Set trade date when latest date is available
        React.useEffect(() => {
            if (latestDate && typeof latestDate === "string" && latestDate.length > 0) {
                setTradeDate(new Date(latestDate.substring(0,10)));
                setTradeDateString(latestDate);
            } else {
                // Fallback to default date if no latest date available
                setTradeDate(new Date("2025-07-21"));
                setTradeDateString("2025-07-21 00:00:00");
            }
        }, [latestDate]);

        var fetchtradesurl =  hosturl + "/tradingzone/tradesByDate?date=" + tradeDateString + "&live=true";

        const { isLoading, error, data: serverData , isFetching , status } = useQuery({
            queryKey: ['trades', tradeDateString],
            queryFn: () =>
                  fetch(fetchtradesurl, {
                    credentials: 'include', // Include cookies for authentication
                  })
                    .then(response => {
                      if(response.ok) return response.json();
                      throw new Error(`HTTP error! status: ${response.status}`);
                    })
                    .then(data  => {
                      return data
                    }),
            refetchInterval: intervalSec,
        });

        //use memo shows empry data if set when api cals are in process of fetching
        const data = useMemo(() => serverData ?? [], [serverData]);

        // Show loading while fetching latest date
        if (isLoadingLatestDate) {
            return <h1>Loading latest trade date...</h1>
        }

        if (status === 'pending') return <h1>Loading...</h1>
        if (status === 'error') {
            console.error('Trades API Error:', error);
            return <span>Error: {error.message}</span>
        }

    const handleTradeDateChange = (selectedDate : Date)  => {
         setTradeDate(selectedDate)
        var dateFormatted = format(toDate(selectedDate), "yyyy-MM-dd");
        var selectedDateString = dateFormatted + " 00:00:00"
        setTradeDateString(selectedDateString)
    }

    const handleIntervalStringToInt = (value: string) => {
        setIntervalSec(parseInt(value))
    }

      return (

        <div >
{/**
                <div className="grid  grid-cols-6 flex gap-2 items-left flex-col sm:flex-row">
                    <div className="col-span-1 ">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[130px] justify-start text-left font-normal",
                                !tradeDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {tradeDate ? format(tradeDate, "yyyy-MM-dd") : <span>Trade date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={tradeDate}
                              //onSelect= { setTradeDate }
                              onSelect= { (val , evt) => { if(val) handleTradeDateChange (val) }}
                              //https://github.com/Hacker0x01/react-datepicker/issues/2971
                              //DatePicker is a range hence 2 values
                              //onSelect= {(val: Date) => handleTradeDateChange(val)}
                              //onSelect={(ev) => setTradeDate(ev.target.value) }
                              //onSelect={handleTradeDateChange}
                              //onSelect= { handleTradeDateChange(tradeDate)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                    </div>
                    <div className="col-span-2 flex gap-3 items-left flex-col sm:flex-row py-0">
                        <label className="text-md"> Interval :</label>
                        <Select defaultValue="10000"
                            //onValueChange={handleIntervalStringToInt}> value={intervalSec}
                            onValueChange={(val) => handleIntervalStringToInt (val)}>
                              <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="3000" />
                              </SelectTrigger>
                              <SelectContent className="rounded-md">
                                <SelectItem value="3000" className="rounded-md">
                                  3 Seconds
                                </SelectItem>
                                <SelectItem value="5000" className="rounded-md">
                                  5 Seconds
                                </SelectItem>
                                <SelectItem value="10000" className="rounded-md">
                                  10 Seconds
                                </SelectItem>
                                <SelectItem value="30000" className="rounded-md">
                                  30 Seconds
                                </SelectItem>
                                <SelectItem value="60000" className="rounded-md">
                                  1 Minute
                                </SelectItem>
                              </SelectContent>
                            </Select>
                           <label>
                            <span
                              style={{
                                display: 'inline-block',
                                marginLeft: '.5rem',
                                width: 8,
                                height: 8,
                                background: isFetching ? 'green' : 'transparent',
                                transition: !isFetching ? 'all .3s ease' : 'none',
                                borderRadius: '100%',
                                transform: 'scale(2)',
                              }}
                            />
                            </label>
                    </div>
                    <div>

                    </div>

                </div>

 */}
            <div>

               {/* <DataTable columns={columns} data={data} />*/}
                <DataTable columns={columns} data={data} />
            </div>
        </div>
      );
}

export { TradesQueryGrid }