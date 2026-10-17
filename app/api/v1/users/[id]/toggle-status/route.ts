import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);

    const existing = await sql`SELECT id, is_active FROM users WHERE id = ${userId} LIMIT 1`;
    if (existing.length === 0) {
      return NextResponse.json({ detail: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    const newStatus = !existing[0].is_active;

    await sql`
      UPDATE users SET is_active = ${newStatus}, updated_at = NOW() WHERE id = ${userId}
    `;

    return NextResponse.json({ success: true, is_active: newStatus });
  } catch (error: any) {
    console.error('Error toggleUserStatus:', error);
    return NextResponse.json({ detail: 'Gagal mengubah status pengguna.' }, { status: 500 });
  }
}
