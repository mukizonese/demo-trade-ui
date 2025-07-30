'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { WatchList } from "@/components/ui/watchlist/watchlist"
import { useChartPanel } from '@/contexts/ChartPanelContext';
import { ChartPanel } from '@/components/ui/chart-panel';

interface LayoutWrapperContentProps {
  children: React.ReactNode;
}

function LayoutWrapperContent({ children }: LayoutWrapperContentProps) {
  const pathname = usePathname();
  const { isChartPanelOpen, closeChartPanel } = useChartPanel();
  
  //console.log('🔍 [LAYOUT] Current pathname:', pathname, 'isChartPanelOpen:', isChartPanelOpen);
  
  // Show watchlist on desktop for all routes, but only on mobile for /watch route
  const isWatchPage = pathname === '/watch';

  // Close chart panel when navigating to a different route
  const prevPathnameRef = React.useRef(pathname);
  
  React.useEffect(() => {
    //console.log('🔍 [LAYOUT] Pathname changed from', prevPathnameRef.current, 'to', pathname, 'isChartPanelOpen:', isChartPanelOpen);
    if (prevPathnameRef.current !== pathname && isChartPanelOpen) {
      //console.log('🔍 [LAYOUT] Closing chart panel due to navigation');
      closeChartPanel();
    }
    prevPathnameRef.current = pathname;
  }, [pathname, isChartPanelOpen, closeChartPanel]);

  return (
    <div className="rounded-lg bg-vc-border-gradient p-px">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-2">
        {/* Mobile: Only show on /watch route, Desktop: Always show */}
        <div className={`col-span-1 lg:col-span-2 order-2 lg:order-1 ${isWatchPage ? 'block' : 'hidden lg:block'}`}>
          <WatchList/>
        </div>
        {/* Mobile: Full width, Desktop: 8/10 columns - Show chart panel or main content */}
        <div className="col-span-1 lg:col-span-8 order-1 lg:order-2">
          <div className="rounded-lg p-3.5 lg:p-6">
            {isChartPanelOpen ? <ChartPanel /> : children}
          </div>
        </div>
      </div>
    </div>
  );
}

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  return <LayoutWrapperContent>{children}</LayoutWrapperContent>;
} 