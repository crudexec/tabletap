'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CartItem, MenuItem } from '@/lib/types';

const CART_STORAGE_KEY = 'restaurant-cart';

interface CartState {
  items: CartItem[];
  tableNumber: number | null;
}

export function useCart(tableNumber?: number) {
  const [cart, setCart] = useState<CartState>({ items: [], tableNumber: tableNumber ?? null });
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CartState;
        // Only restore cart if it's for the same table
        if (tableNumber && parsed.tableNumber === tableNumber) {
          setCart(parsed);
        } else if (tableNumber) {
          setCart({ items: [], tableNumber });
        }
      } catch {
        setCart({ items: [], tableNumber: tableNumber ?? null });
      }
    } else if (tableNumber) {
      setCart({ items: [], tableNumber });
    }
    setIsInitialized(true);
  }, [tableNumber]);

  // Save cart to localStorage
  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart, isInitialized]);

  const addItem = useCallback((menuItem: MenuItem, quantity: number = 1, notes?: string) => {
    setCart(prev => {
      const existingIndex = prev.items.findIndex(item => item.menuItemId === menuItem.id);

      if (existingIndex >= 0) {
        // Update existing item
        const newItems = [...prev.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity,
          notes: notes ?? newItems[existingIndex].notes,
        };
        return { ...prev, items: newItems };
      }

      // Add new item
      return {
        ...prev,
        items: [...prev.items, { menuItemId: menuItem.id, menuItem, quantity, notes }],
      };
    });
  }, []);

  const updateQuantity = useCallback((menuItemId: string, quantity: number) => {
    setCart(prev => {
      if (quantity <= 0) {
        return { ...prev, items: prev.items.filter(item => item.menuItemId !== menuItemId) };
      }
      return {
        ...prev,
        items: prev.items.map(item =>
          item.menuItemId === menuItemId ? { ...item, quantity } : item
        ),
      };
    });
  }, []);

  const removeItem = useCallback((menuItemId: string) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(item => item.menuItemId !== menuItemId),
    }));
  }, []);

  const updateNotes = useCallback((menuItemId: string, notes: string) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.menuItemId === menuItemId ? { ...item, notes } : item
      ),
    }));
  }, []);

  const clearCart = useCallback(() => {
    setCart(prev => ({ ...prev, items: [] }));
  }, []);

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  return {
    items: cart.items,
    tableNumber: cart.tableNumber,
    totalItems,
    totalAmount,
    addItem,
    updateQuantity,
    removeItem,
    updateNotes,
    clearCart,
    isInitialized,
  };
}
