import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma, isDbConnected } from '@/../utils/prisma';
import { getSession } from '@/../utils/auth';
import { USE_MOCK_DATA } from '@/mock/mockConfig';
import { mockStore } from '@/mock/mockStore';

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const groupId = searchParams.get('groupId');
		const pollId = searchParams.get('pollId');

		if (USE_MOCK_DATA || (groupId && !/^[0-9a-fA-F]{24}$/.test(groupId)) || (pollId && !/^[0-9a-fA-F]{24}$/.test(pollId))) {
			if (pollId) {
				const poll = mockStore.getPollById(pollId);
				return NextResponse.json({ poll });
			}
			return NextResponse.json({ polls: mockStore.getPolls(groupId || undefined) });
		}

		const session = await getSession(req);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		if (pollId) {
			const poll = await prisma.poll.findUnique({
				where: { id: pollId },
				include: {
					creator: { select: { id: true, name: true, avatarUrl: true } },
				},
			});
			return NextResponse.json({ poll });
		}

		if (!groupId) {
			return NextResponse.json({ error: 'Missing groupId or pollId' }, { status: 400 });
		}

		const polls = await prisma.poll.findMany({
			where: { groupId },
			include: {
				creator: { select: { id: true, name: true, avatarUrl: true } },
			},
			orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
		});

		return NextResponse.json({ polls });
	} catch (error) {
		console.error('Polls GET Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const {
			groupId,
			title,
			description,
			category,
			options,
			isMultipleChoice,
			isAnonymous,
			allowUserOptions,
			expiresAt,
			pinned,
			postToFeed = true,
		} = body;

		if (!groupId || !title || !title.trim()) {
			return NextResponse.json({ error: 'Missing groupId or title' }, { status: 400 });
		}

		const cleanOptions = (options || []).filter((opt: string) => typeof opt === 'string' && opt.trim().length > 0);
		if (cleanOptions.length < 2) {
			return NextResponse.json({ error: 'At least 2 options are required' }, { status: 400 });
		}

		const session = await getSession(req);
		const userId = session?.userId || 'user_demo';

		if (USE_MOCK_DATA || !/^[0-9a-fA-F]{24}$/.test(groupId)) {
			const res = mockStore.createPoll(
				{
					groupId,
					title,
					description,
					category,
					options: cleanOptions,
					isMultipleChoice,
					isAnonymous,
					allowUserOptions,
					expiresAt,
					pinned,
					postToFeed,
				},
				userId,
			);
			return NextResponse.json(res);
		}

		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		// Security: verify user is leader or officer of the group
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
		const isOfficer = member?.role === 'OFFICER' || (group.officerIds && group.officerIds.includes(session.userId));

		if (!isLeader && !isOfficer) {
			return NextResponse.json({ error: 'Only leaders and officers can create polls' }, { status: 403 });
		}

		const formattedOptions = cleanOptions.map((optText: string, i: number) => ({
			id: `opt_${Date.now()}_${i}`,
			text: optText.trim(),
			votes: [],
		}));

		const newPoll = await prisma.poll.create({
			data: {
				groupId,
				creatorId: session.userId,
				title: title.trim(),
				description: description?.trim() || null,
				category: category || 'General',
				options: formattedOptions,
				isMultipleChoice: Boolean(isMultipleChoice),
				isAnonymous: Boolean(isAnonymous),
				allowUserOptions: Boolean(allowUserOptions),
				expiresAt: expiresAt ? new Date(expiresAt) : null,
				pinned: Boolean(pinned),
			},
			include: {
				creator: { select: { id: true, name: true, avatarUrl: true } },
			},
		});

		// Auto-post to feed
		if (postToFeed) {
			await prisma.feedMessage.create({
				data: {
					groupId,
					userId: session.userId,
					content: `📊 Poll: ${newPoll.title}`,
					subAppType: 'poll',
					pollId: newPoll.id,
				},
			});
		}

		return NextResponse.json({ success: true, poll: newPoll });
	} catch (error) {
		console.error('Polls POST Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function PATCH(req: NextRequest) {
	try {
		const body = await req.json();
		const { action, pollId, optionIds, optionText, isClosed, pinned } = body;

		if (!pollId) {
			return NextResponse.json({ error: 'Missing pollId' }, { status: 400 });
		}

		const session = await getSession(req);
		const userId = session?.userId || 'user_demo';

		if (USE_MOCK_DATA || !/^[0-9a-fA-F]{24}$/.test(pollId)) {
			if (action === 'vote') {
				const res = mockStore.votePoll(pollId, optionIds || [], userId);
				return NextResponse.json(res);
			}
			if (action === 'add_option') {
				const res = mockStore.addPollOption(pollId, optionText, userId);
				return NextResponse.json(res);
			}
			if (action === 'toggle_close') {
				const res = mockStore.togglePollClose(pollId, isClosed);
				return NextResponse.json(res);
			}
			if (action === 'toggle_pin') {
				const res = mockStore.togglePollPin(pollId, pinned);
				return NextResponse.json(res);
			}
			return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
		}

		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		const poll = await prisma.poll.findUnique({
			where: { id: pollId },
		});
		if (!poll) {
			return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
		}

		// Authorization checks for administrative actions
		if (action === 'toggle_close' || action === 'toggle_pin') {
			const group = await prisma.group.findUnique({ where: { id: poll.groupId } });
			const isLeader = group?.leaderId === session.userId;
			const isCreator = poll.creatorId === session.userId;
			const isOfficer = group?.officerIds?.includes(session.userId);

			if (!isLeader && !isCreator && !isOfficer) {
				return NextResponse.json({ error: 'Unauthorized action' }, { status: 403 });
			}

			const updated = await prisma.poll.update({
				where: { id: pollId },
				data: {
					isClosed: action === 'toggle_close' ? (isClosed !== undefined ? isClosed : !poll.isClosed) : undefined,
					pinned: action === 'toggle_pin' ? (pinned !== undefined ? pinned : !poll.pinned) : undefined,
				},
				include: {
					creator: { select: { id: true, name: true, avatarUrl: true } },
				},
			});
			return NextResponse.json({ success: true, poll: updated });
		}

		if (action === 'vote') {
			if (poll.isClosed) {
				return NextResponse.json({ error: 'Poll is closed' }, { status: 400 });
			}
			if (poll.expiresAt && new Date(poll.expiresAt).getTime() < Date.now()) {
				await prisma.poll.update({ where: { id: pollId }, data: { isClosed: true } });
				return NextResponse.json({ error: 'Poll has expired' }, { status: 400 });
			}

			const currentOptions = (poll.options as Array<{ id: string; text: string; votes: string[] }>) || [];
			const targetOptionIds = optionIds || [];

			const updatedOptions = currentOptions.map((opt) => {
				const filtered = opt.votes.filter((uid) => uid !== session.userId);
				if (targetOptionIds.includes(opt.id)) {
					filtered.push(session.userId);
				}
				return { ...opt, votes: filtered };
			});

			const updated = await prisma.poll.update({
				where: { id: pollId },
				data: { options: updatedOptions },
				include: {
					creator: { select: { id: true, name: true, avatarUrl: true } },
				},
			});

			return NextResponse.json({ success: true, poll: updated });
		}

		if (action === 'add_option') {
			if (poll.isClosed) {
				return NextResponse.json({ error: 'Poll is closed' }, { status: 400 });
			}
			if (!poll.allowUserOptions) {
				return NextResponse.json({ error: 'Member options disabled' }, { status: 403 });
			}
			if (!optionText || !optionText.trim()) {
				return NextResponse.json({ error: 'Option text required' }, { status: 400 });
			}

			const currentOptions = (poll.options as Array<{ id: string; text: string; votes: string[] }>) || [];
			const newOpt = {
				id: `opt_${Date.now()}`,
				text: optionText.trim(),
				votes: [session.userId],
			};

			let updatedOptions = [...currentOptions];
			if (!poll.isMultipleChoice) {
				updatedOptions = updatedOptions.map((opt) => ({
					...opt,
					votes: opt.votes.filter((uid) => uid !== session.userId),
				}));
			}
			updatedOptions.push(newOpt);

			const updated = await prisma.poll.update({
				where: { id: pollId },
				data: { options: updatedOptions },
				include: {
					creator: { select: { id: true, name: true, avatarUrl: true } },
				},
			});

			return NextResponse.json({ success: true, poll: updated });
		}

		return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
	} catch (error) {
		console.error('Polls PATCH Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const pollId = searchParams.get('pollId');

		if (!pollId) {
			return NextResponse.json({ error: 'Missing pollId' }, { status: 400 });
		}

		if (USE_MOCK_DATA || !/^[0-9a-fA-F]{24}$/.test(pollId)) {
			mockStore.deletePoll(pollId);
			return NextResponse.json({ success: true });
		}

		const session = await getSession(req);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		if (!(await isDbConnected())) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		const poll = await prisma.poll.findUnique({
			where: { id: pollId },
		});
		if (!poll) {
			return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
		}

		const group = await prisma.group.findUnique({ where: { id: poll.groupId } });
		const isLeader = group?.leaderId === session.userId;
		const isCreator = poll.creatorId === session.userId;
		const isOfficer = group?.officerIds?.includes(session.userId);

		if (!isLeader && !isCreator && !isOfficer) {
			return NextResponse.json({ error: 'Unauthorized to delete poll' }, { status: 403 });
		}

		await prisma.poll.delete({ where: { id: pollId } });
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Polls DELETE Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
