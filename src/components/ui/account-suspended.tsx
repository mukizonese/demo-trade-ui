'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, LogOut } from "lucide-react";

interface AccountSuspendedProps {
  userEmail: string;
  onSignOut: () => void;
}

export function AccountSuspended({ userEmail, onSignOut }: AccountSuspendedProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl text-red-600 dark:text-red-400">
            Account Suspended
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Your account has been deactivated by an administrator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Account: <span className="font-medium">{userEmail}</span></p>
            <p className="mt-2">
              If you believe this is an error, please contact support or sign in with a different account.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={onSignOut}
              variant="outline"
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                const authClientUrl = process.env.NEXT_PUBLIC_AUTH_CLIENT_URL || 'http://localhost:3001';
                window.location.href = `${authClientUrl}/signin?source=demo-trade-ui&redirectTo=${encodeURIComponent(window.location.href)}`;
              }}
            >
              Sign In with Different Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 