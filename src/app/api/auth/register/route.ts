import { NextResponse } from 'next/server';
import { prisma, isDbConnected } from '@/../utils/prisma';

export async function POST(req: Request) {
	try {
		const { email, name, password, role, avatarUrl, bio, major, year } = await req.json();

		if (!email || !name || !password || !role) {
			return NextResponse.json(
				{ error: 'Missing required parameters' },
				{ status: 400 },
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

		// Create User in MongoDB
		const user = await prisma.user.create({
			data: {
				email,
				name,
				password,
				role,
				avatarUrl: avatarUrl || null,
				bio: bio || null,
				major: major || null,
				year: year || null,
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
		};

		return NextResponse.json({ success: true, user: formattedUser });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Registration API Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
