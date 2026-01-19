'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

function getLocalStorageData() {
  if (typeof window === 'undefined') return null;

  try {
    const completedRequests = JSON.parse(localStorage.getItem('restaurant_completed_requests') || '[]');
    const settings = JSON.parse(localStorage.getItem('restaurant_settings') || 'null');
    const tableLayout = JSON.parse(localStorage.getItem('restaurant_table_layout') || 'null');

    // Only return data if there's actually something meaningful to migrate
    const hasData = completedRequests.length > 0 || settings !== null || tableLayout !== null;

    if (!hasData) return null;

    return {
      activeRequests: JSON.parse(localStorage.getItem('restaurant_active_requests') || '[]'),
      completedRequests,
      settings,
      tableLayout,
    };
  } catch {
    return null;
  }
}

function clearLocalStorageData() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('restaurant_active_requests');
  localStorage.removeItem('restaurant_completed_requests');
  localStorage.removeItem('restaurant_settings');
  localStorage.removeItem('restaurant_table_layout');
}

export function MigrationPrompt() {
  const [open, setOpen] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Small delay to ensure everything is loaded
    const timer = setTimeout(() => {
      const data = getLocalStorageData();
      if (data) {
        setOpen(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleMigrate = async () => {
    setMigrating(true);
    setError(null);

    try {
      const data = getLocalStorageData();
      if (!data) {
        setOpen(false);
        return;
      }

      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Migration failed');
      }

      clearLocalStorageData();
      setOpen(false);
      window.location.reload();
    } catch (err) {
      setError('Failed to migrate data. Please try again.');
      console.error('Migration error:', err);
    } finally {
      setMigrating(false);
    }
  };

  const handleSkip = () => {
    setOpen(false);
  };

  const handleSkipAndClear = () => {
    clearLocalStorageData();
    setOpen(false);
  };

  // Don't render anything until mounted on client
  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Migrate Your Data</DialogTitle>
          <DialogDescription>
            We found existing data in your browser from before you logged in.
            Would you like to migrate it to your account?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            This will import your completed requests, settings, and table layout
            configuration to your account.
          </p>
          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={handleSkipAndClear} disabled={migrating}>
            Skip & Clear
          </Button>
          <Button variant="outline" onClick={handleSkip} disabled={migrating}>
            Skip
          </Button>
          <Button onClick={handleMigrate} disabled={migrating}>
            {migrating ? 'Migrating...' : 'Migrate Data'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
