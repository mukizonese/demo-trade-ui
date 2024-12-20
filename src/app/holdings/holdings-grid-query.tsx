"use client"

import { HoldingValue, columns } from "./columns-live"
import { DataTable } from "./data-table"
import React, { StrictMode, useEffect, useState, useMemo  } from 'react';
import { useForm } from "react-hook-form"
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
//import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClientHoldings = new QueryClient()

export type Holdings = {

    totInvestment: number
    totCurrValue: number
    totPnl: number
    totPnlPct: number
    totNetChng: number
    totNetChngPct: number
    totDayChng: number
    totDayChngPct: number

    transactionlist : HoldingValue[]

}

export default function HoldingsQueryGrid() {

  return (
    <QueryClientProvider client={queryClientHoldings}>
      {/**<ReactQueryDevtools /> */}
      <HoldingsExample/>
    </QueryClientProvider>
  )
}

function formatNumbers(cp : number){
        if(cp < 0 ){
            return  <p className="text-lg font-sans  text-red-600" >{new Intl.NumberFormat('en-IN').format(cp)}</p> ;
        } else if (cp > 0 ){
            return  <p className="text-lg font-sans   text-green-700">{new Intl.NumberFormat('en-IN' ).format(cp)}</p>  ;
        } else if (cp == 0 ){
             return  <p >{cp}</p>  ;
         }
}
function formatNumberPcts(cp : number){
        if(cp < 0 ){
            return  <p className="text-sm font-sans  text-red-600" >{new Intl.NumberFormat('en-IN').format(cp)}   </p> ;
        } else if (cp > 0 ){
            return  <p className="text-sm font-sans   text-green-700">{new Intl.NumberFormat('en-IN').format(cp)}</p>  ;
        } else if (cp == 0 ){
             return  <p >{cp}</p>  ;
         }
}

function HoldingsExample() {

      var hosturl = process.env.NEXT_PUBLIC_FETCH_URL;
     const queryClientHoldings = useQueryClient()
      const [intervalSec, setIntervalSec] = React.useState(10000) //10000 is 10s

      var fetchholdingssurl =  hosturl + "/tradingzone/holdings/3";
      //console.log ("fetchholdingssurl > ",fetchholdingssurl)


    const { isLoading, error, data: serverData , isFetching , status } = useQuery({
        queryKey: ['holdings'],
           queryFn: () =>
                  fetch(fetchholdingssurl)
                    .then(response => {
                      if(response.ok){
                            return response.json();
                       }else{
                            //console.log ("Err in holding fetch > ")
                       }
                    })
                    .then(data  => {
                        //console.log ("data > ",data)
                      return data
                    })
            ,
            refetchInterval: intervalSec,

      })



        //use memo shows empry data if set when api cals are in process of fetching

        //const data = useMemo(() => serverData ?? [], serverData);
        if (serverData === undefined) {
                    return <h1>Loading..as data not obtained.</h1>
        }
        //console.log ("data > ")
        //console.log (serverData.totCurrValue)
        //console.log (serverData.totDayChng)
        //console.log (serverData.totNetChng)

        if (status === 'pending') return <h1>Loading...</h1>
        if (status === 'error') return <span>Error: {error.message}</span>
        //if (status === 'error') return <span>Error... </span>

      return (

        <div >
            <div className="grid grid-flow-row auto-rows-max gap-y-4">
                <div >
                        <div className="grid grid-cols-8 flex gap-2 justify-items-center flex-col sm:flex-row">
                            <div className="col-span-2 ">
                                <span className="text-sm font-small">Total investment</span>
                                <p className="text-lg font-sans " >{new Intl.NumberFormat('en-IN').format(serverData.totInvestment)}</p>
                                <span className="text-small font-medium">
                                </span>

                            </div>
                            <div className="col-span-2 ">
                                <span className="text-sm font-small">Current value</span>
                                {formatNumbers(serverData.totCurrValue) }
                            </div>
                            <div className="col-span-2 ">
                                <span className="text-sm font-small">Day&apos;s P&L</span>
                                <span>{formatNumbers(serverData.totDayChng) }
                                {formatNumberPcts(serverData.totDayChngPct) }</span>
                            </div>
                            <div className="col-span-2 ">
                                <span className="text-sm font-small">Total P&L</span>
                                {formatNumbers(serverData.totNetChng) }
                                {formatNumberPcts(serverData.totNetChngPct) }
                            </div>
                        </div>
                </div>

                <div >
                    <DataTable columns={columns} data={serverData.transactionlist} />
                </div>
            </div>
        </div>
      );
}

export { HoldingsQueryGrid }