import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import { getAuthUser } from '@/app/lib/auth-server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ detail: 'Autentikasi diperlukan.' }, { status: 401 });
    }

    const { id } = await params;
    const txId = parseInt(id, 10);
    const body = await request.json();

    const existingRows = await sql`SELECT * FROM transactions WHERE id = ${txId} LIMIT 1`;
    if (existingRows.length === 0) {
      return NextResponse.json({ detail: 'Transaksi tidak ditemukan.' }, { status: 404 });
    }
    const current = existingRows[0];

    // RBAC: bendahara_seksi can only update their own section transactions
    if (authUser.role === 'bendahara_seksi' && authUser.section_id && current.section_id !== authUser.section_id) {
      return NextResponse.json({ detail: 'Akses ditolak: Tidak berhak mengubah transaksi seksi lain.' }, { status: 403 });
    }

    const description = body.description ?? current.description;
    const amount = body.amount !== undefined ? Number(body.amount) : Number(current.amount);
    const date = body.date ?? current.date;
    const type = body.type ?? current.type;

    const updated = await sql`
      UPDATE transactions
      SET description = ${description},
          amount = ${amount},
          date = ${date}::date,
          type = ${type},
          updated_at = NOW()
      WHERE id = ${txId}
      RETURNING id, section_id, user_id, date::text, description, ref_no, type,
                amount::numeric, balance::numeric, linked_transaction_id, receipt_file_url, created_at, updated_at
    `;

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error('Error updateTransaction:', error);
    return NextResponse.json({ detail: 'Gagal memperbarui transaksi.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ detail: 'Autentikasi diperlukan.' }, { status: 401 });
    }

    const { id } = await params;
    const txId = parseInt(id, 10);

    const existing = await sql`SELECT id, section_id, linked_transaction_id FROM transactions WHERE id = ${txId} LIMIT 1`;
    if (existing.length === 0) {
      return NextResponse.json({ detail: 'Transaksi tidak ditemukan.' }, { status: 404 });
    }

    const current = existing[0];
    if (authUser.role === 'bendahara_seksi' && authUser.section_id && current.section_id !== authUser.section_id) {
      return NextResponse.json({ detail: 'Akses ditolak: Tidak berhak menghapus transaksi seksi lain.' }, { status: 403 });
    }

    // If there is linked transaction, unlink or delete
    const linkedId = existing[0].linked_transaction_id;
    if (linkedId) {
      await sql`UPDATE transactions SET linked_transaction_id = NULL WHERE id = ${linkedId}`;
    }

    await sql`DELETE FROM transactions WHERE id = ${txId}`;

    return NextResponse.json({ success: true, message: 'Transaksi berhasil dihapus.' });
  } catch (error: any) {
    console.error('Error deleteTransaction:', error);
    return NextResponse.json({ detail: 'Gagal menghapus transaksi.' }, { status: 500 });
  }
}
