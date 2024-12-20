"use client"
import React, { StrictMode, useEffect, useState, useMemo  } from 'react';
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
import { SymbolSearch } from "@/components/ui/symbol-search"

export default function WatchListSearch(props : any) {

    const [selectedSymbol , setSelectedSymbol] =React.useState("")
    //Take value from children ie SymbolSearch
    const updateParentSymbol = (t : string) => {
      setSelectedSymbol(t);
   }


      return (
      <div className="grid grid-cols-10 flex gap-3 items-left flex-col sm:flex-row">
        <div className="col-span-6 ">
            <SymbolSearch initialSymbol="HDFCBANK" updateParentSymbol={updateParentSymbol} />
        </div>
        <div className="col-span-2 ">
            <Button variant="outline" className="ml-auto"
                onClick={() =>  {
                    addSelectedSymbol(selectedSymbol)
                    }
                }
            >
                <Image
                     className="dark:invert"
                     src="/icons/circle-plus.svg"
                     alt="Add"
                     width={20}
                     height={20}
                     priority
                   />
            </Button>
        </div>
        <div className="col-span-2 ">
            <Button variant="outline" className="ml-auto"
                onClick={() =>  {
                    removeSelectedSymbol(selectedSymbol)
                    }
                }
            >
                <Image
                     className="dark:invert"
                     src="/icons/circle-minus.svg"
                     alt="Rem"
                     width={20}
                     height={20}
                     priority
                   />
            </Button>
        </div>
    </div>
      );

      function addSelectedSymbol(symbol: String){
        //console.log("addSelectedSymbol" ,symbol )
            var hosturl = process.env.NEXT_PUBLIC_FETCH_URL;
            var addWatchListurl =  hosturl + "/watchlist/add/" + symbol +"?cache=hash:watchlist&key=mukesh:1";
            //console.log(" addWatchListurl : ",addWatchListurl);

            // Define the request options
            const requestOptions = {
              method: "PUT", // Specify the request method
              headers: { "Content-Type": "application/json" }, // Specify the content type
              //body: JSON.stringify(data) // Send the data in JSON format
            };

            //const [addStatus, setaddStatus] = React.useState(false)
            var addStatus;
            // Make the request
            fetch(addWatchListurl, requestOptions)
              .then(response => response.json()) // Parse the response as JSON
              .then(data => addStatus = data) // Do something with the data
              .catch(error => console.error(error)); // Handle errors

            //console.log("addSelectedSymbol status" ,addStatus )
      }

        function removeSelectedSymbol(symbol: String){
          //console.log("removeSelectedSymbol" ,symbol )
          var host = process.env.NEXT_PUBLIC_FETCH_HOST;
              var port = process.env.NEXT_PUBLIC_FETCH_PORT;
              var remWatchListurl =  "http://" + host + ":" + port + "/watchlist/remove/" + symbol +"?cache=hash:watchlist&key=mukesh:1";
              //console.log(" remWatchListurl : ",remWatchListurl);

              // Define the request options
              const requestOptions = {
                method: "PUT", // Specify the request method
                headers: { "Content-Type": "application/json" }, // Specify the content type
                //body: JSON.stringify(data) // Send the data in JSON format
              };

              //const [addStatus, setaddStatus] = React.useState(false)
              var remStatus;
              // Make the request
              fetch(remWatchListurl, requestOptions)
                .then(response => response.json()) // Parse the response as JSON
                .then(data => remStatus = data) // Do something with the data
                .catch(error => console.error(error)); // Handle errors

              //console.log("removeSelectedSymbol status" ,remStatus )
        }

}

export { WatchListSearch }