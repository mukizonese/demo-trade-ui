'use client';

import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { AuthServiceError, authErrorHandler } from '@/lib/auth-error-handler';

interface AuthErrorToastProps {
  error: AuthServiceError;
  onClose: () => void;
  onRetry?: () => void;
}

export function AuthErrorToast({ error, onClose, onRetry }: AuthErrorToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-hide after 10 seconds for retryable errors, 15 seconds for non-retryable
    const timeout = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, error.retryable ? 10000 : 15000);

    return () => clearTimeout(timeout);
  }, [error.retryable, onClose]);

  const getIcon = () => {
    switch (error.type) {
      case 'auth_api_down':
      case 'auth_client_down':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'mapping_failed':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'user_not_found':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (error.type) {
      case 'auth_api_down':
      case 'auth_client_down':
        return 'bg-red-50 border-red-200';
      case 'mapping_failed':
        return 'bg-orange-50 border-orange-200';
      case 'user_not_found':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  const getTextColor = () => {
    switch (error.type) {
      case 'auth_api_down':
      case 'auth_client_down':
        return 'text-red-800';
      case 'mapping_failed':
        return 'text-orange-800';
      case 'user_not_found':
        return 'text-yellow-800';
      default:
        return 'text-red-800';
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const handleContactSupport = () => {
    // Open support page or email
    window.open('mailto:support@mukizone.com?subject=Authentication Service Issue', '_blank');
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md w-full transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      <div className={`${getBackgroundColor()} border rounded-lg shadow-lg p-4`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className={`font-medium ${getTextColor()}`}>
              {error.message}
            </div>
            
            {error.details && (
              <div className="mt-1 text-sm text-gray-600">
                {error.details}
              </div>
            )}
            
            <div className="mt-3 flex space-x-2">
              {error.retryable && onRetry && (
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </button>
              )}
              
              <button
                onClick={handleContactSupport}
                className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Contact Support
              </button>
            </div>
          </div>
          
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Global error toast manager
export function AuthErrorToastManager() {
  const [errors, setErrors] = useState<AuthServiceError[]>([]);

  useEffect(() => {
    const handleError = (error: AuthServiceError) => {
      setErrors(prev => [...prev, error]);
    };

    authErrorHandler.onError(handleError);

    return () => {
      authErrorHandler.offError(handleError);
    };
  }, []);

  const removeError = (index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  };

  const retryError = (index: number) => {
    const error = errors[index];
    if (error.retryable) {
      // Trigger a page reload for retryable errors
      window.location.reload();
    }
  };

  return (
    <>
      {errors.map((error, index) => (
        <AuthErrorToast
          key={`${error.type}-${index}`}
          error={error}
          onClose={() => removeError(index)}
          onRetry={() => retryError(index)}
        />
      ))}
    </>
  );
} 