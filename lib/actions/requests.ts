'use server';

import { auth } from '@/auth';
import { db } from '@/db/client';
import { serviceRequests } from '@/db/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getActiveRequests() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  return db.select().from(serviceRequests)
    .where(eq(serviceRequests.status, 'active'))
    .orderBy(desc(serviceRequests.createdAt));
}

export async function getCompletedRequests(startDate?: Date, endDate?: Date) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const conditions = [eq(serviceRequests.status, 'completed')];

  if (startDate) {
    conditions.push(gte(serviceRequests.createdAt, startDate));
  }
  if (endDate) {
    conditions.push(lte(serviceRequests.createdAt, endDate));
  }

  return db.select().from(serviceRequests)
    .where(and(...conditions))
    .orderBy(desc(serviceRequests.createdAt));
}

export async function getAllRequests() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  return db.select().from(serviceRequests)
    .orderBy(desc(serviceRequests.createdAt));
}

export async function createRequest(tableNumber: number, requestType: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const [newRequest] = await db.insert(serviceRequests).values({
    tableNumber,
    requestType,
    status: 'active',
    userId: session.user.id,
  }).returning();

  revalidatePath('/');
  return newRequest;
}

export async function completeRequest(id: string, elapsedTime: number) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const [updated] = await db.update(serviceRequests)
    .set({
      status: 'completed',
      elapsedTime,
      completedAt: new Date(),
    })
    .where(eq(serviceRequests.id, id))
    .returning();

  revalidatePath('/');
  return updated;
}

export async function deleteRequest(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  await db.delete(serviceRequests).where(eq(serviceRequests.id, id));
  revalidatePath('/');
}
