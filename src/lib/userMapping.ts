/**
 * User ID Mapping Service
 * Handles mapping between Supabase UUIDs and trading service user IDs
 */

import { authErrorHandler } from './auth-error-handler';

interface UserMapping {
  supabase_uuid: string;
  trading_user_id: number;
}

/**
 * Get trading user ID for the authenticated user
 */
export async function getTradingUserId(): Promise<number> {
  try {
    const authApiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8050';
    
    //console.log('🔍 [USER MAPPING] Fetching trading user ID from:', `${authApiUrl}/api/mapping/trading-user-id`);
    
    const response = await fetch(`${authApiUrl}/api/mapping/trading-user-id`, {
      credentials: 'include', // Include cookies for authentication
    });

    if (!response.ok) {
      console.error('🔍 [USER MAPPING] HTTP error:', response.status, response.statusText);
      const error = new Error(`HTTP error! status: ${response.status}`);
      (error as any).status = response.status;
      throw error;
    }

    const data: UserMapping = await response.json();
    //console.log('🔍 [USER MAPPING] User mapping response:', data);
    
    return data.trading_user_id;
  } catch (error) {
    console.error('🔍 [USER MAPPING] Failed to get trading user ID:', error);
    
    // Use error handler instead of falling back to default
    const authError = authErrorHandler.handleMappingError(error, 'getTradingUserId');
    
    // Throw the error instead of returning a default value
    throw new Error(`User mapping failed: ${authError.message}`);
  }
}

/**
 * Get trading user ID with caching
 */
let cachedTradingUserId: number | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getCachedTradingUserId(): Promise<number> {
  const now = Date.now();
  
  // Return cached value if still valid
  if (cachedTradingUserId && now < cacheExpiry) {
    //console.log('🔍 [USER MAPPING] Returning cached trading user ID:', cachedTradingUserId);
    return cachedTradingUserId;
  }
  
  // Fetch new value
  console.log('🔍 [USER MAPPING] Cache expired or empty, fetching new trading user ID...');
  const tradingUserId = await getTradingUserId();
  
  // Cache the result
  cachedTradingUserId = tradingUserId;
  cacheExpiry = now + CACHE_DURATION;
  
  console.log('🔍 [USER MAPPING] Cached new trading user ID:', tradingUserId);
  return tradingUserId;
}

/**
 * Clear the cached trading user ID
 */
export function clearTradingUserIdCache(): void {
  //console.log('🔍 [USER MAPPING] Clearing trading user ID cache');
  cachedTradingUserId = null;
  cacheExpiry = 0;
} 