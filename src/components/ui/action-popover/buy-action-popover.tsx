
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

const queryClientBuyPopover = new QueryClient()

export default function BuyActionPopover(props : any) {
  const { onActionClick, price } = props; // Callback to close parent popup and price
  const { user, loading } = useSimpleAuth();
  const { toast } = useToast();

  // Wait for auth to load to prevent hydration mismatch
  if (loading) {
    return (
      <button className="px-1.5 py-0.5 text-xs font-medium text-gray-400 border border-gray-300 rounded">
        B
      </button>
    );
  }

  const handleBuyClick = async () => {
    // Proactively check auth service health before showing popover
    const isHealthy = await authErrorHandler.checkAuthApiHealth();
    if (!isHealthy) {
      console.log('🔴 [BUY ACTION] Auth API is down, showing error');
      const error = new Error('Authentication Service is currently unavailable');
      error.name = 'TypeError';
      authErrorHandler.handleAuthApiError(error, 'buy-action-click');
      return; // Don't proceed with buy action
    }
    
    // If auth service is healthy, show upgrade required toast
    toast({
      title: "Upgrade Required",
      description: "Please sign in and upgrade to trader role to buy stocks. Click the Sign In button in the navigation to get started.",
      variant: "default",
    });
  };

  return (
    <QueryClientProvider client={queryClientBuyPopover}>
      {/**<ReactQueryDevtools /> */}
      {user?.role === 'trader' ? (
        <ActionPopoverQuery symbol={props.symbol} price={price} onActionClick={onActionClick} />
      ) : (
        <button 
          className="px-0.5 py-0 text-xs font-medium text-blue-600 border border-blue-500 rounded hover:bg-blue-50 h-2 w-2"
          onClick={handleBuyClick}
        >
          B
        </button>
      )}
    </QueryClientProvider>
  )
}

function formatNumbers(price : number, qty : number ){
          return <p>{new Intl.NumberFormat('en-IN').format(price * qty)}</p>
}


export function ActionPopoverQuery(props : any) {

    const { toast } = useToast()
    const { user } = useSimpleAuth();
    const queryClientBuyPopover = useQueryClient()
    const symbol= props.symbol;
    const { onActionClick, price } = props; // Callback to close parent popup and price
    const [quantity, setQuantity] = React.useState(1)
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

    const handlePopoverTriggerClick = async () => {
      // Proactively check auth service health before opening popover
      const isHealthy = await authErrorHandler.checkAuthApiHealth();
      if (!isHealthy) {
        console.log('🔴 [BUY POPOVER] Auth API is down, showing error');
        const error = new Error('Authentication Service is currently unavailable');
        error.name = 'TypeError';
        authErrorHandler.handleAuthApiError(error, 'buy-popover-trigger');
        return; // Don't open popover
      }
      
      // If auth service is healthy, open the popover
      setIsPopoverOpen(true);
    };

    // Use the actual price from watchlist data, fallback to static price if not provided
    const currentPrice = price || 5561.5;

  return (
      <Popover open={isPopoverOpen} onOpenChange={(open) => {
        setIsPopoverOpen(open);
        if (!open) {
          // Reset quantity when popover closes
          setQuantity(1);
        }
      }}>
        <PopoverTrigger asChild>
          <button onClick={handlePopoverTriggerClick} className="px-0.5 py-0 text-xs font-medium text-blue-600 border border-blue-400 rounded hover:bg-blue-50 h-2 w-2">
            B
          </button>
        </PopoverTrigger>
         <PopoverContent className="w-60 " sideOffset={5} alignOffset={2}>
                <div className="grid gap-6">
                  <div className="space-y-2 bg-blue-100">
                    <h2 className="text-lg leading-none">{symbol}</h2>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-2 items-center gap-4">
                      <Label >Price.</Label>
                      <Label >{currentPrice}</Label>
                    </div>
                      <div className="grid grid-cols-2 items-center gap-4">
                        <Label >Qty.</Label>
                        <Input
                          id="quantity"
                          type="number"
                          defaultValue="1"
                          className="col-span-1 h-8"
                          onChange={e => setQuantity(e.target.valueAsNumber)}
                        />
                      </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                      <Label >Amount</Label>
                      <Label >
                        {new Intl.NumberFormat('en-IN').format(currentPrice * quantity)}
                        </Label>
                    </div>
                  </div>
                  < div className="grid gap-4">
                   <div className="grid grid-cols-2 items-center gap-4">
                        <Button className="bg-blue-300"
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
                                    //console.log('🔍 [BUY] Using trading user ID:', userId);
                                    
                                    const result = await actionTrade(symbol, quantity, userId);
                                    toast({
                                              title: "Buy: Status ",
                                              description: result.message,
                                              //description: "TEST TOAST",
                                    })
                                  } catch (error) {
                                    console.error('Failed to get trading user ID:', error);
                                    // Use error handler instead of generic toast
                                    authErrorHandler.handleMappingError(error, 'buy-action-popover');
                                  }
                        }}

                        >
                        Buy</Button>
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

async function actionTrade(symbol: string, qty: number, userId: number): Promise<{ success: boolean; message: string }> {
  //console.log("buyTrade " ,symbol )
  //console.log("qty " ,qty )
      var hosturl = process.env.NEXT_PUBLIC_TRADING_API_URL;
      
      var action_url =  hosturl + "/tradingzone/holdings/buy/" + symbol +"?qty=" + qty + "&userId=" + userId;

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
}

export { BuyActionPopover }