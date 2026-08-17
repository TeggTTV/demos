'use client';

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from 'react';

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
}

export interface AttendanceRecord {
	id: string;
	eventId: string;
	groupId: string;
	userId: string;
	userName?: string;
	userEmail?: string;
	status: 'PRESENT' | 'LATE' | 'EXCUSED' | 'ABSENT';
	checkInMethod: 'CODE' | 'MANUAL' | 'QR';
	timestamp: string;
}

export type Theme = 'light' | 'dark';

interface AppContextType {
	currentUser: User | null;
	users: User[];
	groups: Group[];
	requests: JoinRequest[];
	feedMessages: FeedMessage[];
	events: MeetingEvent[];
	attendances: AttendanceRecord[];
	invites: ClubInvite[];
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
	joinViaInviteCode: (code: string) => Promise<{
		groupId?: string;
		success: boolean;
		group?: Group;
		error?: string;
	}>;
	refreshData: () => Promise<void>;
}

/* ──────────────────────────── Context ─────────────────────────── */

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [groups, setGroups] = useState<Group[]>([]);
	const [requests, setRequests] = useState<JoinRequest[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [feedMessages, setFeedMessages] = useState<FeedMessage[]>([]);
	const [events, setEvents] = useState<MeetingEvent[]>([]);
	const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
	const [invites, setInvites] = useState<ClubInvite[]>([]);
	const [theme, setTheme] = useState<Theme>('light');
	const [hydrated, setHydrated] = useState(false);

	/* ─── Hydrate pure from API ─── */
	const loadData = useCallback(async () => {
		try {
			// Groups / Clubs
			const gRes = await fetch('/api/groups');
			const gData = await gRes.json();
			if (gData.groups) {
				setGroups(gData.groups);
			}

			// Requests
			const rRes = await fetch('/api/requests');
			const rData = await rRes.json();
			if (rData.requests) {
				setRequests(rData.requests);
			}

			// Users
			const uRes = await fetch('/api/users');
			const uData = await uRes.json();
			if (uData.users) {
				setUsers(uData.users);
			}

			// Events
			const eRes = await fetch('/api/events');
			const eData = await eRes.json();
			if (eData.events) {
				setEvents(eData.events);
			}

			// Attendance
			const aRes = await fetch('/api/attendance');
			const aData = await aRes.json();
			if (aData.attendances) {
				setAttendances(aData.attendances);
			}

			// Invites
			const iRes = await fetch('/api/invites');
			const iData = await iRes.json();
			if (iData.invites) {
				setInvites(iData.invites);
			}
		} catch (e) {
			console.error('API loadData failed:', e);
		}
	}, []);

	/* eslint-disable react-hooks/set-state-in-effect */
	useEffect(() => {
		const savedTheme = localStorage.getItem('demos_theme') as Theme | null;
		const resolvedTheme = savedTheme || 'light';
		setTheme(resolvedTheme);
		document.documentElement.classList.toggle(
			'dark',
			resolvedTheme === 'dark',
		);

		const savedUser = localStorage.getItem('demos_current_user');
		if (savedUser && savedUser !== 'null') {
			try {
				setCurrentUser(JSON.parse(savedUser));
			} catch {
				localStorage.removeItem('demos_current_user');
			}
		}

		loadData();
		setHydrated(true);
	}, [loadData]);
	/* eslint-enable react-hooks/set-state-in-effect */

	/* ─── Theme Toggle ─── */
	const toggleTheme = useCallback(() => {
		setTheme((prev) => {
			const next = prev === 'light' ? 'dark' : 'light';
			localStorage.setItem('demos_theme', next);
			document.documentElement.classList.toggle('dark', next === 'dark');
			return next;
		});
	}, []);

	/* ─── Authentication Handlers ─── */
	const loginUser = useCallback(async (email: string, password: string) => {
		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			});
			const data = await res.json();
			if (data.success && data.user) {
				setCurrentUser(data.user);
				localStorage.setItem(
					'demos_current_user',
					JSON.stringify(data.user),
				);
				return { success: true };
			}
			return {
				success: false,
				error: data.error || 'Invalid email or password',
			};
		} catch (e) {
			console.error('Login error:', e);
			return {
				success: false,
				error: 'Network error occurred during login',
			};
		}
	}, []);

	const registerUser = useCallback(
		async (
			email: string,
			name: string,
			password: string,
			role: 'LEADER' | 'APPLICANT',
			avatarUrl?: string,
			bio?: string,
			major?: string,
			year?: string,
		) => {
			try {
				const res = await fetch('/api/auth/register', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						email,
						name,
						password,
						role,
						avatarUrl,
						bio,
						major,
						year,
					}),
				});
				const data = await res.json();
				if (data.success && data.user) {
					setCurrentUser(data.user);
					setUsers((prev) => [...prev, data.user]);
					localStorage.setItem(
						'demos_current_user',
						JSON.stringify(data.user),
					);
					return { success: true };
				}
				return {
					success: false,
					error: data.error || 'Registration failed',
				};
			} catch (e) {
				console.error('Registration error:', e);
				return {
					success: false,
					error: 'Network error occurred during registration',
				};
			}
		},
		[],
	);

	const logoutUser = useCallback(() => {
		setCurrentUser(null);
		localStorage.removeItem('demos_current_user');
	}, []);

	/* ─── Join Requests & Member Onboarding ─── */
	const sendJoinRequest = useCallback(
		async (groupId: string, message?: string) => {
			if (!currentUser) return;
			const exists = requests.find(
				(r) =>
					r.groupId === groupId &&
					r.userId === currentUser.id &&
					r.status === 'PENDING',
			);
			if (exists) return;

			try {
				const res = await fetch('/api/requests', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						action: 'create',
						groupId,
						userId: currentUser.id,
						message,
					}),
				});
				const data = await res.json();
				if (data.success && data.request) {
					setRequests((prev) => [...prev, data.request]);
				}
			} catch (e) {
				console.error('Could not save join request:', e);
			}
		},
		[currentUser, requests],
	);

	const approveRequest = useCallback(async (requestId: string) => {
		try {
			const res = await fetch('/api/requests', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'approve', requestId }),
			});
			const data = await res.json();
			if (data.success && data.request) {
				setRequests((prev) =>
					prev.map((r) => (r.id === requestId ? data.request : r)),
				);
				const gRes = await fetch('/api/groups');
				const gData = await gRes.json();
				if (gData.groups) setGroups(gData.groups);
			}
		} catch (e) {
			console.error('Could not approve request:', e);
		}
	}, []);

	const declineRequest = useCallback(async (requestId: string) => {
		try {
			const res = await fetch('/api/requests', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'decline', requestId }),
			});
			const data = await res.json();
			if (data.success && data.request) {
				setRequests((prev) =>
					prev.map((r) => (r.id === requestId ? data.request : r)),
				);
			}
		} catch (e) {
			console.error('Could not decline request:', e);
		}
	}, []);

	/* ─── Club Invite Codes ─── */
	const generateClubInvite = useCallback(
		async (groupId: string) => {
			const targetGroup = groups.find((g) => g.id === groupId);
			const prefix = targetGroup
				? targetGroup.name
						.replace(/[^A-Za-z0-9]/g, '')
						.slice(0, 4)
						.toUpperCase()
				: 'CLUB';
			const randomNum = Math.floor(1000 + Math.random() * 9000);
			const code = `DEMOS-${prefix}-${randomNum}`;

			try {
				const res = await fetch('/api/invites', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ groupId, code }),
				});
				const data = await res.json();
				if (data.success && data.invite) {
					setInvites((prev) => [data.invite, ...prev]);
					return { success: true, code: data.invite.code };
				}
				return {
					success: false,
					error: data.error || 'Failed to generate invite',
				};
			} catch (e) {
				console.error('Failed to generate invite:', e);
				return {
					success: false,
					error: 'Network error generating invite',
				};
			}
		},
		[groups],
	);

	const joinViaInviteCode = useCallback(
		async (code: string) => {
			if (!currentUser)
				return { success: false, error: 'Must be signed in' };

			let cleanCode = code.trim();
			if (cleanCode.includes('/join/')) {
				cleanCode =
					cleanCode.split('/join/').pop()?.split('?')[0] || cleanCode;
			}
			cleanCode = cleanCode.toUpperCase();

			try {
				const res = await fetch('/api/invites', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						action: 'redeem',
						code: cleanCode,
						userId: currentUser.id,
					}),
				});
				const data = await res.json();
				if (data.success && data.groupId) {
					const gRes = await fetch('/api/groups');
					const gData = await gRes.json();
					if (gData.groups) {
						setGroups(gData.groups);
						const joinedGroup = gData.groups.find(
							(g: Group) => g.id === data.groupId,
						);
						return {
							success: true,
							group: joinedGroup,
							groupId: data.groupId,
						};
					}
					return { success: true, groupId: data.groupId };
				}
				return {
					success: false,
					error: data.error || 'Invalid or expired invite code',
				};
			} catch (e) {
				console.error('Failed to redeem invite:', e);
				return {
					success: false,
					error: 'Network error redeeming invite',
				};
			}
		},
		[currentUser],
	);

	/* ─── Feed Messages & Announcements ─── */
	const postMessage = useCallback(
		async (
			groupId: string,
			content: string,
			fileName?: string,
			fileUrl?: string,
			isAnnouncement?: boolean,
			pinned?: boolean,
		) => {
			if (!currentUser) return;

			try {
				const res = await fetch('/api/feed', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						groupId,
						userId: currentUser.id,
						content,
						fileName,
						fileUrl,
						isAnnouncement,
						pinned,
					}),
				});
				const data = await res.json();
				if (data.success && data.message) {
					setFeedMessages((prev) => [...prev, data.message]);
				}
			} catch (e) {
				console.error('Could not save feed message:', e);
			}
		},
		[currentUser],
	);

	const deleteMessage = useCallback(async (messageId: string) => {
		try {
			const res = await fetch(`/api/feed?messageId=${messageId}`, {
				method: 'DELETE',
			});
			const data = await res.json();
			if (data.success) {
				setFeedMessages((prev) =>
					prev.filter((m) => m.id !== messageId),
				);
			}
		} catch (e) {
			console.error('Could not delete message:', e);
		}
	}, []);

	const fetchFeedMessages = useCallback(async (groupId: string) => {
		try {
			const res = await fetch(`/api/feed?groupId=${groupId}`);
			const data = await res.json();
			if (data.messages) {
				setFeedMessages((prev) => {
					const otherGroupMsgs = prev.filter(
						(m) => m.groupId !== groupId,
					);
					return [...otherGroupMsgs, ...data.messages];
				});
			}
		} catch (e) {
			console.error('Feed API fetch failed:', e);
		}
	}, []);

	/* ─── Profile ─── */
	const updateProfile = useCallback(
		async (
			name: string,
			avatarUrl: string,
			bio?: string,
			major?: string,
			year?: string,
		) => {
			if (!currentUser) return;
			const updatedUser: User = {
				...currentUser,
				name,
				avatarUrl,
				bio: bio ?? currentUser.bio,
				major: major ?? currentUser.major,
				year: year ?? currentUser.year,
			};

			try {
				const res = await fetch('/api/auth', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(updatedUser),
				});
				const data = await res.json();
				if (data.success && data.user) {
					setCurrentUser(data.user);
					setUsers((prev) =>
						prev.map((u) =>
							u.id === data.user.id ? data.user : u,
						),
					);
					localStorage.setItem(
						'demos_current_user',
						JSON.stringify(data.user),
					);
				}
			} catch (e) {
				console.error('Could not update profile:', e);
			}
		},
		[currentUser],
	);

	/* ─── Club Creation & Settings ─── */
	const createGroup = useCallback(
		async (groupData: {
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
		}) => {
			if (!currentUser)
				return { success: false, error: 'User not signed in' };

			try {
				const res = await fetch('/api/groups', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						...groupData,
						leaderId: currentUser.id,
					}),
				});
				const data = await res.json();
				if (data.success && data.group) {
					setGroups((prev) => [data.group, ...prev]);
					return { success: true, group: data.group };
				}
				return {
					success: false,
					error: data.error || 'Failed to create club',
				};
			} catch (e) {
				console.error('Failed to create group:', e);
				return { success: false, error: 'Network error creating club' };
			}
		},
		[currentUser],
	);

	const updateGroupSettings = useCallback(
		async (
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
		) => {
			try {
				const res = await fetch('/api/groups', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ groupId, ...settings }),
				});
				const data = await res.json();
				if (data.success && data.group) {
					setGroups((prev) =>
						prev.map((g) => (g.id === groupId ? data.group : g)),
					);
					if (settings.kickUserId) {
						setRequests((prev) =>
							prev.filter(
								(r) =>
									!(
										r.groupId === groupId &&
										r.userId === settings.kickUserId
									),
							),
						);
					}
					if (settings.deleteLinkId || settings.deleteFileId) {
						const messageId =
							settings.deleteLinkId || settings.deleteFileId;
						if (messageId) {
							setFeedMessages((prev) =>
								prev.filter((m) => m.id !== messageId),
							);
						}
					}
					return { success: true };
				}
				return {
					success: false,
					error: data.error || 'Failed to update club',
				};
			} catch (e) {
				console.error('Failed to update group:', e);
				return { success: false, error: 'Network error updating club' };
			}
		},
		[],
	);

	/* ─── Event & Attendance Management ─── */
	const createMeetingEvent = useCallback(
		async (
			groupId: string,
			eventData: {
				title: string;
				description?: string;
				date: string;
				time: string;
				location?: string;
			},
		) => {
			if (!currentUser)
				return { success: false, error: 'Must be logged in' };

			const randomCode = `DEMO-${Math.floor(1000 + Math.random() * 9000)}`;

			try {
				const res = await fetch('/api/events', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						groupId,
						...eventData,
						checkInCode: randomCode,
						createdById: currentUser.id,
					}),
				});
				const data = await res.json();
				if (data.success && data.event) {
					setEvents((prev) => [data.event, ...prev]);
					return { success: true, event: data.event };
				}
				return {
					success: false,
					error: data.error || 'Failed to create meeting event',
				};
			} catch (e) {
				console.error('Failed to create meeting event:', e);
				return {
					success: false,
					error: 'Network error creating meeting event',
				};
			}
		},
		[currentUser],
	);

	const toggleEventActive = useCallback(
		async (eventId: string, isActive: boolean) => {
			try {
				const res = await fetch('/api/events', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ eventId, isActive }),
				});
				const data = await res.json();
				if (data.success && data.event) {
					setEvents((prev) =>
						prev.map((e) =>
							e.id === eventId ? { ...e, isActive } : e,
						),
					);
					return { success: true };
				}
				return { success: false };
			} catch (e) {
				console.error('Failed to toggle event active state:', e);
				return { success: false };
			}
		},
		[],
	);

	const deleteMeetingEvent = useCallback(async (eventId: string) => {
		try {
			const res = await fetch(`/api/events?eventId=${eventId}`, {
				method: 'DELETE',
			});
			const data = await res.json();
			if (data.success) {
				setEvents((prev) => prev.filter((e) => e.id !== eventId));
				setAttendances((prev) =>
					prev.filter((a) => a.eventId !== eventId),
				);
				return { success: true };
			}
			return { success: false };
		} catch (e) {
			console.error('Failed to delete meeting event:', e);
			return { success: false };
		}
	}, []);

	const checkInToEvent = useCallback(
		async (eventId: string, code: string) => {
			if (!currentUser)
				return {
					success: false,
					error: 'Must be logged in to check in',
				};

			const event = events.find((e) => e.id === eventId);
			if (!event) return { success: false, error: 'Event not found' };

			if (!event.isActive) {
				return {
					success: false,
					error: 'Attendance check-in for this event is closed',
				};
			}

			const cleanInput = code.trim().toUpperCase().replace(/\s+/g, '');
			const cleanTarget = event.checkInCode
				.trim()
				.toUpperCase()
				.replace(/\s+/g, '');
			const cleanTargetNum = cleanTarget.replace('DEMO-', '');

			if (cleanInput !== cleanTarget && cleanInput !== cleanTargetNum) {
				return {
					success: false,
					error: 'Invalid check-in code. Please ask an officer.',
				};
			}

			try {
				const res = await fetch('/api/attendance', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						eventId,
						groupId: event.groupId,
						userId: currentUser.id,
						userName: currentUser.name,
						userEmail: currentUser.email,
						status: 'PRESENT',
						checkInMethod: 'CODE',
					}),
				});
				const data = await res.json();
				if (data.success && data.record) {
					setAttendances((prev) => {
						const filtered = prev.filter(
							(a) =>
								!(
									a.eventId === eventId &&
									a.userId === currentUser.id
								),
						);
						return [data.record, ...filtered];
					});
					return {
						success: true,
						message: 'Attendance verified! You are checked in.',
					};
				}
				return {
					success: false,
					error: data.error || 'Failed to check in',
				};
			} catch (e) {
				console.error('Failed to check in:', e);
				return { success: false, error: 'Network error checking in' };
			}
		},
		[currentUser, events],
	);

	const updateAttendanceStatus = useCallback(
		async (
			eventId: string,
			userId: string,
			status: 'PRESENT' | 'LATE' | 'EXCUSED' | 'ABSENT',
		) => {
			const event = events.find((e) => e.id === eventId);
			const targetUser = users.find((u) => u.id === userId);

			try {
				const res = await fetch('/api/attendance', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						eventId,
						groupId: event?.groupId,
						userId,
						userName: targetUser?.name,
						userEmail: targetUser?.email,
						status,
						checkInMethod: 'MANUAL',
					}),
				});
				const data = await res.json();
				if (data.success && data.record) {
					setAttendances((prev) => {
						const filtered = prev.filter(
							(a) =>
								!(a.eventId === eventId && a.userId === userId),
						);
						return [data.record, ...filtered];
					});
					return { success: true };
				}
				return { success: false };
			} catch (e) {
				console.error('Failed to update attendance status:', e);
				return { success: false };
			}
		},
		[events, users],
	);

	return (
		<AppContext.Provider
			value={{
				currentUser,
				users,
				groups,
				requests,
				feedMessages,
				events,
				attendances,
				invites,
				theme,
				hydrated,
				toggleTheme,
				loginUser,
				registerUser,
				logoutUser,
				sendJoinRequest,
				approveRequest,
				declineRequest,
				postMessage,
				updateProfile,
				fetchFeedMessages,
				createGroup,
				deleteMessage,
				updateGroupSettings,
				createMeetingEvent,
				toggleEventActive,
				deleteMeetingEvent,
				checkInToEvent,
				updateAttendanceStatus,
				generateClubInvite,
				joinViaInviteCode,
				refreshData: loadData,
			}}
		>
			{children}
		</AppContext.Provider>
	);
}

export function useAppContext() {
	const ctx = useContext(AppContext);
	if (!ctx)
		throw new Error('useAppContext must be used within an AppProvider');
	return ctx;
}
