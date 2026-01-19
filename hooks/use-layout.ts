'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTableLayout, saveTableLayout } from '@/lib/actions/layouts';
import type { TablePosition } from '@/db/schema/table-layouts';

interface TableLayout {
  id: string;
  name: string;
  positions: TablePosition[];
}

const DEFAULT_LAYOUT: TableLayout = {
  id: 'default',
  name: 'Main Dining Room',
  positions: [
    { tableNumber: 1, x: 50, y: 50, width: 80, height: 80, shape: 'square', seats: 4 },
    { tableNumber: 2, x: 180, y: 50, width: 80, height: 80, shape: 'square', seats: 4 },
    { tableNumber: 3, x: 310, y: 50, width: 80, height: 80, shape: 'square', seats: 4 },
    { tableNumber: 4, x: 440, y: 50, width: 80, height: 80, shape: 'square', seats: 4 },
    { tableNumber: 5, x: 50, y: 180, width: 120, height: 80, shape: 'rectangle', seats: 6 },
    { tableNumber: 6, x: 220, y: 180, width: 120, height: 80, shape: 'rectangle', seats: 6 },
    { tableNumber: 7, x: 390, y: 180, width: 100, height: 100, shape: 'round', seats: 5 },
    { tableNumber: 8, x: 50, y: 310, width: 80, height: 80, shape: 'square', seats: 4 },
    { tableNumber: 9, x: 180, y: 310, width: 80, height: 80, shape: 'square', seats: 4 },
    { tableNumber: 10, x: 310, y: 310, width: 150, height: 80, shape: 'rectangle', seats: 8 },
  ],
};

export function useLayout() {
  const [layout, setLayout] = useState<TableLayout>(DEFAULT_LAYOUT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLayout = useCallback(async () => {
    try {
      const data = await getTableLayout();
      setLayout(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch layout');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLayout();
  }, [fetchLayout]);

  const save = useCallback(async (data: { name: string; positions: TablePosition[] }) => {
    try {
      await saveTableLayout(data);
      setLayout(prev => ({ ...prev, ...data }));
    } catch (err) {
      setError('Failed to save layout');
      console.error(err);
      throw err;
    }
  }, []);

  return {
    layout,
    loading,
    error,
    save,
    refresh: fetchLayout,
  };
}
