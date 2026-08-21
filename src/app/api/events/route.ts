import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma, isDbConnected } from '@/../utils/prisma';
import { sendWebPushToGroupMembers } from '@/utils/serverPush';
import { getSession } from '@/../utils/auth';

export async function GET(req: NextRequest) {
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

		if (groupId) {
			const group = await prisma.group.findUnique({
				where: { id: groupId },
			});
			if (!group) {
				return NextResponse.json({ error: 'Group not found' }, { status: 404 });
			}
			if (group.isPrivate && group.leaderId !== session.userId) {
				const member = await prisma.groupMember.findFirst({
					where: { groupId, userId: session.userId },
				});
				if (!member) {
					return NextResponse.json({ error: 'Access denied' }, { status: 403 });
				}
			}
		}

		const events = await prisma.meetingEvent.findMany({
			where: groupId ? { groupId } : { group: { isPrivate: false } },
			include: {
				group: {
					select: {
						id: true,
						name: true,
						bannerUrl: true,
						category: true,
					},
				},
			},
			orderBy: { date: 'desc' },
		});

		const mappedEvents = events.map((event) => {
			const eventDateTime = new Date(`${event.date}T${event.time || '00:00'}`);
			const isTimeReached = new Date() >= eventDateTime;
			let isActive = event.isActive;
			if (!isActive && event.status !== 'CLOSED' && event.status !== 'NOT_SENT' && isTimeReached) {
				isActive = true;
			}
			return { ...event, isActive };
		});

		return NextResponse.json({ events: mappedEvents });
	} catch (error) {
		console.error('Events GET Error:', error);
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
		const {
			groupId,
			title,
			description,
			date,
			time,
			location,
			checkInCode,
			endDate,
			price,
			status,
			locationType,
			allDay,
			endTime,
			regRequired,
			regCapacity,
			regDeadline,
			inviteMessage,
			inviteReminderDays,
		} = body;

		if (!groupId || !title || !date || !time) {
			return NextResponse.json(
				{ error: 'Missing required parameters' },
				{ status: 400 },
			);
		}

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

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
			return NextResponse.json({ error: 'Access denied: only leaders or officers can create events' }, { status: 403 });
		}

		const initialIsActive = new Date(`${date}T${time || '00:00'}`) <= new Date();

		const newEvent = await prisma.meetingEvent.create({
			data: {
				groupId,
				title,
				description: description || null,
				date,
				time,
				location: location || '',
				checkInCode: checkInCode || `${Math.floor(100000 + Math.random() * 900000)}`,
				isActive: initialIsActive,
				createdById: session.userId, // use secure session userId
				endDate: endDate || null,
				price: price || null,
				status: status || 'NOT_SENT',
				locationType: locationType || null,
				allDay: allDay !== undefined ? allDay : false,
				endTime: endTime || null,
				regRequired: regRequired !== undefined ? regRequired : false,
				regCapacity: regCapacity !== undefined && regCapacity !== null ? parseInt(String(regCapacity)) : null,
				regDeadline: regDeadline || null,
				inviteMessage: inviteMessage || null,
				inviteReminderDays: inviteReminderDays !== undefined && inviteReminderDays !== null ? parseInt(String(inviteReminderDays)) : 0,
			},
			include: {
				group: { select: { name: true } },
			},
		});

		const groupName = newEvent.group?.name || 'Club';
		sendWebPushToGroupMembers(groupId, session.userId, {
			title: `Attendance Open: ${title}`,
			body: `Meeting check-in opened for "${groupName}" at ${time}. PIN: ${newEvent.checkInCode}`,
			url: `/group/${groupId}/feed`,
		}).catch(() => {});

		return NextResponse.json({ success: true, event: newEvent });
	} catch (error) {
		console.error('Events POST Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function PUT(req: NextRequest) {
	try {
		const session = await getSession(req);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await req.json();
		const {
			eventId,
			isActive,
			title,
			description,
			date,
			time,
			location,
			endDate,
			price,
			status,
			locationType,
			allDay,
			endTime,
			regRequired,
			regCapacity,
			regDeadline,
			inviteMessage,
			inviteReminderDays,
		} = body;

		if (!eventId) {
			return NextResponse.json(
				{ error: 'Missing eventId parameter' },
				{ status: 400 },
			);
		}

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		const existingEvent = await prisma.meetingEvent.findUnique({
			where: { id: eventId },
		});

		if (!existingEvent) {
			return NextResponse.json({ error: 'Event not found' }, { status: 404 });
		}

		const group = await prisma.group.findUnique({
			where: { id: existingEvent.groupId },
		});

		const isLeader = group?.leaderId === session.userId;
		const member = await prisma.groupMember.findFirst({
			where: { groupId: existingEvent.groupId, userId: session.userId },
		});
		const isOfficer = member?.role === 'OFFICER';

		if (!isLeader && !isOfficer) {
			return NextResponse.json({ error: 'Access denied: unauthorized to edit event' }, { status: 403 });
		}

		let newIsActive = isActive;
		let newStatus = status;

		if (newIsActive === undefined && (date !== undefined || time !== undefined)) {
			const targetDate = date !== undefined ? date : existingEvent.date;
			const targetTime = time !== undefined ? time : existingEvent.time;
			const eventDateTime = new Date(`${targetDate}T${targetTime || '00:00'}`);
			newIsActive = eventDateTime <= new Date();
		}

		if (isActive === false) {
			newStatus = 'CLOSED';
		} else if (isActive === true) {
			newStatus = 'PUBLISHED';
		}

		const updated = await prisma.meetingEvent.update({
			where: { id: eventId },
			data: {
				isActive: newIsActive !== undefined ? newIsActive : undefined,
				title: title !== undefined ? title : undefined,
				description: description !== undefined ? description : undefined,
				date: date !== undefined ? date : undefined,
				time: time !== undefined ? time : undefined,
				location: location !== undefined ? location : undefined,
				endDate: endDate !== undefined ? endDate : undefined,
				price: price !== undefined ? price : undefined,
				status: newStatus !== undefined ? newStatus : undefined,
				locationType: locationType !== undefined ? locationType : undefined,
				allDay: allDay !== undefined ? allDay : undefined,
				endTime: endTime !== undefined ? endTime : undefined,
				regRequired: regRequired !== undefined ? regRequired : undefined,
				regCapacity: regCapacity !== undefined ? (regCapacity !== null ? parseInt(String(regCapacity)) : null) : undefined,
				regDeadline: regDeadline !== undefined ? regDeadline : undefined,
				inviteMessage: inviteMessage !== undefined ? inviteMessage : undefined,
				inviteReminderDays: inviteReminderDays !== undefined ? (inviteReminderDays !== null ? parseInt(String(inviteReminderDays)) : 0) : undefined,
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
	} catch (error) {
		console.error('Events PUT Error:', error);
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

		const existingEvent = await prisma.meetingEvent.findUnique({
			where: { id: eventId },
		});

		if (!existingEvent) {
			return NextResponse.json({ error: 'Event not found' }, { status: 404 });
		}

		const group = await prisma.group.findUnique({
			where: { id: existingEvent.groupId },
		});

		const isLeader = group?.leaderId === session.userId;
		const member = await prisma.groupMember.findFirst({
			where: { groupId: existingEvent.groupId, userId: session.userId },
		});
		const isOfficer = member?.role === 'OFFICER';

		if (!isLeader && !isOfficer) {
			return NextResponse.json({ error: 'Access denied: unauthorized to delete event' }, { status: 403 });
		}

		await prisma.attendanceRecord.deleteMany({
			where: { eventId },
		});

		await prisma.meetingEvent.delete({
			where: { id: eventId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Events DELETE Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
