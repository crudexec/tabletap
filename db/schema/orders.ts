import { pgTable, text, uuid, integer, real, timestamp, index } from 'drizzle-orm/pg-core';
import { menuItems } from './menu';

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  tableNumber: integer('table_number').notNull(),
  status: text('status').notNull().default('pending'),
  notes: text('notes'),
  totalAmount: real('total_amount').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_orders_status').on(table.status),
  index('idx_orders_table_number').on(table.tableNumber),
  index('idx_orders_created_at').on(table.createdAt),
]);

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  menuItemId: uuid('menu_item_id').notNull().references(() => menuItems.id),
  menuItemName: text('menu_item_name').notNull(), // Store name for historical reference
  quantity: integer('quantity').notNull().default(1),
  unitPrice: real('unit_price').notNull(),
  notes: text('notes'),
}, (table) => [
  index('idx_order_items_order_id').on(table.orderId),
]);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
