import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { sql } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'metra_karya_super_secret_key_2026_demo_only';

export interface AuthPayload {
  sub: string;
  role: string;
  section_id?: number | null;
}

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

export function verifyPassword(plain: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(plain, hash);
  } catch {
    return false;
  }
}

export function createAccessToken(user: { id: number; role: string; section_id?: number | null }): string {
  return jwt.sign(
    {
      sub: String(user.id),
      role: user.role,
      section_id: user.section_id || null,
      iss: 'sikarya-puradalemmetra',
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function getAuthUser(request: NextRequest) {
  let token: string | null = null;

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    token = request.cookies.get('sikarya_access_token')?.value || null;
  }

  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    if (!payload?.sub) return null;

    const rows = await sql`
      SELECT id, username, full_name, role, is_active, section_id
      FROM users
      WHERE id = ${parseInt(payload.sub, 10)} AND is_active = true
      LIMIT 1
    `;

    return rows.length > 0 ? rows[0] : null;
  } catch {
    return null;
  }
}
