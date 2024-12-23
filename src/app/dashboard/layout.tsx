//'use client'
import "./../globals.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WatchList } from "@/components/ui/watchlist/watchlist"

export default function Dashboard({
  children,
}: Readonly<{
     children: React.ReactNode;
   }>) {

  return (
            <div className="flex min-h-4 w-full items-center justify-center p-6 md:p-10">
                   DASHBOARD coming up ...
            </div>

  );
}
