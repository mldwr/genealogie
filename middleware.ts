import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Only protect the account route, leaving deport route public
  if (!session && req.nextUrl.pathname.startsWith('/account')) {
    const redirectUrl = new URL('/signin', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  // Only run middleware on the account path
  matcher: ['/account/:path*']
}; 