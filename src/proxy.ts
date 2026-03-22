import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const session = request.cookies.get('session');

  // Protect app and onboarding routes
  if (
    request.nextUrl.pathname.startsWith('/app') ||
    request.nextUrl.pathname.startsWith('/onboarding')
  ) {
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // If attempting to access login page while having a session
  if (request.nextUrl.pathname === '/') {
    if (session) {
      return NextResponse.redirect(new URL('/app', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
