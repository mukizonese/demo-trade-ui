"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Disclaimer } from "./disclaimer";
import { Architecture } from "./architecture";

export default function AboutPage() {
  return (
    <div className="flex min-h-4 w-full items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-4xl">
        <Tabs defaultValue="disclaimer" className="w-full">
          <TabsList className="space-x-3 bg-teal-100">
            <TabsTrigger value="disclaimer">Disclaimer</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
          </TabsList>
          <TabsContent value="disclaimer">
            <Disclaimer />
          </TabsContent>
          <TabsContent value="architecture">
            <Architecture />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 