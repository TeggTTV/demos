import { NextResponse } from 'next/server';
import { prisma, isDbConnected } from '@/../utils/prisma';
import { sendWebPushToUsers } from '@/utils/serverPush';

export async function GET() {
	try {
		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		const dbGroups = await prisma.group.findMany({
			include: {
				members: true,
			},
			orderBy: { createdAt: 'desc' },
		});

		const formattedGroups = dbGroups.map((g) => ({
			id: g.id,
			name: g.name,
			tagline: g.tagline,
			description: g.description,
			category: g.category || 'General',
			subject: g.subject,
			meetingFrequency: g.meetingFrequency,
			meetingLocation: g.meetingLocation,
			minMembers: g.minMembers,
			maxMembers: g.maxMembers,
			isPrivate: g.isPrivate,
			profanityFilter: g.profanityFilter,
			bannerUrl: g.bannerUrl,
			logoUrl: g.logoUrl,
			websiteUrl: g.websiteUrl,
			instagramUrl: g.instagramUrl,
			discordUrl: g.discordUrl,
			tags: g.tags,
			officerIds: g.officerIds,
			leaderId: g.leaderId,
			memberIds: g.members.map((m) => m.userId),
		}));

		return NextResponse.json({ groups: formattedGroups });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Groups GET Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const {
			name,
			tagline,
			description,
			category,
			meetingFrequency,
			meetingLocation,
			minMembers,
			maxMembers,
			bannerUrl,
			logoUrl,
			websiteUrl,
			instagramUrl,
			discordUrl,
			tags,
			leaderId,
		} = await req.json();

		if (!name || !description || !leaderId) {
			return NextResponse.json(
				{ error: 'Missing required club details (name, description, leaderId)' },
				{ status: 400 },
			);
		}

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		// Create Group
		const newGroup = await prisma.group.create({
			data: {
				name,
				tagline: tagline || null,
				description,
				category: category || 'Technology & Coding',
				subject: category || 'General',
				meetingFrequency: meetingFrequency || 'Weekly',
				meetingLocation: meetingLocation || '',
				minMembers: Number(minMembers || 1),
				maxMembers: Number(maxMembers || 50),
				isPrivate: false,
				profanityFilter: false,
				bannerUrl: bannerUrl || null,
				logoUrl: logoUrl || null,
				websiteUrl: websiteUrl || null,
				instagramUrl: instagramUrl || null,
				discordUrl: discordUrl || null,
				tags: tags || [],
				officerIds: [],
				leaderId,
				members: {
					create: {
						userId: leaderId,
						role: 'LEADER',
					},
				},
			},
			include: {
				members: true,
			},
		});

		const formatted = {
			id: newGroup.id,
			name: newGroup.name,
			tagline: newGroup.tagline,
			description: newGroup.description,
			category: newGroup.category,
			subject: newGroup.subject,
			meetingFrequency: newGroup.meetingFrequency,
			meetingLocation: newGroup.meetingLocation,
			minMembers: newGroup.minMembers,
			maxMembers: newGroup.maxMembers,
			isPrivate: newGroup.isPrivate,
			profanityFilter: newGroup.profanityFilter,
			bannerUrl: newGroup.bannerUrl,
			logoUrl: newGroup.logoUrl,
			websiteUrl: newGroup.websiteUrl,
			instagramUrl: newGroup.instagramUrl,
			discordUrl: newGroup.discordUrl,
			tags: newGroup.tags,
			officerIds: newGroup.officerIds,
			leaderId: newGroup.leaderId,
			memberIds: newGroup.members.map((m) => m.userId),
		};

		return NextResponse.json({ success: true, group: formatted });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Groups POST Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function PUT(req: Request) {
	try {
		const body = await req.json();
		const {
			groupId,
			name,
			tagline,
			description,
			category,
			meetingFrequency,
			meetingLocation,
			isPrivate,
			profanityFilter,
			bannerUrl,
			logoUrl,
			websiteUrl,
			instagramUrl,
			discordUrl,
			tags,
			officerIds,
			kickUserId,
			deleteLinkId,
			deleteFileId,
		} = body;

		if (!groupId) {
			return NextResponse.json(
				{ error: 'Missing groupId' },
				{ status: 400 },
			);
		}

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		// 1. Kick user if requested
		if (kickUserId) {
			const targetGroup = await prisma.group.findUnique({ where: { id: groupId } });
			await prisma.groupMember.deleteMany({
				where: {
					groupId,
					userId: kickUserId,
				},
			});
			await prisma.joinRequest.deleteMany({
				where: {
					groupId,
					userId: kickUserId,
				},
			});
			const existing = await prisma.group.findUnique({ where: { id: groupId } });
			if (existing && existing.officerIds.includes(kickUserId)) {
				await prisma.group.update({
					where: { id: groupId },
					data: {
						officerIds: existing.officerIds.filter((id) => id !== kickUserId),
					},
				});
			}

			// Push notify kicked member
			sendWebPushToUsers([kickUserId], {
				title: 'Club Membership Update',
				body: `You were removed from "${targetGroup?.name || 'Club'}".`,
				url: '/groups',
			}).catch(() => {});
		}

		// 2. Officer promotion/demotion push notification
		if (officerIds !== undefined) {
			const existing = await prisma.group.findUnique({ where: { id: groupId } });
			if (existing) {
				const oldOfficers = existing.officerIds || [];
				const newOfficers = officerIds || [];

				const promoted = newOfficers.filter((id: string) => !oldOfficers.includes(id));
				const demoted = oldOfficers.filter((id: string) => !newOfficers.includes(id));

				if (promoted.length > 0) {
					sendWebPushToUsers(promoted, {
						title: 'Congratulations! You are an Officer',
						body: `You were promoted to Officer in "${existing.name}".`,
						url: `/group/${groupId}/feed`,
					}).catch(() => {});
				}

				if (demoted.length > 0) {
					sendWebPushToUsers(demoted, {
						title: 'Club Role Update',
						body: `Your role in "${existing.name}" was changed to Member.`,
						url: `/group/${groupId}/feed`,
					}).catch(() => {});
				}
			}
		}

		// 3. Delete shared link / file if requested
		if (deleteLinkId || deleteFileId) {
			const messageId = deleteLinkId || deleteFileId;
			await prisma.feedMessage.deleteMany({
				where: {
					id: messageId,
					groupId,
				},
			});
		}

		// 4. Update settings
		const updatedGroup = await prisma.group.update({
			where: { id: groupId },
			data: {
				name: name !== undefined ? name : undefined,
				tagline: tagline !== undefined ? tagline : undefined,
				description: description !== undefined ? description : undefined,
				category: category !== undefined ? category : undefined,
				subject: category !== undefined ? category : undefined,
				meetingFrequency:
					meetingFrequency !== undefined ? meetingFrequency : undefined,
				meetingLocation:
					meetingLocation !== undefined ? meetingLocation : undefined,
				isPrivate:
					isPrivate !== undefined ? Boolean(isPrivate) : undefined,
				profanityFilter:
					profanityFilter !== undefined ? Boolean(profanityFilter) : undefined,
				bannerUrl: bannerUrl !== undefined ? bannerUrl : undefined,
				logoUrl: logoUrl !== undefined ? logoUrl : undefined,
				websiteUrl: websiteUrl !== undefined ? websiteUrl : undefined,
				instagramUrl: instagramUrl !== undefined ? instagramUrl : undefined,
				discordUrl: discordUrl !== undefined ? discordUrl : undefined,
				tags: tags !== undefined ? tags : undefined,
				officerIds: officerIds !== undefined ? officerIds : undefined,
			},
			include: {
				members: true,
			},
		});

		const formatted = {
			id: updatedGroup.id,
			name: updatedGroup.name,
			tagline: updatedGroup.tagline,
			description: updatedGroup.description,
			category: updatedGroup.category,
			subject: updatedGroup.subject,
			meetingFrequency: updatedGroup.meetingFrequency,
			meetingLocation: updatedGroup.meetingLocation,
			minMembers: updatedGroup.minMembers,
			maxMembers: updatedGroup.maxMembers,
			isPrivate: updatedGroup.isPrivate,
			profanityFilter: updatedGroup.profanityFilter,
			bannerUrl: updatedGroup.bannerUrl,
			logoUrl: updatedGroup.logoUrl,
			websiteUrl: updatedGroup.websiteUrl,
			instagramUrl: updatedGroup.instagramUrl,
			discordUrl: updatedGroup.discordUrl,
			tags: updatedGroup.tags,
			officerIds: updatedGroup.officerIds,
			leaderId: updatedGroup.leaderId,
			memberIds: updatedGroup.members.map((m) => m.userId),
		};

		return NextResponse.json({ success: true, group: formatted });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Groups PUT Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function DELETE(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const groupId = searchParams.get('groupId');

		if (!groupId) {
			return NextResponse.json(
				{ error: 'Missing groupId' },
				{ status: 400 },
			);
		}

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		await prisma.group.delete({
			where: { id: groupId },
		});

		return NextResponse.json({ success: true });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Groups DELETE Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
