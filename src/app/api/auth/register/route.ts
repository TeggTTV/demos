import { NextResponse } from 'next/server';
import { prisma, isDbConnected } from '@/../utils/prisma';
import { encryptPassword } from '@/../utils/encryption';
import { signToken, setSessionCookie } from '@/../utils/auth';
import { isRateLimited } from '@/../utils/rateLimit';
import { validateBase64Upload } from '@/../utils/validation';

export async function POST(req: Request) {
	try {
		// 1. Rate Limiting by IP
		const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
		if (isRateLimited(`register_ip_${ip}`, 5, 5 * 60 * 1000)) {
			return NextResponse.json(
				{ error: 'Too many registration requests. Please try again later.' },
				{ status: 429 }
			);
		}

		const body = await req.json();
		const { email, name, password, role, avatarUrl, bio, major, year, botField } = body;

		// 2. Bot Honeypot Protection
		if (botField) {
			return NextResponse.json(
				{ error: 'Bot activity detected.' },
				{ status: 400 }
			);
		}

		// 3. Input Validation
		if (!email || !name || !password || !role) {
			return NextResponse.json(
				{ error: 'Missing required parameters' },
				{ status: 400 },
			);
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{ error: 'Invalid email format' },
				{ status: 400 }
			);
		}

		if (name.trim().length < 2) {
			return NextResponse.json(
				{ error: 'Name must be at least 2 characters long' },
				{ status: 400 }
			);
		}

		if (password.length < 6) {
			return NextResponse.json(
				{ error: 'Password must be at least 6 characters long' },
				{ status: 400 }
			);
		}

		// 4. Block Field Tampering
		if (role !== 'APPLICANT') {
			return NextResponse.json(
				{ error: 'Unauthorized role registration' },
				{ status: 400 }
			);
		}

		// 5. Restrict Avatar Uploads
		const avatarCheck = validateBase64Upload(avatarUrl, ['image/'], 2);
		if (!avatarCheck.isValid) {
			return NextResponse.json(
				{ error: avatarCheck.error },
				{ status: 400 }
			);
		}

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database is offline' }, { status: 503 });
		}

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return NextResponse.json(
				{ error: 'Email address already registered' },
				{ status: 409 },
			);
		}

		const encryptedPassword = encryptPassword(password);

		// Create User in MongoDB
		const user = await prisma.user.create({
			data: {
				email,
				name,
				password: encryptedPassword,
				role: 'APPLICANT', // strictly enforce APPLICANT role
				avatarUrl: avatarUrl || null,
				bio: bio || null,
				major: major || null,
				year: year || null,
				phone: null,
				lastActive: new Date(),
			},
		});

		const formattedUser = {
			id: user.id,
			email: user.email,
			name: user.name,
			avatarUrl: user.avatarUrl,
			role: user.role,
			bio: user.bio,
			major: user.major,
			year: user.year,
			phone: user.phone,
			lastActive: user.lastActive,
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
		console.error('Registration API Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
