import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import { getAuthUser } from '@/app/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const type = searchParams.get('type') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const offset = (page - 1) * limit;

    let rows;
    let countRes;

    if (query && type) {
      const pattern = `%${query.trim()}%`;
      rows = await sql`
        SELECT p.id, p.user_id, p.date::text, p.donor_name, p.donation_type, 
               p.amount_money::numeric, p.goods_name, p.goods_quantity, p.notes, p.created_at,
               u.id as staff_id, u.username as staff_username, u.full_name as staff_full_name, u.role as staff_role
        FROM punia_donations p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.donation_type = ${type}
          AND (p.donor_name ILIKE ${pattern} OR p.goods_name ILIKE ${pattern})
        ORDER BY p.date DESC, p.id DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countRes = await sql`
        SELECT count(*) FROM punia_donations p
        WHERE p.donation_type = ${type}
          AND (p.donor_name ILIKE ${pattern} OR p.goods_name ILIKE ${pattern})
      `;
    } else if (query) {
      const pattern = `%${query.trim()}%`;
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
    } else if (type) {
      rows = await sql`
        SELECT p.id, p.user_id, p.date::text, p.donor_name, p.donation_type, 
               p.amount_money::numeric, p.goods_name, p.goods_quantity, p.notes, p.created_at,
               u.id as staff_id, u.username as staff_username, u.full_name as staff_full_name, u.role as staff_role
        FROM punia_donations p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.donation_type = ${type}
        ORDER BY p.date DESC, p.id DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countRes = await sql`
        SELECT count(*) FROM punia_donations WHERE donation_type = ${type}
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

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      total_pages,
    });
  } catch (error: any) {
    console.error('Error list_punia:', error);
    return NextResponse.json({ detail: 'Gagal memuat data punia.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ detail: 'Autentikasi petugas diperlukan untuk mencatat dana punia.' }, { status: 401 });
    }
    const userId = authUser.id;

    const body = await request.json();
    const { donor_name, donation_type, date, amount_money, goods_name, goods_quantity, notes } = body;

    if (!donor_name || !donation_type || !date) {
      return NextResponse.json({ detail: 'Data donatur dan tanggal wajib diisi.' }, { status: 400 });
    }

    if (donation_type === 'money') {
      if (!amount_money || Number(amount_money) <= 0) {
        return NextResponse.json({ detail: 'Nominal punia uang harus lebih besar dari 0.' }, { status: 400 });
      }
    } else if (donation_type === 'goods') {
      if (!goods_name || !goods_quantity) {
        return NextResponse.json({ detail: 'Nama barang dan jumlah barang wajib diisi.' }, { status: 400 });
      }
    }

    const inserted = await sql`
      INSERT INTO punia_donations (
        user_id, date, donor_name, donation_type, 
        amount_money, goods_name, goods_quantity, notes, created_at
      ) VALUES (
        ${userId}, 
        ${date}::date, 
        ${donor_name.trim()}, 
        ${donation_type}, 
        ${donation_type === 'money' ? Number(amount_money) : null}, 
        ${donation_type === 'goods' ? goods_name.trim() : null}, 
        ${donation_type === 'goods' ? goods_quantity.trim() : null}, 
        ${notes ? notes.trim() : null}, 
        NOW()
      )
      RETURNING id, user_id, date::text, donor_name, donation_type, amount_money::numeric, goods_name, goods_quantity, notes, created_at
    `;

    const row = inserted[0];

    const staffRows = await sql`
      SELECT id, username, full_name, role FROM users WHERE id = ${row.user_id} LIMIT 1
    `;
    const staff = staffRows[0] || null;

    const responseItem = {
      id: row.id,
      user_id: row.user_id,
      date: row.date,
      donor_name: row.donor_name,
      donation_type: row.donation_type,
      amount_money: row.amount_money !== null ? Number(row.amount_money) : null,
      goods_name: row.goods_name,
      goods_quantity: row.goods_quantity,
      notes: row.notes,
      created_at: row.created_at,
      staff: staff
        ? {
            id: staff.id,
            username: staff.username,
            full_name: staff.full_name,
            role: staff.role,
          }
        : null,
    };

    return NextResponse.json(responseItem, { status: 201 });
  } catch (error: any) {
    console.error('Error create_punia:', error);
    return NextResponse.json({ detail: error.message || 'Gagal menyimpan data punia.' }, { status: 500 });
  }
}
