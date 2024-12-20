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

import { LatestTradeDate } from "@/components/ui/tradeutil/trade-util"

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

        var hosturl = process.env.NEXT_PUBLIC_FETCH_URL;

        const [tradeDate, setTradeDate] = React.useState<Date>(new Date("2024-12-02"))
        const [tradeDateString, setTradeDateString] = useState("2024-12-02 00:00:00")

        const latestDate = LatestTradeDate();
        //console.log ("WatchListGridQuery latestTradeDate() > ")
        //console.log ( latestDate)
        //console.log ("WatchListGridQuery latestTradeDate() > ", latestDate, " latestDate.substring(0,10) > ", latestDate.substring(0,10))

        const memoInit = useMemo(() => {
            if (typeof latestDate === "string" && latestDate.length === 0) {
                    //console.log("The string is empty");
                    setTradeDate(new Date("2024-12-09"));
                    setTradeDateString("2024-12-09 00:00:00")
                } else if (latestDate === null) {
                    //console.log("The string is null");
                    setTradeDate(new Date("2024-12-09"));
                    setTradeDateString("2024-12-09 00:00:00")
                } else {
                    //console.log("The string is not empty or null");
                    setTradeDate(new Date(latestDate.substring(0,10)));
                    setTradeDateString(latestDate)
                }
        }, [latestDate]);

    const handleTradeDateChange = (selectedDate : Date)  => {

         console.log ("selectedDate > ", selectedDate)
         setTradeDate(selectedDate)
        var dateFormatted = format(toDate(selectedDate), "yyyy-MM-dd");
        console.log ("dateFormatted > ",dateFormatted)
        var selectedDateString = dateFormatted + " 00:00:00"
        console.log ("selectedDateString > ",selectedDateString)
        setTradeDateString(selectedDateString)
    }

      const queryClient = useQueryClient()
      const [intervalMs, setIntervalMs] = React.useState(5000)
      //const [value, setValue] = React.useState('')
      const [intervalSec, setIntervalSec] = React.useState(5000) //10000 is 10s

    const handleIntervalStringToInt = (value: string) => {
        setIntervalSec(parseInt(value))
    }


      var fetchtradesurl =  hosturl + "/tradingzone/tradesByDate?date=" + tradeDateString + "&live=true";
      console.log ("fetchtradesurl > ",fetchtradesurl)


    const { isLoading, error, data: serverData , isFetching , status } = useQuery({
        queryKey: ['trades', tradeDateString],
/*         queryFn: () =>
            fetch(fetchtradesurl).then((res) =>
            res.json()
            ) */
           queryFn: () =>
                  fetch(fetchtradesurl)
                    .then(response => {
                      if(response.ok) return response.json();
                    })
                    .then(data  => {
                      return data
                    })
 /*               queryFn: async (): Promise<Array<Trade>> => {
                  const response = await fetch(fetchtradesurl)
                  return await response.json()
                } */
//              queryFn:  async () => getTradeByDates(intervalDate)
//                queryFn:  getTradeByDates(intervalDate)
            ,
            // Refetch the data every second
            refetchInterval: intervalSec,
            //enabled: true,
      })

        //use memo shows empry data if set when api cals are in process of fetching
        const data = useMemo(() => serverData ?? [], [serverData]);
        /* console.log(data);
          if (data === undefined) {
            return <h1>Loading..as data not obtained.</h1>
          } */


        if (status === 'pending') return <h1>Loading...</h1>
        if (status === 'error') return <span>Error: {error.message}</span>
        //if (status === 'error') return <span>Error... </span>

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