import { Database } from 'bun:sqlite';
import { env } from '@/utils/env';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema';

const sqlite = new Database(`${import.meta.dir}/../../${env.dbFileName}`);

export const db = drizzle(sqlite, { schema });
