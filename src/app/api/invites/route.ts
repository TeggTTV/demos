import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';
import { prisma, isDbConnected } from '@/../utils/prisma';
import { sendWebPushToUsers } from '@/utils/serverPush';
import { getSession } from '@/../utils/auth';
import { USE_MOCK_DATA } from '@/mock/mockConfig';
import { mockStore } from '@/mock/mockStore';

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const groupId = searchParams.get('groupId') || searchParams.get('id');
		const code = searchParams.get('code');

		if (USE_MOCK_DATA) {
			if (code) {
				const inv = mockStore
					.getInvites()
					.find(
						(i) => i.code.toUpperCase() === code.trim().toUpperCase(),
					);
				if (!inv) {
					return NextResponse.json(
						{ error: 'Invalid invite code' },
						{ status: 404 },
					);
				}
				const grp = mockStore.getGroupById(inv.groupId);
				return NextResponse.json({
					invite: {
						id: inv.id,
						groupId: inv.groupId,
						code: inv.code,
						status: inv.status,
						group: grp
							? {
									id: grp.id,
									name: grp.name,
									description: grp.description,
									bannerUrl: grp.bannerUrl,
									category: grp.category,
								}
							: undefined,
					},
				});
			}

			return NextResponse.json({
				invites: mockStore.getInvites(groupId || undefined),
			});
		}

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		if (code) {
			const cleanCode = code.trim().toUpperCase();
			const invite = await prisma.clubInvite.findUnique({
				where: { code: cleanCode },
				include: { group: true },
			});
			if (!invite) {
				return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
			}
			// Only return trimmed group details for verification
			return NextResponse.json({
				invite: {
					id: invite.id,
					groupId: invite.groupId,
					code: invite.code,
					status: invite.status,
					group: {
						id: invite.group.id,
						name: invite.group.name,
						description: invite.group.description,
						bannerUrl: invite.group.bannerUrl,
						category: invite.group.category,
					},
				},
			});
		}

		const session = await getSession(req);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		if (!groupId) {
			const groups = await prisma.group.findMany({
				where: {
					OR: [
						{ leaderId: session.userId },
						{ officerIds: { has: session.userId } },
					],
				},
			});
			const groupIds = groups.map((g) => g.id);

			const invites = await prisma.clubInvite.findMany({
				where: { groupId: { in: groupIds } },
				orderBy: { createdAt: 'desc' },
			});
			return NextResponse.json({ invites });
		}

		// Authorization lock: only group leaders/officers can list invites for a group
		const group = await prisma.group.findUnique({
			where: { id: groupId },
		});

		if (!group) {
			return NextResponse.json({ error: 'Group not found' }, { status: 404 });
		}

		const isLeader = group.leaderId === session.userId;
		const member = await prisma.groupMember.findFirst({
			where: { groupId, userId: session.userId },
		});
		const isOfficer = member?.role === 'OFFICER';

		if (!isLeader && !isOfficer) {
			return NextResponse.json({ error: 'Access denied: unauthorized to view invites' }, { status: 403 });
		}

		const invites = await prisma.clubInvite.findMany({
			where: { groupId },
			orderBy: { createdAt: 'desc' },
		});

		return NextResponse.json({ invites });
	} catch (error) {
		console.error('Invites GET Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

async function handleRedeem(req: NextRequest, sessionUserId: string, rawCode: string) {
	if (!rawCode) {
		return NextResponse.json(
			{ error: 'Missing code' },
			{ status: 400 },
		);
	}

	if (USE_MOCK_DATA) {
		const res = mockStore.redeemInvite(rawCode, sessionUserId);
		if (!res.success) {
			return NextResponse.json({ error: res.error }, { status: 400 });
		}
		return NextResponse.json({ success: true, groupId: res.groupId, group: res.group });
	}

	const cleanCode = rawCode.trim().toUpperCase();
	const invite = await prisma.clubInvite.findUnique({
		where: { code: cleanCode },
	});

	if (!invite || invite.status !== 'ACTIVE') {
		return NextResponse.json(
			{ error: 'Invalid or expired invite code' },
			{ status: 400 },
		);
	}

	// Add member to group, bind to session.userId (preventing user tampering)
	await prisma.groupMember.upsert({
		where: {
			groupId_userId: {
				groupId: invite.groupId,
				userId: sessionUserId,
			},
		},
		update: {},
		create: {
			groupId: invite.groupId,
			userId: sessionUserId,
			role: 'MEMBER',
		},
	});

	const joinedUser = await prisma.user.findUnique({
		where: { id: sessionUserId },
		select: { name: true },
	});
	const group = await prisma.group.findUnique({
		where: { id: invite.groupId },
		select: { name: true, leaderId: true, officerIds: true },
	});

	if (group) {
		const staff = Array.from(new Set([group.leaderId, ...(group.officerIds || [])]));
		sendWebPushToUsers(staff, {
			title: 'Invite Code Redeemed',
			body: `${joinedUser?.name || 'A new member'} joined "${group.name}" via invite code.`,
			url: `/group/${invite.groupId}/feed`,
		}).catch(() => {});
	}

	return NextResponse.json({ success: true, groupId: invite.groupId });
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { action, groupId, code } = body;

		if (USE_MOCK_DATA) {
			const session = await getSession(req);
			const userId = session?.userId || 'user_1';
			if (action === 'redeem' || (!groupId && code)) {
				return handleRedeem(req, userId, code);
			}
			if (!groupId) {
				return NextResponse.json({ error: 'Missing groupId' }, { status: 400 });
			}
			const newInvite = mockStore.generateInvite(groupId);
			return NextResponse.json({ success: true, code: newInvite.code, invite: newInvite });
		}

		const session = await getSession(req);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		if (action === 'redeem' || (!groupId && code)) {
			return handleRedeem(req, session.userId, code);
		}

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		// Create Invite Code (Delete existing invites for this group first to keep DB clean)
		if (!groupId) {
			return NextResponse.json(
				{ error: 'Missing groupId' },
				{ status: 400 },
			);
		}

		// Authorization lock: only group leaders/officers can create invites
		const group = await prisma.group.findUnique({
			where: { id: groupId },
		});

		if (!group) {
			return NextResponse.json({ error: 'Group not found' }, { status: 404 });
		}

		const isLeader = group.leaderId === session.userId;
		if (!isLeader) {
			return NextResponse.json({ error: 'Access denied: only leaders can create invites' }, { status: 403 });
		}

		// Generate cryptographically secure random token if not provided or to prevent brute-forcing
		const secureCode = code
			? code.trim().toUpperCase()
			: crypto.randomBytes(6).toString('hex').toUpperCase();

		// Remove all previous invites for this club
		await prisma.clubInvite.deleteMany({
			where: { groupId },
		});

		const newInvite = await prisma.clubInvite.upsert({
			where: { code: secureCode },
			update: {
				status: 'ACTIVE',
			},
			create: {
				groupId,
				code: secureCode,
				status: 'ACTIVE',
			},
		});

		return NextResponse.json({ success: true, code: newInvite.code, invite: newInvite });
	} catch (error) {
		console.error('Invites POST Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function PATCH(req: NextRequest) {
	try {
		const body = await req.json();
		const { code } = body;

		if (USE_MOCK_DATA) {
			const session = await getSession(req);
			return handleRedeem(req, session?.userId || 'user_1', code);
		}

		const session = await getSession(req);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		return handleRedeem(req, session.userId, code);
	} catch (error) {
		console.error('Invites PATCH Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const groupId = searchParams.get('groupId') || searchParams.get('id');

		if (!groupId) {
			return NextResponse.json({ error: 'Missing groupId' }, { status: 400 });
		}

		if (USE_MOCK_DATA) {
			mockStore.deleteInvites(groupId);
			return NextResponse.json({ success: true });
		}

		const session = await getSession(req);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Authorization lock: only group leaders/officers can delete invites
		const group = await prisma.group.findUnique({
			where: { id: groupId },
		});

		if (!group) {
			return NextResponse.json({ error: 'Group not found' }, { status: 404 });
		}

		const isLeader = group.leaderId === session.userId;
		if (!isLeader) {
			return NextResponse.json({ error: 'Access denied: only leaders can delete invites' }, { status: 403 });
		}

		await prisma.clubInvite.deleteMany({
			where: { groupId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Invites DELETE Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
