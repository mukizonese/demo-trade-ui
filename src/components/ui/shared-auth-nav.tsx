'use client';

import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
import { UserMenu } from "./user-menu";

interface SharedAuthNavProps {
  onSignIn?: () => void;
  onSignOut?: () => void;
  onProfile?: () => void;
  showGuestLogin?: boolean;
  className?: string;
}

// Auth is now handled by SimpleAuthContext

export function SharedAuthNav({ 
  onSignIn, 
  onSignOut, 
  onProfile, 
  showGuestLogin = true,
  className = "" 
}: SharedAuthNavProps) {
  const { user, loading } = useSimpleAuth();

  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        Loading...
      </Button>
    );
  }

  if (user) {
    return (
      <div className={className}>
        <UserMenu />
      </div>
    );
  }

  // No user logged in - show sign-in button
  const handleSignIn = () => {
    const currentUrl = window.location.href;
    const authClientUrl = process.env.NEXT_PUBLIC_AUTH_CLIENT_URL || 'http://localhost:3001';
    window.location.href = `${authClientUrl}/signin?redirectTo=${encodeURIComponent(currentUrl)}&source=demo-trade-ui`;
  };

  return (
    <div className={className}>
      <Button variant="outline" size="sm" onClick={handleSignIn}>
        <LogIn className="h-4 w-4 mr-2" />
        Sign In
      </Button>
    </div>
  );
} 