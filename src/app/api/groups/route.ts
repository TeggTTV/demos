import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma, isDbConnected } from '@/../utils/prisma';
import { sendWebPushToUsers } from '@/utils/serverPush';
import { getSession } from '@/../utils/auth';
import { validateBase64Upload } from '@/../utils/validation';


export async function GET(req: NextRequest) {
	try {
		const session = await getSession(req);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

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
	} catch (error) {
		console.error('Groups GET Error:', error);
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
		} = body;

		if (!name || !description) {
			return NextResponse.json(
				{ error: 'Missing required club details (name, description)' },
				{ status: 400 },
			);
		}

		if (name.trim().length < 2) {
			return NextResponse.json({ error: 'Group name must be at least 2 characters long' }, { status: 400 });
		}

		// Restrict uploads
		if (logoUrl) {
			const logoCheck = validateBase64Upload(logoUrl, ['image/'], 3);
			if (!logoCheck.isValid) {
				return NextResponse.json({ error: `Logo: ${logoCheck.error}` }, { status: 400 });
			}
		}
		if (bannerUrl) {
			const bannerCheck = validateBase64Upload(bannerUrl, ['image/'], 3);
			if (!bannerCheck.isValid) {
				return NextResponse.json({ error: `Banner: ${bannerCheck.error}` }, { status: 400 });
			}
		}


		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		// Create Group with leaderId strictly bound to session.userId (preventing tampering)
		const newGroup = await prisma.group.create({
			data: {
				name: name.trim(),
				tagline: tagline || null,
				description: description.trim(),
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
				leaderId: session.userId,
				members: {
					create: {
						userId: session.userId,
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
	} catch (error) {
		console.error('Groups POST Error:', error);
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

		// Authorization Check
		const existingGroup = await prisma.group.findUnique({
			where: { id: groupId },
		});

		if (!existingGroup) {
			return NextResponse.json({ error: 'Group not found' }, { status: 404 });
		}

		const isLeader = existingGroup.leaderId === session.userId;

		// Only group leaders can modify group settings
		if (!isLeader) {
			return NextResponse.json({ error: 'Access denied: only group leaders can modify group settings' }, { status: 403 });
		}

		// Restrict uploads
		if (logoUrl) {
			const logoCheck = validateBase64Upload(logoUrl, ['image/'], 3);
			if (!logoCheck.isValid) {
				return NextResponse.json({ error: `Logo: ${logoCheck.error}` }, { status: 400 });
			}
		}
		if (bannerUrl) {
			const bannerCheck = validateBase64Upload(bannerUrl, ['image/'], 3);
			if (!bannerCheck.isValid) {
				return NextResponse.json({ error: `Banner: ${bannerCheck.error}` }, { status: 400 });
			}
		}


		// Block field tampering: only leaders can manage officer promotions or kick members
		if ((officerIds !== undefined || kickUserId !== undefined) && !isLeader) {
			return NextResponse.json({ error: 'Access denied: only group leaders can change roles or kick members' }, { status: 403 });
		}

		// 1. Kick user if requested
		if (kickUserId) {
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
			if (existingGroup.officerIds.includes(kickUserId)) {
				await prisma.group.update({
					where: { id: groupId },
					data: {
						officerIds: existingGroup.officerIds.filter((id) => id !== kickUserId),
					},
				});
			}

			// Push notify kicked member
			sendWebPushToUsers([kickUserId], {
				title: 'Club Membership Update',
				body: `You were removed from "${existingGroup.name}".`,
				url: '/groups',
			}).catch(() => {});
		}

		// 2. Officer promotion/demotion push notification
		if (officerIds !== undefined) {
			const oldOfficers = existingGroup.officerIds || [];
			const newOfficers = officerIds || [];

			const promoted = newOfficers.filter((id: string) => !oldOfficers.includes(id));
			const demoted = oldOfficers.filter((id: string) => !newOfficers.includes(id));

			if (promoted.length > 0) {
				sendWebPushToUsers(promoted, {
					title: 'Congratulations! You are an Officer',
					body: `You were promoted to Officer in "${existingGroup.name}".`,
					url: `/group/${groupId}/feed`,
				}).catch(() => {});
			}

			if (demoted.length > 0) {
				sendWebPushToUsers(demoted, {
					title: 'Club Role Update',
					body: `Your role in "${existingGroup.name}" was changed to Member.`,
					url: `/group/${groupId}/feed`,
				}).catch(() => {});
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
	} catch (error) {
		console.error('Groups PUT Error:', error);
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

		if (!groupId) {
			return NextResponse.json(
				{ error: 'Missing groupId' },
				{ status: 400 },
			);
		}

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		// Authorization Check
		const group = await prisma.group.findUnique({
			where: { id: groupId },
		});

		if (!group) {
			return NextResponse.json({ error: 'Group not found' }, { status: 404 });
		}

		// Only group leaders can delete groups
		if (group.leaderId !== session.userId) {
			return NextResponse.json({ error: 'Access denied: only group leaders can delete groups' }, { status: 403 });
		}

		await prisma.group.delete({
			where: { id: groupId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Groups DELETE Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
