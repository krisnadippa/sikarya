import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nama = searchParams.get('nama') || '';
    const tipe = searchParams.get('tipe') || '';
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const offset = (page - 1) * limit;

    let rows;
    let countRes;

    if (nama && tipe) {
      const pattern = `%${nama.trim()}%`;
      rows = await sql`
        SELECT p.id, p.user_id, p.date::text, p.donor_name, p.donation_type, 
               p.amount_money::numeric, p.goods_name, p.goods_quantity, p.notes, p.created_at,
               u.id as staff_id, u.username as staff_username, u.full_name as staff_full_name, u.role as staff_role
        FROM punia_donations p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.donation_type = ${tipe}
          AND (p.donor_name ILIKE ${pattern} OR p.goods_name ILIKE ${pattern})
        ORDER BY p.date DESC, p.id DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countRes = await sql`
        SELECT count(*) FROM punia_donations p
        WHERE p.donation_type = ${tipe}
          AND (p.donor_name ILIKE ${pattern} OR p.goods_name ILIKE ${pattern})
      `;
    } else if (nama) {
      const pattern = `%${nama.trim()}%`;
      rows = await sql`
        SELECT p.id, p.user_id, p.date::text, p.donor_name, p.donation_type, 
               p.amount_money::numeric, p.goods_name, p.goods_quantity, p.notes, p.created_at,
               u.id as staff_id, u.username as staff_username, u.full_name as staff_full_name, u.role as staff_role
        FROM punia_donations p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.donor_name ILIKE ${pattern} OR p.goods_name ILIKE ${pattern}
        ORDER BY p.date DESC, p.id DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countRes = await sql`
        SELECT count(*) FROM punia_donations p
        WHERE p.donor_name ILIKE ${pattern} OR p.goods_name ILIKE ${pattern}
      `;
    } else if (tipe) {
      rows = await sql`
        SELECT p.id, p.user_id, p.date::text, p.donor_name, p.donation_type, 
               p.amount_money::numeric, p.goods_name, p.goods_quantity, p.notes, p.created_at,
               u.id as staff_id, u.username as staff_username, u.full_name as staff_full_name, u.role as staff_role
        FROM punia_donations p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.donation_type = ${tipe}
        ORDER BY p.date DESC, p.id DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countRes = await sql`
        SELECT count(*) FROM punia_donations WHERE donation_type = ${tipe}
      `;
    } else {
      rows = await sql`
        SELECT p.id, p.user_id, p.date::text, p.donor_name, p.donation_type, 
               p.amount_money::numeric, p.goods_name, p.goods_quantity, p.notes, p.created_at,
               u.id as staff_id, u.username as staff_username, u.full_name as staff_full_name, u.role as staff_role
        FROM punia_donations p
        LEFT JOIN users u ON p.user_id = u.id
        ORDER BY p.date DESC, p.id DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countRes = await sql`
        SELECT count(*) FROM punia_donations
      `;
    }

    const total = parseInt(countRes[0]?.count || '0', 10);
    const total_pages = Math.ceil(total / limit) || 1;

    const items = rows.map((r: any) => ({
      id: r.id,
      user_id: r.user_id,
      date: r.date,
      donor_name: r.donor_name,
      donation_type: r.donation_type,
      amount_money: r.amount_money !== null ? Number(r.amount_money) : null,
      goods_name: r.goods_name,
      goods_quantity: r.goods_quantity,
      notes: r.notes,
      created_at: r.created_at,
      staff: r.staff_id
        ? {
            id: r.staff_id,
            username: r.staff_username,
            full_name: r.staff_full_name,
            role: r.staff_role,
          }
        : null,
    }));

    return NextResponse.json(
      {
        items,
        total,
        page,
        limit,
        total_pages,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        },
      }
    );
  } catch (error: any) {
    console.error('Error public_search_punia:', error);
    return NextResponse.json({ detail: 'Gagal mencari data punia.' }, { status: 500 });
  }
}
