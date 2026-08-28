import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma, isDbConnected } from '@/../utils/prisma';
import { sendWebPushToGroupMembers } from '@/utils/serverPush';
import { getSession } from '@/../utils/auth';
import { validateBase64Upload } from '@/../utils/validation';
import { USE_MOCK_DATA } from '@/mock/mockConfig';
import { mockStore } from '@/mock/mockStore';

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const groupId = searchParams.get('groupId');

		if (!groupId) {
			return NextResponse.json({ error: 'Missing groupId parameter' }, { status: 400 });
		}

		if (USE_MOCK_DATA || !groupId || !/^[0-9a-fA-F]{24}$/.test(groupId)) {
			return NextResponse.json({ messages: mockStore.getFeedMessages(groupId || 'club_acm_01') });
		}

		const session = await getSession(req);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		// Verify Group exists
		const group = await prisma.group.findUnique({
			where: { id: groupId },
		});

		if (!group) {
			return NextResponse.json({ error: 'Group not found' }, { status: 404 });
		}

		// Enforce Low-Level Security / Lock Record Access
		if (group.isPrivate && group.leaderId !== session.userId) {
			const member = await prisma.groupMember.findFirst({
				where: { groupId, userId: session.userId },
			});
			if (!member) {
				return NextResponse.json({ error: 'Access denied: private group' }, { status: 403 });
			}
		}

		const messages = await prisma.feedMessage.findMany({
			where: { groupId },
			select: {
				id: true,
				groupId: true,
				userId: true,
				content: true,
				fileName: true,
				fileUrl: true,
				isAnnouncement: true,
				pinned: true,
				subAppType: true,
				pollId: true,
				createdAt: true,
				poll: {
					include: {
						creator: {
							select: {
								id: true,
								name: true,
								avatarUrl: true,
							},
						},
					},
				},
			},
			orderBy: { createdAt: 'asc' },
		});

		const messagesWithDownloadUrl = messages.map((msg) => {
			return {
				...msg,
				fileUrl: msg.fileName ? `/api/feed/download?messageId=${msg.id}` : msg.fileUrl || null,
			};
		});

		return NextResponse.json({ messages: messagesWithDownloadUrl });
	} catch (error: unknown) {
		const err = error as { code?: string; message?: string };
		if (err?.code === 'P2023' || err?.message?.includes('Malformed ObjectID')) {
			const { searchParams } = new URL(req.url);
			const gId = searchParams.get('groupId') || 'club_acm_01';
			return NextResponse.json({ messages: mockStore.getFeedMessages(gId) });
		}
		console.error('Feed GET Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { groupId, content, fileName, fileUrl, isAnnouncement, pinned, subAppType, pollId } = body;

		if (!groupId || (!content && !fileUrl && !pollId)) {
			return NextResponse.json(
				{ error: 'Missing required parameters (groupId, content/file/poll)' },
				{ status: 400 },
			);
		}

		if (USE_MOCK_DATA || !/^[0-9a-fA-F]{24}$/.test(groupId)) {
			const session = await getSession(req);
			const userId = session?.userId || 'user_alex_chen';
			const newMsg = mockStore.postFeedMessage({
				groupId,
				userId,
				content: content || '',
				fileName,
				fileUrl,
				isAnnouncement,
				pinned,
				subAppType,
				pollId,
			});
			return NextResponse.json({ success: true, message: newMsg });
		}

		const session = await getSession(req);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Restrict File Uploads
		if (fileUrl) {
			const uploadCheck = validateBase64Upload(
				fileUrl,
				['image/', 'application/pdf', 'text/plain'],
				5
			);
			if (!uploadCheck.isValid) {
				return NextResponse.json({ error: uploadCheck.error }, { status: 400 });
			}
		}


		// Trim and escape/validate inputs
		const cleanContent = content ? content.trim() : '';

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		const group = await prisma.group.findUnique({
			where: { id: groupId },
		});

		if (!group) {
			return NextResponse.json({ error: 'Group not found' }, { status: 404 });
		}

		// Lock record access: user must be the leader or a member to post
		const isLeader = group.leaderId === session.userId;
		const member = await prisma.groupMember.findFirst({
			where: { groupId, userId: session.userId },
		});

		if (!isLeader && !member) {
			return NextResponse.json({ error: 'Access denied: not a group member' }, { status: 403 });
		}

		const isOfficer = member?.role === 'OFFICER';

		// Block field tampering: announcements and pins can only be made by leaders/officers
		const canManageAnnouncements = isLeader || isOfficer;
		if ((isAnnouncement || pinned) && !canManageAnnouncements) {
			return NextResponse.json({ error: 'Access denied: unauthorized to post announcements/pins' }, { status: 403 });
		}

		const newMessage = await prisma.feedMessage.create({
			data: {
				groupId,
				userId: session.userId, // securely use session userId
				content: cleanContent,
				fileName: fileName || null,
				fileUrl: fileUrl || null,
				isAnnouncement: Boolean(isAnnouncement),
				pinned: Boolean(pinned),
				subAppType: subAppType || null,
				pollId: pollId || null,
			},
			include: {
				user: { select: { id: true, name: true, avatarUrl: true } },
				group: { select: { name: true } },
				poll: {
					include: {
						creator: { select: { id: true, name: true, avatarUrl: true } },
					},
				},
			},
		});

		// Trigger background Web Push to group members
		const senderName = newMessage.user?.name || 'A member';
		const groupName = newMessage.group?.name || 'Club';
		let title = `${groupName} Message`;
		let bodyText = `${senderName}: ${cleanContent || 'New attachment'}`;

		if (fileUrl && fileName) {
			title = `New File in ${groupName}`;
			bodyText = `${senderName} shared "${fileName}".`;
		} else if (cleanContent && (cleanContent.includes('http://') || cleanContent.includes('https://'))) {
			title = `Resource Link in ${groupName}`;
			bodyText = `${senderName} shared a link.`;
		}

		sendWebPushToGroupMembers(groupId, session.userId, {
			title,
			body: bodyText.slice(0, 120),
			url: `/group/${groupId}/feed`,
		}).catch(() => {});

		return NextResponse.json({ success: true, message: newMessage });
	} catch (error) {
		console.error('Feed POST Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const messageId = searchParams.get('messageId');

		if (!messageId) {
			return NextResponse.json(
				{ error: 'Missing messageId parameter' },
				{ status: 400 },
			);
		}

		if (USE_MOCK_DATA || !/^[0-9a-fA-F]{24}$/.test(messageId)) {
			mockStore.deleteFeedMessage(messageId);
			return NextResponse.json({ success: true });
		}

		const session = await getSession(req);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		const message = await prisma.feedMessage.findUnique({
			where: { id: messageId },
		});

		if (!message) {
			return NextResponse.json({ error: 'Message not found' }, { status: 404 });
		}

		// Authorization lock: only message owner OR group leader/officers can delete
		const group = await prisma.group.findUnique({
			where: { id: message.groupId },
		});

		const isOwner = message.userId === session.userId;
		const isLeader = group?.leaderId === session.userId;
		const member = await prisma.groupMember.findFirst({
			where: { groupId: message.groupId, userId: session.userId },
		});
		const isOfficer = member?.role === 'OFFICER';

		if (!isOwner && !isLeader && !isOfficer) {
			return NextResponse.json({ error: 'Access denied: unauthorized delete attempt' }, { status: 403 });
		}

		await prisma.feedMessage.delete({
			where: { id: messageId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Feed DELETE Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
