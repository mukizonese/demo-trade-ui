'use client'
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
// Theme
import { ModuleRegistry } from '@ag-grid-community/core';

// React Grid Logic
// Core CSS
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

import React, { StrictMode, useEffect, useState } from 'react';


ModuleRegistry.registerModules([ClientSideRowModelModule]);

const GridExample = () => {
     // Row Data: The data to be displayed.
    //const [rowData, setRowData] = useState([]);
      const [rowData, setRowData] = useState([
       { id: 1, symbol: "HUL", company: "Hindustan Unilever", prevClosePrice: 2486, currentPrice: 2510, changePrice:23 },
       { id: 2, symbol: "TCS", company: "Tata Consultancy Service", prevClosePrice: 1014, currentPrice: 1009, changePrice:-4},
       { id: 3, symbol: "MARUTI", company: "Maruti Suzuki", prevClosePrice: 9990, currentPrice: 9999, changePrice:4 }
     ]);

     // Column Definitions: Defines the columns to be displayed.
      const [colDefs, setColDefs] = useState([
            { field: "id" },
            { field: "symbol" , filter: 'string'},
            { field: "company" , filter: 'string'},
            { field: "prevClosePrice" , filter: 'number'},
            { field: "currentPrice" , filter: 'number' },
            { field: "changePrice" , filter: 'number' }
          ]);

     const defaultColDef = {
             flex: 1,
         };

     // Fetch data & update rowData state
     /*     useEffect(() => {
         console.log('hello');
          fetch('http://localhost:8090/tickers') // Fetch data from server
            .then(result => result.json()) // Convert to JSON
            .then(rowData => setRowData(rowData)); // Update state of `rowData`
         }, []) */

return (
   // wrapping container with theme & size
   <div
    className="ag-theme-quartz" // applying the Data Grid theme
    style={{ height: 500 }} // the Data Grid will fill the size of the parent container
   >
     <AgGridReact
         rowData={rowData}
         columnDefs={colDefs}
         defaultColDef={defaultColDef}
     />
   </div>
  )
}

export default function StaticAGGridSample() {
  //return <h1>Hello, Ticker Page!</h1>
  return (
    <div>
        <GridExample/>
    </div>
  );
}
