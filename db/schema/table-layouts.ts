import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export interface TablePosition {
  tableNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: 'square' | 'rectangle' | 'round';
  seats: number;
}

export const tableLayouts = sqliteTable('table_layouts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  positions: text('positions', { mode: 'json' }).$type<TablePosition[]>().notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export type TableLayout = typeof tableLayouts.$inferSelect;
export type NewTableLayout = typeof tableLayouts.$inferInsert;
