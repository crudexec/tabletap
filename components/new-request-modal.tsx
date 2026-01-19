'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Settings } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface NewRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (tableNumber: number, requestType: string) => void;
  settings: Settings;
  existingRequests: Array<{ tableNumber: number; requestType: string }>;
}

export function NewRequestModal({
  open,
  onClose,
  onSubmit,
  settings,
  existingRequests
}: NewRequestModalProps) {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    if (selectedTable && selectedType) {
      onSubmit(selectedTable, selectedType);
      resetAndClose();
    }
  }, [selectedTable, selectedType]);

  const resetAndClose = () => {
    setSelectedTable(null);
    setSelectedType(null);
    onClose();
  };

  const handleTableSelect = (table: number) => {
    setSelectedTable(table);
  };

  const handleTypeSelect = (type: string) => {
    if (selectedTable && !isRequestActive(selectedTable, type)) {
      setSelectedType(type);
    }
  };

  const isRequestActive = (table: number, type: string) => {
    return existingRequests.some(
      req => req.tableNumber === table && req.requestType === type
    );
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-lg p-0 gap-0 rounded-3xl border-0 shadow-ive-xl overflow-hidden bg-[var(--card-solid)]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <DialogTitle className="text-headline">New Request</DialogTitle>
          <p className="text-caption mt-1">Select a table, then choose the request type</p>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* Table Selection */}
          <div>
            <label className="text-footnote block mb-3">Table</label>
            <div className="grid grid-cols-5 gap-2">
              {settings.tables.map((table, index) => (
                <button
                  key={table}
                  onClick={() => handleTableSelect(table)}
                  className={cn(
                    'h-14 rounded-xl font-semibold text-[17px] transition-ive',
                    'border border-border hover:border-primary/30',
                    selectedTable === table
                      ? 'bg-primary text-primary-foreground border-primary shadow-ive-sm'
                      : 'bg-secondary hover:bg-secondary/80',
                    'animate-in fade-in zoom-in-95'
                  )}
                  style={{
                    animationDelay: `${index * 20}ms`,
                    animationFillMode: 'backwards',
                  }}
                >
                  {table}
                </button>
              ))}
            </div>
          </div>

          {/* Request Type Selection */}
          {selectedTable && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <label className="text-footnote block mb-3">Request Type</label>
              <div className="grid grid-cols-2 gap-2">
                {settings.requestTypes.map((type, index) => {
                  const isActive = isRequestActive(selectedTable, type);
                  return (
                    <button
                      key={type}
                      onClick={() => handleTypeSelect(type)}
                      disabled={isActive}
                      className={cn(
                        'h-16 rounded-xl font-medium text-[15px] transition-ive relative',
                        'border border-border',
                        isActive
                          ? 'bg-secondary/50 text-muted-foreground cursor-not-allowed opacity-50'
                          : 'bg-secondary hover:bg-secondary/80 hover:border-primary/30',
                        'animate-in fade-in zoom-in-95'
                      )}
                      style={{
                        animationDelay: `${index * 30}ms`,
                        animationFillMode: 'backwards',
                      }}
                    >
                      <span>{type}</span>
                      {isActive && (
                        <span className="absolute top-2 right-2">
                          <Check className="w-4 h-4 text-[var(--status-success)]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom hint */}
        <div className="px-6 py-4 bg-secondary/50 border-t border-border">
          <p className="text-caption text-center">
            {selectedTable
              ? `Table ${selectedTable} selected · Choose request type`
              : 'Tap a table number to begin'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
