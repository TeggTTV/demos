import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma, isDbConnected } from '@/../utils/prisma';
import { getSession } from '@/../utils/auth';
import { validateBase64Upload } from '@/../utils/validation';

export async function POST(req: NextRequest) {
	try {
		// 1. Enforce Server-Side Auth
		const session = await getSession(req);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await req.json();
		const { name, avatarUrl, bio, major, year, phone, birthday } = body;

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database connection offline' }, { status: 503 });
		}

		// 2. Input Validation
		if (name !== undefined && name.trim().length < 2) {
			return NextResponse.json({ error: 'Name must be at least 2 characters long' }, { status: 400 });
		}

		// 3. Restrict Avatar Uploads
		if (avatarUrl !== undefined) {
			const avatarCheck = validateBase64Upload(avatarUrl, ['image/'], 2);
			if (!avatarCheck.isValid) {
				return NextResponse.json({ error: avatarCheck.error }, { status: 400 });
			}
		}

		// 4. Update User securely based on session.userId (preventing profile tampering)
		const user = await prisma.user.update({
			where: { id: session.userId },
			data: {
				name: name !== undefined ? name.trim() : undefined,
				avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
				bio: bio !== undefined ? bio : undefined,
				major: major !== undefined ? major : undefined,
				year: year !== undefined ? year : undefined,
				phone: phone !== undefined ? phone.trim() : undefined,
				birthday: birthday !== undefined ? birthday : undefined,
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
				phone: true,
				birthday: true,
				lastActive: true,
				createdAt: true,
			},
		});

		return NextResponse.json({ success: true, user });
	} catch (error) {
		console.error('Auth API Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
