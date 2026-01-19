'use client';

import { useState, useRef, useEffect } from 'react';
import { TablePosition, TableLayout, getTableLayout, saveTableLayout } from '@/lib/table-layout';
import { ServiceRequest } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Pencil, Check, X } from 'lucide-react';

interface TableLayoutViewProps {
  activeRequests: ServiceRequest[];
  onTableClick: (tableNumber: number) => void;
}

export function TableLayoutView({ activeRequests, onTableClick }: TableLayoutViewProps) {
  const [layout, setLayout] = useState<TableLayout>(getTableLayout());
  const [editMode, setEditMode] = useState(false);
  const [draggedTable, setDraggedTable] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedLayout = getTableLayout();
    setLayout(savedLayout);
  }, []);

  const getTableStatus = (tableNumber: number) => {
    const requests = activeRequests.filter(r => r.tableNumber === tableNumber);
    if (requests.length === 0) return 'available';

    const now = Date.now();
    const maxElapsed = Math.max(...requests.map(r =>
      Math.floor((now - new Date(r.createdAt).getTime()) / 1000)
    ));

    if (maxElapsed > 15) return 'critical';
    if (maxElapsed > 10) return 'warning';
    return 'active';
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'available':
        return {
          bg: 'bg-[var(--card-solid)] dark:bg-[#2C2C2E]',
          border: 'border-[var(--border-strong)]',
          text: 'text-muted-foreground',
          shadow: 'shadow-ive-sm',
          ring: '',
        };
      case 'active':
        return {
          bg: 'bg-[var(--status-success-muted)]',
          border: 'border-[var(--status-success)]/50',
          text: 'text-[var(--status-success)]',
          shadow: 'shadow-ive-sm',
          ring: '',
        };
      case 'warning':
        return {
          bg: 'bg-[var(--status-warning-muted)]',
          border: 'border-[var(--status-warning)]/50',
          text: 'text-[var(--status-warning)]',
          shadow: 'shadow-ive-md',
          ring: 'animate-pulse-soft',
        };
      case 'critical':
        return {
          bg: 'bg-[var(--status-critical-muted)]',
          border: 'border-[var(--status-critical)]/50',
          text: 'text-[var(--status-critical)]',
          shadow: 'shadow-ive-md',
          ring: 'animate-pulse-soft',
        };
      default:
        return {
          bg: 'bg-[var(--card-solid)] dark:bg-[#2C2C2E]',
          border: 'border-[var(--border-strong)]',
          text: 'text-muted-foreground',
          shadow: 'shadow-ive-sm',
          ring: '',
        };
    }
  };

  const handleMouseDown = (e: React.MouseEvent, tableNumber: number) => {
    if (!editMode) {
      onTableClick(tableNumber);
      return;
    }

    const table = layout.positions.find(t => t.tableNumber === tableNumber);
    if (!table) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDraggedTable(tableNumber);
    setDragOffset({
      x: e.clientX - rect.left - table.x,
      y: e.clientY - rect.top - table.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!editMode || draggedTable === null) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newX = Math.max(0, Math.min(rect.width - 100, e.clientX - rect.left - dragOffset.x));
    const newY = Math.max(0, Math.min(rect.height - 100, e.clientY - rect.top - dragOffset.y));

    setLayout(prev => ({
      ...prev,
      positions: prev.positions.map(t =>
        t.tableNumber === draggedTable
          ? { ...t, x: newX, y: newY }
          : t
      ),
    }));
  };

  const handleMouseUp = () => {
    setDraggedTable(null);
  };

  const saveLayoutChanges = () => {
    saveTableLayout(layout);
    setEditMode(false);
  };

  const cancelEdit = () => {
    setLayout(getTableLayout());
    setEditMode(false);
  };

  const renderTable = (table: TablePosition, index: number) => {
    const status = getTableStatus(table.tableNumber);
    const styles = getStatusStyles(status);
    const requests = activeRequests.filter(r => r.tableNumber === table.tableNumber);
    const isBeingDragged = draggedTable === table.tableNumber;

    return (
      <div
        key={table.tableNumber}
        className={cn(
          'absolute flex flex-col items-center justify-center border-2 transition-ive select-none',
          styles.bg,
          styles.border,
          styles.shadow,
          styles.ring,
          editMode ? 'cursor-move' : 'cursor-pointer hover:shadow-ive-lg hover:scale-105',
          isBeingDragged && 'shadow-ive-xl scale-110 z-10',
          table.shape === 'round' && 'rounded-full',
          table.shape === 'square' && 'rounded-xl',
          table.shape === 'rectangle' && 'rounded-xl',
          'animate-in fade-in zoom-in-95'
        )}
        style={{
          left: `${table.x}px`,
          top: `${table.y}px`,
          width: `${table.width}px`,
          height: `${table.height}px`,
          animationDelay: `${index * 30}ms`,
          animationFillMode: 'backwards',
        }}
        onMouseDown={(e) => handleMouseDown(e, table.tableNumber)}
      >
        {/* Table number */}
        <span className={cn(
          'text-[15px] font-semibold',
          status === 'available' ? 'text-foreground' : styles.text
        )}>
          {table.tableNumber}
        </span>

        {/* Request types indicator */}
        {requests.length > 0 && !editMode && (
          <div className="mt-0.5 flex items-center gap-0.5">
            {requests.slice(0, 3).map((_, i) => (
              <div
                key={i}
                className={cn('w-1.5 h-1.5 rounded-full', styles.text.replace('text-', 'bg-'))}
              />
            ))}
          </div>
        )}

        {/* Edit mode info */}
        {editMode && (
          <span className="text-[10px] text-muted-foreground mt-0.5">
            {table.seats} seats
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-headline">Floor</h2>

        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <Button
                onClick={saveLayoutChanges}
                size="sm"
                className="h-9 px-4 rounded-xl bg-[var(--status-success)] hover:bg-[var(--status-success)]/90 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                onClick={cancelEdit}
                variant="ghost"
                size="sm"
                className="h-9 px-4 rounded-xl"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setEditMode(true)}
              variant="ghost"
              size="sm"
              className="h-9 px-4 rounded-xl text-muted-foreground hover:text-foreground"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Floor Plan */}
      <div
        ref={containerRef}
        className={cn(
          'relative rounded-2xl border border-border overflow-hidden transition-ive',
          'bg-gradient-to-br from-secondary/50 to-secondary/70 dark:from-[#1C1C1E] dark:to-[#0D0D0D]',
          editMode && 'border-primary/30 bg-primary/5'
        )}
        style={{ height: '420px', minWidth: '600px' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid pattern for edit mode */}
        {editMode && (
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full">
              <defs>
                <pattern id="edit-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="0.5" fill="currentColor" className="text-primary" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#edit-grid)" />
            </svg>
          </div>
        )}

        {/* Tables */}
        {layout.positions.map((table, index) => renderTable(table, index))}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-4 px-4 py-2 rounded-xl glass">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--card-solid)] border-2 border-[var(--border-strong)] shadow-sm" />
            <span className="text-[11px] text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--status-success)]" />
            <span className="text-[11px] text-muted-foreground">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--status-warning)]" />
            <span className="text-[11px] text-muted-foreground">Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--status-critical)]" />
            <span className="text-[11px] text-muted-foreground">Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}
