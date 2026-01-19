'use server';

import { auth } from '@/auth';
import { db } from '@/db/client';
import { menuCategories, menuItems } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Category Actions

export async function getCategories() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const categories = await db.query.menuCategories.findMany({
    orderBy: [asc(menuCategories.sortOrder), asc(menuCategories.name)],
  });

  return categories;
}

export async function getCategoriesWithItems() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const categories = await db.query.menuCategories.findMany({
    orderBy: [asc(menuCategories.sortOrder), asc(menuCategories.name)],
    with: {
      items: {
        orderBy: [asc(menuItems.sortOrder), asc(menuItems.name)],
      },
    },
  });

  return categories;
}

export async function createCategory(data: {
  name: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const [category] = await db.insert(menuCategories)
    .values({
      name: data.name,
      description: data.description,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    })
    .returning();

  revalidatePath('/settings');
  return category;
}

export async function updateCategory(id: string, data: {
  name?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const [category] = await db.update(menuCategories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(menuCategories.id, id))
    .returning();

  revalidatePath('/settings');
  return category;
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  await db.delete(menuCategories)
    .where(eq(menuCategories.id, id));

  revalidatePath('/settings');
}

// Menu Item Actions

export async function getMenuItems(categoryId?: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  if (categoryId) {
    return db.query.menuItems.findMany({
      where: eq(menuItems.categoryId, categoryId),
      orderBy: [asc(menuItems.sortOrder), asc(menuItems.name)],
    });
  }

  return db.query.menuItems.findMany({
    orderBy: [asc(menuItems.sortOrder), asc(menuItems.name)],
  });
}

export async function createMenuItem(data: {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  dietaryTags?: string[];
  isAvailable?: boolean;
  sortOrder?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const [item] = await db.insert(menuItems)
    .values({
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl,
      dietaryTags: data.dietaryTags,
      isAvailable: data.isAvailable ?? true,
      sortOrder: data.sortOrder ?? 0,
    })
    .returning();

  revalidatePath('/settings');
  return item;
}

export async function updateMenuItem(id: string, data: {
  categoryId?: string;
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  dietaryTags?: string[];
  isAvailable?: boolean;
  sortOrder?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const [item] = await db.update(menuItems)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(menuItems.id, id))
    .returning();

  revalidatePath('/settings');
  return item;
}

export async function deleteMenuItem(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  await db.delete(menuItems)
    .where(eq(menuItems.id, id));

  revalidatePath('/settings');
}
