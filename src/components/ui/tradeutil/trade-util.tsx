"use client"
import React, { StrictMode, useEffect, useState, useMemo  } from 'react';

//export const latestTradeDate = LatestDate();

export function LatestTradeDate(){

    const [latestDate , setLatestDate] =React.useState("")
    //const [latestDate , setLatestDate] = ""

    var hosturl = process.env.NEXT_PUBLIC_FETCH_URL;
    var fetchurl =  hosturl + "/tradingzone/trades/latestdate/";
    //console.log(" fetchlatesttradedateurl : ",fetchurl);

        const fetchData = () => {
            fetch(fetchurl)
              .then(response => {
                return response.json()
              })
              .then(data => {
                setLatestDate(data)
              })
        }
         useEffect(() => {
            fetchData()
        }, [])

      //console.log(" latestDate : ",latestDate);
      return latestDate;

}

