import { NextResponse } from 'next/server';
import { prisma, isDbConnected } from '@/../utils/prisma';
import { sendWebPushToUsers } from '@/utils/serverPush';

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const eventId = searchParams.get('eventId');
		const groupId = searchParams.get('groupId');

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		const attendances = await prisma.attendanceRecord.findMany({
			where: {
				...(eventId ? { eventId } : {}),
				...(groupId ? { groupId } : {}),
			},
			orderBy: { timestamp: 'desc' },
		});

		return NextResponse.json({ attendances });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Attendance GET Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const {
			eventId,
			groupId,
			userId,
			userName,
			userEmail,
			status,
			checkInMethod,
		} = await req.json();

		if (!eventId || !userId) {
			return NextResponse.json(
				{ error: 'Missing required parameters (eventId, userId)' },
				{ status: 400 },
			);
		}

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		const record = await prisma.attendanceRecord.upsert({
			where: {
				eventId_userId: {
					eventId,
					userId,
				},
			},
			update: {
				status: status || 'PRESENT',
				checkInMethod: checkInMethod || 'CODE',
				timestamp: new Date(),
			},
			create: {
				eventId,
				groupId: groupId || '',
				userId,
				userName: userName || null,
				userEmail: userEmail || null,
				status: status || 'PRESENT',
				checkInMethod: checkInMethod || 'CODE',
			},
			include: {
				event: { select: { title: true } },
				group: { select: { name: true } },
			},
		});

		// If attendance was manually verified by an officer, notify the student
		if (checkInMethod === 'MANUAL') {
			sendWebPushToUsers([userId], {
				title: `Attendance Updated: ${status || 'PRESENT'}`,
				body: `You are marked ${status || 'PRESENT'} for "${record.event.title}" (${record.group.name}).`,
				url: `/group/${groupId}/feed`,
			}).catch(() => {});
		}

		return NextResponse.json({ success: true, record });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Attendance POST Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
