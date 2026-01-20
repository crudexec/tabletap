import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes('sslmode=')
    ? undefined  // Let the connection string handle SSL
    : { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });

export type DB = typeof db;
