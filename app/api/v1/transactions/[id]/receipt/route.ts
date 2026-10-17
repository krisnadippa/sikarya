import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const txId = parseInt(id, 10);

    if (isNaN(txId)) {
      return NextResponse.json({ detail: 'ID transaksi tidak valid.' }, { status: 400 });
    }

    const rows = await sql`
      SELECT id, receipt_file_url FROM transactions WHERE id = ${txId} LIMIT 1
    `;

    if (rows.length === 0 || !rows[0].receipt_file_url) {
      return NextResponse.json({ detail: 'Bukti nota tidak ditemukan.' }, { status: 404 });
    }

    const fileUrl = rows[0].receipt_file_url;

    // 1. If stored as Base64 Data URL, serve as binary image with long-term HTTP caching
    if (fileUrl.startsWith('data:image/')) {
      const commaIndex = fileUrl.indexOf(',');
      if (commaIndex === -1) {
        return NextResponse.json({ detail: 'Format data gambar rusak.' }, { status: 400 });
      }

      const meta = fileUrl.slice(0, commaIndex);
      const base64Content = fileUrl.slice(commaIndex + 1);
      const mimeMatch = meta.match(/data:([^;]+)/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

      const buffer = Buffer.from(base64Content, 'base64');

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        },
      });
    }

    // 2. If stored as external full URL, redirect directly
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return NextResponse.redirect(new URL(fileUrl));
    }

    // 3. Fallback: redirect or return URL
    return NextResponse.json({ receipt_file_url: fileUrl });
  } catch (error: any) {
    console.error('Error fetching transaction receipt:', error);
    return NextResponse.json({ detail: 'Gagal memuat bukti nota.' }, { status: 500 });
  }
}
