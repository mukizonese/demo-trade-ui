'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { authErrorHandler } from '@/lib/auth-error-handler';

export default function TestAuthErrorsPage() {
  const simulateAuthApiDown = () => {
    const error = new Error('Failed to fetch');
    error.name = 'TypeError';
    authErrorHandler.handleAuthApiError(error, 'test-simulation');
  };

  const simulateMappingFailed = () => {
    const error = new Error('HTTP error! status: 404');
    (error as any).status = 404;
    authErrorHandler.handleMappingError(error, 'test-simulation');
  };

  const simulateUserNotFound = () => {
    const error = new Error('HTTP error! status: 401');
    (error as any).status = 401;
    authErrorHandler.handleMappingError(error, 'test-simulation');
  };

  const simulateNetworkError = () => {
    const error = new Error('Network error occurred');
    error.name = 'TypeError';
    authErrorHandler.handleAuthApiError(error, 'test-simulation');
  };

  const checkAuthApiHealth = async () => {
    const isHealthy = await authErrorHandler.checkAuthApiHealth();
    alert(`Auth API Health: ${isHealthy ? 'Healthy' : 'Unhealthy'}`);
  };

  const checkAuthClientHealth = async () => {
    const isHealthy = await authErrorHandler.checkAuthClientHealth();
    alert(`Auth Client Health: ${isHealthy ? 'Healthy' : 'Unhealthy'}`);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Error Testing</h1>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={simulateAuthApiDown} variant="destructive">
            Simulate Auth API Down
          </Button>
          
          <Button onClick={simulateMappingFailed} variant="destructive">
            Simulate Mapping Failed
          </Button>
          
          <Button onClick={simulateUserNotFound} variant="destructive">
            Simulate User Not Found
          </Button>
          
          <Button onClick={simulateNetworkError} variant="destructive">
            Simulate Network Error
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={checkAuthApiHealth} variant="outline">
            Check Auth API Health
          </Button>
          
          <Button onClick={checkAuthClientHealth} variant="outline">
            Check Auth Client Health
          </Button>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Click any of the simulation buttons to test error handling</li>
          <li>Error toasts should appear in the top-right corner</li>
          <li>Use the health check buttons to verify service status</li>
          <li>Errors will auto-dismiss after 10-15 seconds</li>
        </ul>
      </div>
    </div>
  );
} 