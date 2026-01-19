'use client';

import { useEffect, useState } from 'react';
import { ServiceRequest } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface RequestCardProps {
  request: ServiceRequest;
  onComplete: (id: string) => void;
  onClear: (id: string) => void;
}

export function RequestCard({ request, onComplete, onClear }: RequestCardProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    if (request.status === 'completed') return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(request.createdAt).getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 100);

    return () => clearInterval(interval);
  }, [request.status, request.createdAt]);

  const getStatusConfig = () => {
    if (request.status === 'completed') {
      return {
        bg: 'bg-[var(--card-solid)]',
        border: 'border-border',
        ring: '',
        timerColor: 'text-muted-foreground',
        indicator: 'bg-[var(--status-neutral)]',
      };
    }
    if (elapsedTime < 10) {
      return {
        bg: 'bg-[var(--status-success-muted)]',
        border: 'border-[var(--status-success)]/20',
        ring: '',
        timerColor: 'text-[var(--status-success)]',
        indicator: 'bg-[var(--status-success)]',
      };
    }
    if (elapsedTime <= 15) {
      return {
        bg: 'bg-[var(--status-warning-muted)]',
        border: 'border-[var(--status-warning)]/20',
        ring: 'animate-pulse-soft',
        timerColor: 'text-[var(--status-warning)]',
        indicator: 'bg-[var(--status-warning)]',
      };
    }
    return {
      bg: 'bg-[var(--status-critical-muted)]',
      border: 'border-[var(--status-critical)]/20',
      ring: 'animate-pulse-soft',
      timerColor: 'text-[var(--status-critical)]',
      indicator: 'bg-[var(--status-critical)]',
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const displayTime = request.status === 'completed' && request.elapsedTime
    ? request.elapsedTime
    : elapsedTime;

  const status = getStatusConfig();

  const handleClick = () => {
    if (request.status === 'active') {
      onComplete(request.id);
    } else {
      onClear(request.id);
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={cn(
        'w-full text-left rounded-2xl border p-5 transition-ive cursor-pointer group relative overflow-hidden',
        status.bg,
        status.border,
        status.ring,
        isPressed ? 'scale-[0.98]' : 'scale-100',
        'hover:shadow-ive-md active:shadow-ive-sm'
      )}
    >
      {/* Status indicator dot */}
      <div className="absolute top-5 right-5">
        <div className={cn('w-2.5 h-2.5 rounded-full', status.indicator)} />
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Table & Type */}
        <div>
          <div className="text-[13px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">
            Table {request.tableNumber}
          </div>
          <div className="text-[17px] font-semibold tracking-tight">
            {request.requestType}
          </div>
        </div>

        {/* Timer - The hero element */}
        <div className={cn(
          'font-mono text-[32px] font-semibold tracking-tight leading-none',
          status.timerColor
        )}>
          {formatTime(displayTime)}
        </div>

        {/* Completion info for completed requests */}
        {request.status === 'completed' && (
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <Check className="w-3.5 h-3.5" />
            <span>Completed {format(new Date(request.completedAt!), 'HH:mm')}</span>
          </div>
        )}
      </div>

      {/* Hover hint */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 h-1 transition-ive',
        request.status === 'active' ? 'bg-[var(--status-success)]' : 'bg-destructive',
        'opacity-0 group-hover:opacity-100'
      )} />
    </button>
  );
}
