'use server';

import { db } from '@/db/client';
import { serviceRequests, settings } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

async function getClientIP(): Promise<string> {
  const headersList = await headers();
  return headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         headersList.get('x-real-ip') ||
         'unknown';
}

function checkRateLimit(key: string, maxRequests = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export async function validateTableExists(tableNumber: number): Promise<boolean> {
  const allSettings = await db.select().from(settings);

  for (const s of allSettings) {
    if (s.tables.includes(tableNumber)) {
      return true;
    }
  }

  // If no settings exist yet, check against default tables (1-10)
  if (allSettings.length === 0) {
    return tableNumber >= 1 && tableNumber <= 10;
  }

  return false;
}

export async function getRequestTypesForTable(tableNumber: number): Promise<string[]> {
  const allSettings = await db.select().from(settings);

  for (const s of allSettings) {
    if (s.tables.includes(tableNumber)) {
      return s.requestTypes;
    }
  }

  // Default fallback
  return ['Service', 'Bill'];
}

export async function createPublicRequest(
  tableNumber: number,
  requestType: string
): Promise<{ success: boolean; error?: string }> {
  // Get client IP for rate limiting
  const clientIP = await getClientIP();
  const rateLimitKey = `${clientIP}-${tableNumber}`;

  if (!checkRateLimit(rateLimitKey)) {
    return {
      success: false,
      error: 'Too many requests. Please wait a moment before trying again.',
    };
  }

  // Validate table exists
  const tableExists = await validateTableExists(tableNumber);
  if (!tableExists) {
    return { success: false, error: 'Invalid table number' };
  }

  // Validate request type
  const validTypes = await getRequestTypesForTable(tableNumber);
  if (!validTypes.includes(requestType)) {
    return { success: false, error: 'Invalid request type' };
  }

  try {
    await db.insert(serviceRequests).values({
      tableNumber,
      requestType,
      status: 'active',
      userId: null, // Public request, no user associated
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to create public request:', error);
    return { success: false, error: 'Failed to create request' };
  }
}
