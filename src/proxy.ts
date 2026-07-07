import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Daftar route yang harus diproteksi
const protectedPaths = [
  '/dashboard',
  '/profil-desa',
  '/aspirasi-warga',
  '/whitelist-warga',
  '/akun-warga',
  '/pengaturan'
];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const hasSession = request.cookies.has('aspira_session');
  
  // Jika mengakses protected path tanpa session, redirect ke /
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // Jika sudah punya session dan mengakses halaman login (/), redirect ke /dashboard
  if (pathname === '/') {
    if (hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - logo (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|logo.*|vercel.svg).*)',
  ],
};
