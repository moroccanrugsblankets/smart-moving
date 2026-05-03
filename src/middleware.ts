import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect /admin paths to /backoffice
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const newPath = pathname.replace(/^\/admin/, '/backoffice');
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Protect /backoffice routes
  if (pathname.startsWith('/backoffice')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.redirect(new URL('/portal-access-secure', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/backoffice/:path*', '/admin/:path*', '/admin'],
};
