'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getActiveRequests,
  getCompletedRequests,
  createRequest,
  completeRequest,
  deleteRequest,
} from '@/lib/actions/requests';
import type { ServiceRequest } from '@/db/schema';

export function useRequests() {
  const [activeRequests, setActiveRequests] = useState<ServiceRequest[]>([]);
  const [completedRequests, setCompletedRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      const [active, completed] = await Promise.all([
        getActiveRequests(),
        getCompletedRequests(),
      ]);
      setActiveRequests(active);
      setCompletedRequests(completed);
      setError(null);
    } catch (err) {
      setError('Failed to fetch requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const create = useCallback(async (tableNumber: number, requestType: string) => {
    const newRequest = await createRequest(tableNumber, requestType);
    setActiveRequests(prev => [...prev, newRequest]);
    return newRequest;
  }, []);

  const complete = useCallback(async (id: string, elapsedTime: number) => {
    const updated = await completeRequest(id, elapsedTime);
    setActiveRequests(prev => prev.filter(r => r.id !== id));
    setCompletedRequests(prev => [updated, ...prev]);
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteRequest(id);
    setActiveRequests(prev => prev.filter(r => r.id !== id));
    setCompletedRequests(prev => prev.filter(r => r.id !== id));
  }, []);

  return {
    activeRequests,
    completedRequests,
    loading,
    error,
    create,
    complete,
    remove,
    refresh: fetchRequests,
  };
}
