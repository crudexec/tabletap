'use server';

import { db } from '@/db/client';
import { menuCategories, menuItems } from '@/db/schema';
import { eq, asc, and } from 'drizzle-orm';

// Public menu actions - no authentication required

export async function getPublicMenu() {
  // Get only active categories with available items
  const categories = await db.query.menuCategories.findMany({
    where: eq(menuCategories.isActive, true),
    orderBy: [asc(menuCategories.sortOrder), asc(menuCategories.name)],
  });

  // Get available items for each category
  const categoriesWithItems = await Promise.all(
    categories.map(async (category) => {
      const items = await db.query.menuItems.findMany({
        where: and(
          eq(menuItems.categoryId, category.id),
          eq(menuItems.isAvailable, true)
        ),
        orderBy: [asc(menuItems.sortOrder), asc(menuItems.name)],
      });
      return { ...category, items };
    })
  );

  // Filter out categories with no items
  return categoriesWithItems.filter(cat => cat.items.length > 0);
}

export async function getPublicMenuItem(id: string) {
  const item = await db.query.menuItems.findFirst({
    where: and(
      eq(menuItems.id, id),
      eq(menuItems.isAvailable, true)
    ),
  });

  return item;
}
