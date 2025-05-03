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
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /signin
     * - /signup
     * - /reset-password
     * - /change-password
     * - /account (protected route)
     * - /deport (public route)
     * - /participate (public route)
     */
    '/((?!_next/static|_next/image|favicon.ico|signin|signup|reset-password|change-password|account|deport|participate).*)',
  ],
};