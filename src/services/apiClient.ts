import {
	User,
	Group,
	JoinRequest,
	ClubInvite,
	FeedMessage,
	MeetingEvent,
	AttendanceRecord,
} from '@/types/models';

async function safeJson<T>(res: Response): Promise<T> {
	const text = await res.text();
	if (!text || !text.trim()) {
		return { success: res.ok, error: res.ok ? undefined : `Request failed with status ${res.status}` } as T;
	}
	try {
		return JSON.parse(text) as T;
	} catch {
		return { success: res.ok, error: `Invalid response format (status ${res.status})` } as T;
	}
}

export const apiClient = {
	// ─── Auth & Users ───
	async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
		const res = await fetch('/api/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password }),
		});
		return safeJson(res);
	},

	async register(userData: {
		email: string;
		name: string;
		password: string;
		role: 'LEADER' | 'APPLICANT';
		avatarUrl?: string;
		bio?: string;
		major?: string;
		year?: string;
	}): Promise<{ success: boolean; user?: User; error?: string }> {
		const res = await fetch('/api/auth/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(userData),
		});
		return safeJson(res);
	},

	async logout(): Promise<{ success: boolean }> {
		const res = await fetch('/api/auth/logout', { method: 'POST' });
		return safeJson(res);
	},

	async fetchUsers(): Promise<{ users?: User[]; error?: string }> {
		const res = await fetch('/api/users');
		return safeJson(res);
	},

	async updateProfile(profileData: {
		name: string;
		avatarUrl: string;
		bio?: string;
		major?: string;
		year?: string;
		phone?: string;
		birthday?: string;
	}): Promise<{ success: boolean; user?: User; error?: string }> {
		const res = await fetch('/api/users/avatar', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(profileData),
		});
		return safeJson(res);
	},

	// ─── Groups ───
	async fetchGroups(): Promise<{ groups?: Group[]; error?: string }> {
		const res = await fetch('/api/groups');
		return safeJson(res);
	},

	async createGroup(groupData: {
		name: string;
		tagline?: string;
		description: string;
		category: string;
		meetingFrequency: string;
		meetingLocation?: string;
		minMembers: number;
		maxMembers: number;
		bannerUrl?: string;
		logoUrl?: string;
		websiteUrl?: string;
		instagramUrl?: string;
		discordUrl?: string;
		tags?: string[];
	}): Promise<{ success: boolean; group?: Group; error?: string }> {
		const res = await fetch('/api/groups', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(groupData),
		});
		return safeJson(res);
	},

	async updateGroupSettings(
		groupId: string,
		settings: {
			name?: string;
			tagline?: string;
			description?: string;
			category?: string;
			meetingFrequency?: string;
			meetingLocation?: string;
			isPrivate?: boolean;
			profanityFilter?: boolean;
			bannerUrl?: string;
			logoUrl?: string;
			websiteUrl?: string;
			instagramUrl?: string;
			discordUrl?: string;
			tags?: string[];
			officerIds?: string[];
			kickUserId?: string;
			deleteLinkId?: string;
			deleteFileId?: string;
			addMemberEmails?: string[];
		},
	): Promise<{ success: boolean; group?: Group; error?: string }> {
		const res = await fetch('/api/groups', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ groupId, ...settings }),
		});
		return safeJson(res);
	},

	async deleteGroup(groupId: string): Promise<{ success: boolean; error?: string }> {
		const res = await fetch(`/api/groups?groupId=${encodeURIComponent(groupId)}`, {
			method: 'DELETE',
		});
		return safeJson(res);
	},

	// ─── Invites ───
	async fetchInvites(): Promise<{ invites?: ClubInvite[]; error?: string }> {
		const res = await fetch('/api/invites');
		return safeJson(res);
	},

	async generateClubInvite(groupId: string): Promise<{ success: boolean; code?: string; error?: string }> {
		const res = await fetch('/api/invites', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ groupId }),
		});
		return safeJson(res);
	},

	async deleteClubInvites(groupId: string): Promise<{ success: boolean; error?: string }> {
		const res = await fetch(`/api/invites?groupId=${encodeURIComponent(groupId)}`, {
			method: 'DELETE',
		});
		return safeJson(res);
	},

	async joinViaInviteCode(code: string): Promise<{
		success: boolean;
		groupId?: string;
		group?: Group;
		error?: string;
	}> {
		const res = await fetch('/api/invites', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ code }),
		});
		return safeJson(res);
	},

	// ─── Join Requests ───
	async fetchRequests(): Promise<{ requests?: JoinRequest[]; error?: string }> {
		const res = await fetch('/api/requests');
		return safeJson(res);
	},

	async sendJoinRequest(groupId: string, message?: string): Promise<{ success: boolean; request?: JoinRequest; error?: string }> {
		const res = await fetch('/api/requests', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ groupId, message }),
		});
		return safeJson(res);
	},

	async updateRequestStatus(
		requestId: string,
		status: 'APPROVED' | 'DECLINED',
	): Promise<{ success: boolean; error?: string }> {
		const res = await fetch('/api/requests', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ requestId, status }),
		});
		return safeJson(res);
	},

	// ─── Feed Messages ───
	async fetchFeedMessages(groupId: string): Promise<{ messages?: FeedMessage[]; error?: string }> {
		const res = await fetch(`/api/feed?groupId=${encodeURIComponent(groupId)}`);
		return safeJson(res);
	},

	async postMessage(payload: {
		groupId: string;
		content: string;
		fileName?: string;
		fileUrl?: string;
		isAnnouncement?: boolean;
		pinned?: boolean;
	}): Promise<{ success: boolean; message?: FeedMessage; error?: string }> {
		const res = await fetch('/api/feed', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
		return safeJson(res);
	},

	async deleteMessage(messageId: string): Promise<{ success: boolean; error?: string }> {
		const res = await fetch(`/api/feed?messageId=${encodeURIComponent(messageId)}`, {
			method: 'DELETE',
		});
		return safeJson(res);
	},

	// ─── Events & Meetings ───
	async fetchEvents(params?: {
		groupId?: string;
		type?: 'activity' | 'attendance' | 'all';
		eventId?: string;
	}): Promise<{ events?: MeetingEvent[]; error?: string }> {
		const searchParams = new URLSearchParams();
		if (params?.groupId) searchParams.append('groupId', params.groupId);
		if (params?.type && params.type !== 'all') searchParams.append('type', params.type);
		if (params?.eventId) searchParams.append('eventId', params.eventId);
		const qs = searchParams.toString();
		const res = await fetch(`/api/events${qs ? `?${qs}` : ''}`);
		return safeJson(res);
	},

	async createMeetingEvent(
		groupId: string,
		eventData: {
			title: string;
			description?: string;
			date: string;
			time: string;
			location?: string;
			endDate?: string;
			price?: string;
			status?: string;
			locationType?: string;
			allDay?: boolean;
			endTime?: string;
			regRequired?: boolean;
			regCapacity?: number;
			regDeadline?: string;
			inviteMessage?: string;
			inviteReminderDays?: number;
			membersOnly?: boolean;
			bannerUrl?: string;
			isAttendanceSession?: boolean;
			eventType?: 'ACTIVITY' | 'ATTENDANCE_SESSION';
		},
	): Promise<{ success: boolean; event?: MeetingEvent; error?: string }> {
		const res = await fetch('/api/events', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ groupId, ...eventData }),
		});
		return safeJson(res);
	},

	async toggleEventActive(eventId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
		const res = await fetch('/api/events', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ eventId, isActive }),
		});
		return safeJson(res);
	},

	async deleteMeetingEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
		const res = await fetch(`/api/events?id=${encodeURIComponent(eventId)}`, {
			method: 'DELETE',
		});
		return safeJson(res);
	},

	// ─── Attendance ───
	async fetchAttendances(params?: {
		groupId?: string;
		eventId?: string;
	}): Promise<{ attendances?: AttendanceRecord[]; error?: string }> {
		const searchParams = new URLSearchParams();
		if (params?.groupId) searchParams.append('groupId', params.groupId);
		if (params?.eventId) searchParams.append('eventId', params.eventId);
		const qs = searchParams.toString();
		const res = await fetch(`/api/attendance${qs ? `?${qs}` : ''}`);
		return safeJson(res);
	},

	async checkInToEvent(payload: {
		eventId: string;
		code?: string;
		status?: string;
		checkInMethod?: 'CODE' | 'MANUAL' | 'QR';
	}): Promise<{ success: boolean; message?: string; isMembersOnly?: boolean; error?: string }> {
		const res = await fetch('/api/attendance', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
		return safeJson(res);
	},

	async updateAttendanceStatus(payload: {
		eventId: string;
		userId: string;
		status: 'PRESENT' | 'LATE' | 'EXCUSED' | 'ABSENT';
	}): Promise<{ success: boolean; error?: string }> {
		const res = await fetch('/api/attendance', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
		return safeJson(res);
	},
};
