import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db/client';
import { serviceRequests, settings, tableLayouts } from '@/db/schema';

interface MigrationData {
  completedRequests?: Array<{
    id: string;
    tableNumber: number;
    requestType: string;
    elapsedTime?: number;
    createdAt: string;
    completedAt?: string;
  }>;
  settings?: {
    tables: number[];
    requestTypes: string[];
    soundEnabled: boolean;
    notificationVolume: number;
  };
  tableLayout?: {
    id: string;
    name: string;
    positions: Array<{
      tableNumber: number;
      x: number;
      y: number;
      width: number;
      height: number;
      shape: 'square' | 'rectangle' | 'round';
      seats: number;
    }>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: MigrationData = await request.json();
    const results = { requests: 0, settings: false, layout: false };

    // Import completed requests
    if (data.completedRequests?.length) {
      for (const r of data.completedRequests) {
        await db.insert(serviceRequests).values({
          id: r.id,
          tableNumber: r.tableNumber,
          requestType: r.requestType,
          status: 'completed',
          elapsedTime: r.elapsedTime ?? null,
          createdAt: new Date(r.createdAt),
          completedAt: r.completedAt ? new Date(r.completedAt) : null,
          userId: session.user.id,
        }).onConflictDoNothing();
      }
      results.requests = data.completedRequests.length;
    }

    // Import settings
    if (data.settings) {
      await db.insert(settings).values({
        tables: data.settings.tables,
        requestTypes: data.settings.requestTypes,
        soundEnabled: data.settings.soundEnabled,
        notificationVolume: data.settings.notificationVolume,
        userId: session.user.id,
      }).onConflictDoNothing();
      results.settings = true;
    }

    // Import table layout
    if (data.tableLayout) {
      await db.insert(tableLayouts).values({
        name: data.tableLayout.name,
        positions: data.tableLayout.positions,
        userId: session.user.id,
      }).onConflictDoNothing();
      results.layout = true;
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed' },
      { status: 500 }
    );
  }
}
