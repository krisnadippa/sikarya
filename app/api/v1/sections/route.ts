import { NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';

export async function GET() {
  try {
    const rows = await sql`
      SELECT id, section_name, section_code, description, created_at
      FROM sections
      ORDER BY id ASC
    `;
    return NextResponse.json(rows, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    console.error('Error fetching sections:', error);
    return NextResponse.json({ detail: 'Gagal memuat data seksi.' }, { status: 500 });
  }
}
