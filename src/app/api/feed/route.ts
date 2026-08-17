import { NextResponse } from 'next/server';
import { prisma, isDbConnected } from '@/../utils/prisma';
import { sendWebPushToGroupMembers } from '@/utils/serverPush';

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const groupId = searchParams.get('groupId');

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		const messages = await prisma.feedMessage.findMany({
			where: groupId ? { groupId } : undefined,
			include: {
				user: {
					select: {
						id: true,
						name: true,
						avatarUrl: true,
					},
				},
			},
			orderBy: { createdAt: 'asc' },
		});

		return NextResponse.json({ messages });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Feed GET Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const { groupId, userId, content, fileName, fileUrl, isAnnouncement, pinned } =
			await req.json();

		if (!groupId || !userId || (!content && !fileUrl)) {
			return NextResponse.json(
				{ error: 'Missing required parameters (groupId, userId, content/file)' },
				{ status: 400 },
			);
		}

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		const newMessage = await prisma.feedMessage.create({
			data: {
				groupId,
				userId,
				content: content || '',
				fileName: fileName || null,
				fileUrl: fileUrl || null,
				isAnnouncement: Boolean(isAnnouncement),
				pinned: Boolean(pinned),
			},
			include: {
				user: { select: { name: true } },
				group: { select: { name: true } },
			},
		});

		// Trigger background Web Push to group members
		const senderName = newMessage.user?.name || 'A member';
		const groupName = newMessage.group?.name || 'Club';
		let title = `${groupName} Message`;
		let body = `${senderName}: ${content || 'New attachment'}`;

		if (fileUrl && fileName) {
			title = `New File in ${groupName}`;
			body = `${senderName} shared "${fileName}".`;
		} else if (content && (content.includes('http://') || content.includes('https://'))) {
			title = `Resource Link in ${groupName}`;
			body = `${senderName} shared a link.`;
		}

		sendWebPushToGroupMembers(groupId, userId, {
			title,
			body: body.slice(0, 120),
			url: `/group/${groupId}/feed`,
		}).catch(() => {});

		return NextResponse.json({ success: true, message: newMessage });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Feed POST Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function DELETE(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const messageId = searchParams.get('messageId');

		if (!messageId) {
			return NextResponse.json(
				{ error: 'Missing messageId parameter' },
				{ status: 400 },
			);
		}

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		await prisma.feedMessage.delete({
			where: { id: messageId },
		});

		return NextResponse.json({ success: true });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Feed DELETE Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
