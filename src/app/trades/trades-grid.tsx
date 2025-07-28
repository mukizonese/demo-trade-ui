"use client"

import { Trade, columns } from "./columns"
import { DataTable } from "./data-table"
import React, { StrictMode, useEffect, useState } from 'react';
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
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

export default function TradesGrid() {

   //const data = await getTradesData()
   //const data = await getServerSideProps();

    var hosturl = process.env.NEXT_PUBLIC_TRADING_API_URL;

    const [tradeDate, setTradeDate] = React.useState<Date>(new Date("2024-12-02"))
    const [tradeDateString, setTradeDateString] = useState("2024-12-02 00:00:00")

    const handleTradeDateChange = (selectedDate : Date)  => {

         console.log ("selectedDate > ", selectedDate)
         setTradeDate(selectedDate)
        var dateFormatted = format(toDate(selectedDate), "yyyy-MM-dd");
        console.log ("dateFormatted > ",dateFormatted)
        var selectedDateString = dateFormatted + " 00:00:00"
        console.log ("selectedDateString > ",selectedDateString)
        setTradeDateString(selectedDateString)
        fetchTradesData();
    }

      var fetchtradesurl =  hosturl + "/tradingzone/tradesByDate?date=" + tradeDateString + "&live=false";
      console.log ("fetchtradesurl > ",fetchtradesurl)

      const [data, setTradesData] = useState([])

        const fetchTradesData = () => {
            fetch(fetchtradesurl)
              .then(response => {
                return response.json()
              })
              .then(data => {
                setTradesData(data)
              })
        }

        useEffect(() => {
            fetchTradesData()
        }, [tradeDateString])


      return (
        <div >
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

                </div>
            <div>
                <DataTable columns={columns} data={data} />
            </div>
        </div>
      );
}

export { TradesGrid }