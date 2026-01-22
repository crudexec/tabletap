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
  tables: number[];
  tableSeats: Record<number, number>;
  warningThreshold: number;
  criticalThreshold: number;
}

export function TableLayoutView({ activeRequests, onTableClick, tables, tableSeats, warningThreshold, criticalThreshold }: TableLayoutViewProps) {
  const [layout, setLayout] = useState<TableLayout>(getTableLayout());
  const [editMode, setEditMode] = useState(false);
  const [draggedTable, setDraggedTable] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync layout with settings tables and seats
  useEffect(() => {
    const savedLayout = getTableLayout();
    const existingTableNumbers = savedLayout.positions.map(p => p.tableNumber);

    // Find tables that need to be added
    const tablesToAdd = tables.filter(t => !existingTableNumbers.includes(t));

    // Find tables that need to be removed
    const tablesToRemove = existingTableNumbers.filter(t => !tables.includes(t));

    // Check if any seats have changed
    const seatsChanged = savedLayout.positions.some(p =>
      tables.includes(p.tableNumber) && tableSeats[p.tableNumber] !== undefined && p.seats !== tableSeats[p.tableNumber]
    );

    if (tablesToAdd.length > 0 || tablesToRemove.length > 0 || seatsChanged) {
      // Remove tables that are no longer in settings and update seats
      let updatedPositions = savedLayout.positions
        .filter(p => tables.includes(p.tableNumber))
        .map(p => ({
          ...p,
          seats: tableSeats[p.tableNumber] ?? p.seats,
        }));

      // Add new tables with default positions
      const shapes: Array<'square' | 'rectangle' | 'round'> = ['square', 'rectangle', 'round'];
      tablesToAdd.forEach((tableNumber, index) => {
        // Calculate position for new table based on existing tables
        const row = Math.floor((updatedPositions.length + index) / 4);
        const col = (updatedPositions.length + index) % 4;
        const seats = tableSeats[tableNumber] ?? 4;
        const newPosition: TablePosition = {
          tableNumber,
          x: 50 + col * 130,
          y: 50 + row * 130,
          width: seats > 6 ? 120 : 80,
          height: 80,
          shape: seats > 6 ? 'rectangle' : seats > 4 ? 'round' : 'square',
          seats,
        };
        updatedPositions.push(newPosition);
      });

      // Sort by table number
      updatedPositions.sort((a, b) => a.tableNumber - b.tableNumber);

      const newLayout = {
        ...savedLayout,
        positions: updatedPositions,
      };

      setLayout(newLayout);
      saveTableLayout(newLayout);
    } else {
      setLayout(savedLayout);
    }
  }, [tables, tableSeats]);

  const getTableStatus = (tableNumber: number) => {
    const requests = activeRequests.filter(r => r.tableNumber === tableNumber);
    if (requests.length === 0) return 'available';

    const now = Date.now();
    const maxElapsedSeconds = Math.max(...requests.map(r =>
      Math.floor((now - new Date(r.createdAt).getTime()) / 1000)
    ));

    const warningSeconds = warningThreshold * 60;
    const criticalSeconds = criticalThreshold * 60;

    if (maxElapsedSeconds >= criticalSeconds) return 'critical';
    if (maxElapsedSeconds >= warningSeconds) return 'warning';
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

  // Calculate seat positions around a table
  const getSeatPositions = (table: TablePosition) => {
    const seats: { x: number; y: number }[] = [];
    const seatSize = 12;
    const gap = 4;
    const centerX = table.width / 2;
    const centerY = table.height / 2;

    if (table.shape === 'round') {
      // Distribute seats evenly around the circle
      for (let i = 0; i < table.seats; i++) {
        const angle = (i * 2 * Math.PI) / table.seats - Math.PI / 2;
        const radius = Math.max(table.width, table.height) / 2 + seatSize / 2 + gap;
        seats.push({
          x: centerX + radius * Math.cos(angle) - seatSize / 2,
          y: centerY + radius * Math.sin(angle) - seatSize / 2,
        });
      }
    } else {
      // For square/rectangle, distribute along edges
      const seatsPerSide = {
        top: Math.ceil(table.seats / 4),
        bottom: Math.ceil(table.seats / 4),
        left: Math.floor((table.seats - Math.ceil(table.seats / 4) * 2) / 2),
        right: table.seats - Math.ceil(table.seats / 4) * 2 - Math.floor((table.seats - Math.ceil(table.seats / 4) * 2) / 2),
      };

      // Simpler distribution: top, bottom, then sides
      const totalSeats = table.seats;
      let placed = 0;

      // Top side
      const topSeats = Math.min(Math.ceil(totalSeats / 2), Math.floor(table.width / 25));
      for (let i = 0; i < topSeats && placed < totalSeats; i++) {
        const spacing = table.width / (topSeats + 1);
        seats.push({
          x: spacing * (i + 1) - seatSize / 2,
          y: -seatSize - gap,
        });
        placed++;
      }

      // Bottom side
      const bottomSeats = Math.min(totalSeats - placed, Math.floor(table.width / 25));
      for (let i = 0; i < bottomSeats && placed < totalSeats; i++) {
        const spacing = table.width / (bottomSeats + 1);
        seats.push({
          x: spacing * (i + 1) - seatSize / 2,
          y: table.height + gap,
        });
        placed++;
      }

      // Left side
      const leftSeats = Math.min(Math.ceil((totalSeats - placed) / 2), Math.floor(table.height / 25));
      for (let i = 0; i < leftSeats && placed < totalSeats; i++) {
        const spacing = table.height / (leftSeats + 1);
        seats.push({
          x: -seatSize - gap,
          y: spacing * (i + 1) - seatSize / 2,
        });
        placed++;
      }

      // Right side
      const rightSeats = totalSeats - placed;
      for (let i = 0; i < rightSeats && placed < totalSeats; i++) {
        const spacing = table.height / (rightSeats + 1);
        seats.push({
          x: table.width + gap,
          y: spacing * (i + 1) - seatSize / 2,
        });
        placed++;
      }
    }

    return seats;
  };

  const renderTable = (table: TablePosition, index: number) => {
    const status = getTableStatus(table.tableNumber);
    const styles = getStatusStyles(status);
    const requests = activeRequests.filter(r => r.tableNumber === table.tableNumber);
    const isBeingDragged = draggedTable === table.tableNumber;
    const seatPositions = getSeatPositions(table);

    return (
      <div
        key={table.tableNumber}
        className="absolute"
        style={{
          left: `${table.x}px`,
          top: `${table.y}px`,
          animationDelay: `${index * 30}ms`,
          animationFillMode: 'backwards',
        }}
      >
        {/* Seats */}
        {seatPositions.map((seat, i) => (
          <div
            key={i}
            className={cn(
              'absolute w-3 h-3 rounded-full border-2 transition-ive',
              status === 'available'
                ? 'bg-secondary border-border'
                : status === 'active'
                  ? 'bg-[var(--status-success-muted)] border-[var(--status-success)]/30'
                  : status === 'warning'
                    ? 'bg-[var(--status-warning-muted)] border-[var(--status-warning)]/30'
                    : 'bg-[var(--status-critical-muted)] border-[var(--status-critical)]/30'
            )}
            style={{
              left: `${seat.x}px`,
              top: `${seat.y}px`,
            }}
          />
        ))}

        {/* Table */}
        <div
          className={cn(
            'flex flex-col items-center justify-center border-2 transition-ive select-none',
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
            width: `${table.width}px`,
            height: `${table.height}px`,
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
