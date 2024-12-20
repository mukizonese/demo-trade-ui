//'use client'
import "./../globals.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WatchList } from "@/components/ui/watchlist/watchlist"

export default function WatchListLayout({
  children,
}: Readonly<{
     children: React.ReactNode;
   }>) {

  return (
            <div>
                   Watchlist Layout
            </div>

  );
}
