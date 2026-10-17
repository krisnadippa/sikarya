import { NextRequest, NextResponse } from 'next/server';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitBucket>();

// Blacklist of automated attack scanners & vulnerability exploitation tools
const BLOCKED_BOT_AGENTS = [
  'sqlmap',
  'nikto',
  'acunetix',
  'havij',
  'wpscan',
  'masscan',
  'zgrab',
  'nuclei',
  'nmap',
  'dirbuster',
  'gobuster',
];

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_SEARCH_REQ = 40;              // Search queries: max 40/min
const MAX_MUTATION_REQ = 30;            // Mutation (POST/PUT/DELETE): max 30/min
const MAX_GENERAL_REQ = 120;            // Read APIs: max 120/min

let lastCleanup = Date.now();

function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup > 30000) {
    lastCleanup = now;
    for (const [key, bucket] of rateLimitMap.entries()) {
      if (bucket.resetAt < now) {
        rateLimitMap.delete(key);
      }
    }
  }
}

function checkRateLimit(key: string, maxRequests: number): { allowed: boolean; remaining: number; resetInSec: number } {
  cleanupExpired();
  const now = Date.now();
  let bucket = rateLimitMap.get(key);

  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(key, bucket);
    return { allowed: true, remaining: maxRequests - 1, resetInSec: 60 };
  }

  bucket.count += 1;
  const remaining = Math.max(0, maxRequests - bucket.count);
  const resetInSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

  if (bucket.count > maxRequests) {
    return { allowed: false, remaining: 0, resetInSec };
  }

  return { allowed: true, remaining, resetInSec };
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();

  // 1. Bot Scanner Filtering
  const isMaliciousBot = BLOCKED_BOT_AGENTS.some((bot) => userAgent.includes(bot));
  if (isMaliciousBot) {
    return new NextResponse('Access Denied by Security Policy', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // 2. Protect Admin Dashboard Pages
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('sikarya_access_token')?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // 3. API Rate Limiting & Anti-Flooding
  if (pathname.startsWith('/api/')) {
    // Resolve client IP (supporting Vercel / Cloudflare / reverse proxy headers)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = (forwarded ? forwarded.split(',')[0].trim() : realIp) || '127.0.0.1';

    let maxLimit = MAX_GENERAL_REQ;
    let limitType = 'general';

    if (pathname.includes('/search')) {
      maxLimit = MAX_SEARCH_REQ;
      limitType = 'search';
    } else if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      maxLimit = MAX_MUTATION_REQ;
      limitType = 'mutation';
    }

    const rateKey = `${ip}:${limitType}:${pathname}`;
    const { allowed, remaining, resetInSec } = checkRateLimit(rateKey, maxLimit);

    if (!allowed) {
      const rateResponse = NextResponse.json(
        {
          detail: 'Terlalu banyak permintaan (Rate limit exceeded). Mohon tunggu sejenak sebelum mencoba kembali.',
          retry_after_seconds: resetInSec,
        },
        { status: 429 }
      );
      rateResponse.headers.set('Retry-After', resetInSec.toString());
      rateResponse.headers.set('X-RateLimit-Limit', maxLimit.toString());
      rateResponse.headers.set('X-RateLimit-Remaining', '0');
      rateResponse.headers.set('X-RateLimit-Reset', resetInSec.toString());
      return applySecurityHeaders(rateResponse);
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', maxLimit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    return applySecurityHeaders(response);
  }

  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
  ],
};
