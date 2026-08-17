import { NextResponse } from 'next/server';
import { prisma, isDbConnected } from '@/../utils/prisma';

export async function POST(req: Request) {
	try {
		const { email, name, avatarUrl, bio, major, year } = await req.json();
		if (!email) {
			return NextResponse.json(
				{ error: 'Missing required email parameter' },
				{ status: 400 },
			);
		}

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database connection offline' }, { status: 503 });
		}

		const user = await prisma.user.update({
			where: { email },
			data: {
				name: name !== undefined ? name : undefined,
				avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
				bio: bio !== undefined ? bio : undefined,
				major: major !== undefined ? major : undefined,
				year: year !== undefined ? year : undefined,
			},
			select: {
				id: true,
				email: true,
				name: true,
				avatarUrl: true,
				role: true,
				bio: true,
				major: true,
				year: true,
				createdAt: true,
			},
		});

		return NextResponse.json({ success: true, user });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Auth API Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
