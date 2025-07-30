'use client';

import React, { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChartPanel } from '@/contexts/ChartPanelContext';

export function ChartPanel() {
  const { selectedSymbol, closeChartPanel } = useChartPanel();
  const [timeRange, setTimeRange] = useState("99d");
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [priceInfo, setPriceInfo] = useState({ current: 0, change: 0, changePercent: 0 });
  const [yAxisDomain, setYAxisDomain] = useState([0, 100]);

  const fetchTradesData = (symbol: string, timeRange: string) => {
    setIsLoading(true);
    const hosturl = process.env.NEXT_PUBLIC_TRADING_API_URL;
    const url = hosturl + "/tradingzone/tradeshistory";
    const fetchurl = url + "/" + symbol + "/" + timeRange;

    fetch(fetchurl)
      .then(response => {
        return response.json();
      })
      .then(data => {
        // Process data to calculate price change and Y-axis domain
        if (data && data.length > 0) {
          const sortedData = data.sort((a: any, b: any) => new Date(a.tradDt).getTime() - new Date(b.tradDt).getTime());
          const firstPrice = sortedData[0].lastPric;
          const lastPrice = sortedData[sortedData.length - 1].lastPric;
          const change = lastPrice - firstPrice;
          const changePercent = (change / firstPrice) * 100;
          
          // Calculate Y-axis domain based on actual data range
          const prices = data.map((item: any) => item.lastPric);
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          const priceRange = maxPrice - minPrice;
          
          // Add 10% padding above and below the data range
          const padding = priceRange * 0.1;
          const yMin = Math.max(0, minPrice - padding);
          const yMax = maxPrice + padding;
          
          setYAxisDomain([yMin, yMax]);
          
          setPriceInfo({
            current: lastPrice,
            change: change,
            changePercent: changePercent
          });
        }
        
        setChartData(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching chart data:', error);
        setChartData([]);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (selectedSymbol) {
      fetchTradesData(selectedSymbol, timeRange);
    }
  }, [selectedSymbol, timeRange]);

  if (!selectedSymbol) {
    return null;
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle className="text-xl font-bold">{selectedSymbol}</CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold">
              ₹{new Intl.NumberFormat('en-IN').format(priceInfo.current)}
            </span>
            <span className={`font-medium ${priceInfo.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {priceInfo.change >= 0 ? '+' : ''}₹{new Intl.NumberFormat('en-IN').format(priceInfo.change)}
            </span>
            <span className={`font-medium ${priceInfo.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ({priceInfo.changePercent >= 0 ? '+' : ''}{priceInfo.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-[120px] rounded-lg sm:ml-auto"
              aria-label="Select a value"
            >
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="99d" className="rounded-lg">
                All
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={closeChartPanel}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading chart data...</p>
            </div>
          </div>
        ) : (
          <div className="h-[400px] w-full bg-gray-50 rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="tradDt" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => {
                    const dt = value.substring(0, 10);
                    const date = new Date(dt);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <YAxis 
                  domain={yAxisDomain}
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => {
                    return new Intl.NumberFormat('en-IN').format(value);
                  }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    });
                  }}
                  formatter={(value, name) => [
                    new Intl.NumberFormat('en-IN').format(value as number),
                    'Price'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="lastPric"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorPrice)"
                  fillOpacity={0.6}
                  dot={false}
                  activeDot={{ r: 4, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 