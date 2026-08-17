import { NextResponse } from 'next/server';
import { prisma, isDbConnected } from '@/../utils/prisma';

export async function POST(req: Request) {
	try {
		const { email, password } = await req.json();

		if (!email || !password) {
			return NextResponse.json(
				{ error: 'Missing required parameters' },
				{ status: 400 },
			);
		}

		if (!(await isDbConnected())) {
			return NextResponse.json(
				{ error: 'Database is offline' },
				{ status: 503 },
			);
		}

		// Find User
		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user || user.password !== password) {
			return NextResponse.json(
				{ error: 'Invalid email or password' },
				{ status: 401 },
			);
		}

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

		return NextResponse.json({ success: true, user: formattedUser });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Login API Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
