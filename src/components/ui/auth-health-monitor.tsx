'use client';

import React, { useEffect, useState } from 'react';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { authErrorHandler } from '@/lib/auth-error-handler';

export function AuthHealthMonitor() {
  const { user } = useSimpleAuth();
  const [healthCheckInterval, setHealthCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const [wasAuthenticated, setWasAuthenticated] = useState(false);

  useEffect(() => {
    // Track if user was ever authenticated (not guest)
    const isAuthenticated = user && user.email && !user.email.includes('guest');
    
    if (isAuthenticated) {
      setWasAuthenticated(true);
    }
    
    // Run health checks if user is currently authenticated OR was previously authenticated
    const shouldRunHealthCheck = isAuthenticated || wasAuthenticated;
    
    // Only log when status changes to reduce console spam
    console.log('🔍 [PAGE HEALTH MONITOR] Status:', {
      isAuthenticated,
      wasAuthenticated,
      shouldRunHealthCheck,
      userEmail: user?.email
    });
    
    if (shouldRunHealthCheck) {
      // Clear any existing interval
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
      }
      
      // Start new health check interval (every 60 seconds to avoid rate limits)
      const interval = setInterval(() => {
        console.log('🔍 [PAGE HEALTH MONITOR] Running health check...');
        authErrorHandler.checkAuthApiHealth().then(isHealthy => {
          console.log('🔍 [PAGE HEALTH MONITOR] Health check result:', isHealthy);
          if (!isHealthy) {
            console.log('🔍 [PAGE HEALTH MONITOR] Auth API is down, showing error');
            const error = new Error('Authentication Service is currently unavailable');
            error.name = 'TypeError';
            authErrorHandler.handleAuthApiError(error, 'page-health-monitor');
          }
        }).catch(error => {
          console.error('🔍 [PAGE HEALTH MONITOR] Health check failed:', error);
        });
      }, 60000); // 60 seconds to avoid rate limits
      
      setHealthCheckInterval(interval);
      
      // Also do an immediate health check to test
      console.log('🔍 [PAGE HEALTH MONITOR] Running immediate health check...');
      authErrorHandler.checkAuthApiHealth().then(isHealthy => {
        console.log('🔍 [PAGE HEALTH MONITOR] Immediate health check result:', isHealthy);
      }).catch(error => {
        console.error('🔍 [PAGE HEALTH MONITOR] Immediate health check failed:', error);
      });
    } else {
      // Clear interval only if user was never authenticated (i.e., always a guest)
      if (!wasAuthenticated && healthCheckInterval) {
        clearInterval(healthCheckInterval);
        setHealthCheckInterval(null);
      }
    }
  }, [user, wasAuthenticated]); // Remove healthCheckInterval from dependencies

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
      }
    };
  }, [healthCheckInterval]);

  // This component doesn't render anything visible
  return null;
} 