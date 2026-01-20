import { pgTable, text, uuid, timestamp, jsonb } from 'drizzle-orm/pg-core';
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

export const tableLayouts = pgTable('table_layouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  positions: jsonb('positions').$type<TablePosition[]>().notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type TableLayout = typeof tableLayouts.$inferSelect;
export type NewTableLayout = typeof tableLayouts.$inferInsert;
