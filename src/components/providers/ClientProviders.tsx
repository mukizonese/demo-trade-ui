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
        // Disable retries during static generation
        retry: false,
        // Disable refetching during static generation
        refetchOnWindowFocus: false,
        // Disable refetching on mount during static generation
        refetchOnMount: false,
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