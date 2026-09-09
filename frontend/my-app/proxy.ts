// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. ADMIN LOGIN ROUTE HANDLING
  if (pathname === '/admin/login') {
    const adminToken =
      request.cookies.get('admin_token')?.value ||
      request.cookies.get('auth_token')?.value;

    // If already authenticated as admin, skip login and redirect to dashboard
    if (adminToken) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 2. SKIP OTHER PUBLIC ROUTES & STATIC ASSETS
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname === '/forgot-password' ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 3. ADMIN PORTAL PROTECTION (/admin/*)
  if (pathname.startsWith('/admin')) {
    const adminToken =
      request.cookies.get('admin_token')?.value ||
      request.cookies.get('auth_token')?.value;
    const userRole = request.cookies.get('user_role')?.value;

    // Reject if token is missing
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Optional: Protect high-privilege sub-routes (e.g., /admin/audit-logs) by RBAC role claim
    if (pathname.startsWith('/admin/audit-logs') && userRole !== 'super_admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    return NextResponse.next();
  }

  // 4. TENANT WORKSPACE PROTECTION (e.g. /company-a/dashboard)
  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const pathSegments = pathname.split('/').filter(Boolean);
  const tenantFromUrl = pathSegments[0];
  const userTenant = request.cookies.get('user_tenant')?.value;

  // Block cross-tenant access
  if (tenantFromUrl && userTenant && userTenant !== tenantFromUrl) {
    return NextResponse.redirect(new URL(`/${userTenant}/dashboard`, request.url));
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};