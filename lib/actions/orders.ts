'use server';

import { auth } from '@/auth';
import { db } from '@/db/client';
import { orders, orderItems, menuItems } from '@/db/schema';
import { eq, desc, and, or, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { OrderStatus, CartItem } from '@/lib/types';

// Admin Order Actions (authenticated)

export async function getOrders(status?: OrderStatus | OrderStatus[]) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  let whereClause;
  if (status) {
    if (Array.isArray(status)) {
      whereClause = inArray(orders.status, status);
    } else {
      whereClause = eq(orders.status, status);
    }
  }

  const allOrders = await db.query.orders.findMany({
    where: whereClause,
    orderBy: [desc(orders.createdAt)],
  });

  // Get items for each order
  const ordersWithItems = await Promise.all(
    allOrders.map(async (order) => {
      const items = await db.query.orderItems.findMany({
        where: eq(orderItems.orderId, order.id),
      });
      return { ...order, items };
    })
  );

  return ordersWithItems;
}

export async function getActiveOrders() {
  return getOrders(['pending', 'preparing', 'ready']);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const [order] = await db.update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();

  revalidatePath('/');
  return order;
}

export async function deleteOrder(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  await db.delete(orders)
    .where(eq(orders.id, id));

  revalidatePath('/');
}

// Public Order Actions (for guests)

export async function createOrder(data: {
  tableNumber: number;
  items: { menuItemId: string; quantity: number; notes?: string }[];
  notes?: string;
}) {
  // Validate items exist and are available
  const itemIds = data.items.map(i => i.menuItemId);
  const menuItemsList = await db.query.menuItems.findMany({
    where: and(
      inArray(menuItems.id, itemIds),
      eq(menuItems.isAvailable, true)
    ),
  });

  if (menuItemsList.length !== itemIds.length) {
    throw new Error('Some items are unavailable');
  }

  // Create a map for quick lookup
  const itemMap = new Map(menuItemsList.map(item => [item.id, item]));

  // Calculate total
  let totalAmount = 0;
  const orderItemsData = data.items.map(item => {
    const menuItem = itemMap.get(item.menuItemId)!;
    totalAmount += menuItem.price * item.quantity;
    return {
      menuItemId: item.menuItemId,
      menuItemName: menuItem.name,
      quantity: item.quantity,
      unitPrice: menuItem.price,
      notes: item.notes,
    };
  });

  // Create order
  const [order] = await db.insert(orders)
    .values({
      tableNumber: data.tableNumber,
      notes: data.notes,
      totalAmount,
      status: 'pending',
    })
    .returning();

  // Create order items
  await db.insert(orderItems)
    .values(orderItemsData.map(item => ({
      ...item,
      orderId: order.id,
    })));

  revalidatePath('/');
  return order;
}

export async function getOrdersByTable(tableNumber: number) {
  const tableOrders = await db.query.orders.findMany({
    where: and(
      eq(orders.tableNumber, tableNumber),
      or(
        eq(orders.status, 'pending'),
        eq(orders.status, 'preparing'),
        eq(orders.status, 'ready')
      )
    ),
    orderBy: [desc(orders.createdAt)],
  });

  // Get items for each order
  const ordersWithItems = await Promise.all(
    tableOrders.map(async (order) => {
      const items = await db.query.orderItems.findMany({
        where: eq(orderItems.orderId, order.id),
      });
      return { ...order, items };
    })
  );

  return ordersWithItems;
}
