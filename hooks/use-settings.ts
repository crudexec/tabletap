'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { getSettings, updateSettings } from '@/lib/actions/settings';

interface Settings {
  companySlug: string;
  tables: number[];
  tableSeats: Record<number, number>;
  requestTypes: string[];
  soundEnabled: boolean;
  notificationVolume: number;
  warningThreshold: number;
  criticalThreshold: number;
}

const DEFAULT_SETTINGS: Settings = {
  companySlug: 'restaurant',
  tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  tableSeats: { 1: 4, 2: 4, 3: 4, 4: 4, 5: 6, 6: 6, 7: 5, 8: 4, 9: 4, 10: 8 },
  requestTypes: ['Service', 'Bill'],
  soundEnabled: true,
  notificationVolume: 0.5,
  warningThreshold: 2,
  criticalThreshold: 5,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  const fetchSettings = useCallback(async () => {
    try {
      const data = await getSettings();
      setSettings(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch settings on mount and when pathname changes (navigation)
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings, pathname]);

  // Refetch settings when page becomes visible (e.g., after navigating back from settings)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchSettings();
      }
    };

    const handleFocus = () => {
      fetchSettings();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchSettings]);

  const update = useCallback(async (data: Partial<Settings>) => {
    try {
      await updateSettings(data);
      setSettings(prev => ({ ...prev, ...data }));
    } catch (err) {
      setError('Failed to update settings');
      console.error(err);
      throw err;
    }
  }, []);

  return {
    settings,
    loading,
    error,
    update,
    refresh: fetchSettings,
  };
}
