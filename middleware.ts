import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          return req.cookies.getAll().map(cookie => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll: (cookiesList) => {
          cookiesList.forEach((cookie) => {
            req.cookies.set({
              name: cookie.name,
              value: cookie.value,
              ...cookie.options,
            });
            res.cookies.set({
              name: cookie.name,
              value: cookie.value,
              ...cookie.options,
            });
          });
        },
      },
    }
  );

  // This will refresh the session if needed, regardless of route
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
     * - /auth/callback (auth callback route)
     */
    '/((?!_next/static|_next/image|favicon.ico|signin|signup|reset-password|change-password|auth/callback).*)',
  ],
};