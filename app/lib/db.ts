import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_wBUnATKx3b6m@ep-odd-heart-b4vncp4k-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";

export const sql = neon(databaseUrl);
