import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// This initializes the SQLite database stored in the project root
const sqlite = new Database('sqlite.db');

export const db = drizzle(sqlite, { schema });
