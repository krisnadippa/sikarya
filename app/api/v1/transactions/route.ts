import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import { getAuthUser } from '@/app/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('section_id') ? parseInt(searchParams.get('section_id')!, 10) : null;
    const type = searchParams.get('type') || null;
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    let rows;
    let countRes;

    const pattern = search ? `%${search.trim()}%` : null;

    if (sectionId && type && pattern) {
      rows = await sql`
        SELECT t.id, t.section_id, t.user_id, t.date::text, t.description, t.ref_no, t.type,
               t.amount::numeric, t.balance::numeric, t.linked_transaction_id, t.receipt_file_url,
               t.created_at, t.updated_at,
               s.section_name, s.section_code,
               u.username, u.full_name, u.role
        FROM transactions t
        LEFT JOIN sections s ON t.section_id = s.id
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.section_id = ${sectionId} AND t.type = ${type}
          AND (t.description ILIKE ${pattern} OR t.ref_no ILIKE ${pattern})
        ORDER BY t.date DESC, t.id DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countRes = await sql`
        SELECT count(*) FROM transactions t
        WHERE t.section_id = ${sectionId} AND t.type = ${type}
          AND (t.description ILIKE ${pattern} OR t.ref_no ILIKE ${pattern})
      `;
    } else if (sectionId && type) {
      rows = await sql`
        SELECT t.id, t.section_id, t.user_id, t.date::text, t.description, t.ref_no, t.type,
               t.amount::numeric, t.balance::numeric, t.linked_transaction_id, t.receipt_file_url,
               t.created_at, t.updated_at,
               s.section_name, s.section_code,
               u.username, u.full_name, u.role
        FROM transactions t
        LEFT JOIN sections s ON t.section_id = s.id
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.section_id = ${sectionId} AND t.type = ${type}
        ORDER BY t.date DESC, t.id DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countRes = await sql`
        SELECT count(*) FROM transactions WHERE section_id = ${sectionId} AND type = ${type}
      `;
    } else if (sectionId && pattern) {
      rows = await sql`
        SELECT t.id, t.section_id, t.user_id, t.date::text, t.description, t.ref_no, t.type,
               t.amount::numeric, t.balance::numeric, t.linked_transaction_id, t.receipt_file_url,
               t.created_at, t.updated_at,
               s.section_name, s.section_code,
               u.username, u.full_name, u.role
        FROM transactions t
        LEFT JOIN sections s ON t.section_id = s.id
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.section_id = ${sectionId}
          AND (t.description ILIKE ${pattern} OR t.ref_no ILIKE ${pattern})
        ORDER BY t.date DESC, t.id DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countRes = await sql`
        SELECT count(*) FROM transactions t
        WHERE t.section_id = ${sectionId}
          AND (t.description ILIKE ${pattern} OR t.ref_no ILIKE ${pattern})
      `;
    } else if (sectionId) {
      rows = await sql`
        SELECT t.id, t.section_id, t.user_id, t.date::text, t.description, t.ref_no, t.type,
               t.amount::numeric, t.balance::numeric, t.linked_transaction_id, t.receipt_file_url,
               t.created_at, t.updated_at,
               s.section_name, s.section_code,
               u.username, u.full_name, u.role
        FROM transactions t
        LEFT JOIN sections s ON t.section_id = s.id
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.section_id = ${sectionId}
        ORDER BY t.date DESC, t.id DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countRes = await sql`
        SELECT count(*) FROM transactions WHERE section_id = ${sectionId}
      `;
    } else if (type) {
      rows = await sql`
        SELECT t.id, t.section_id, t.user_id, t.date::text, t.description, t.ref_no, t.type,
               t.amount::numeric, t.balance::numeric, t.linked_transaction_id, t.receipt_file_url,
               t.created_at, t.updated_at,
               s.section_name, s.section_code,
               u.username, u.full_name, u.role
        FROM transactions t
        LEFT JOIN sections s ON t.section_id = s.id
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.type = ${type}
        ORDER BY t.date DESC, t.id DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countRes = await sql`
        SELECT count(*) FROM transactions WHERE type = ${type}
      `;
    } else if (pattern) {
      rows = await sql`
        SELECT t.id, t.section_id, t.user_id, t.date::text, t.description, t.ref_no, t.type,
               t.amount::numeric, t.balance::numeric, t.linked_transaction_id, t.receipt_file_url,
               t.created_at, t.updated_at,
               s.section_name, s.section_code,
               u.username, u.full_name, u.role
        FROM transactions t
        LEFT JOIN sections s ON t.section_id = s.id
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.description ILIKE ${pattern} OR t.ref_no ILIKE ${pattern}
        ORDER BY t.date DESC, t.id DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countRes = await sql`
        SELECT count(*) FROM transactions t
        WHERE t.description ILIKE ${pattern} OR t.ref_no ILIKE ${pattern}
      `;
    } else {
      rows = await sql`
        SELECT t.id, t.section_id, t.user_id, t.date::text, t.description, t.ref_no, t.type,
               t.amount::numeric, t.balance::numeric, t.linked_transaction_id, t.receipt_file_url,
               t.created_at, t.updated_at,
               s.section_name, s.section_code,
               u.username, u.full_name, u.role
        FROM transactions t
        LEFT JOIN sections s ON t.section_id = s.id
        LEFT JOIN users u ON t.user_id = u.id
        ORDER BY t.date DESC, t.id DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countRes = await sql`
        SELECT count(*) FROM transactions
      `;
    }

    const total = parseInt(countRes[0]?.count || '0', 10);
    const total_pages = Math.ceil(total / limit) || 1;

    const items = rows.map((r: any) => ({
      id: r.id,
      section_id: r.section_id,
      user_id: r.user_id,
      date: r.date,
      description: r.description,
      ref_no: r.ref_no,
      type: r.type,
      amount: Number(r.amount),
      balance: Number(r.balance),
      linked_transaction_id: r.linked_transaction_id,
      receipt_file_url: r.receipt_file_url,
      created_at: r.created_at,
      updated_at: r.updated_at,
      section: {
        id: r.section_id,
        section_name: r.section_name,
        section_code: r.section_code,
      },
      user: {
        id: r.user_id,
        username: r.username,
        full_name: r.full_name,
        role: r.role,
      },
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
    console.error('Error getTransactions:', error);
    return NextResponse.json({ detail: 'Gagal memuat transaksi.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    let userId = authUser?.id;

    if (!userId) {
      const defaultUser = await sql`
        SELECT id, username, full_name, role FROM users WHERE role = 'bendahara_umum' LIMIT 1
      `;
      userId = defaultUser[0]?.id || 2;
    }

    const body = await request.json();
    const { section_id, date, description, type, amount, target_section_id, receipt_file_url } = body;

    if (!section_id || !date || !description || !type || !amount) {
      return NextResponse.json({ detail: 'Data transaksi tidak lengkap.' }, { status: 400 });
    }

    const parsedAmount = Number(amount);
    if (parsedAmount <= 0) {
      return NextResponse.json({ detail: 'Nominal transaksi harus lebih dari 0.' }, { status: 400 });
    }

    // 1. Get primary section
    const secRows = await sql`SELECT id, section_name, section_code FROM sections WHERE id = ${section_id} LIMIT 1`;
    if (secRows.length === 0) {
      return NextResponse.json({ detail: 'Seksi tidak ditemukan.' }, { status: 404 });
    }
    const section = secRows[0];

    // 2. Running balance
    const lastBalRows = await sql`
      SELECT balance::numeric FROM transactions WHERE section_id = ${section_id} ORDER BY id DESC LIMIT 1
    `;
    const prevBalance = lastBalRows.length > 0 ? Number(lastBalRows[0].balance) : 0;
    const newBalance = type === 'income' ? prevBalance + parsedAmount : prevBalance - parsedAmount;

    // 3. Sequential ref number
    const countRows = await sql`SELECT count(*)::int as count FROM transactions WHERE section_id = ${section_id}`;
    const nextSeq = (countRows[0]?.count || 0) + 1;
    const cleanCode = section.section_code.replace('-', '').toUpperCase();
    const isKas = cleanCode.includes('KAS');
    const ref_no = isKas
      ? `KW-${String(nextSeq).padStart(2, '0')}`
      : `${cleanCode}-${type === 'expense' ? 'NT' : 'TR'}${String(nextSeq).padStart(2, '0')}`;

    // 4. Insert Primary Transaction
    const insertedTx = await sql`
      INSERT INTO transactions (
        section_id, user_id, date, description, ref_no, type,
        amount, balance, receipt_file_url, created_at, updated_at
      ) VALUES (
        ${section_id}, ${userId}, ${date}::date, ${description}, ${ref_no}, ${type},
        ${parsedAmount}, ${newBalance}, ${receipt_file_url || null}, NOW(), NOW()
      )
      RETURNING id, section_id, user_id, date::text, description, ref_no, type,
                amount::numeric, balance::numeric, linked_transaction_id, receipt_file_url, created_at, updated_at
    `;
    const primaryTx = insertedTx[0];

    // 5. AUTO-LEDGER SYNC
    if (target_section_id && type === 'expense') {
      const targetSecRows = await sql`SELECT id, section_name, section_code FROM sections WHERE id = ${target_section_id} LIMIT 1`;
      if (targetSecRows.length > 0) {
        const targetSec = targetSecRows[0];
        const targetLastBalRows = await sql`
          SELECT balance::numeric FROM transactions WHERE section_id = ${target_section_id} ORDER BY id DESC LIMIT 1
        `;
        const targetPrevBal = targetLastBalRows.length > 0 ? Number(targetLastBalRows[0].balance) : 0;
        const targetNewBal = targetPrevBal + parsedAmount;

        const targetCountRows = await sql`SELECT count(*)::int as count FROM transactions WHERE section_id = ${target_section_id}`;
        const targetSeq = (targetCountRows[0]?.count || 0) + 1;
        const targetCleanCode = targetSec.section_code.replace('-', '').toUpperCase();
        const targetRefNo = `${targetCleanCode}-TR${String(targetSeq).padStart(2, '0')}`;

        const linkedInserted = await sql`
          INSERT INTO transactions (
            section_id, user_id, date, description, ref_no, type,
            amount, balance, linked_transaction_id, receipt_file_url, created_at, updated_at
          ) VALUES (
            ${target_section_id}, ${userId}, ${date}::date,
            ${`[Alokasi dari Kas Umum - Ref: ${primaryTx.ref_no}] ${description}`},
            ${targetRefNo}, 'income',
            ${parsedAmount}, ${targetNewBal}, ${primaryTx.id}, ${receipt_file_url || null}, NOW(), NOW()
          )
          RETURNING id
        `;

        const linkedTxId = linkedInserted[0]?.id;
        if (linkedTxId) {
          await sql`
            UPDATE transactions SET linked_transaction_id = ${linkedTxId} WHERE id = ${primaryTx.id}
          `;
          primaryTx.linked_transaction_id = linkedTxId;
        }
      }
    }

    const userRows = await sql`SELECT id, username, full_name, role FROM users WHERE id = ${userId} LIMIT 1`;
    const user = userRows[0] || null;

    const response = {
      id: primaryTx.id,
      section_id: primaryTx.section_id,
      user_id: primaryTx.user_id,
      date: primaryTx.date,
      description: primaryTx.description,
      ref_no: primaryTx.ref_no,
      type: primaryTx.type,
      amount: Number(primaryTx.amount),
      balance: Number(primaryTx.balance),
      linked_transaction_id: primaryTx.linked_transaction_id,
      receipt_file_url: primaryTx.receipt_file_url,
      created_at: primaryTx.created_at,
      updated_at: primaryTx.updated_at,
      section: {
        id: section.id,
        section_name: section.section_name,
        section_code: section.section_code,
      },
      user: user
        ? {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            role: user.role,
          }
        : null,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error createTransaction:', error);
    return NextResponse.json({ detail: error.message || 'Gagal membuat transaksi.' }, { status: 500 });
  }
}
