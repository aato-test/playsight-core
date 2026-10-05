import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../env';
import * as schema from './schema';

export const hasDatabase = Boolean(env.databaseUrl);

if (!hasDatabase) {
  console.log('[server/db] DATABASE_URL is not set. Operating with in-memory persistence and demo seed data.');
}

export const pool = hasDatabase ? new Pool({ connectionString: env.databaseUrl, max: 10 }) : (null as unknown as Pool);
export const db = (hasDatabase ? drizzle(pool, { schema }) : null) as unknown as ReturnType<typeof drizzle>;
export { schema };
