
// db/index.ts
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import * as schema from './schemas';

const expoDb = SQLite.openDatabaseSync('db.db');
export const db = drizzle(expoDb, { schema });