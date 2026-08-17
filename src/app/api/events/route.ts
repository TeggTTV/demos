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

		const events = await prisma.meetingEvent.findMany({
			where: groupId ? { groupId } : undefined,
			orderBy: { date: 'desc' },
		});

		return NextResponse.json({ events });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Events GET Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const {
			groupId,
			title,
			description,
			date,
			time,
			location,
			checkInCode,
			createdById,
		} = await req.json();

		if (!groupId || !title || !date || !time || !createdById) {
			return NextResponse.json(
				{ error: 'Missing required parameters (groupId, title, date, time, createdById)' },
				{ status: 400 },
			);
		}

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		const newEvent = await prisma.meetingEvent.create({
			data: {
				groupId,
				title,
				description: description || null,
				date,
				time,
				location: location || '',
				checkInCode: checkInCode || `DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
				isActive: true,
				createdById,
			},
			include: {
				group: { select: { name: true } },
			},
		});

		// Trigger background Web Push to club members
		const groupName = newEvent.group?.name || 'Club';
		sendWebPushToGroupMembers(groupId, createdById, {
			title: `Attendance Open: ${title}`,
			body: `Meeting check-in opened for "${groupName}" at ${time}. PIN: ${newEvent.checkInCode}`,
			url: `/group/${groupId}/feed`,
		}).catch(() => {});

		return NextResponse.json({ success: true, event: newEvent });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Events POST Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function PUT(req: Request) {
	try {
		const { eventId, isActive, title, description, date, time, location } =
			await req.json();

		if (!eventId) {
			return NextResponse.json(
				{ error: 'Missing eventId parameter' },
				{ status: 400 },
			);
		}

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		const updated = await prisma.meetingEvent.update({
			where: { id: eventId },
			data: {
				isActive: isActive !== undefined ? isActive : undefined,
				title: title !== undefined ? title : undefined,
				description: description !== undefined ? description : undefined,
				date: date !== undefined ? date : undefined,
				time: time !== undefined ? time : undefined,
				location: location !== undefined ? location : undefined,
			},
			include: {
				group: { select: { name: true } },
			},
		});

		if (isActive !== undefined) {
			const groupName = updated.group?.name || 'Club';
			sendWebPushToGroupMembers(updated.groupId, null, {
				title: isActive
					? `Check-In Opened: ${updated.title}`
					: `Check-In Closed: ${updated.title}`,
				body: isActive
					? `Attendance session is active for "${groupName}". Code: ${updated.checkInCode}`
					: `Attendance check-in has closed for "${groupName}".`,
				url: `/group/${updated.groupId}/feed`,
			}).catch(() => {});
		}

		return NextResponse.json({ success: true, event: updated });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Events PUT Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function DELETE(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const eventId = searchParams.get('eventId');

		if (!eventId) {
			return NextResponse.json(
				{ error: 'Missing eventId parameter' },
				{ status: 400 },
			);
		}

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		await prisma.attendanceRecord.deleteMany({
			where: { eventId },
		});

		await prisma.meetingEvent.delete({
			where: { id: eventId },
		});

		return NextResponse.json({ success: true });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Events DELETE Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
