import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for route protection
 * Protects all routes under /(dashboard)
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get session token from cookies
    const sessionToken = request.cookies.get("better-auth.session_token")?.value;

    // Protected routes pattern
    const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.match(/^\/(dashboard)/);

    // Auth routes (login, register)
    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");

    // If accessing protected route without session, redirect to login
    if (isProtectedRoute && !sessionToken) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If accessing auth route with session, redirect to dashboard
    if (isAuthRoute && sessionToken) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api routes
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, etc.
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).)",
    ],
};
