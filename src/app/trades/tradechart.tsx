"use client"

//import * as React from "react"
import React, { StrictMode, useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis , YAxis } from "recharts"
import { useForm } from "react-hook-form"
import { config } from "@/config/config"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SymbolSearch } from "@/components/ui/symbol-search"


export function TradeChart() {

    const [selectedSymbol , setSelectedSymbol] =React.useState("")
    //Take value from children ie SymbolSearch
    const updateParentSymbol = (t : string) => {
      setSelectedSymbol(t);
   }

    //console.log(" selectedSymbol in tradechart : ",selectedSymbol);

    const [chartSymbol, setChartSymbol] = useState([])

    const fetchChartSymbol = (symbol: any) => {
        setChartSymbol(symbol)
      }

    useEffect(() => {
            fetchChartSymbol(selectedSymbol)
    }, [selectedSymbol])

    const chartConfig = {
          symbol: {
            label: chartSymbol,
            color: "hsl(var(--chart-2))",
          },
        } satisfies ChartConfig


    const [timeRange, setTimeRange] = React.useState("99d")

    const [chartData, setTrades] = useState([])

    const fetchTradesData = (symbol: string, timeRange: string) => {

        //const host = config.fetchHost;
        //const port = config.fetchPort;
        var hosturl = process.env.NEXT_PUBLIC_TRADING_API_URL;

        var url =  hosturl + "/tradingzone/tradeshistory";
        var fetchurl = url + "/" + symbol + "/" + timeRange;

        //console.log(" fetchurl in TradeChart : ",fetchurl);

        //fetch("http://localhost:8090/tradeshistory/HDFCBANK/2024-10-16")
        fetch(fetchurl)
          .then(response => {
            return response.json()
          })
          .then(data => {
            setTrades(data)
          })
      }

    useEffect(() => {
        selectedSymbol !== "" ? fetchTradesData(selectedSymbol, timeRange) : ""

      }, [selectedSymbol, timeRange])

  return (

<div>

    <SymbolSearch initialSymbol="HDFCBANK" updateParentSymbol={updateParentSymbol} />
    <Card>

      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Chart</CardTitle>
          <CardDescription>
            React recharts

          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[120px] rounded-lg sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
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
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >

          <AreaChart data={chartData}>

            <defs>
              <linearGradient id="fillSymbol" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-symbol)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-symbol)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="tradDt"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              minTickGap={8}
              tickFormatter={(value) => {

                const dt = value.substring(0,10);
                //console.log(dt);
                const date = new Date(dt)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <YAxis
              dataKey="lastPric"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              minTickGap={8}
              tickFormatter={(value) => {
                return value;
              }}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="lastPric"
              type="natural"
              fill="url(#fillSymbol)"
              stroke="var(--color-symbol)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent nameKey="symbol" />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  </div>

  )
}

