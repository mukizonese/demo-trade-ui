import { useState, useEffect, useRef } from 'react';

interface PriceChangeEffect {
  isChanged: boolean;
  changeType: 'up' | 'down' | 'none';
  flashClass: string;
  resetFlash: () => void;
}

export const usePriceChangeEffect = (
  currentValue: number | null | undefined,
  previousValue: number | null | undefined,
  flashDuration: number = 6000
): PriceChangeEffect => {
  const [isChanged, setIsChanged] = useState(false);
  const [changeType, setChangeType] = useState<'up' | 'down' | 'none'>('none');
  const [flashClass, setFlashClass] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousValueRef = useRef<number | null | undefined>(previousValue);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip the first render to avoid false positives
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousValueRef.current = currentValue;
      return;
    }

    // Only trigger effect if we have both current and previous values
    if (currentValue !== null && currentValue !== undefined && 
        previousValueRef.current !== null && previousValueRef.current !== undefined) {
      
      const current = Number(currentValue);
      const previous = Number(previousValueRef.current);
      
      // Check if value actually changed (with tolerance for floating point)
      const difference = Math.abs(current - previous);
      
      if (difference > 1.0 && !isNaN(current) && !isNaN(previous)) {
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
        }, flashDuration);
      }
    }
    
    // Update previous value for next comparison
    previousValueRef.current = currentValue;
  }, [currentValue, flashDuration]);

  const resetFlash = () => {
    setIsChanged(false);
    setChangeType('none');
    setFlashClass('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
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