'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { SimpleAuthProvider, useSimpleAuth } from '@/contexts/SimpleAuthContext'
import { AccountSuspended } from '@/components/ui/account-suspended'

interface ClientProvidersProps {
  children: React.ReactNode
}

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, accountSuspended, signOut } = useSimpleAuth();

  // Show suspended page if account is suspended
  if (accountSuspended && user) {
    return (
      <AccountSuspended 
        userEmail={user.email} 
        onSignOut={signOut}
      />
    );
  }

  return <>{children}</>;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Enable retries for service unavailability (502, 503, 504)
        retry: (failureCount, error) => {
          // Don't retry if it's a 4xx error (client error)
          if (error && typeof error === 'object' && 'status' in error) {
            const status = (error as any).status;
            if (status >= 400 && status < 500) {
              return false;
            }
          }
          
          // Retry up to 3 times for 5xx errors (server errors)
          return failureCount < 3;
        },
        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Disable refetching during static generation
        refetchOnWindowFocus: false,
        // Disable refetching on mount during static generation
        refetchOnMount: false,
      },
      mutations: {
        // Enable retries for mutations too
        retry: (failureCount, error) => {
          if (error && typeof error === 'object' && 'status' in error) {
            const status = (error as any).status;
            if (status >= 400 && status < 500) {
              return false;
            }
          }
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <SimpleAuthProvider>
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </SimpleAuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
} 