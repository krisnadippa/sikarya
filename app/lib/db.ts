import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL environment variable is not defined!');
  } else {
    console.warn('WARNING: DATABASE_URL is not set. Ensure .env.local contains DATABASE_URL.');
  }
}

export const sql = neon(databaseUrl || '');


