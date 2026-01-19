'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSettings, updateSettings } from '@/lib/actions/settings';

interface Settings {
  tables: number[];
  requestTypes: string[];
  soundEnabled: boolean;
  notificationVolume: number;
}

const DEFAULT_SETTINGS: Settings = {
  tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  requestTypes: ['Service', 'Bill'],
  soundEnabled: true,
  notificationVolume: 0.5,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchSettings();
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
