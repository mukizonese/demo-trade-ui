import { useState, useEffect, useRef } from 'react';

interface PriceChangeEffect {
  isChanged: boolean;
  changeType: 'up' | 'down' | 'none';
  flashClass: string;
  resetFlash: () => void;
}

// Global map to store previous prices across all instances
const globalPreviousPrices = new Map<string, number>();

export const usePriceChangeEffectWithQuery = (
  currentValue: number | null | undefined,
  symbol: string,
  flashDuration: number = 6000
): PriceChangeEffect => {
  // Log when the hook is called
  // console.log(`🔍 [WATCHLIST] Hook Called - Symbol: ${symbol}, CurrentValue: ${currentValue}, Timestamp: ${new Date().toISOString()}`);
  const [isChanged, setIsChanged] = useState(false);
  const [changeType, setChangeType] = useState<'up' | 'down' | 'none'>('none');
  const [flashClass, setFlashClass] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    // Prevent multiple simultaneous processing
    if (isProcessingRef.current) {
      return;
    }

    // Only trigger effect if we have a current value
    if (currentValue === null || currentValue === undefined) {
      return;
    }

    const current = Number(currentValue);
    const previous = globalPreviousPrices.get(symbol);
    
    // Handle initial load for a symbol in the global map
    if (previous === undefined) {
      globalPreviousPrices.set(symbol, current);
      return;
    }

    const difference = Math.abs(current - previous);
    
    if (difference > 1.0 && !isNaN(current) && !isNaN(previous)) {
      // Only trigger if not already flashing
      if (!isChanged && !isProcessingRef.current) {
        isProcessingRef.current = true;
        
        setIsChanged(true);
        
        // Determine change type
        if (current > previous) {
          setChangeType('up');
          setFlashClass('animate-flash-green');
        } else if (current < previous) {
          setChangeType('down');
          setFlashClass('animate-flash-red');
        }
        
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Reset after flash duration
        timeoutRef.current = setTimeout(() => {
          setIsChanged(false);
          setChangeType('none');
          setFlashClass('');
          globalPreviousPrices.set(symbol, current);
          isProcessingRef.current = false;
          timeoutRef.current = null;
        }, flashDuration);
      }
    } else {
      if (!isChanged) { // Only update if not currently flashing
        globalPreviousPrices.set(symbol, current);
      }
    }
  }, [currentValue, symbol, flashDuration, isChanged]);

  const resetFlash = () => {
    setIsChanged(false);
    setChangeType('none');
    setFlashClass('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isProcessingRef.current = false;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isChanged,
    changeType,
    flashClass,
    resetFlash
  };
}; 