'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChartPanelContextType {
  isChartPanelOpen: boolean;
  selectedSymbol: string;
  openChartPanel: (symbol: string) => void;
  closeChartPanel: () => void;
}

const ChartPanelContext = createContext<ChartPanelContextType | undefined>(undefined);

export function ChartPanelProvider({ children }: { children: ReactNode }) {
  const [isChartPanelOpen, setIsChartPanelOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('');

  const openChartPanel = (symbol: string) => {
    setSelectedSymbol(symbol);
    setIsChartPanelOpen(true);
  };

           const closeChartPanel = () => {
           console.log('🔍 [CHART PANEL] Closing chart panel');
           setIsChartPanelOpen(false);
           setSelectedSymbol('');
         };

  return (
    <ChartPanelContext.Provider value={{
      isChartPanelOpen,
      selectedSymbol,
      openChartPanel,
      closeChartPanel,
    }}>
      {children}
    </ChartPanelContext.Provider>
  );
}

export function useChartPanel() {
  const context = useContext(ChartPanelContext);
  if (context === undefined) {
    throw new Error('useChartPanel must be used within a ChartPanelProvider');
  }
  return context;
} 