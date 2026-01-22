'use server';

import { auth } from '@/auth';
import { db } from '@/db/client';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const DEFAULT_SETTINGS = {
  companySlug: 'restaurant',
  tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  tableSeats: { 1: 4, 2: 4, 3: 4, 4: 4, 5: 6, 6: 6, 7: 5, 8: 4, 9: 4, 10: 8 } as Record<number, number>,
  requestTypes: ['Service', 'Bill'],
  soundEnabled: true,
  notificationVolume: 0.5,
  warningThreshold: 2,
  criticalThreshold: 5,
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
    companySlug: userSettings.companySlug,
    tables: userSettings.tables,
    tableSeats: userSettings.tableSeats ?? DEFAULT_SETTINGS.tableSeats,
    requestTypes: userSettings.requestTypes,
    soundEnabled: userSettings.soundEnabled,
    notificationVolume: userSettings.notificationVolume,
    warningThreshold: userSettings.warningThreshold ?? DEFAULT_SETTINGS.warningThreshold,
    criticalThreshold: userSettings.criticalThreshold ?? DEFAULT_SETTINGS.criticalThreshold,
  };
}

export async function updateSettings(data: {
  companySlug?: string;
  tables?: number[];
  tableSeats?: Record<number, number>;
  requestTypes?: string[];
  soundEnabled?: boolean;
  notificationVolume?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
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
