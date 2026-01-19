import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const settings = sqliteTable('settings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tables: text('tables', { mode: 'json' }).$type<number[]>().notNull(),
  requestTypes: text('request_types', { mode: 'json' }).$type<string[]>().notNull(),
  soundEnabled: integer('sound_enabled', { mode: 'boolean' }).notNull().default(true),
  notificationVolume: real('notification_volume').notNull().default(0.5),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;
