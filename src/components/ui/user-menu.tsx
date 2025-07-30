'use client';

import React, { useState } from 'react';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, UserCheck, Crown } from "lucide-react";

export function UserMenu() {
  const { user, signOut } = useSimpleAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);

  if (!user) {
    return null;
  }

  // Helper function to get role display text
  const getRoleDisplayText = (role: string) => {
    switch (role) {
      case 'guest':
        return 'Guest - Basic access to public features';
      case 'trader':
        return 'Trader - Full trading access';
      case 'aitrader':
        return 'AI Trader - Advanced AI-powered trading';
      case 'admin':
        return 'Admin - Full system access';
      default:
        return role;
    }
  };

  // Helper function to check if user has specific role
  const hasRole = (role: string) => {
    return user.role === role;
  };

  // Handle role upgrade
  const handleUpgradeToTrader = async () => {
    // If this is the guest account, redirect to auth-client for sign in
    if (user?.email === 'guest@mukizone.com') {
      // Sign out the guest user and redirect to auth-client
      await signOut();
      
      // Redirect to auth-client sign-in
      const currentUrl = window.location.href;
      const authClientUrl = process.env.NEXT_PUBLIC_AUTH_CLIENT_URL;
      window.location.href = `${authClientUrl}/signin?redirectTo=${encodeURIComponent(currentUrl)}&source=demo-trade-ui`;
      return;
    }

    setIsUpgrading(true);
    try {
      const authApiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8050';
      
      const response = await fetch(`${authApiUrl}/api/auth/update-role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ role: 'trader' }),
      });

      const result = await response.json();

      if (response.ok) {
        // Refresh the page to update the user data
        window.location.reload();
      } else {
        throw new Error(result.message || 'Failed to upgrade to trader');
      }
    } catch (error) {
      console.error('Failed to upgrade to trader:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleProfile = () => {
    // Redirect to auth-client profile page
    const currentUrl = window.location.href;
    const authClientUrl = process.env.NEXT_PUBLIC_AUTH_CLIENT_URL;
    window.location.href = `${authClientUrl}/profile?redirectTo=${encodeURIComponent(currentUrl)}&source=demo-trade-ui`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <div className="flex flex-col items-start">
            <span className="text-sm">{user.email}</span>
            <span className="text-xs text-muted-foreground capitalize">
              {user.role}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.email}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {getRoleDisplayText(user.role)}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Profile Settings - Available for all users */}
        <DropdownMenuItem onClick={handleProfile}>
          <UserCheck className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        
        {/* Role-specific menu items */}
        {hasRole('guest') && (
          <DropdownMenuItem 
            onClick={handleUpgradeToTrader}
            disabled={isUpgrading}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100"
          >
            <Crown className="mr-2 h-4 w-4 text-blue-600" />
            <span>{isUpgrading ? 'Upgrading...' : 'Upgrade to Trader'}</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 