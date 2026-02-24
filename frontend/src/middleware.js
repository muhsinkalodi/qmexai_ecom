import { NextResponse } from 'next/server';

export function middleware(request) {
    const token = request.cookies.get('qmexai_token')?.value;
    const path = request.nextUrl.pathname;

    // Route Guards
    const isProtectedRoute = path.startsWith('/profile') || path.startsWith('/checkout');
    const isAdminRoute = path.startsWith('/admin');

    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isAdminRoute) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Minimal parse of JWT payload without cryptographic verification for Edge speed
        try {
            const payloadBase64 = token.split('.')[1];
            if (!payloadBase64) throw new Error("Invalid token format");

            // atob is available in Next.js Edge runtime
            const decodedPayload = JSON.parse(atob(payloadBase64));

            if (decodedPayload.is_admin !== true) {
                // Not an admin, redirect to storefront
                return NextResponse.redirect(new URL('/', request.url));
            }
        } catch (error) {
            console.warn("Middleware JWT decode failed", error);
            // On parse failure, play it safe and enforce redirect
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/profile/:path*', '/checkout/:path*', '/admin/:path*'],
};
