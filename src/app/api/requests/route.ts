import { NextResponse } from 'next/server';
import { prisma, isDbConnected } from '@/../utils/prisma';

export async function GET() {
	try {
		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		const dbRequests = await prisma.joinRequest.findMany({
			orderBy: { createdAt: 'desc' },
		});
		return NextResponse.json({ requests: dbRequests });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Requests GET Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const { action, groupId, userId, requestId, message } = await req.json();

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		if (action === 'create') {
			if (!groupId || !userId) {
				return NextResponse.json(
					{ error: 'Missing groupId or userId' },
					{ status: 400 },
				);
			}

			const newRequest = await prisma.joinRequest.upsert({
				where: {
					groupId_userId: {
						groupId,
						userId,
					},
				},
				update: {
					message: message || '',
					status: 'PENDING',
					createdAt: new Date(),
				},
				create: {
					groupId,
					userId,
					message: message || '',
					status: 'PENDING',
				},
			});
			return NextResponse.json({ success: true, request: newRequest });
		}

		if (action === 'approve') {
			if (!requestId) {
				return NextResponse.json(
					{ error: 'Missing requestId' },
					{ status: 400 },
				);
			}

			const joinReq = await prisma.joinRequest.update({
				where: { id: requestId },
				data: { status: 'APPROVED' },
			});

			// Add to GroupMember relationships
			await prisma.groupMember.upsert({
				where: {
					groupId_userId: {
						groupId: joinReq.groupId,
						userId: joinReq.userId,
					},
				},
				update: {},
				create: {
					groupId: joinReq.groupId,
					userId: joinReq.userId,
					role: 'MEMBER',
				},
			});

			return NextResponse.json({ success: true, request: joinReq });
		}

		if (action === 'decline') {
			if (!requestId) {
				return NextResponse.json(
					{ error: 'Missing requestId' },
					{ status: 400 },
				);
			}

			const joinReq = await prisma.joinRequest.update({
				where: { id: requestId },
				data: { status: 'DECLINED' },
			});
			return NextResponse.json({ success: true, request: joinReq });
		}

		return NextResponse.json(
			{ error: 'Invalid action parameter' },
			{ status: 400 },
		);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Requests POST Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
