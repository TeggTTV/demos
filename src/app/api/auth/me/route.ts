import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma, isDbConnected } from '@/../utils/prisma';
import { getSession } from '@/../utils/auth';
import { USE_MOCK_DATA } from '@/mock/mockConfig';
import { mockStore } from '@/mock/mockStore';

export async function GET(req: NextRequest) {
	try {
		const session = await getSession(req);
		if (!session || !session.userId) {
			return NextResponse.json({ success: false, user: null }, { status: 401 });
		}

		// Mock Data Mode
		if (USE_MOCK_DATA) {
			const mockUser = mockStore.getUserById(session.userId) || mockStore.getUserByEmail(session.email);
			if (!mockUser) {
				return NextResponse.json({ success: false, user: null }, { status: 401 });
			}
			return NextResponse.json({ success: true, user: mockUser });
		}

		// Database Mode
		if (!(await isDbConnected())) {
			return NextResponse.json({ success: false, error: 'Database is offline' }, { status: 503 });
		}

		const user = await prisma.user.findUnique({
			where: { id: session.userId },
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

		if (!user) {
			return NextResponse.json({ success: false, user: null }, { status: 401 });
		}

		return NextResponse.json({ success: true, user });
	} catch (error) {
		console.error('Session Me API Error:', error);
		return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
	}
}
