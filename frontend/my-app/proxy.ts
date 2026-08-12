// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. SKIP PUBLIC ROUTES & STATIC ASSETS
  // (Added '/admin/login' so the admin login page can load publicly!)
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname === '/admin/login' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. ADMIN PORTAL PROTECTION (/admin/*)
  if (pathname.startsWith('/admin')) {
    // Check for admin-specific cookie (or auth_token / is_admin flag)
    const adminToken = request.cookies.get('admin_token')?.value || request.cookies.get('auth_token')?.value;
    const isAdmin = request.cookies.get('is_admin')?.value === 'true';

    // If no token or not an admin, send to /admin/login (NOT tenant login)
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
  }

  // 3. TENANT WORKSPACE PROTECTION (e.g. /company-a/mypage)
  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const pathSegments = pathname.split('/').filter(Boolean);
  const tenantFromUrl = pathSegments[0];
  const userTenant = request.cookies.get('user_tenant')?.value;

  // Block tenant cross-access
  if (tenantFromUrl && userTenant && userTenant !== tenantFromUrl) {
    return NextResponse.redirect(new URL(`/${userTenant}/mypage`, request.url));
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};