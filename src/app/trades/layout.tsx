//'use client'
import "./../globals.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TradesGrid } from "./trades-grid"
import { TradesQueryGrid } from "./trades-grid-query"

export default function RootLayout({
  children,
}: Readonly<{
     children: React.ReactNode;
   }>) {

  return (
      <div >
            <Tabs defaultValue="trades-query"
                >
                      <TabsList className="space-x-3 bg-teal-100">
                        <TabsTrigger value="trades-query">Live</TabsTrigger>
                        <TabsTrigger value="trades">Historic</TabsTrigger>
                      </TabsList>

                <TabsContent value="trades-query"><TradesQueryGrid/></TabsContent>
                <TabsContent value="trades"><TradesGrid/></TabsContent>
            </Tabs>
      </div>
  );
}
