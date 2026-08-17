import { NextResponse } from 'next/server';
import { prisma, isDbConnected } from '@/../utils/prisma';
import { sendWebPushToUsers } from '@/utils/serverPush';

export async function GET(req: Request) {
	try {
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
			return NextResponse.json({ invite });
		}

		const invites = await prisma.clubInvite.findMany({
			where: groupId ? { groupId } : undefined,
			orderBy: { createdAt: 'desc' },
		});

		return NextResponse.json({ invites });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Invites GET Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { action, groupId, code, userId } = body;

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		if (action === 'redeem') {
			if (!code || !userId) {
				return NextResponse.json(
					{ error: 'Missing code or userId' },
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

			// Add member to group
			await prisma.groupMember.upsert({
				where: {
					groupId_userId: {
						groupId: invite.groupId,
						userId,
					},
				},
				update: {},
				create: {
					groupId: invite.groupId,
					userId,
					role: 'MEMBER',
				},
			});

			const joinedUser = await prisma.user.findUnique({
				where: { id: userId },
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
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Invites POST Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function DELETE(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const groupId = searchParams.get('groupId');

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		if (!groupId) {
			return NextResponse.json({ error: 'Missing groupId' }, { status: 400 });
		}

		await prisma.clubInvite.deleteMany({
			where: { groupId },
		});

		return NextResponse.json({ success: true });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Invites DELETE Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
