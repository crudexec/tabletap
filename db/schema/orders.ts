import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { menuItems } from './menu';

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tableNumber: integer('table_number').notNull(),
  status: text('status', { enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'] }).notNull().default('pending'),
  notes: text('notes'),
  totalAmount: real('total_amount').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('idx_orders_status').on(table.status),
  index('idx_orders_table_number').on(table.tableNumber),
  index('idx_orders_created_at').on(table.createdAt),
]);

export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  menuItemId: text('menu_item_id').notNull().references(() => menuItems.id),
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
