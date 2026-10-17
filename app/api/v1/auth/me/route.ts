import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/auth-server';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ detail: 'Autentikasi diperlukan.' }, { status: 401 });
  }
  return NextResponse.json(user);
}
