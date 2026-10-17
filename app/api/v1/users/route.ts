import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import { hashPassword } from '@/app/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    let rows;
    if (role) {
      rows = await sql`
        SELECT id, username, full_name, role, is_active, section_id, created_at, updated_at
        FROM users
        WHERE role = ${role}
        ORDER BY id ASC
      `;
    } else {
      rows = await sql`
        SELECT id, username, full_name, role, is_active, section_id, created_at, updated_at
        FROM users
        ORDER BY id ASC
      `;
    }

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error getUsers:', error);
    return NextResponse.json({ detail: 'Gagal memuat daftar pengguna.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, role, full_name, section_id } = body;

    if (!username || !password || !role) {
      return NextResponse.json({ detail: 'Username, password, dan role wajib diisi.' }, { status: 400 });
    }

    // Check duplicate
    const existing = await sql`SELECT id FROM users WHERE LOWER(username) = LOWER(${username.trim()}) LIMIT 1`;
    if (existing.length > 0) {
      return NextResponse.json({ detail: 'Username sudah digunakan.' }, { status: 409 });
    }

    const hashed = hashPassword(password);

    const inserted = await sql`
      INSERT INTO users (
        username, password_hash, full_name, role, is_active, section_id, created_at, updated_at
      ) VALUES (
        ${username.trim()}, ${hashed}, ${full_name ? full_name.trim() : username.trim()},
        ${role}, true, ${section_id || null}, NOW(), NOW()
      )
      RETURNING id, username, full_name, role, is_active, section_id, created_at, updated_at
    `;

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error: any) {
    console.error('Error createUser:', error);
    return NextResponse.json({ detail: error.message || 'Gagal membuat pengguna baru.' }, { status: 500 });
  }
}
