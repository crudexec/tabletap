import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const serviceRequests = sqliteTable('service_requests', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tableNumber: integer('table_number').notNull(),
  requestType: text('request_type').notNull(),
  status: text('status', { enum: ['active', 'completed'] }).notNull().default('active'),
  elapsedTime: integer('elapsed_time'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
}, (table) => [
  index('idx_service_requests_status').on(table.status),
  index('idx_service_requests_created_at').on(table.createdAt),
]);

export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type NewServiceRequest = typeof serviceRequests.$inferInsert;
