import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma, isDbConnected } from '@/../utils/prisma';
import { sendWebPushToUsers } from '@/utils/serverPush';
import { getSession } from '@/../utils/auth';

export async function GET(req: NextRequest) {
	try {
		const session = await getSession(req);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const groupId = searchParams.get('groupId');
		const code = searchParams.get('code');

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		if (code) {
			const invite = await prisma.clubInvite.findUnique({
				where: { code: code.toUpperCase() },
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
					},
				},
			});
		}

		if (!groupId) {
			return NextResponse.json({ error: 'Missing groupId or code' }, { status: 400 });
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

export async function POST(req: NextRequest) {
	try {
		const session = await getSession(req);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await req.json();
		const { action, groupId, code } = body;

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		if (action === 'redeem') {
			if (!code) {
				return NextResponse.json(
					{ error: 'Missing code' },
					{ status: 400 },
				);
			}

			const invite = await prisma.clubInvite.findUnique({
				where: { code: code.toUpperCase() },
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
						userId: session.userId,
					},
				},
				update: {},
				create: {
					groupId: invite.groupId,
					userId: session.userId,
					role: 'MEMBER',
				},
			});

			const joinedUser = await prisma.user.findUnique({
				where: { id: session.userId },
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

		// Create Invite Code (Delete existing invites for this group first to keep DB clean)
		if (!groupId || !code) {
			return NextResponse.json(
				{ error: 'Missing groupId or code' },
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

		// Remove all previous invites for this club
		await prisma.clubInvite.deleteMany({
			where: { groupId },
		});

		const newInvite = await prisma.clubInvite.upsert({
			where: { code: code.toUpperCase() },
			update: {
				status: 'ACTIVE',
			},
			create: {
				groupId,
				code: code.toUpperCase(),
				status: 'ACTIVE',
			},
		});

		return NextResponse.json({ success: true, invite: newInvite });
	} catch (error) {
		console.error('Invites POST Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const session = await getSession(req);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const groupId = searchParams.get('groupId');

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		if (!groupId) {
			return NextResponse.json({ error: 'Missing groupId' }, { status: 400 });
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
