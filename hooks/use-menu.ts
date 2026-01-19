'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getCategories,
  getCategoriesWithItems,
  createCategory,
  updateCategory,
  deleteCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '@/lib/actions/menu';
import type { MenuCategory, MenuItem, MenuCategoryWithItems } from '@/lib/types';

export function useMenu() {
  const [categories, setCategories] = useState<MenuCategoryWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCategoriesWithItems();
      // Transform the data to match our types
      const transformed = data.map(cat => ({
        ...cat,
        items: cat.items || [],
      }));
      setCategories(transformed as MenuCategoryWithItems[]);
      setError(null);
    } catch (err) {
      setError('Failed to fetch menu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Category operations
  const addCategory = useCallback(async (data: {
    name: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
  }) => {
    try {
      await createCategory(data);
      await fetchMenu();
    } catch (err) {
      setError('Failed to create category');
      throw err;
    }
  }, [fetchMenu]);

  const editCategory = useCallback(async (id: string, data: {
    name?: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
  }) => {
    try {
      await updateCategory(id, data);
      await fetchMenu();
    } catch (err) {
      setError('Failed to update category');
      throw err;
    }
  }, [fetchMenu]);

  const removeCategory = useCallback(async (id: string) => {
    try {
      await deleteCategory(id);
      await fetchMenu();
    } catch (err) {
      setError('Failed to delete category');
      throw err;
    }
  }, [fetchMenu]);

  // Menu item operations
  const addMenuItem = useCallback(async (data: {
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    dietaryTags?: string[];
    isAvailable?: boolean;
    sortOrder?: number;
  }) => {
    try {
      await createMenuItem(data);
      await fetchMenu();
    } catch (err) {
      setError('Failed to create menu item');
      throw err;
    }
  }, [fetchMenu]);

  const editMenuItem = useCallback(async (id: string, data: {
    categoryId?: string;
    name?: string;
    description?: string;
    price?: number;
    imageUrl?: string;
    dietaryTags?: string[];
    isAvailable?: boolean;
    sortOrder?: number;
  }) => {
    try {
      await updateMenuItem(id, data);
      await fetchMenu();
    } catch (err) {
      setError('Failed to update menu item');
      throw err;
    }
  }, [fetchMenu]);

  const removeMenuItem = useCallback(async (id: string) => {
    try {
      await deleteMenuItem(id);
      await fetchMenu();
    } catch (err) {
      setError('Failed to delete menu item');
      throw err;
    }
  }, [fetchMenu]);

  return {
    categories,
    loading,
    error,
    refresh: fetchMenu,
    // Category operations
    addCategory,
    editCategory,
    removeCategory,
    // Item operations
    addMenuItem,
    editMenuItem,
    removeMenuItem,
  };
}
