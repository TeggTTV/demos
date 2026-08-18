import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/../utils/prisma';
import { getSession } from '@/../utils/auth';

export async function GET(req: NextRequest) {
	try {
		const session = await getSession(req);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const users = await prisma.user.findMany({
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
		const cleanUsers = users.map((user) => {
			let avatarUrl = user.avatarUrl;
			if (avatarUrl && avatarUrl.startsWith('data:')) {
				avatarUrl = `/api/users/avatar?userId=${user.id}`;
			}
			return {
				...user,
				avatarUrl,
			};
		});
		return NextResponse.json({ users: cleanUsers });
	} catch (error) {
		console.error('Error fetching users:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
