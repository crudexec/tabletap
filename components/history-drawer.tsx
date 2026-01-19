'use client';

import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ServiceRequest } from '@/lib/types';
import { format } from 'date-fns';
import { Trash2, Clock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  completedRequests: ServiceRequest[];
  onDeleteRequest: (id: string) => void;
  onClearHistory: () => void;
}

export function HistoryDrawer({
  open,
  onClose,
  completedRequests,
  onDeleteRequest,
  onClearHistory,
}: HistoryDrawerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sortedRequests = [...completedRequests].sort(
    (a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
  );

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[440px] sm:w-[500px] p-0 border-0 shadow-ive-xl bg-[var(--card-solid)]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-headline">History</SheetTitle>
              <p className="text-caption mt-1">
                {completedRequests.length} completed request{completedRequests.length !== 1 ? 's' : ''}
              </p>
            </div>
            {completedRequests.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearHistory}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto h-[calc(100vh-120px)]">
          {completedRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-subhead text-muted-foreground mb-1">No history yet</p>
              <p className="text-caption">Completed requests will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedRequests.map((request, index) => (
                <div
                  key={request.id}
                  className={cn(
                    'group p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-ive',
                    'animate-in fade-in slide-in-from-right-2'
                  )}
                  style={{
                    animationDelay: `${index * 30}ms`,
                    animationFillMode: 'backwards',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[15px] font-semibold">
                          Table {request.tableNumber}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-[15px]">{request.requestType}</span>
                      </div>

                      {/* Time info */}
                      <div className="flex items-center gap-4 text-[13px] text-muted-foreground">
                        <span>{format(new Date(request.completedAt!), 'MMM d, HH:mm')}</span>
                        <span className="flex items-center gap-1 text-[var(--status-success)]">
                          <Check className="w-3.5 h-3.5" />
                          {formatTime(request.elapsedTime || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Delete button */}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDeleteRequest(request.id)}
                      className="w-8 h-8 rounded-lg opacity-0 group-hover:opacity-100 transition-ive text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
