import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/../utils/prisma';
import { getSession } from '@/../utils/auth';
import { USE_MOCK_DATA } from '@/mock/mockConfig';
import { mockStore } from '@/mock/mockStore';

export async function GET(req: NextRequest) {
	try {
		const session = await getSession(req);
		if (!session) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 },
			);
		}

		if (USE_MOCK_DATA) {
			return NextResponse.json({ users: mockStore.getUsers() });
		}

		// Update calling user's lastActive timestamp
		try {
			await prisma.user.update({
				where: { id: session.userId },
				data: { lastActive: new Date() },
			});
		} catch (err) {
			console.error('Failed to update lastActive:', err);
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
				phone: true,
				birthday: true,
				lastActive: true,
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
