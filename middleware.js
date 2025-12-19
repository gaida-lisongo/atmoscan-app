import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('auth-token')?.value;
  console.log('Middleware - Auth Token:', token);
  const { pathname } = request.nextUrl;
  console.log('Middleware - Pathname:', pathname);

  // Pages publiques qui ne nécessitent pas d'authentification
  const publicPaths = ['/login'];
  const isPublicPath = publicPaths.includes(pathname);

  // Si pas de token et on essaie d'accéder à une page privée -> redirection vers login
  if (!token && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Si on a un token et on est sur /login -> redirection vers dashboard
  if (token && pathname === '/login') {
    const dashboardUrl = new URL('/', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Matcher pour toutes les routes sauf :
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};