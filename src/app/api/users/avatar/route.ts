import { NextResponse } from 'next/server';
import { prisma, isDbConnected } from '@/../utils/prisma';
import { USE_MOCK_DATA } from '@/mock/mockConfig';
import { mockStore } from '@/mock/mockStore';

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const userId = searchParams.get('userId');

		if (!userId) {
			return NextResponse.json(
				{ error: 'Missing userId parameter' },
				{ status: 400 },
			);
		}

		if (USE_MOCK_DATA) {
			const mockUser = mockStore.getUserById(userId);
			if (mockUser && mockUser.avatarUrl) {
				return NextResponse.redirect(new URL(mockUser.avatarUrl));
			}
			return NextResponse.json({ error: 'Avatar not found' }, { status: 404 });
		}

		if (!(await isDbConnected())) {
			return NextResponse.json(
				{ error: 'Database unavailable' },
				{ status: 503 },
			);
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { avatarUrl: true },
		});

		if (!user || !user.avatarUrl) {
			return NextResponse.json(
				{ error: 'Avatar not found' },
				{ status: 404 },
			);
		}

		// Handle base64 data URLs
		if (user.avatarUrl.startsWith('data:')) {
			const matches = user.avatarUrl.match(
				/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/,
			);
			if (matches) {
				const contentType = matches[1];
				const base64Data = matches[2];
				const buffer = Buffer.from(base64Data, 'base64');

				return new Response(buffer, {
					headers: {
						'Content-Type': contentType,
						'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
					},
				});
			}
		}

		// If it's a standard HTTP URL, redirect to it
		return NextResponse.redirect(new URL(user.avatarUrl));
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Avatar GET Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function PATCH(req: Request) {
	try {
		const body = await req.json();
		const { name, avatarUrl, bio, major, year, phone, birthday, userId: bodyUserId } = body;

		if (USE_MOCK_DATA) {
			// Find first user or by bodyUserId
			const targetId = bodyUserId || mockStore.getUsers()[0]?.id;
			const updated = mockStore.updateUser(targetId, {
				name,
				avatarUrl,
				bio,
				major,
				year,
				phone,
				birthday,
			});
			return NextResponse.json({ success: true, user: updated });
		}

		return NextResponse.json({ success: true });
	} catch (error: unknown) {
		console.error('Avatar PATCH Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

