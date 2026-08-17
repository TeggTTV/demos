import { NextResponse } from 'next/server';
import { prisma, isDbConnected } from '@/../utils/prisma';
import { sendWebPushToUsers } from '@/utils/serverPush';

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
			const targetGroup = await prisma.group.findUnique({
				where: { id: groupId },
				select: { name: true, leaderId: true, officerIds: true },
			});
			const applicant = await prisma.user.findUnique({
				where: { id: userId },
				select: { name: true },
			});

			if (targetGroup) {
				const leaderAndOfficers = Array.from(
					new Set([targetGroup.leaderId, ...(targetGroup.officerIds || [])]),
				);
				sendWebPushToUsers(leaderAndOfficers, {
					title: 'New Club Join Request',
					body: `${applicant?.name || 'A student'} applied to join "${targetGroup.name}".`,
					url: '/pending',
				}).catch(() => {});
			}

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
				include: {
					group: { select: { name: true } },
				},
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

			// Push notify the approved applicant
			sendWebPushToUsers([joinReq.userId], {
				title: 'Application Approved!',
				body: `You are now an official member of "${joinReq.group.name}".`,
				url: `/group/${joinReq.groupId}/feed`,
			}).catch(() => {});

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
				include: {
					group: { select: { name: true } },
				},
			});

			// Push notify the declined applicant
			sendWebPushToUsers([joinReq.userId], {
				title: 'Join Request Update',
				body: `Your request to join "${joinReq.group.name}" was declined.`,
				url: '/pending',
			}).catch(() => {});

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
