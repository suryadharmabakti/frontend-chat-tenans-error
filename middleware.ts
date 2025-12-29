import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Izinkan akses ke API
    if (
        pathname.startsWith("/register/api") ||
        pathname.startsWith("/logout/api") ||
        pathname.startsWith("/login/api")
    ) {
        return NextResponse.next();
    }

    const token = request.cookies.get('token')?.value;
    const tenant = request.cookies.get('tenant')?.value;

    const publicPaths = ['/login', '/register'];
    const isPublicPath = publicPaths.includes(pathname);

    const isTenantPage = pathname.startsWith("/tenants");

    // Belum login dan bukan halaman publik
    if (!token && !isPublicPath && !isTenantPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Sudah login, tapi belum pilih tenant dan bukan halaman tenant
    if (token && !tenant && !isPublicPath && !isTenantPage) {
        return NextResponse.redirect(new URL('/tenants', request.url));
    }

    // Sudah login, tapi akses halaman login/register → redirect ke root
    if (token && isPublicPath) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon|.*\\..*).*)",
    ],
}
