"use client"

import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
import { authErrorHandler } from '@/lib/auth-error-handler';

interface TradeDetail {
  symbol: string;
  action: string; // "B" for Buy, "S" for Sell
  qty: number;
  price: number;
  tradeDate: string;
  ageInDays: number;
  pnl: number;
  currentPrice: number;
}

interface TradeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  totalQty?: number;
  ltp?: number;
}

export function TradeDetailsModal({ 
  isOpen, 
  onClose, 
  symbol, 
  totalQty = 0, 
  ltp = 0 
}: TradeDetailsModalProps) {
  const [tradeDetails, setTradeDetails] = useState<TradeDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSimpleAuth();

  const fetchTradeDetails = async () => {
    if (!symbol || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Proactively check auth service health
      const isHealthy = await authErrorHandler.checkAuthApiHealth();
      if (!isHealthy) {
        console.log('🔴 [TRADE DETAILS] Auth API is down, showing error');
        const error = new Error('Authentication Service is currently unavailable');
        error.name = 'TypeError';
        authErrorHandler.handleAuthApiError(error, 'trade-details-fetch');
        return;
      }

      // Fetch real trade details from the API
      const hosturl = process.env.NEXT_PUBLIC_TRADING_API_URL;
      if (!hosturl) {
        throw new Error('Trading API URL is not configured');
      }

      const response = await fetch(`${hosturl}/tradingzone/holdings/my/trades/${symbol}`, {
        credentials: 'include' // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔍 [TRADE DETAILS] Fetched trade details:', data);
      
      // Transform the data to match our interface
      const transformedTrades: TradeDetail[] = data.map((trade: any) => ({
        symbol: trade.symbol,
        action: trade.action,
        qty: trade.qty,
        price: trade.price,
        tradeDate: trade.tradeDate,
        ageInDays: trade.ageInDays,
        pnl: trade.pnl,
        currentPrice: trade.currentPrice
      }));

      setTradeDetails(transformedTrades);
      
    } catch (err) {
      console.error('Error fetching trade details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trade details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && symbol) {
      fetchTradeDetails();
    }
  }, [isOpen, symbol, user]);

  const formatDate = (dateString: string) => {
    // Handle both timestamp and date string formats
    let date: Date;
    if (dateString.includes('T')) {
      date = new Date(dateString);
    } else {
      date = new Date(dateString + 'T00:00:00');
    }
    
    // Format as YYYY-MON-DD
    const year = date.getFullYear();
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(num);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">{symbol}</DialogTitle>
          </div>
        </DialogHeader>

        {/* Summary Information */}
        <div className="grid grid-cols-2 gap-4 mb-3 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Total Qty.</p>
            <p className="font-medium">{formatNumber(totalQty)}</p>
          </div>
          <div className="flex items-center gap-2">
            <div>
              <p className="text-sm text-gray-600">LTP</p>
              <p className="font-medium">{formatCurrency(ltp)}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchTradeDetails}
              disabled={isLoading}
              className="h-8 px-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Trade Details Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading trade details...</span>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-600">
            <p>{error}</p>
            <Button onClick={fetchTradeDetails} className="mt-2">
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              Rows 1 - {tradeDetails.length} out of {tradeDetails.length}
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Qty.</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Age (days)</TableHead>
                  <TableHead>P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tradeDetails.map((trade, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatDate(trade.tradeDate)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        trade.action === 'B' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.action}
                      </span>
                    </TableCell>
                    <TableCell>{formatNumber(trade.qty)}</TableCell>
                    <TableCell>{formatCurrency(trade.price)}</TableCell>
                    <TableCell>{trade.ageInDays}</TableCell>
                    <TableCell className={trade.pnl < 0 ? 'text-red-600' : 'text-green-600'}>
                      {formatCurrency(trade.pnl)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}


      </DialogContent>
    </Dialog>
  );
} 