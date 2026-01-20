import { pgTable, text, uuid, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const serviceRequests = pgTable('service_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  tableNumber: integer('table_number').notNull(),
  requestType: text('request_type').notNull(),
  status: text('status').notNull().default('active'),
  elapsedTime: integer('elapsed_time'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
}, (table) => [
  index('idx_service_requests_status').on(table.status),
  index('idx_service_requests_created_at').on(table.createdAt),
]);

export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type NewServiceRequest = typeof serviceRequests.$inferInsert;
