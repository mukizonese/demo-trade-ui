//'use client'
//import "./../../globals.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WatchListGrid } from "./watchlist-grid"
import { WatchListSearch } from "./watchlist-search"

export default function WatchList(props : any) {



  return (
      <div >

            <Tabs defaultValue="watchlist-query" >
                      <TabsList>
                        <TabsTrigger value="watchlist-query">WatchList</TabsTrigger>
                      </TabsList>

                <TabsContent value="watchlist-query">
                    <WatchListSearch/>
                    <WatchListGrid/>
                </TabsContent>
            </Tabs>
      </div>
  );
}
export { WatchList }