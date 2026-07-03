import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

const globalForDb = globalThis as unknown as {
  sqlite: Database.Database | undefined;
};

export const sqlite =
  globalForDb.sqlite ?? new Database(path.join(process.cwd(), 'sqlite.db'));

if (process.env.NODE_ENV !== 'production') globalForDb.sqlite = sqlite;

sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });