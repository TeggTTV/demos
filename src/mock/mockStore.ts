import {
	User,
	Group,
	MeetingEvent,
	AttendanceRecord,
	FeedMessage,
	JoinRequest,
	ClubInvite,
	Poll,
} from '@/types/models';
import {
	MOCK_USERS,
	MOCK_GROUPS,
	MOCK_EVENTS,
	MOCK_ATTENDANCES,
	MOCK_FEED_MESSAGES,
	MOCK_REQUESTS,
	MOCK_INVITES,
	MOCK_POLLS,
} from './mockData';
import { DEFAULT_CLUB_BANNER } from '@/constants/bannerPresets';

class MockDataStore {
	private users: User[] = [...MOCK_USERS];
	private groups: Group[] = [...MOCK_GROUPS];
	private events: MeetingEvent[] = [...MOCK_EVENTS];
	private attendances: AttendanceRecord[] = [...MOCK_ATTENDANCES];
	private feedMessages: FeedMessage[] = [...MOCK_FEED_MESSAGES];
	private requests: JoinRequest[] = [...MOCK_REQUESTS];
	private invites: ClubInvite[] = [...MOCK_INVITES];
	private polls: Poll[] = [...MOCK_POLLS];

	// ─── Users ───
	getUsers(): User[] {
		return [...this.users];
	}

	getUserById(id: string): User | undefined {
		return this.users.find((u) => u.id === id);
	}

	getUserByEmail(email: string): User | undefined {
		const clean = email.trim().toLowerCase();
		return this.users.find((u) => u.email.toLowerCase() === clean);
	}

	updateUser(id: string, updates: Partial<User>): User | undefined {
		const index = this.users.findIndex((u) => u.id === id);
		if (index === -1) return undefined;
		this.users[index] = { ...this.users[index], ...updates };
		return this.users[index];
	}

	login(email: string, password?: string): { success: boolean; user?: User; error?: string } {
		const user = this.getUserByEmail(email);
		if (!user) {
			return {
				success: false,
				error: 'Invalid email. (Tip: Use any demo account like alex.chen@campus.edu)',
			};
		}
		// In mock mode, allow any non-empty password or standard demo password
		if (password && password.trim() === '') {
			return { success: false, error: 'Password required' };
		}
		// Update last active
		user.lastActive = new Date().toISOString();
		return { success: true, user };
	}

	register(userData: {
		email: string;
		name: string;
		password?: string;
		role: 'LEADER' | 'APPLICANT';
		avatarUrl?: string;
		bio?: string;
		major?: string;
		year?: string;
	}): { success: boolean; user?: User; error?: string } {
		const existing = this.getUserByEmail(userData.email);
		if (existing) {
			return { success: false, error: 'User already exists with this email' };
		}
		const newUser: User = {
			id: `user_${Date.now()}`,
			email: userData.email,
			name: userData.name,
			avatarUrl:
				userData.avatarUrl ||
				`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userData.name)}`,
			role: userData.role || 'APPLICANT',
			bio: userData.bio || '',
			major: userData.major || 'Undeclared',
			year: userData.year || '2028',
			lastActive: new Date().toISOString(),
		};
		this.users.push(newUser);
		return { success: true, user: newUser };
	}

	// ─── Groups ───
	getGroups(): Group[] {
		return [...this.groups];
	}

	getGroupById(id: string): Group | undefined {
		return this.groups.find((g) => g.id === id);
	}

	createGroup(groupData: Partial<Group>, leaderId: string): Group {
		const newGroup: Group = {
			id: `club_${Date.now()}`,
			name: groupData.name || 'New Campus Club',
			tagline: groupData.tagline || '',
			description: groupData.description || '',
			category: groupData.category || 'General',
			subject: groupData.category || 'General',
			meetingFrequency: groupData.meetingFrequency || 'Weekly',
			meetingLocation: groupData.meetingLocation || '',
			minMembers: groupData.minMembers || 1,
			maxMembers: groupData.maxMembers || 50,
			leaderId,
			memberIds: [leaderId],
			isPrivate: Boolean(groupData.isPrivate),
			isPublicToGuests:
				groupData.isPublicToGuests !== undefined
					? Boolean(groupData.isPublicToGuests)
					: true,
			isPublicToMembers:
				groupData.isPublicToMembers !== undefined
					? Boolean(groupData.isPublicToMembers)
					: true,
			isFeatured:
				groupData.isFeatured !== undefined
					? Boolean(groupData.isFeatured)
					: true,
			profanityFilter: Boolean(groupData.profanityFilter),
			bannerUrl: groupData.bannerUrl || DEFAULT_CLUB_BANNER,
			logoUrl: groupData.logoUrl,
			websiteUrl: groupData.websiteUrl,
			instagramUrl: groupData.instagramUrl,
			discordUrl: groupData.discordUrl,
			tags: groupData.tags || [],
			createdAt: new Date().toISOString(),
		};
		this.groups.unshift(newGroup);
		return newGroup;
	}

	updateGroup(id: string, updates: Partial<Group> & { kickUserId?: string; addMemberEmails?: string[] }): Group | undefined {
		const index = this.groups.findIndex((g) => g.id === id);
		if (index === -1) return undefined;
		const current = this.groups[index];

		let memberIds = [...current.memberIds];
		let officerIds = [...(current.officerIds || [])];

		if (updates.kickUserId) {
			memberIds = memberIds.filter((uid) => uid !== updates.kickUserId);
			officerIds = officerIds.filter((uid) => uid !== updates.kickUserId);
		}

		if (updates.addMemberEmails && Array.isArray(updates.addMemberEmails)) {
			updates.addMemberEmails.forEach((email) => {
				const u = this.getUserByEmail(email);
				if (u && !memberIds.includes(u.id)) {
					memberIds.push(u.id);
				}
			});
		}

		if (updates.officerIds !== undefined) {
			officerIds = updates.officerIds;
		}

		const updated: Group = {
			...current,
			...updates,
			memberIds,
			officerIds,
		};
		this.groups[index] = updated;
		return updated;
	}

	deleteGroup(id: string): boolean {
		const initialLength = this.groups.length;
		this.groups = this.groups.filter((g) => g.id !== id);
		return this.groups.length < initialLength;
	}

	// ─── Events ───
	getEvents(params?: { groupId?: string; type?: string; eventId?: string; userId?: string }): MeetingEvent[] {
		let result = [...this.events];
		if (params?.eventId) {
			result = result.filter((e) => e.id === params.eventId);
		}
		if (params?.groupId) {
			result = result.filter((e) => e.groupId === params.groupId);
		}
		if (params?.type === 'attendance') {
			result = result.filter((e) => e.isAttendanceSession === true || e.eventType === 'ATTENDANCE_SESSION');
		} else if (params?.type === 'activity') {
			result = result.filter((e) => e.isAttendanceSession !== true && e.eventType !== 'ATTENDANCE_SESSION');
		}

		// Apply privacy settings when not querying a single event by ID
		if (!params?.eventId) {
			const userId = params?.userId;
			result = result.filter((e) => {
				const group = this.getGroupById(e.groupId);
				if (!group) return true;

				const isLeaderOrOfficer = Boolean(
					userId && (group.leaderId === userId || (group.officerIds && group.officerIds.includes(userId)))
				);
				const isMember = Boolean(
					userId && (isLeaderOrOfficer || group.memberIds.includes(userId))
				);

				// Draft / NOT_SENT privacy: only visible to club leaders and officers
				if ((e.status === 'NOT_SENT' || e.status === 'DRAFT') && !isLeaderOrOfficer) {
					return false;
				}

				// Private club privacy: only visible to club members
				if (group.isPrivate && !isMember) {
					return false;
				}

				// Club not public to guests: only visible if user is logged in & member
				if (group.isPublicToGuests === false && !isMember) {
					return false;
				}

				return true;
			});
		}

		return result;
	}

	getEventById(id: string): MeetingEvent | undefined {
		return this.events.find((e) => e.id === id);
	}

	createEvent(eventData: Partial<MeetingEvent>, userId: string): MeetingEvent {
		const group = this.getGroupById(eventData.groupId || '');
		const isAttendance = Boolean(eventData.isAttendanceSession || eventData.eventType === 'ATTENDANCE_SESSION');
		const newEvent: MeetingEvent = {
			id: `event_${Date.now()}`,
			groupId: eventData.groupId || '',
			title: eventData.title || 'Club Session',
			description: eventData.description || '',
			date: eventData.date || new Date().toISOString().split('T')[0],
			time: eventData.time || '18:00',
			location: eventData.location || '',
			checkInCode: eventData.checkInCode || `${Math.floor(100000 + Math.random() * 900000)}`,
			isActive: eventData.isActive !== undefined ? eventData.isActive : true,
			createdById: userId,
			createdAt: new Date().toISOString(),
			endDate: eventData.endDate,
			price: eventData.price,
			status: eventData.status || 'PUBLISHED',
			locationType: eventData.locationType,
			allDay: eventData.allDay,
			endTime: eventData.endTime,
			regRequired: eventData.regRequired,
			regCapacity: eventData.regCapacity,
			regDeadline: eventData.regDeadline,
			inviteMessage: eventData.inviteMessage,
			inviteReminderDays: eventData.inviteReminderDays,
			membersOnly: eventData.membersOnly,
			bannerUrl: eventData.bannerUrl,
			isAttendanceSession: isAttendance,
			eventType: isAttendance ? 'ATTENDANCE_SESSION' : 'ACTIVITY',
			group: group
				? {
						id: group.id,
						name: group.name,
						bannerUrl: group.bannerUrl,
						category: group.category,
					}
				: undefined,
		};
		this.events.unshift(newEvent);
		return newEvent;
	}

	updateEvent(id: string, updates: Partial<MeetingEvent>): MeetingEvent | undefined {
		const index = this.events.findIndex((e) => e.id === id);
		if (index === -1) return undefined;
		this.events[index] = { ...this.events[index], ...updates };
		return this.events[index];
	}

	deleteEvent(id: string): boolean {
		const initial = this.events.length;
		this.events = this.events.filter((e) => e.id !== id);
		this.attendances = this.attendances.filter((a) => a.eventId !== id);
		return this.events.length < initial;
	}

	// ─── Attendance ───
	getAttendances(params?: { groupId?: string; eventId?: string; userId?: string }): AttendanceRecord[] {
		let result = [...this.attendances];
		if (params?.groupId) {
			result = result.filter((a) => a.groupId === params.groupId);
		}
		if (params?.eventId) {
			result = result.filter((a) => a.eventId === params.eventId);
		}
		if (params?.userId) {
			result = result.filter((a) => a.userId === params.userId);
		}
		return result;
	}

	recordAttendance(payload: {
		eventId: string;
		userId: string;
		status?: AttendanceRecord['status'];
		checkInMethod?: 'CODE' | 'MANUAL' | 'QR';
		code?: string;
	}): { success: boolean; record?: AttendanceRecord; error?: string } {
		const event = this.getEventById(payload.eventId);
		if (!event) return { success: false, error: 'Event not found' };

		const user = this.getUserById(payload.userId);
		if (!user) return { success: false, error: 'User not found' };

		if (payload.checkInMethod === 'CODE' && payload.code) {
			const cleanInput = payload.code.trim().toUpperCase();
			const cleanTarget = event.checkInCode.trim().toUpperCase();
			if (cleanInput !== cleanTarget) {
				return { success: false, error: 'Invalid check-in code' };
			}
		}

		const existingIndex = this.attendances.findIndex(
			(a) => a.eventId === payload.eventId && a.userId === payload.userId,
		);

		const record: AttendanceRecord = {
			id: existingIndex !== -1 ? this.attendances[existingIndex].id : `att_${Date.now()}`,
			eventId: payload.eventId,
			groupId: event.groupId,
			userId: payload.userId,
			userName: user.name,
			userEmail: user.email,
			status: payload.status || 'PRESENT',
			checkInMethod: payload.checkInMethod || 'CODE',
			timestamp: new Date().toISOString(),
		};

		if (existingIndex !== -1) {
			this.attendances[existingIndex] = record;
		} else {
			this.attendances.unshift(record);
		}

		return { success: true, record };
	}

	updateAttendanceStatus(
		eventId: string,
		userId: string,
		status: AttendanceRecord['status'],
	): { success: boolean; record?: AttendanceRecord } {
		return this.recordAttendance({
			eventId,
			userId,
			status,
			checkInMethod: 'MANUAL',
		});
	}

	// ─── Feed ───
	getFeedMessages(groupId: string): FeedMessage[] {
		return this.feedMessages
			.filter((m) => m.groupId === groupId)
			.map((m) => {
				if (m.pollId) {
					return {
						...m,
						poll: this.getPollById(m.pollId),
					};
				}
				return m;
			})
			.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
	}

	postFeedMessage(payload: {
		groupId: string;
		userId: string;
		content: string;
		fileName?: string;
		fileUrl?: string;
		isAnnouncement?: boolean;
		pinned?: boolean;
		subAppType?: 'poll' | 'announcement' | 'resource' | 'general';
		pollId?: string;
	}): FeedMessage {
		const user = this.getUserById(payload.userId);
		const newMsg: FeedMessage = {
			id: `feed_${Date.now()}`,
			groupId: payload.groupId,
			userId: payload.userId,
			content: payload.content,
			fileName: payload.fileName,
			fileUrl: payload.fileUrl,
			isAnnouncement: Boolean(payload.isAnnouncement),
			pinned: Boolean(payload.pinned),
			subAppType: payload.subAppType || (payload.pollId ? 'poll' : 'general'),
			pollId: payload.pollId,
			poll: payload.pollId ? this.getPollById(payload.pollId) : undefined,
			createdAt: new Date().toISOString(),
			user: user
				? {
						id: user.id,
						name: user.name,
						avatarUrl: user.avatarUrl,
					}
				: undefined,
		};
		this.feedMessages.push(newMsg);
		return newMsg;
	}

	deleteFeedMessage(id: string): boolean {
		const init = this.feedMessages.length;
		this.feedMessages = this.feedMessages.filter((m) => m.id !== id);
		return this.feedMessages.length < init;
	}

	// ─── Polls Sub-App ───
	getPolls(groupId?: string): Poll[] {
		let result = [...this.polls];
		if (groupId) {
			result = result.filter((p) => p.groupId === groupId);
		}
		return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	}

	getPollById(id: string): Poll | undefined {
		return this.polls.find((p) => p.id === id);
	}

	createPoll(
		payload: {
			groupId: string;
			title: string;
			description?: string;
			category?: string;
			options: string[];
			isMultipleChoice?: boolean;
			isAnonymous?: boolean;
			allowUserOptions?: boolean;
			expiresAt?: string;
			pinned?: boolean;
			postToFeed?: boolean;
		},
		userId: string,
	): { success: boolean; poll?: Poll; error?: string } {
		const user = this.getUserById(userId);
		if (!payload.title || !payload.title.trim()) {
			return { success: false, error: 'Poll title is required' };
		}
		const validOptions = (payload.options || []).filter((opt) => opt.trim().length > 0);
		if (validOptions.length < 2) {
			return { success: false, error: 'Poll must have at least 2 options' };
		}

		const newPoll: Poll = {
			id: `poll_${Date.now()}`,
			groupId: payload.groupId,
			creatorId: userId,
			title: payload.title.trim(),
			description: payload.description?.trim() || '',
			category: payload.category || 'General',
			isMultipleChoice: Boolean(payload.isMultipleChoice),
			isAnonymous: Boolean(payload.isAnonymous),
			allowUserOptions: Boolean(payload.allowUserOptions),
			expiresAt: payload.expiresAt,
			isClosed: false,
			pinned: Boolean(payload.pinned),
			createdAt: new Date().toISOString(),
			creator: user
				? {
						id: user.id,
						name: user.name,
						avatarUrl: user.avatarUrl,
					}
				: undefined,
			options: validOptions.map((optText, index) => ({
				id: `opt_${Date.now()}_${index}`,
				text: optText.trim(),
				votes: [],
			})),
		};

		this.polls.unshift(newPoll);

		// If postToFeed is true, automatically create a feed message
		if (payload.postToFeed !== false) {
			this.postFeedMessage({
				groupId: payload.groupId,
				userId,
				content: `📊 Poll: ${newPoll.title}`,
				subAppType: 'poll',
				pollId: newPoll.id,
			});
		}

		return { success: true, poll: newPoll };
	}

	votePoll(
		pollId: string,
		optionIds: string[],
		userId: string,
	): { success: boolean; poll?: Poll; error?: string } {
		const pollIndex = this.polls.findIndex((p) => p.id === pollId);
		if (pollIndex === -1) {
			return { success: false, error: 'Poll not found' };
		}

		const poll = this.polls[pollIndex];
		if (poll.isClosed) {
			return { success: false, error: 'This poll is closed for voting.' };
		}

		if (poll.expiresAt && new Date(poll.expiresAt).getTime() < Date.now()) {
			poll.isClosed = true;
			return { success: false, error: 'This poll has expired.' };
		}

		const updatedOptions = poll.options.map((opt) => {
			// Remove existing vote for this user
			const filteredVotes = opt.votes.filter((uid) => uid !== userId);
			if (optionIds.includes(opt.id)) {
				filteredVotes.push(userId);
			}
			return {
				...opt,
				votes: filteredVotes,
			};
		});

		const updatedPoll: Poll = {
			...poll,
			options: updatedOptions,
		};

		this.polls[pollIndex] = updatedPoll;
		return { success: true, poll: updatedPoll };
	}

	addPollOption(
		pollId: string,
		optionText: string,
		userId: string,
	): { success: boolean; poll?: Poll; error?: string } {
		const pollIndex = this.polls.findIndex((p) => p.id === pollId);
		if (pollIndex === -1) {
			return { success: false, error: 'Poll not found' };
		}

		const poll = this.polls[pollIndex];
		if (poll.isClosed) {
			return { success: false, error: 'This poll is closed.' };
		}
		if (!poll.allowUserOptions) {
			return { success: false, error: 'Member options are not allowed on this poll.' };
		}
		if (!optionText || !optionText.trim()) {
			return { success: false, error: 'Option text cannot be empty.' };
		}

		const newOption = {
			id: `opt_${Date.now()}`,
			text: optionText.trim(),
			votes: [userId], // Automatically vote for the option created by the user
		};

		// If single choice, remove previous vote from other options
		let updatedOptions = [...poll.options];
		if (!poll.isMultipleChoice) {
			updatedOptions = updatedOptions.map((opt) => ({
				...opt,
				votes: opt.votes.filter((uid) => uid !== userId),
			}));
		}

		updatedOptions.push(newOption);

		const updatedPoll: Poll = {
			...poll,
			options: updatedOptions,
		};

		this.polls[pollIndex] = updatedPoll;
		return { success: true, poll: updatedPoll };
	}

	togglePollClose(
		pollId: string,
		isClosed?: boolean,
	): { success: boolean; poll?: Poll; error?: string } {
		const pollIndex = this.polls.findIndex((p) => p.id === pollId);
		if (pollIndex === -1) return { success: false, error: 'Poll not found' };
		const poll = this.polls[pollIndex];
		poll.isClosed = isClosed !== undefined ? isClosed : !poll.isClosed;
		return { success: true, poll };
	}

	togglePollPin(
		pollId: string,
		pinned?: boolean,
	): { success: boolean; poll?: Poll; error?: string } {
		const pollIndex = this.polls.findIndex((p) => p.id === pollId);
		if (pollIndex === -1) return { success: false, error: 'Poll not found' };
		const poll = this.polls[pollIndex];
		poll.pinned = pinned !== undefined ? pinned : !poll.pinned;
		return { success: true, poll };
	}

	deletePoll(pollId: string): boolean {
		const initial = this.polls.length;
		this.polls = this.polls.filter((p) => p.id !== pollId);
		return this.polls.length < initial;
	}

	// ─── Join Requests ───
	getRequests(userId?: string): JoinRequest[] {
		if (userId) {
			const managedGroups = this.groups
				.filter(
					(g) =>
						g.leaderId === userId ||
						(g.officerIds && g.officerIds.includes(userId)),
				)
				.map((g) => g.id);
			return this.requests.filter(
				(r) => managedGroups.includes(r.groupId) || r.userId === userId,
			);
		}
		return [...this.requests];
	}

	createRequest(groupId: string, userId: string, message?: string): JoinRequest {
		const newReq: JoinRequest = {
			id: `req_${Date.now()}`,
			groupId,
			userId,
			message: message || '',
			status: 'PENDING',
			createdAt: new Date().toISOString(),
		};
		this.requests.unshift(newReq);
		return newReq;
	}

	updateRequestStatus(
		requestId: string,
		status: 'APPROVED' | 'DECLINED',
	): { success: boolean; request?: JoinRequest } {
		const index = this.requests.findIndex((r) => r.id === requestId);
		if (index === -1) return { success: false };
		this.requests[index].status = status;
		const req = this.requests[index];

		if (status === 'APPROVED') {
			const group = this.getGroupById(req.groupId);
			if (group && !group.memberIds.includes(req.userId)) {
				group.memberIds.push(req.userId);
			}
		}

		return { success: true, request: req };
	}

	// ─── Invites ───
	getInvites(groupId?: string): ClubInvite[] {
		if (groupId) {
			return this.invites.filter((i) => i.groupId === groupId);
		}
		return [...this.invites];
	}

	generateInvite(groupId: string): ClubInvite {
		const code = `DEMOS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
		const newInvite: ClubInvite = {
			id: `inv_${Date.now()}`,
			groupId,
			code,
			status: 'ACTIVE',
			createdAt: new Date().toISOString(),
		};
		this.invites.unshift(newInvite);
		return newInvite;
	}

	deleteInvites(groupId: string): boolean {
		this.invites = this.invites.filter((i) => i.groupId !== groupId);
		return true;
	}

	redeemInvite(code: string, userId: string): { success: boolean; groupId?: string; group?: Group; error?: string } {
		const cleanCode = code.trim().toUpperCase();
		const invite = this.invites.find(
			(i) => i.code.toUpperCase() === cleanCode && i.status === 'ACTIVE',
		);
		if (!invite) {
			return { success: false, error: 'Invalid or expired invite code' };
		}
		const group = this.getGroupById(invite.groupId);
		if (!group) {
			return { success: false, error: 'Associated group not found' };
		}
		if (!group.memberIds.includes(userId)) {
			group.memberIds.push(userId);
		}
		return { success: true, groupId: group.id, group };
	}

	reset(): void {
		this.users = [...MOCK_USERS];
		this.groups = [...MOCK_GROUPS];
		this.events = [...MOCK_EVENTS];
		this.attendances = [...MOCK_ATTENDANCES];
		this.feedMessages = [...MOCK_FEED_MESSAGES];
		this.requests = [...MOCK_REQUESTS];
		this.invites = [...MOCK_INVITES];
		this.polls = [...MOCK_POLLS];
	}
}

// Global in-memory singleton for mock data session
const globalForMock = globalThis as unknown as { mockStoreInstance?: MockDataStore };
export const mockStore = globalForMock.mockStoreInstance || new MockDataStore();
if (process.env.NODE_ENV !== 'production') {
	globalForMock.mockStoreInstance = mockStore;
}
