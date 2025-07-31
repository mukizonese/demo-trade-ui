/**
 * Refresh Interval Configuration
 * 
 * All UI refresh intervals are synchronized with the dummy service intervals
 * for optimal simulation performance.
 * 
 * Dummy Service Intervals:
 * - Create Task: 10 seconds
 * - Delete Task: 120 seconds
 * 
 * UI Refresh Intervals:
 * - All grids: 10 seconds (matched with create task)
 * - All hooks: 10 seconds (matched with create task)
 */

export const REFRESH_INTERVALS = {
  // Dummy Service Intervals (backend)
  DUMMY_CREATE_INTERVAL: 10000, // 10 seconds
  DUMMY_DELETE_INTERVAL: 120000, // 120 seconds
  
  // UI Refresh Intervals (frontend)
  TRADES_GRID_INTERVAL: 10000, // 10 seconds
  HOLDINGS_GRID_INTERVAL: 10000, // 10 seconds
  WATCHLIST_GRID_INTERVAL: 10000, // 10 seconds
  WATCHLIST_HOOK_INTERVAL: 10000, // 10 seconds
  LATEST_PRICES_INTERVAL: 10000, // 10 seconds
  LATEST_TRADE_DATE_INTERVAL: 10000, // 10 seconds
  
  // Default intervals for new components
  DEFAULT_INTERVAL: 10000, // 10 seconds
} as const;

/**
 * Get the optimal refresh interval for a component
 * @param componentName - Name of the component
 * @returns Refresh interval in milliseconds
 */
export function getRefreshInterval(componentName: keyof typeof REFRESH_INTERVALS): number {
  return REFRESH_INTERVALS[componentName] || REFRESH_INTERVALS.DEFAULT_INTERVAL;
}

/**
 * Convert milliseconds to seconds for display
 * @param ms - Milliseconds
 * @returns Seconds
 */
export function msToSeconds(ms: number): number {
  return Math.round(ms / 1000);
}

/**
 * Convert seconds to milliseconds
 * @param seconds - Seconds
 * @returns Milliseconds
 */
export function secondsToMs(seconds: number): number {
  return seconds * 1000;
} 