import { pgTable, text, uuid, boolean, real, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const settings = pgTable('settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  companySlug: text('company_slug').notNull().default('restaurant'),
  tables: jsonb('tables').$type<number[]>().notNull(),
  requestTypes: jsonb('request_types').$type<string[]>().notNull(),
  soundEnabled: boolean('sound_enabled').notNull().default(true),
  notificationVolume: real('notification_volume').notNull().default(0.5),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;
