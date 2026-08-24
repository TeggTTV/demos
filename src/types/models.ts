import {
	AppNotification,
	NotificationSettings,
	NotificationType,
} from '@/utils/notificationUtils';

/* ──────────────────────────── Types ──────────────────────────── */

export interface User {
	id: string;
	email: string;
	name: string;
	avatarUrl?: string;
	role: 'LEADER' | 'APPLICANT' | 'GUEST';
	bio?: string;
	major?: string;
	year?: string;
	phone?: string;
	birthday?: string;
	lastActive?: string;
}

export interface Group {
	id: string;
	name: string;
	tagline?: string;
	description: string;
	category: string;
	subject?: string; // compatibility
	meetingFrequency: string;
	meetingLocation?: string;
	minMembers: number;
	maxMembers: number;
	leaderId: string;
	memberIds: string[];
	officerIds?: string[];
	isPrivate?: boolean;
	profanityFilter?: boolean;
	bannerUrl?: string;
	logoUrl?: string;
	websiteUrl?: string;
	instagramUrl?: string;
	discordUrl?: string;
	tags?: string[];
	createdAt?: string;
}

export interface JoinRequest {
	id: string;
	groupId: string;
	userId: string;
	message?: string;
	status: 'PENDING' | 'APPROVED' | 'DECLINED';
	createdAt: string;
}

export interface ClubInvite {
	id: string;
	groupId: string;
	code: string;
	email?: string;
	status: 'ACTIVE' | 'USED' | 'EXPIRED';
	createdAt: string;
	expiresAt?: string;
}

export interface FeedMessage {
	id: string;
	groupId: string;
	userId: string;
	content: string;
	fileUrl?: string;
	fileName?: string;
	isAnnouncement?: boolean;
	pinned?: boolean;
	createdAt: string;
	user?: {
		id: string;
		name: string;
		avatarUrl?: string | null;
	};
}

export interface MeetingEvent {
	id: string;
	groupId: string;
	title: string;
	description?: string;
	date: string; // YYYY-MM-DD
	time: string; // e.g. "18:00"
	location?: string;
	checkInCode: string;
	isActive: boolean;
	createdById: string;
	createdAt: string;
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
	group?: {
		id: string;
		name: string;
		bannerUrl?: string;
		category?: string;
	};
}

export interface AttendanceRecord {
	id: string;
	eventId: string;
	groupId: string;
	userId: string;
	userName?: string;
	userEmail?: string;
	status:
		| 'PRESENT'
		| 'LATE'
		| 'EXCUSED'
		| 'ABSENT'
		| 'RSVP_YES'
		| 'RSVP_NO'
		| 'RSVP_MAYBE';
	checkInMethod: 'CODE' | 'MANUAL' | 'QR';
	timestamp: string;
}

export type Theme = 'light' | 'dark';

export interface AppContextType {
	currentUser: User | null;
	users: User[];
	groups: Group[];
	requests: JoinRequest[];
	feedMessages: FeedMessage[];
	events: MeetingEvent[];
	attendances: AttendanceRecord[];
	invites: ClubInvite[];
	notifications: AppNotification[];
	notificationSettings: NotificationSettings;
	unreadNotificationCount: number;
	theme: Theme;
	hydrated: boolean;
	toggleTheme: () => void;
	loginUser: (
		email: string,
		password: string,
	) => Promise<{ success: boolean; error?: string }>;
	registerUser: (
		email: string,
		name: string,
		password: string,
		role: 'LEADER' | 'APPLICANT',
		avatarUrl?: string,
		bio?: string,
		major?: string,
		year?: string,
	) => Promise<{ success: boolean; error?: string }>;
	logoutUser: () => void;
	sendJoinRequest: (groupId: string, message?: string) => Promise<void>;
	approveRequest: (requestId: string) => Promise<void>;
	declineRequest: (requestId: string) => Promise<void>;
	postMessage: (
		groupId: string,
		content: string,
		fileName?: string,
		fileUrl?: string,
		isAnnouncement?: boolean,
		pinned?: boolean,
	) => Promise<void>;
	updateProfile: (
		name: string,
		avatarUrl: string,
		bio?: string,
		major?: string,
		year?: string,
		phone?: string,
		birthday?: string,
	) => Promise<void>;
	fetchFeedMessages: (groupId: string) => Promise<void>;
	createGroup: (groupData: {
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
		isPrivate?: boolean;
	}) => Promise<{ success: boolean; group?: Group; error?: string }>;
	deleteMessage: (messageId: string) => Promise<void>;
	updateGroupSettings: (
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
		},
	) => Promise<{ success: boolean; error?: string }>;
	createMeetingEvent: (
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
			isAttendanceSession?: boolean;
			eventType?: 'ACTIVITY' | 'ATTENDANCE_SESSION';
		},
	) => Promise<{ success: boolean; event?: MeetingEvent; error?: string }>;
	toggleEventActive: (
		eventId: string,
		isActive: boolean,
	) => Promise<{ success: boolean }>;
	deleteMeetingEvent: (eventId: string) => Promise<{ success: boolean }>;
	checkInToEvent: (
		eventId: string,
		code: string,
	) => Promise<{ success: boolean; message?: string; error?: string }>;
	updateAttendanceStatus: (
		eventId: string,
		userId: string,
		status: 'PRESENT' | 'LATE' | 'EXCUSED' | 'ABSENT',
	) => Promise<{ success: boolean }>;
	generateClubInvite: (
		groupId: string,
	) => Promise<{ success: boolean; code?: string; error?: string }>;
	deleteClubInvites: (
		groupId: string,
	) => Promise<{ success: boolean; error?: string }>;
	joinViaInviteCode: (code: string) => Promise<{
		groupId?: string;
		success: boolean;
		group?: Group;
		error?: string;
	}>;
	isIdle: boolean;
	fetchGroups: () => Promise<void>;
	fetchInvites: () => Promise<void>;
	fetchEvents: (
		groupId?: string,
		type?: 'activity' | 'attendance' | 'all',
		eventId?: string,
	) => Promise<void>;
	fetchAttendances: (groupId?: string, eventId?: string) => Promise<void>;
	refreshData: () => Promise<void>;

	// Notifications API
	triggerNotification: (params: {
		type: NotificationType;
		title: string;
		body: string;
		groupId?: string;
		groupName?: string;
		url?: string;
		meta?: Record<string, unknown>;
	}) => void;
	markNotificationAsRead: (id: string) => void;
	markAllNotificationsAsRead: () => void;
	deleteNotification: (id: string) => void;
	clearAllNotifications: () => void;
	updateNotificationSettings: (
		newSettings: Partial<NotificationSettings>,
	) => void;
}
