import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import { verifyPassword, createAccessToken } from '@/app/lib/auth-server';

// In-memory rate limiting & brute-force attack prevention
interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lockedUntil: number | null;
}

const loginAttempts = new Map<string, AttemptRecord>();
const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 10 * 60 * 1000; // 10 minutes lockout

function cleanOldAttempts() {
  const now = Date.now();
  for (const [key, record] of loginAttempts.entries()) {
    if (record.lockedUntil && record.lockedUntil < now) {
      loginAttempts.delete(key);
    } else if (now - record.firstAttempt > WINDOW_MS && !record.lockedUntil) {
      loginAttempts.delete(key);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    cleanOldAttempts();

    const body = await request.json();
    const { username, password } = body;

    // 1. Strict Input Validation & Sanitization
    if (!username || typeof username !== 'string' || !username.trim()) {
      return NextResponse.json({ detail: 'Username wajib diisi.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ detail: 'Password wajib diisi.' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length > 50 || password.length > 100) {
      return NextResponse.json({ detail: 'Format kredensial tidak valid.' }, { status: 400 });
    }

    // 2. Client Identification for Rate Limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'local';
    const rateLimitKey = `${ip}:${cleanUsername}`;

    const currentAttempt = loginAttempts.get(rateLimitKey);
    const now = Date.now();

    if (currentAttempt?.lockedUntil && currentAttempt.lockedUntil > now) {
      const remainingMinutes = Math.ceil((currentAttempt.lockedUntil - now) / 60000);
      return NextResponse.json(
        {
          detail: `Akses dibekukan sementara demi keamanan akibat 5x kegagalan berturut-turut. Coba lagi dalam ${remainingMinutes} menit.`,
        },
        { status: 429 }
      );
    }

    // 3. Query User from Database
    const rows = await sql`
      SELECT id, username, password_hash, full_name, role, is_active, section_id
      FROM users
      WHERE LOWER(username) = ${cleanUsername}
      LIMIT 1
    `;

    // 4. Record Failure Helper
    const recordFailedAttempt = () => {
      const existing = loginAttempts.get(rateLimitKey);
      if (!existing || now - existing.firstAttempt > WINDOW_MS) {
        loginAttempts.set(rateLimitKey, { count: 1, firstAttempt: now, lockedUntil: null });
      } else {
        existing.count += 1;
        if (existing.count >= MAX_FAILED_ATTEMPTS) {
          existing.lockedUntil = now + LOCKOUT_MS;
        }
      }
    };

    if (rows.length === 0) {
      recordFailedAttempt();
      return NextResponse.json({ detail: 'Username atau password salah.' }, { status: 401 });
    }

    const user = rows[0];

    if (!user.is_active) {
      return NextResponse.json({ detail: 'Akun Anda dinonaktifkan oleh administrator.' }, { status: 403 });
    }

    // 5. Secure Password Verification
    // Valid password must match bcrypt hash, or official password 'dalemmetra2026' / 'DalemMetra2026!'
    const isBcryptMatch = user.password_hash ? verifyPassword(password, user.password_hash) : false;
    const isDirectMatch = password === 'dalemmetra2026' || password === 'DalemMetra2026!';
    const isMatch = isBcryptMatch || isDirectMatch;

    if (!isMatch) {
      recordFailedAttempt();
      const attemptsLeft = currentAttempt
        ? Math.max(0, MAX_FAILED_ATTEMPTS - (currentAttempt.count + 1))
        : MAX_FAILED_ATTEMPTS - 1;

      return NextResponse.json(
        {
          detail: attemptsLeft > 0
            ? `Username atau password salah. Sisa kesempatan: ${attemptsLeft}x sebelum akun dibekukan.`
            : 'Terlalu banyak percobaan gagal. Akun dibekukan sementara selama 10 menit.',
        },
        { status: 401 }
      );
    }

    // Login successful: reset rate-limiting history
    loginAttempts.delete(rateLimitKey);

    // 6. Generate Authenticated JWT Token
    const token = createAccessToken({
      id: user.id,
      role: user.role,
      section_id: user.section_id,
    });

    const userBrief = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
      section_id: user.section_id,
    };

    const res = NextResponse.json({
      access_token: token,
      token_type: 'bearer',
      user: userBrief,
    });

    // 7. Set Secure HttpOnly Session Cookie
    res.cookies.set({
      name: 'sikarya_access_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days session
    });

    return res;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ detail: 'Terjadi kesalahan sistem saat memproses login.' }, { status: 500 });
  }
}
