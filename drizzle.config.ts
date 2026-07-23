import { defineConfig } from 'drizzle-kit';

// Native env loading (Node 20.12+) so drizzle-kit sees DATABASE_URL without dotenv.
try {
  process.loadEnvFile('.env');
} catch {
  // .env absent (e.g. CI/prod) — rely on the ambient environment.
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
});
