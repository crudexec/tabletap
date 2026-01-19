'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ServiceRequest } from '@/lib/types';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { CalendarIcon, Clock, TrendingUp, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightsDrawerProps {
  open: boolean;
  onClose: () => void;
  completedRequests: ServiceRequest[];
}

export function InsightsDrawer({ open, onClose, completedRequests }: InsightsDrawerProps) {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(new Date().setHours(0, 0, 0, 0)),
    to: new Date(new Date().setHours(23, 59, 59, 999)),
  });

  const [analytics, setAnalytics] = useState({
    averageServiceTime: 0,
    averageBillTime: 0,
    totalRequests: 0,
    requestsByType: {} as Record<string, number>,
    requestsByTable: {} as Record<number, number>,
  });

  useEffect(() => {
    calculateAnalytics();
  }, [dateRange, completedRequests]);

  const calculateAnalytics = () => {
    if (!dateRange.from || !dateRange.to) return;

    const filteredRequests = completedRequests.filter(request => {
      const requestDate = parseISO(request.createdAt);
      return isWithinInterval(requestDate, { start: dateRange.from!, end: dateRange.to! });
    });

    const serviceRequests = filteredRequests.filter(r => r.requestType === 'Service');
    const billRequests = filteredRequests.filter(r => r.requestType === 'Bill');

    const avgServiceTime = serviceRequests.length > 0
      ? serviceRequests.reduce((sum, r) => sum + (r.elapsedTime || 0), 0) / serviceRequests.length
      : 0;

    const avgBillTime = billRequests.length > 0
      ? billRequests.reduce((sum, r) => sum + (r.elapsedTime || 0), 0) / billRequests.length
      : 0;

    const requestsByType = filteredRequests.reduce((acc, r) => {
      acc[r.requestType] = (acc[r.requestType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const requestsByTable = filteredRequests.reduce((acc, r) => {
      acc[r.tableNumber] = (acc[r.tableNumber] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    setAnalytics({
      averageServiceTime: avgServiceTime,
      averageBillTime: avgBillTime,
      totalRequests: filteredRequests.length,
      requestsByType,
      requestsByTable,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[440px] sm:w-[500px] p-0 border-0 shadow-ive-xl bg-[var(--card-solid)]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="text-headline">Insights</SheetTitle>
          <p className="text-caption mt-1">Performance analytics for your service</p>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-100px)]">
          {/* Date Range */}
          <div>
            <label className="text-footnote block mb-3">Date Range</label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'flex-1 h-11 justify-start text-left font-normal rounded-xl border-border',
                      !dateRange.from && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {dateRange.from ? format(dateRange.from, 'MMM d') : 'From'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl border-0 shadow-ive-lg" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                    className="rounded-2xl"
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'flex-1 h-11 justify-start text-left font-normal rounded-xl border-border',
                      !dateRange.to && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {dateRange.to ? format(dateRange.to, 'MMM d') : 'To'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl border-0 shadow-ive-lg" align="end">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                    className="rounded-2xl"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-secondary/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-footnote">Total Requests</span>
              </div>
              <div className="text-[28px] font-semibold tracking-tight">
                {analytics.totalRequests}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-footnote">Avg. Response</span>
              </div>
              <div className="text-[28px] font-semibold tracking-tight font-mono">
                {analytics.totalRequests > 0
                  ? formatTime(
                      Object.values(analytics.requestsByType).length > 0
                        ? completedRequests
                            .filter(r => {
                              const requestDate = parseISO(r.createdAt);
                              return dateRange.from && dateRange.to &&
                                isWithinInterval(requestDate, { start: dateRange.from, end: dateRange.to });
                            })
                            .reduce((sum, r) => sum + (r.elapsedTime || 0), 0) / analytics.totalRequests
                        : 0
                    )
                  : '0:00'}
              </div>
            </div>
          </div>

          {/* Response Times */}
          <div className="p-4 rounded-2xl bg-secondary/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Clock className="w-4 h-4" />
              <span className="text-footnote">Response Times by Type</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[15px]">Service requests</span>
                <span className="font-mono text-[15px] font-medium">
                  {formatTime(analytics.averageServiceTime)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[15px]">Bill requests</span>
                <span className="font-mono text-[15px] font-medium">
                  {formatTime(analytics.averageBillTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Request Types */}
          {Object.keys(analytics.requestsByType).length > 0 && (
            <div className="p-4 rounded-2xl bg-secondary/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <TrendingUp className="w-4 h-4" />
                <span className="text-footnote">By Request Type</span>
              </div>
              <div className="space-y-2">
                {Object.entries(analytics.requestsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-[14px]">{type}</span>
                        <span className="text-[14px] font-medium">{count}</span>
                      </div>
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${(count / analytics.totalRequests) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* By Table */}
          {Object.keys(analytics.requestsByTable).length > 0 && (
            <div className="p-4 rounded-2xl bg-secondary/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <LayoutGrid className="w-4 h-4" />
                <span className="text-footnote">By Table</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(analytics.requestsByTable)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([table, count]) => (
                    <div
                      key={table}
                      className="text-center p-2 rounded-xl bg-background"
                    >
                      <div className="text-[13px] text-muted-foreground">T{table}</div>
                      <div className="text-[17px] font-semibold">{count}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
