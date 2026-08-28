import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma, isDbConnected } from '@/../utils/prisma';
import { sendWebPushToUsers } from '@/utils/serverPush';
import { getSession } from '@/../utils/auth';
import { USE_MOCK_DATA } from '@/mock/mockConfig';
import { mockStore } from '@/mock/mockStore';

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const eventId = searchParams.get('eventId') || undefined;
		const groupId = searchParams.get('groupId') || undefined;

		if (USE_MOCK_DATA || (groupId && !/^[0-9a-fA-F]{24}$/.test(groupId)) || (eventId && !/^[0-9a-fA-F]{24}$/.test(eventId))) {
			return NextResponse.json({
				attendances: mockStore.getAttendances({ eventId, groupId }),
			});
		}

		const session = await getSession(req);
		if (!session) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 },
			);
		}

		if (!(await isDbConnected())) {
			return NextResponse.json(
				{ error: 'Database unavailable' },
				{ status: 503 },
			);
		}

		// Enforce Low-Level Security / Lock Record Access
		let canAccessAll = false;

		if (groupId) {
			const group = await prisma.group.findUnique({
				where: { id: groupId },
			});
			if (group) {
				const isLeader = group.leaderId === session.userId;
				const member = await prisma.groupMember.findFirst({
					where: { groupId, userId: session.userId },
				});
				const isOfficer = member?.role === 'OFFICER';
				canAccessAll = isLeader || isOfficer;
			}
		} else if (eventId) {
			const event = await prisma.meetingEvent.findUnique({
				where: { id: eventId },
			});
			if (event) {
				const group = await prisma.group.findUnique({
					where: { id: event.groupId },
				});
				if (group) {
					const isLeader = group.leaderId === session.userId;
					const member = await prisma.groupMember.findFirst({
						where: {
							groupId: event.groupId,
							userId: session.userId,
						},
					});
					const isOfficer = member?.role === 'OFFICER';
					canAccessAll = isLeader || isOfficer;
				}
			}
		}

		// If user is not leader/officer, they can only view their own attendance records
		const attendances = await prisma.attendanceRecord.findMany({
			where: {
				...(eventId ? { eventId } : {}),
				...(groupId ? { groupId } : {}),
				...(!canAccessAll ? { userId: session.userId } : {}),
			},
			orderBy: { timestamp: 'desc' },
		});

		return NextResponse.json({ attendances });
	} catch (error) {
		console.error('Attendance GET Error:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 },
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const {
			eventId,
			userId: targetUserId,
			status,
			checkInMethod,
			code,
		} = body;

		if (!eventId) {
			return NextResponse.json(
				{ error: 'Missing required parameter: eventId' },
				{ status: 400 },
			);
		}

		if (USE_MOCK_DATA) {
			const session = await getSession(req);
			const userId = targetUserId || session?.userId || 'user_1';
			const res = mockStore.recordAttendance({
				eventId,
				userId,
				status,
				checkInMethod,
				code,
			});
			if (!res.success) {
				return NextResponse.json({ error: res.error }, { status: 400 });
			}
			return NextResponse.json({ success: true, record: res.record });
		}

		const session = await getSession(req);
		if (!session) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 },
			);
		}

		const userId = targetUserId || session.userId;

		if (!(await isDbConnected())) {
			return NextResponse.json(
				{ error: 'Database unavailable' },
				{ status: 503 },
			);
		}

		const event = await prisma.meetingEvent.findUnique({
			where: { id: eventId },
		});

		if (!event) {
			return NextResponse.json(
				{ error: 'Event not found' },
				{ status: 404 },
			);
		}

		const group = await prisma.group.findUnique({
			where: { id: event.groupId },
		});

		if (!group) {
			return NextResponse.json(
				{ error: 'Group associated with event not found' },
				{ status: 404 },
			);
		}

		const isLeader = group.leaderId === session.userId;
		const officerMember = await prisma.groupMember.findFirst({
			where: { groupId: event.groupId, userId: session.userId },
		});
		const isOfficer = officerMember?.role === 'OFFICER';
		const isMember = isLeader || Boolean(officerMember);

		// If event is members-only, enforce membership
		if ((event as { membersOnly?: boolean }).membersOnly && !isMember) {
			return NextResponse.json(
				{
					error: 'This activity is for club members only. Please join the club first.',
					isMembersOnly: true,
					groupId: event.groupId,
				},
				{ status: 403 },
			);
		}

		// If user is trying to check in someone else
		if (userId !== session.userId) {
			// Must be leader or officer
			if (!isLeader && !isOfficer) {
				return NextResponse.json(
					{
						error: 'Access denied: only leaders or officers can record attendance for others',
					},
					{ status: 403 },
				);
			}
		} else {
			// Self check-in: must verify check-in code if code check-in method is used and user is not leader/officer
			if (!isLeader && !isOfficer) {
				const eventDateTime = new Date(
					`${event.date}T${event.time || '00:00'}`,
				);
				const isTimeReached = new Date() >= eventDateTime;
				const isEventActive =
					event.isActive ||
					(event.status !== 'CLOSED' &&
						event.status !== 'NOT_SENT' &&
						isTimeReached);
				if (!isEventActive) {
					return NextResponse.json(
						{
							error: 'Check-in is currently closed for this event',
						},
						{ status: 400 },
					);
				}
				if (checkInMethod === 'MANUAL') {
					return NextResponse.json(
						{
							error: 'Cannot manually check in. Must use code check-in',
						},
						{ status: 403 },
					);
				}
				const cleanInput = (code || '').trim().toUpperCase();
				const cleanTarget = event.checkInCode.trim().toUpperCase();
				if (cleanInput !== cleanTarget) {
					console.log(code, event.checkInCode);
					return NextResponse.json(
						{ error: 'Invalid check-in code' },
						{ status: 400 },
					);
				}
			}
		}

		// Retrieve target user details
		const targetUser = await prisma.user.findUnique({
			where: { id: userId },
			select: { name: true, email: true },
		});

		if (!targetUser) {
			return NextResponse.json(
				{ error: 'Target user not found' },
				{ status: 404 },
			);
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
				groupId: event.groupId,
				userId,
				userName: targetUser.name || null,
				userEmail: targetUser.email || null,
				status: status || 'PRESENT',
				checkInMethod: checkInMethod || 'CODE',
			},
			include: {
				event: { select: { title: true } },
				group: { select: { name: true } },
			},
		});

		// If attendance was manually verified by an officer, notify the student
		if (checkInMethod === 'MANUAL' && userId !== session.userId) {
			sendWebPushToUsers([userId], {
				title: `Attendance Updated: ${status || 'PRESENT'}`,
				body: `You are marked ${status || 'PRESENT'} for "${record.event.title}" (${record.group.name}).`,
				url: `/group/${event.groupId}/feed`,
			}).catch(() => {});
		}

		return NextResponse.json({ success: true, record });
	} catch (error) {
		console.error('Attendance POST Error:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 },
		);
	}
}

export const PATCH = POST;

