'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getActiveOrders,
  updateOrderStatus,
  deleteOrder,
} from '@/lib/actions/orders';
import type { Order, OrderStatus } from '@/lib/types';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getActiveOrders();
      setOrders(data as Order[]);
      setError(null);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    // Poll for new orders every 5 seconds
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = useCallback(async (id: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(id, status);
      setOrders(prev =>
        prev.map(order =>
          order.id === id ? { ...order, status } : order
        ).filter(order =>
          // Remove completed/cancelled orders from active list
          !['completed', 'cancelled'].includes(order.status)
        )
      );
    } catch (err) {
      setError('Failed to update order status');
      throw err;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteOrder(id);
      setOrders(prev => prev.filter(order => order.id !== id));
    } catch (err) {
      setError('Failed to delete order');
      throw err;
    }
  }, []);

  // Group orders by status
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  return {
    orders,
    pendingOrders,
    preparingOrders,
    readyOrders,
    loading,
    error,
    refresh: fetchOrders,
    updateStatus,
    remove,
  };
}
