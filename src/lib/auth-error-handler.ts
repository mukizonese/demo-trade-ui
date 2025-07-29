/**
 * Authentication Error Handler
 * Handles authentication service failures with proper error messages
 */

export interface AuthServiceError {
  type: 'auth_api_down' | 'auth_client_down' | 'mapping_failed' | 'user_not_found' | 'network_error';
  message: string;
  details?: string;
  retryable: boolean;
}

export class AuthServiceErrorHandler {
  private static instance: AuthServiceErrorHandler;
  private errorCallbacks: ((error: AuthServiceError) => void)[] = [];
  private lastError: AuthServiceError | null = null;
  private lastErrorTime: number = 0;
  private readonly ERROR_DEDUPLICATION_WINDOW = 5000; // 5 seconds

  static getInstance(): AuthServiceErrorHandler {
    if (!AuthServiceErrorHandler.instance) {
      AuthServiceErrorHandler.instance = new AuthServiceErrorHandler();
    }
    return AuthServiceErrorHandler.instance;
  }

  /**
   * Register a callback to handle authentication errors
   */
  onError(callback: (error: AuthServiceError) => void): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * Remove a callback
   */
  offError(callback: (error: AuthServiceError) => void): void {
    this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Notify all registered callbacks of an error
   */
  private notifyError(error: AuthServiceError): void {
    const now = Date.now();
    
    // Check if this is a duplicate error within the deduplication window
    if (this.lastError && 
        this.lastError.type === error.type && 
        this.lastError.message === error.message &&
        (now - this.lastErrorTime) < this.ERROR_DEDUPLICATION_WINDOW) {
      //console.log('🔴 [AUTH ERROR] Duplicate error suppressed:', error.type);
      return;
    }
    
    // Update last error info
    this.lastError = error;
    this.lastErrorTime = now;
    
    this.errorCallbacks.forEach(callback => callback(error));
  }

  /**
   * Handle authentication API errors
   */
  handleAuthApiError(error: any, context: string = 'unknown'): AuthServiceError {
    console.error(`🔴 [AUTH ERROR] ${context}:`, error);

    let authError: AuthServiceError;

    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      // Network error - likely auth API is down
      authError = {
        type: 'auth_api_down',
        message: 'Authentication Service is currently unavailable',
        details: 'The authentication service is not responding. Please try again later.',
        retryable: true
      };
    } else if (error.status === 401) {
      // Unauthorized
      authError = {
        type: 'user_not_found',
        message: 'Authentication required',
        details: 'Please sign in to access this feature.',
        retryable: false
      };
    } else if (error.status === 500) {
      // Server error
      authError = {
        type: 'auth_api_down',
        message: 'Authentication Service Error',
        details: 'The authentication service encountered an error. Please try again later.',
        retryable: true
      };
    } else {
      // Unknown error
      authError = {
        type: 'network_error',
        message: 'Authentication Service Error',
        details: error.message || 'An unexpected error occurred with the authentication service.',
        retryable: true
      };
    }

    this.notifyError(authError);
    return authError;
  }

  /**
   * Handle user mapping errors
   */
  handleMappingError(error: any, context: string = 'unknown'): AuthServiceError {
    console.error(`🔴 [MAPPING ERROR] ${context}:`, error);

    let authError: AuthServiceError;

    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      // Network error - likely auth API is down
      authError = {
        type: 'auth_api_down',
        message: 'User Mapping Service is currently unavailable',
        details: 'Unable to retrieve user information. Please try again later.',
        retryable: true
      };
    } else if (error.status === 404) {
      // User mapping not found
      authError = {
        type: 'mapping_failed',
        message: 'User Profile Not Found',
        details: 'Your user profile could not be located. Please contact support.',
        retryable: false
      };
    } else if (error.status === 401) {
      // Unauthorized
      authError = {
        type: 'user_not_found',
        message: 'Authentication required',
        details: 'Please sign in to access this feature.',
        retryable: false
      };
    } else {
      // Unknown error
      authError = {
        type: 'mapping_failed',
        message: 'User Mapping Error',
        details: error.message || 'An error occurred while retrieving user information.',
        retryable: true
      };
    }

    this.notifyError(authError);
    return authError;
  }

  /**
   * Check if auth API is reachable
   */
  async checkAuthApiHealth(): Promise<boolean> {
    try {
      const authApiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8050';
      const response = await fetch(`${authApiUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      // Consider rate limit (429) as healthy since it means the service is responding
      const isHealthy = response.ok || response.status === 429;
      //console.log('🔍 [AUTH HEALTH] Auth API health check:', isHealthy ? 'HEALTHY' : 'UNHEALTHY', 'Status:', response.status);
      
      // If we hit rate limit, log it but don't treat as error
      if (response.status === 429) {
        console.log('🔍 [AUTH HEALTH] Rate limited, but service is responding');
      }
      
      // Clear last error if service is now healthy
      if (isHealthy && this.lastError) {
        console.log('🔍 [AUTH HEALTH] Service recovered, clearing last error');
        this.lastError = null;
        this.lastErrorTime = 0;
      }
      
      return isHealthy;
    } catch (error) {
      console.error('🔴 [AUTH HEALTH CHECK] Failed:', error);
      return false;
    }
  }

  /**
   * Check if auth client is reachable
   */
  async checkAuthClientHealth(): Promise<boolean> {
    try {
      const authClientUrl = process.env.NEXT_PUBLIC_AUTH_CLIENT_URL || 'http://localhost:3001';
      const response = await fetch(`${authClientUrl}`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      return response.ok;
    } catch (error) {
      console.error('🔴 [AUTH CLIENT HEALTH CHECK] Failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const authErrorHandler = AuthServiceErrorHandler.getInstance(); 