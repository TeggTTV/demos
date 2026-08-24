import { NextResponse } from 'next/server';
import { prisma, isDbConnected } from '@/../utils/prisma';
import { decryptPassword } from '@/../utils/encryption';
import { signToken, setSessionCookie } from '@/../utils/auth';
import { isRateLimited } from '@/../utils/rateLimit';
import { USE_MOCK_DATA } from '@/mock/mockConfig';
import { mockStore } from '@/mock/mockStore';

export async function POST(req: Request) {
	try {
		// Mock Mode Authentication
		if (USE_MOCK_DATA) {
			const body = await req.json();
			const { email, password } = body;
			if (!email) {
				return NextResponse.json({ error: 'Missing email' }, { status: 400 });
			}
			const mockRes = mockStore.login(email, password);
			if (!mockRes.success || !mockRes.user) {
				return NextResponse.json({ error: mockRes.error || 'Invalid credentials' }, { status: 401 });
			}
			const token = await signToken({
				userId: mockRes.user.id,
				email: mockRes.user.email,
				role: mockRes.user.role,
			});
			const response = NextResponse.json({ success: true, user: mockRes.user });
			setSessionCookie(response, token);
			return response;
		}
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

		// Update user's lastActive timestamp on login
		const updatedUser = await prisma.user.update({
			where: { id: user.id },
			data: { lastActive: new Date() },
		});

		// 5. Trim Response & Generate JWT
		const formattedUser = {
			id: updatedUser.id,
			email: updatedUser.email,
			name: updatedUser.name,
			avatarUrl: updatedUser.avatarUrl,
			role: updatedUser.role,
			bio: updatedUser.bio,
			major: updatedUser.major,
			year: updatedUser.year,
			phone: updatedUser.phone,
			birthday: updatedUser.birthday,
			lastActive: updatedUser.lastActive,
		};

		const token = await signToken({
			userId: updatedUser.id,
			email: updatedUser.email,
			role: updatedUser.role,
		});

		const response = NextResponse.json({ success: true, user: formattedUser });
		setSessionCookie(response, token);
		return response;
	} catch (error) {
		console.error('Login API Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
