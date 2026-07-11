import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const globalForDb = globalThis as unknown as {
  postgres: postgres.Sql | undefined;
};

// Use DATABASE_URL for Postgres connection
const connectionString = process.env.DATABASE_URL!;

// Cache the database connection in development. This avoids creating a new connection on every HMR update.
export const sql = globalForDb.postgres ?? postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== 'production') globalForDb.postgres = sql;

export const db = drizzle(sql, { schema });