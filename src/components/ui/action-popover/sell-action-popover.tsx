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
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
import { getCachedTradingUserId, clearTradingUserIdCache } from '@/lib/userMapping';
import { authErrorHandler } from '@/lib/auth-error-handler';

const queryClientSellPopover = new QueryClient()

export default function SellActionPopover(props : any) {
  const { onActionClick } = props; // Callback to close parent popup
  const { user } = useSimpleAuth();
  const { toast } = useToast();

  const handleSellClick = async () => {
    // Proactively check auth service health before showing popover
    const isHealthy = await authErrorHandler.checkAuthApiHealth();
    if (!isHealthy) {
      console.log('🔴 [SELL ACTION] Auth API is down, showing error');
      const error = new Error('Authentication Service is currently unavailable');
      error.name = 'TypeError';
      authErrorHandler.handleAuthApiError(error, 'sell-action-click');
      return; // Don't proceed with sell action
    }
    
    // If auth service is healthy, show upgrade required toast
    toast({
      title: "Upgrade Required",
      description: "Please sign in and upgrade to trader role to sell stocks. Click the Sign In button in the navigation to get started.",
      variant: "default",
    });
  };

  return (
    <QueryClientProvider client={queryClientSellPopover}>
      {/**<ReactQueryDevtools /> */}
      {user?.role === 'trader' ? (
        <ActionPopoverQuery symbol={props.symbol} holdqty = {props.holdqty} onActionClick={onActionClick} />
      ) : (
        <div className="flex items-center justify-center p-2">
          <button 
            className="text-xs text-red-600 hover:text-red-800 underline"
            onClick={handleSellClick}
          >
            S
          </button>
        </div>
      )}
    </QueryClientProvider>
  )
}

function formatNumbers(price : number, qty : number, ){
          return <p>{new Intl.NumberFormat('en-IN').format(price * qty)}</p>
}



export function ActionPopoverQuery(props : any) {

    const { toast } = useToast()
    const { user } = useSimpleAuth();
    const queryClientBuyPopover = useQueryClient()
    const symbol= props.symbol;
    const { onActionClick } = props; // Callback to close parent popup
    const [quantity, setQuantity] = React.useState(1)
    const holdqty=props.holdqty;
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

    const handlePopoverTriggerClick = async () => {
      // Proactively check auth service health before opening popover
      const isHealthy = await authErrorHandler.checkAuthApiHealth();
      if (!isHealthy) {
        console.log('🔴 [SELL POPOVER] Auth API is down, showing error');
        const error = new Error('Authentication Service is currently unavailable');
        error.name = 'TypeError';
        authErrorHandler.handleAuthApiError(error, 'sell-popover-trigger');
        return; // Don't open popover
      }
      
      // If auth service is healthy, open the popover
      setIsPopoverOpen(true);
    };

    var hosturl = process.env.NEXT_PUBLIC_TRADING_API_URL;
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
      <Popover open={isPopoverOpen} onOpenChange={(open) => {
        setIsPopoverOpen(open);
        if (!open) {
          // Reset quantity when popover closes
          setQuantity(1);
        }
      }}>
              <PopoverTrigger asChild>
                <button onClick={handlePopoverTriggerClick}>
                          <Image
                             src="/icons/sell-popover.svg"
                             alt="Sell"
                             width={15}
                             height={15}
                             priority
                           />
                </button>
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
                              onClick={async () =>  {
                                        // Close popover immediately when button is clicked
                                        setIsPopoverOpen(false);
                                        // Close parent popup if callback provided
                                        if (onActionClick) {
                                          onActionClick();
                                        }
                                        
                                        try {
                                          // Clear cache to ensure we get the current user's ID
                                          clearTradingUserIdCache();
                                          const userId = await getCachedTradingUserId();
                                          //console.log('🔍 [SELL] Using trading user ID:', userId);
                                          
                                          const result = await actionTrade(symbol, quantity , holdqty, userId);
                                          toast({
                                                    title: "Sell: Msg ",
                                                    description: result.message,
                                                    //description: "TEST TOAST",
                                          })
                                        } catch (error) {
                                          console.error('Failed to get trading user ID:', error);
                                          // Use error handler instead of generic toast
                                          authErrorHandler.handleMappingError(error, 'sell-action-popover');
                                        }
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

async function actionTrade(symbol: String, qty: number, holdqty: number, userId: number): Promise<{ success: boolean; message: string }> {

      //  console.log(" holdqty : ",holdqty);
      //  console.log(" qty : ",qty);
      var hosturl = process.env.NEXT_PUBLIC_TRADING_API_URL;
      
      var action_url =  hosturl + "/tradingzone/holdings/sell/" + symbol +"?qty=" + qty + "&userId=" + userId;

      if(holdqty === 0){
        return { success: false, message: symbol + " - No holdings available to sell. Please buy first." };
      }

      if(qty <= holdqty){

        //console.log(" action_url : ",action_url);

          // Define the request options
          const requestOptions = {
            method: "PUT", // Specify the request method
            headers: { "Content-Type": "application/json" }, // Specify the content type
            //body: JSON.stringify(data) // Send the data in JSON format
          };

          try {
            // Make the request
            const response = await fetch(action_url, requestOptions);
            const data = await response.json();
            
            //console.log("actionTrade status" ,data )
            if(data){
              return { success: true, message: symbol + " Qty : " + qty +" > successfull." };
            }else{
              return { success: false, message: symbol + " Qty :" + qty +" > failure." };
            }
          } catch (error) {
            console.error(error);
            return { success: false, message: symbol + " Qty :" + qty +" > error occurred." };
          }

      }else{
            return { success: false, message: symbol + " Qty to Sell : " + qty +" cannot exceed Holding Qty ie." + holdqty };
      }
}

export { SellActionPopover }