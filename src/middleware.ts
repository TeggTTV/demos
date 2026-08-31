import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '../utils/auth';
import { USE_MOCK_DATA } from './mock/mockConfig';

const PROTECTED_ROUTES = [
	'/groups',
	'/group',
	'/pending',
	'/profile',
	'/settings',
	'/join',
];

const AUTH_ROUTES = ['/auth/login', '/auth/register'];

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	// 1. Force HTTPS in production
	if (
		process.env.NODE_ENV === 'production' &&
		req.headers.get('x-forwarded-proto') !== 'https'
	) {
		const secureUrl = new URL(req.url);
		secureUrl.protocol = 'https:';
		return NextResponse.redirect(secureUrl, 301);
	}

	// Retrieve session cookie
	const token = req.cookies.get('session')?.value;
	const session = token ? await verifyToken(token) : null;

	// Check if accessing a protected route
	const isProtected = PROTECTED_ROUTES.some((route) =>
		pathname.startsWith(route),
	);

	// Check if accessing an authentication route (login/register)
	const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

	// Allow mock clubs and tutorial mode through middleware without login redirect
	const isMockGroup =
		pathname.startsWith('/group/club_') ||
		pathname.startsWith('/group/group_');
	const isTutorialCookie =
		req.cookies.get('deimos_tutorial_mode')?.value === 'true';

	if (
		isProtected &&
		!session &&
		!USE_MOCK_DATA &&
		!isMockGroup &&
		!isTutorialCookie
	) {
		const loginUrl = new URL('/auth/login', req.url);
		loginUrl.searchParams.set('redirect', pathname);
		return NextResponse.redirect(loginUrl);
	}

	if (isAuthRoute && session) {
		return NextResponse.redirect(new URL('/', req.url));
	}

	// 2. Set Security Headers
	const response = NextResponse.next();

	// Content Security Policy
	response.headers.set(
		'Content-Security-Policy',
		"default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' blob: data: *; connect-src 'self' https://vitals.vercel-analytics.com; worker-src 'self' blob:; object-src 'none';",
	);
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set(
		'Strict-Transport-Security',
		'max-age=31536000; includeSubDomains; preload',
	);
	response.headers.set('X-XSS-Protection', '1; mode=block');

	return response;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes) -> handled by API-specific logic to allow JSON responses
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - icon1.png, apple-icon.png, icon0.svg, sw.js, manifest.json
		 */
		'/((?!api|_next/static|_next/image|favicon.ico|icon1.png|apple-icon.png|icon0.svg|sw.js|manifest.json).*)',
	],
};
