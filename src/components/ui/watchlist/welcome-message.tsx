'use client';

import { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';

interface WelcomeMessageProps {
  defaultSymbolsLoaded: boolean;
  watchlistId?: number;
  onDismiss?: () => void;
}

export function WelcomeMessage({ defaultSymbolsLoaded, watchlistId = 1, onDismiss }: WelcomeMessageProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if we've already shown the message for this session
    const hasShownThisSession = localStorage.getItem('watchlist-welcome-shown');
    
    // Only show the message when default symbols are loaded for the first time on watchlist 1
    if (watchlistId === 1 && defaultSymbolsLoaded && !hasShownThisSession) {
      setIsVisible(true);
      // Mark as shown for this session
      localStorage.setItem('watchlist-welcome-shown', 'true');
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [defaultSymbolsLoaded, watchlistId]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <div className="font-medium">Welcome to your watchlist!</div>
            <div className="mt-1">
              We&apos;ve added some popular stocks to get you started. You can add, remove, or modify these symbols anytime.
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            // Clear the flag so it won't show again
            localStorage.removeItem('watchlist-welcome-shown');
            if (onDismiss) onDismiss();
          }}
          className="text-blue-400 hover:text-blue-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 