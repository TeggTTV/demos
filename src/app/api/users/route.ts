import { NextResponse } from 'next/server';
import { prisma } from '@/../utils/prisma';

export async function GET() {
	try {
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
