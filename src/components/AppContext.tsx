'use client';

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from 'react';
import {
	AppNotification,
	NotificationSettings,
	DEFAULT_NOTIFICATION_SETTINGS,
	NotificationType,
	playNotificationSound,
	sendBrowserNotification,
	subscribeToPushNotifications,
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
	const [notifications, setNotifications] = useState<AppNotification[]>([]);
	const [notificationSettings, setNotificationSettings] =
		useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
	const [theme, setTheme] = useState<Theme>('light');
	const [hydrated, setHydrated] = useState(false);

	/* ─── Service Worker Registration ─── */
	useEffect(() => {
		if (
			typeof window !== 'undefined' &&
			'serviceWorker' in navigator &&
			process.env.NODE_ENV !== 'development'
		) {
			navigator.serviceWorker
				.register('/sw.js')
				.then((reg) => {
					console.log('PWA ServiceWorker registration successful with scope:', reg.scope);
				})
				.catch((err) => {
					console.warn('PWA ServiceWorker registration failed:', err);
				});
		}
	}, []);

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

		// Load Notifications and Settings from localStorage
		const savedNotifications = localStorage.getItem('demos_notifications');
		if (savedNotifications) {
			try {
				setNotifications(JSON.parse(savedNotifications));
			} catch {
				localStorage.removeItem('demos_notifications');
			}
		}

		const savedSettings = localStorage.getItem('demos_notification_settings');
		if (savedSettings) {
			try {
				setNotificationSettings({
					...DEFAULT_NOTIFICATION_SETTINGS,
					...JSON.parse(savedSettings),
				});
			} catch {
				localStorage.removeItem('demos_notification_settings');
			}
		}

		loadData();
		setHydrated(true);
	}, [loadData]);
	/* eslint-enable react-hooks/set-state-in-effect */

	/* ─── Ref sync for notificationSettings & currentUser ─── */
	const settingsRef = React.useRef(notificationSettings);
	useEffect(() => {
		settingsRef.current = notificationSettings;
	}, [notificationSettings]);

	const userRef = React.useRef(currentUser);
	useEffect(() => {
		userRef.current = currentUser;
		if (
			currentUser &&
			typeof window !== 'undefined' &&
			'Notification' in window &&
			Notification.permission === 'granted'
		) {
			subscribeToPushNotifications(currentUser.id).catch(() => {});
		}
	}, [currentUser]);

	/* ─── Persist Notifications ─── */
	const saveNotifications = useCallback(
		(updater: AppNotification[] | ((prev: AppNotification[]) => AppNotification[])) => {
			setNotifications((prev) => {
				const next = typeof updater === 'function' ? updater(prev) : updater;
				try {
					localStorage.setItem(
						'demos_notifications',
						JSON.stringify(next),
					);
				} catch (e) {
					console.error('Failed to persist notifications:', e);
				}
				return next;
			});
		},
		[],
	);

	/* ─── Notification Dispatcher ─── */
	const triggerNotification = useCallback(
		({
			type,
			title,
			body,
			groupId,
			groupName,
			url = '/',
			meta,
		}: {
			type: NotificationType;
			title: string;
			body: string;
			groupId?: string;
			groupName?: string;
			url?: string;
			meta?: Record<string, unknown>;
		}) => {
			const currentSettings = settingsRef.current;
			// Check if this specific notification type is enabled
			if (currentSettings[type] === false) {
				return;
			}

			const newNotification: AppNotification = {
				id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				type,
				title,
				body,
				groupId,
				groupName,
				url,
				read: false,
				createdAt: new Date().toISOString(),
				meta,
			};

			saveNotifications((prev) => [newNotification, ...prev]);

			// Play sound if enabled
			if (currentSettings.soundEnabled) {
				playNotificationSound();
			}

			// Send browser notification if enabled
			if (currentSettings.browserPushEnabled) {
				sendBrowserNotification(title, body, url);
			}
		},
		[saveNotifications],
	);

	/* ─── Background Sync for Incoming Messages & Events ─── */
	const knownMessageIdsRef = React.useRef<Set<string>>(new Set());
	const isFirstSyncRef = React.useRef(true);

	useEffect(() => {
		let isMounted = true;

		async function pollIncomingData() {
			const user = userRef.current;
			if (!user) return;

			try {
				const res = await fetch('/api/feed');
				const data = await res.json();
				if (data.messages && isMounted) {
					const allMsgs: FeedMessage[] = data.messages;

					// If first sync on page load, record all existing message IDs
					if (isFirstSyncRef.current) {
						allMsgs.forEach((m) => knownMessageIdsRef.current.add(m.id));
						isFirstSyncRef.current = false;
						return;
					}

					// Find new messages sent by OTHER users
					const newMsgs = allMsgs.filter(
						(m) =>
							!knownMessageIdsRef.current.has(m.id) &&
							m.userId !== user.id,
					);

					// Record all IDs
					allMsgs.forEach((m) => knownMessageIdsRef.current.add(m.id));

					// Trigger notifications for new incoming messages
					newMsgs.forEach((m: FeedMessage) => {
						// If the user is actively looking at this specific club feed and the tab is focused, skip notification
						if (typeof window !== 'undefined') {
							const currentPath = window.location.pathname;
							const isViewingCurrentFeed =
								currentPath === `/group/${m.groupId}/feed` &&
								document.visibilityState === 'visible' &&
								document.hasFocus();

							if (isViewingCurrentFeed) {
								return;
							}
						}

						const senderName = m.user?.name || 'A member';
						const targetGroup = groups.find((g) => g.id === m.groupId);
						const groupTitle = targetGroup?.name || 'Club';

						if (m.fileUrl && m.fileName) {
							triggerNotification({
								type: 'feed_attachment',
								title: `New File in ${groupTitle}`,
								body: `${senderName} shared file "${m.fileName}".`,
								groupId: m.groupId,
								groupName: groupTitle,
								url: `/group/${m.groupId}/feed`,
							});
						} else if (
							m.content.includes('http://') ||
							m.content.includes('https://')
						) {
							triggerNotification({
								type: 'feed_link',
								title: `Resource Link in ${groupTitle}`,
								body: `${senderName} shared a link.`,
								groupId: m.groupId,
								groupName: groupTitle,
								url: `/group/${m.groupId}/feed`,
							});
						} else {
							triggerNotification({
								type: 'feed_message',
								title: `${groupTitle} Message`,
								body: `${senderName}: ${m.content.slice(0, 70)}${m.content.length > 70 ? '...' : ''}`,
								groupId: m.groupId,
								groupName: groupTitle,
								url: `/group/${m.groupId}/feed`,
							});
						}
					});
				}
			} catch {
				// Ignore polling network blips
			}
		}

		// Initial check
		pollIncomingData();

		// Poll every 5 seconds
		const interval = setInterval(pollIncomingData, 5000);
		return () => {
			isMounted = false;
			clearInterval(interval);
		};
	}, [groups, triggerNotification]);

	const markNotificationAsRead = useCallback(
		(id: string) => {
			saveNotifications((prev) =>
				prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
			);
		},
		[saveNotifications],
	);

	const markAllNotificationsAsRead = useCallback(() => {
		saveNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
	}, [saveNotifications]);

	const deleteNotification = useCallback(
		(id: string) => {
			saveNotifications((prev) => prev.filter((n) => n.id !== id));
		},
		[saveNotifications],
	);

	const clearAllNotifications = useCallback(() => {
		saveNotifications([]);
	}, [saveNotifications]);

	const updateNotificationSettings = useCallback(
		(newSettings: Partial<NotificationSettings>) => {
			setNotificationSettings((prev) => {
				const updated = { ...prev, ...newSettings };
				localStorage.setItem(
					'demos_notification_settings',
					JSON.stringify(updated),
				);
				return updated;
			});
		},
		[],
	);

	const unreadNotificationCount = notifications.filter((n) => !n.read).length;

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

			const targetGroup = groups.find((g) => g.id === groupId);

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

					triggerNotification({
						type: 'join_request',
						title: 'Join Request Submitted',
						body: `Your application to join "${targetGroup?.name || 'the club'}" was sent.`,
						groupId,
						groupName: targetGroup?.name,
						url: '/pending',
					});
				}
			} catch (e) {
				console.error('Could not save join request:', e);
			}
		},
		[currentUser, groups, requests, triggerNotification],
	);

	const approveRequest = useCallback(
		async (requestId: string) => {
			const reqObj = requests.find((r) => r.id === requestId);
			const targetGroup = groups.find((g) => g.id === reqObj?.groupId);
			const applicant = users.find((u) => u.id === reqObj?.userId);

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

					triggerNotification({
						type: 'join_request_status',
						title: 'Application Approved',
						body: `Approved ${applicant?.name || 'member'} for "${targetGroup?.name || 'Club'}".`,
						groupId: targetGroup?.id,
						groupName: targetGroup?.name,
						url: targetGroup ? `/group/${targetGroup.id}/feed` : '/groups',
					});

					triggerNotification({
						type: 'member_added',
						title: 'New Member Joined',
						body: `${applicant?.name || 'A student'} was added to "${targetGroup?.name || 'Club'}".`,
						groupId: targetGroup?.id,
						groupName: targetGroup?.name,
						url: targetGroup ? `/group/${targetGroup.id}/feed` : '/groups',
					});
				}
			} catch (e) {
				console.error('Could not approve request:', e);
			}
		},
		[groups, requests, triggerNotification, users],
	);

	const declineRequest = useCallback(
		async (requestId: string) => {
			const reqObj = requests.find((r) => r.id === requestId);
			const targetGroup = groups.find((g) => g.id === reqObj?.groupId);
			const applicant = users.find((u) => u.id === reqObj?.userId);

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

					triggerNotification({
						type: 'join_request_status',
						title: 'Join Request Declined',
						body: `Application for ${applicant?.name || 'member'} to join "${targetGroup?.name || 'Club'}" was declined.`,
						groupId: targetGroup?.id,
						groupName: targetGroup?.name,
						url: '/pending',
					});
				}
			} catch (e) {
				console.error('Could not decline request:', e);
			}
		},
		[groups, requests, triggerNotification, users],
	);

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
					let joinedGroup: Group | undefined;
					if (gData.groups) {
						setGroups(gData.groups);
						joinedGroup = gData.groups.find(
							(g: Group) => g.id === data.groupId,
						);
					}

					triggerNotification({
						type: 'invite_used',
						title: 'Invite Code Redeemed',
						body: `You joined "${joinedGroup?.name || 'Club'}" using code ${cleanCode}!`,
						groupId: data.groupId,
						groupName: joinedGroup?.name,
						url: `/group/${data.groupId}/feed`,
					});

					triggerNotification({
						type: 'member_added',
						title: 'Member Joined via Invite',
						body: `${currentUser.name} joined "${joinedGroup?.name || 'Club'}".`,
						groupId: data.groupId,
						groupName: joinedGroup?.name,
						url: `/group/${data.groupId}/feed`,
					});

					return {
						success: true,
						group: joinedGroup,
						groupId: data.groupId,
					};
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
		[currentUser, triggerNotification],
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
					// Add to known IDs so poll doesn't duplicate
					knownMessageIdsRef.current.add(data.message.id);
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
				const targetGroup = groups.find((g) => g.id === groupId);

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
						const kickedUser = users.find(
							(u) => u.id === settings.kickUserId,
						);
						triggerNotification({
							type: 'member_removed',
							title: 'Member Removed',
							body: `${kickedUser?.name || 'A member'} was removed from "${targetGroup?.name || 'Club'}".`,
							groupId,
							groupName: targetGroup?.name,
							url: `/group/${groupId}/feed`,
						});
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
		[groups, triggerNotification, users],
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

			const targetGroup = groups.find((g) => g.id === groupId);
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

					triggerNotification({
						type: 'attendance_opened',
						title: `Meeting Check-In Open: ${data.event.title}`,
						body: `Attendance is open for "${targetGroup?.name || 'Club'}" at ${eventData.time}. PIN: ${randomCode}`,
						groupId,
						groupName: targetGroup?.name,
						url: `/group/${groupId}/feed`,
					});

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
		[currentUser, groups, triggerNotification],
	);

	const toggleEventActive = useCallback(
		async (eventId: string, isActive: boolean) => {
			const targetEvent = events.find((e) => e.id === eventId);
			const targetGroup = groups.find((g) => g.id === targetEvent?.groupId);

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

					if (isActive) {
						triggerNotification({
							type: 'attendance_opened',
							title: `Check-In Opened: ${targetEvent?.title || 'Meeting'}`,
							body: `Attendance session is active for "${targetGroup?.name || 'Club'}". Code: ${targetEvent?.checkInCode}`,
							groupId: targetGroup?.id,
							groupName: targetGroup?.name,
							url: targetGroup
								? `/group/${targetGroup.id}/feed`
								: '/groups',
						});
					} else {
						triggerNotification({
							type: 'attendance_closed',
							title: `Check-In Closed: ${targetEvent?.title || 'Meeting'}`,
							body: `Attendance check-in has concluded for "${targetGroup?.name || 'Club'}".`,
							groupId: targetGroup?.id,
							groupName: targetGroup?.name,
							url: targetGroup
								? `/group/${targetGroup.id}/feed`
								: '/groups',
						});
					}

					return { success: true };
				}
				return { success: false };
			} catch (e) {
				console.error('Failed to toggle event active state:', e);
				return { success: false };
			}
		},
		[events, groups, triggerNotification],
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

					const targetGroup = groups.find((g) => g.id === event.groupId);
					triggerNotification({
						type: 'attendance_status',
						title: 'Check-In Confirmed',
						body: `You are marked PRESENT for "${event.title}" (${targetGroup?.name || 'Club'}).`,
						groupId: event.groupId,
						groupName: targetGroup?.name,
						url: `/group/${event.groupId}/feed`,
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
		[currentUser, events, groups, triggerNotification],
	);

	const updateAttendanceStatus = useCallback(
		async (
			eventId: string,
			userId: string,
			status: 'PRESENT' | 'LATE' | 'EXCUSED' | 'ABSENT',
		) => {
			const event = events.find((e) => e.id === eventId);
			const targetUser = users.find((u) => u.id === userId);
			const targetGroup = groups.find((g) => g.id === event?.groupId);

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

					triggerNotification({
						type: 'attendance_status',
						title: `Attendance Updated: ${status}`,
						body: `${targetUser?.name || 'Member'} marked as ${status} for "${event?.title || 'Meeting'}".`,
						groupId: event?.groupId,
						groupName: targetGroup?.name,
						url: event?.groupId
							? `/group/${event.groupId}/feed`
							: '/groups',
					});

					return { success: true };
				}
				return { success: false };
			} catch (e) {
				console.error('Failed to update attendance status:', e);
				return { success: false };
			}
		},
		[events, groups, triggerNotification, users],
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
				notifications,
				notificationSettings,
				unreadNotificationCount,
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
				triggerNotification,
				markNotificationAsRead,
				markAllNotificationsAsRead,
				deleteNotification,
				clearAllNotifications,
				updateNotificationSettings,
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
