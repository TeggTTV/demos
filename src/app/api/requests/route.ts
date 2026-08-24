import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma, isDbConnected } from '@/../utils/prisma';
import { sendWebPushToUsers } from '@/utils/serverPush';
import { getSession } from '@/../utils/auth';
import { USE_MOCK_DATA } from '@/mock/mockConfig';
import { mockStore } from '@/mock/mockStore';

export async function GET(req: NextRequest) {
	try {
		if (USE_MOCK_DATA) {
			const session = await getSession(req);
			return NextResponse.json({ requests: mockStore.getRequests(session?.userId) });
		}

		const session = await getSession(req);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		// Find groups where current user is leader or officer
		const ledGroups = await prisma.group.findMany({
			where: {
				OR: [
					{ leaderId: session.userId },
					{ officerIds: { has: session.userId } },
				],
			},
			select: { id: true },
		});
		const ledGroupIds = ledGroups.map((g) => g.id);

		// Return requests for groups they manage, plus their own requests
		const dbRequests = await prisma.joinRequest.findMany({
			where: {
				OR: [
					{ groupId: { in: ledGroupIds } },
					{ userId: session.userId },
				],
			},
			orderBy: { createdAt: 'desc' },
		});
		return NextResponse.json({ requests: dbRequests });
	} catch (error) {
		console.error('Requests GET Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { action, groupId, requestId, message } = body;

		if (USE_MOCK_DATA) {
			const session = await getSession(req);
			const userId = session?.userId || 'user_1';
			if (action === 'create') {
				if (!groupId) {
					return NextResponse.json({ error: 'Missing groupId' }, { status: 400 });
				}
				const newReq = mockStore.createRequest(groupId, userId, message);
				return NextResponse.json({ success: true, request: newReq });
			}
			if (action === 'approve' || action === 'decline') {
				if (!requestId) {
					return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
				}
				const res = mockStore.updateRequestStatus(
					requestId,
					action === 'approve' ? 'APPROVED' : 'DECLINED',
				);
				return NextResponse.json({ success: true, request: res.request });
			}
		}

		const session = await getSession(req);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		if (action === 'create') {
			if (!groupId) {
				return NextResponse.json(
					{ error: 'Missing groupId' },
					{ status: 400 },
				);
			}

			// Clean message
			const cleanMessage = message ? message.trim() : '';

			const newRequest = await prisma.joinRequest.upsert({
				where: {
					groupId_userId: {
						groupId,
						userId: session.userId, // securely bind to session.userId
					},
				},
				update: {
					message: cleanMessage,
					status: 'PENDING',
					createdAt: new Date(),
				},
				create: {
					groupId,
					userId: session.userId,
					message: cleanMessage,
					status: 'PENDING',
				},
			});
			const targetGroup = await prisma.group.findUnique({
				where: { id: groupId },
				select: { name: true, leaderId: true, officerIds: true },
			});

			const applicant = await prisma.user.findUnique({
				where: { id: session.userId },
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

		if (action === 'approve' || action === 'decline') {
			if (!requestId) {
				return NextResponse.json(
					{ error: 'Missing requestId' },
					{ status: 400 },
				);
			}

			// Retrieve the join request and group to check leader/officer status
			const joinReq = await prisma.joinRequest.findUnique({
				where: { id: requestId },
			});

			if (!joinReq) {
				return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
			}

			const group = await prisma.group.findUnique({
				where: { id: joinReq.groupId },
				select: { leaderId: true, officerIds: true, name: true },
			});

			if (!group) {
				return NextResponse.json({ error: 'Associated group not found' }, { status: 404 });
			}

			const isLeader = group.leaderId === session.userId;
			const member = await prisma.groupMember.findFirst({
				where: { groupId: joinReq.groupId, userId: session.userId },
			});
			const isOfficer = member?.role === 'OFFICER';

			if (!isLeader && !isOfficer) {
				return NextResponse.json({ error: 'Access denied: only leaders or officers can approve/decline join requests' }, { status: 403 });
			}

			const updatedRequest = await prisma.joinRequest.update({
				where: { id: requestId },
				data: { status: action === 'approve' ? 'APPROVED' : 'DECLINED' },
			});

			if (action === 'approve') {
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
					body: `You are now an official member of "${group.name}".`,
					url: `/group/${joinReq.groupId}/feed`,
				}).catch(() => {});
			} else {
				// Push notify the declined applicant
				sendWebPushToUsers([joinReq.userId], {
					title: 'Join Request Update',
					body: `Your request to join "${group.name}" was declined.`,
					url: '/pending',
				}).catch(() => {});
			}

			return NextResponse.json({ success: true, request: { ...updatedRequest, group: { name: group.name } } });
		}

		return NextResponse.json(
			{ error: 'Invalid action parameter' },
			{ status: 400 },
		);
	} catch (error) {
		console.error('Requests POST Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
