"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { PopoverClose } from "@radix-ui/react-popover";
import Image from "next/image";
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
import { useToast } from "@/hooks/use-toast"


const queryClientSellPopover = new QueryClient()

export default function SellActionPopover(props : any) {

  return (
    <QueryClientProvider client={queryClientSellPopover}>
      {/**<ReactQueryDevtools /> */}
      <ActionPopoverQuery symbol={props.symbol} holdqty = {props.holdqty} />
    </QueryClientProvider>
  )
}

function formatNumbers(price : number, qty : number, ){
          return <p>{new Intl.NumberFormat('en-IN').format(price * qty)}</p>
}



export function ActionPopoverQuery(props : any) {

    const { toast } = useToast()
    const queryClientBuyPopover = useQueryClient()
    const symbol= props.symbol;
    const [quantity, setQuantity] = React.useState(1)
    const holdqty=props.holdqty;

    var hosturl = process.env.NEXT_PUBLIC_FETCH_URL;
     var fetchlatestpriceurl =  hosturl+ "/tradingzone/watchlist/latestprice/" + symbol;
      //console.log ("fetchlatestpriceurl > ",fetchlatestpriceurl)


        const { isLoading, error, data: serverData , isFetching , status } = useQuery({
            queryKey: ['sellsymbol',symbol ],
               queryFn: () =>
                      fetch(fetchlatestpriceurl)
                        .then(response => {
                          if(response.ok) return response.json();
                        })
                        .then(data  => {
                          return data
                        })
                ,
                refetchInterval: 10000,
          })

              if (serverData === undefined) {
                return <h1>Loading..as data not obtained.</h1>
              }

            if (status === 'pending') return <h1>Loading...</h1>
            if (status === 'error') return <span>Error: {error.message}</span>
            //if (status === 'error') return <span>Error... </span>


  return (
      <Popover>
              <PopoverTrigger >
                          <Image
                             src="/icons/sell-popover.svg"
                             alt="Sell"
                             width={15}
                             height={15}
                             priority
                           />

              </PopoverTrigger>
               <PopoverContent className="w-60" sideOffset={5} alignOffset={2}>
                      <div className="grid gap-6">
                        <div className="space-y-2 bg-orange-500">
                          <h2 className="text-lg leading-none">{symbol}</h2>
                        </div>
                        <div className="grid gap-2">
                          <div className="grid grid-cols-2 items-center gap-4">
                            <Label >Price.</Label>
                            <Label >{serverData.lastPric}</Label>
                          </div>
                          <div className="grid grid-cols-2 items-center gap-4">
                            <Label >Qty.</Label>
                            <Input
                              id="quantity"
                              type="number"
                              defaultValue="1"
                              className="col-span-1 h-8"
                              //onChange={e => setQuantity((e.target as HTMLInputElement).value)}
                              onChange={e => setQuantity(e.target.valueAsNumber)}
                            />
                          </div>
                            <div className="grid grid-cols-2 items-center gap-4">
                              <Label >Amount</Label>
                              <Label >
                                {
                                    formatNumbers(serverData.lastPric, quantity )
                                }
                                </Label>
                            </div>
                        </div>
                        < div className="grid gap-4">
                         <div className="grid grid-cols-2 items-center gap-4">
                              <Button
                              variant="outline"
                              className="bg-orange-400"
                              onClick={() =>  {
                                        toast({
                                                  title: "Sell: Msg ",
                                                  description: actionTrade(symbol, quantity , holdqty),
                                                  //description: "TEST TOAST",
                                        })
                              }}
                              >
                              Sell</Button>
                               <PopoverClose >
                                <Button>Close</Button>
                              </PopoverClose>
                         </div>
                        </div>
                      </div>
                    </PopoverContent>
            </Popover>
  );

}

function actionTrade(symbol: String, qty: number, holdqty: number){

      //  console.log(" holdqty : ",holdqty);
      //  console.log(" qty : ",qty);
      var actionStatus = true;
      var hosturl = process.env.NEXT_PUBLIC_FETCH_URL;
      var action_url =  hosturl + "/tradingzone/holdings/sell/" + symbol +"?qty=" + qty;

      if(qty <= holdqty){

        //console.log(" action_url : ",action_url);

          // Define the request options
          const requestOptions = {
            method: "PUT", // Specify the request method
            headers: { "Content-Type": "application/json" }, // Specify the content type
            //body: JSON.stringify(data) // Send the data in JSON format
          };

          // Make the request
          fetch(action_url, requestOptions)
            .then(response => response.json()) // Parse the response as JSON
            .then(data => actionStatus = data) // Do something with the data
            .catch(error => console.error(error)); // Handle errors

      }else{
Buy and Sell MsgsBuy d         return symbol + " Qty to Sell : " + qty +" cannot exceed Holding Qty ie." + holdqty;
      }
      //console.log("actionTrade status" ,actionStatus )
      if(actionStatus){
        return symbol + " Qty : " + qty +" > successfull.";
      }else{
        return symbol + " Qty :" + qty +" > failure.";
      }

}

export { SellActionPopover }