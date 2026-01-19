'use server';

import { auth } from '@/auth';
import { db } from '@/db/client';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const DEFAULT_SETTINGS = {
  tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  requestTypes: ['Service', 'Bill'],
  soundEnabled: true,
  notificationVolume: 0.5,
};

export async function getSettings() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const userSettings = await db.query.settings.findFirst({
    where: eq(settings.userId, session.user.id),
  });

  if (!userSettings) {
    return DEFAULT_SETTINGS;
  }

  return {
    tables: userSettings.tables,
    requestTypes: userSettings.requestTypes,
    soundEnabled: userSettings.soundEnabled,
    notificationVolume: userSettings.notificationVolume,
  };
}

export async function updateSettings(data: {
  tables?: number[];
  requestTypes?: string[];
  soundEnabled?: boolean;
  notificationVolume?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const existing = await db.query.settings.findFirst({
    where: eq(settings.userId, session.user.id),
  });

  if (existing) {
    const [updated] = await db.update(settings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(settings.id, existing.id))
      .returning();
    revalidatePath('/');
    return updated;
  } else {
    const [created] = await db.insert(settings)
      .values({
        ...DEFAULT_SETTINGS,
        ...data,
        userId: session.user.id,
      })
      .returning();
    revalidatePath('/');
    return created;
  }
}
