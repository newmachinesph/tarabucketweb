import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Reuse the pool across hot reloads in dev to avoid exhausting Postgres connections.
const globalForDb = globalThis as unknown as { __pgPool?: Pool };

// Keep the per-instance pool small: in serverless each warm instance holds its own
// pool, so N instances × max would otherwise race toward Postgres' connection cap.
// Front with a pooler (PgBouncer / Neon / Supabase) for higher concurrency.
const pool =
  globalForDb.__pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DB_POOL_MAX ?? 5),
  });

if (process.env.NODE_ENV !== 'production') globalForDb.__pgPool = pool;

export const db = drizzle(pool, { schema });
export { schema };
