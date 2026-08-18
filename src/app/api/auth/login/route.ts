import { NextResponse } from 'next/server';
import { prisma, isDbConnected } from '@/../utils/prisma';
import { decryptPassword } from '@/../utils/encryption';
import { signToken, setSessionCookie } from '@/../utils/auth';
import { isRateLimited } from '@/../utils/rateLimit';

export async function POST(req: Request) {
	try {
		// 1. Get client IP for rate limiting
		const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

		if (isRateLimited(`login_ip_${ip}`, 10, 60 * 1000)) {
			return NextResponse.json(
				{ error: 'Too many requests. Please try again later.' },
				{ status: 429 }
			);
		}

		const body = await req.json();
		const { email, password, botField } = body;

		// 2. Bot Honeypot Protection
		if (botField) {
			return NextResponse.json(
				{ error: 'Bot activity detected.' },
				{ status: 400 }
			);
		}

		// 3. Input Validation
		if (!email || !password) {
			return NextResponse.json(
				{ error: 'Missing email or password' },
				{ status: 400 }
			);
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{ error: 'Invalid email format' },
				{ status: 400 }
			);
		}

		if (isRateLimited(`login_email_${email}`, 5, 60 * 1000)) {
			return NextResponse.json(
				{ error: 'Too many login attempts for this email. Please try again in a minute.' },
				{ status: 429 }
			);
		}

		if (!(await isDbConnected())) {
			return NextResponse.json(
				{ error: 'Database is offline' },
				{ status: 503 }
			);
		}

		// 4. Find User
		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user || decryptPassword(user.password) !== password) {
			return NextResponse.json(
				{ error: 'Invalid email or password' },
				{ status: 401 }
			);
		}

		// 5. Trim Response & Generate JWT
		const formattedUser = {
			id: user.id,
			email: user.email,
			name: user.name,
			avatarUrl: user.avatarUrl,
			role: user.role,
			bio: user.bio,
			major: user.major,
			year: user.year,
		};

		const token = await signToken({
			userId: user.id,
			email: user.email,
			role: user.role,
		});

		const response = NextResponse.json({ success: true, user: formattedUser });
		setSessionCookie(response, token);
		return response;
	} catch (error) {
		console.error('Login API Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
