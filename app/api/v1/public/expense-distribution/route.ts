import { NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';

export async function GET() {
  try {
    const rows = await sql`
      SELECT s.section_name, s.section_code, COALESCE(SUM(t.amount), 0)::numeric as total_expense
      FROM sections s
      JOIN transactions t ON t.section_id = s.id
      WHERE t.type = 'expense'
      GROUP BY s.id, s.section_name, s.section_code
      ORDER BY total_expense DESC
    `;

    const data = rows.map((r: any) => ({
      section_name: r.section_name,
      section_code: r.section_code,
      amount: Number(r.total_expense),
    }));

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    });
  } catch (error: any) {
    console.error('Error fetching expense distribution:', error);
    return NextResponse.json({ detail: 'Gagal memuat distribusi pengeluaran.' }, { status: 500 });
  }
}
