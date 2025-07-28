"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWatchlist } from '@/hooks/useWatchlist';
// Auth is handled by SharedAuthNav component
import { Plus, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface WatchlistManagerProps {
  onWatchlistChange?: (watchlistId: number) => void;
  currentWatchlistId?: number;
}

export function WatchlistManager({ onWatchlistChange, currentWatchlistId = 1 }: WatchlistManagerProps) {
      // Auth is handled by SharedAuthNav component
  const { watchlists, isLoadingWatchlists, refetchWatchlists } = useWatchlist();
  const [selectedWatchlistId, setSelectedWatchlistId] = useState(currentWatchlistId);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const queryClient = useQueryClient();
  const hosturl = process.env.NEXT_PUBLIC_TRADING_API_URL;

  // Create watchlist mutation
  const createWatchlistMutation = useMutation({
    mutationFn: async (watchlistId: number) => {
      const response = await fetch(`${hosturl}/tradingzone/watchlist/my/watchlist/${watchlistId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      setIsCreateDialogOpen(false);
      setNewWatchlistName('');
    },
  });

  // Delete watchlist mutation
  const deleteWatchlistMutation = useMutation({
    mutationFn: async (watchlistId: number) => {
      const response = await fetch(`${hosturl}/tradingzone/watchlist/my/watchlist/${watchlistId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      // If we deleted the currently selected watchlist, switch to watchlist 1
      if (selectedWatchlistId === currentWatchlistId) {
        handleWatchlistChange(1);
      }
    },
  });

  // Early return for guest users - watchlist management requires authentication
  // Guest users will see an empty state or be redirected to sign in

  const handleWatchlistChange = (watchlistId: number) => {
    setSelectedWatchlistId(watchlistId);
    onWatchlistChange?.(watchlistId);
  };

  const handleCreateWatchlist = async () => {
    // Find the next available watchlist ID
    const existingIds = Object.keys(watchlists).map(key => parseInt(key.split('_')[1]));
    const nextId = Math.max(0, ...existingIds) + 1;
    
    if (nextId <= 5) {
      createWatchlistMutation.mutate(nextId);
    }
  };

  const handleDeleteWatchlist = async (watchlistId: number) => {
    deleteWatchlistMutation.mutate(watchlistId);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedWatchlistId.toString()} onValueChange={(val) => handleWatchlistChange(parseInt(val))}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Select Watchlist" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(watchlists).map(([key, symbols]) => {
            const watchlistId = parseInt(key.split('_')[1]);
            return (
              <SelectItem key={key} value={watchlistId.toString()}>
                <span>Watchlist {watchlistId}</span>
              </SelectItem>
            );
          })}
          {Object.keys(watchlists).length < 5 && (
            <SelectItem value="new" disabled>
              <div className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Create New
              </div>
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={Object.keys(watchlists).length >= 5 || createWatchlistMutation.isPending}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Watchlist</DialogTitle>
            <DialogDescription>
              Create a new watchlist to organize your favorite stocks. You can have up to 5 watchlists.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newWatchlistName}
                onChange={(e) => setNewWatchlistName(e.target.value)}
                placeholder="My Watchlist"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateWatchlist} 
              disabled={!newWatchlistName.trim() || createWatchlistMutation.isPending}
            >
              {createWatchlistMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {Object.keys(watchlists).length > 1 && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleDeleteWatchlist(selectedWatchlistId)}
          disabled={selectedWatchlistId === 1 || deleteWatchlistMutation.isPending} // Don't allow deleting the first watchlist
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
} 