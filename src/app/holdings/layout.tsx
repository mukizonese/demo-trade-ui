//'use client'
import "./../globals.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HoldingsQueryGrid } from "./holdings-grid-query"

export default function RootLayout({
  children,
}: Readonly<{
     children: React.ReactNode;
   }>) {

  return (
      <div >
            <HoldingsQueryGrid/>
      </div>
  );
}
