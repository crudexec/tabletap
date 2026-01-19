'use server';

import { auth } from '@/auth';
import { db } from '@/db/client';
import { tableLayouts, type TablePosition } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const DEFAULT_POSITIONS: TablePosition[] = [
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
];

const DEFAULT_LAYOUT = {
  id: 'default',
  name: 'Main Dining Room',
  positions: DEFAULT_POSITIONS,
};

export async function getTableLayout() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const layout = await db.query.tableLayouts.findFirst({
    where: eq(tableLayouts.userId, session.user.id),
  });

  if (!layout) {
    return DEFAULT_LAYOUT;
  }

  return {
    id: layout.id,
    name: layout.name,
    positions: layout.positions,
  };
}

export async function saveTableLayout(data: {
  name: string;
  positions: TablePosition[];
}) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const existing = await db.query.tableLayouts.findFirst({
    where: eq(tableLayouts.userId, session.user.id),
  });

  if (existing) {
    const [updated] = await db.update(tableLayouts)
      .set({
        name: data.name,
        positions: data.positions,
        updatedAt: new Date(),
      })
      .where(eq(tableLayouts.id, existing.id))
      .returning();
    revalidatePath('/');
    return updated;
  } else {
    const [created] = await db.insert(tableLayouts)
      .values({
        name: data.name,
        positions: data.positions,
        userId: session.user.id,
      })
      .returning();
    revalidatePath('/');
    return created;
  }
}
