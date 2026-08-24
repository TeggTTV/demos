'use client';

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	useRef,
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
import {
	User,
	Group,
	JoinRequest,
	ClubInvite,
	FeedMessage,
	MeetingEvent,
	AttendanceRecord,
	Theme,
	AppContextType,
} from '@/types/models';
import { apiClient } from '@/services/apiClient';
import { USE_MOCK_DATA } from '@/mock/mockConfig';

// Re-export all types so existing imports from AppContext continue working smoothly
export * from '@/types/models';

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
	const [isIdle, setIsIdle] = useState(false);

	/* ─── Service Worker Registration ─── */
	useEffect(() => {
		if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
			navigator.serviceWorker
				.register('/sw.js')
				.then((reg) => {
					console.log(
						'PWA ServiceWorker registered with scope:',
						reg.scope,
					);
				})
				.catch((err) => {
					console.warn('PWA ServiceWorker registration failed:', err);
				});
		}
	}, []);

	/* ─── Global Idle Detection (3 Minutes) ─── */
	useEffect(() => {
		if (typeof window === 'undefined') return;
		let timeoutId: NodeJS.Timeout;
		const resetTimer = () => {
			clearTimeout(timeoutId);
			setIsIdle(false);
			timeoutId = setTimeout(() => setIsIdle(true), 3 * 60 * 1000);
		};
		const eventsList = ['mousemove', 'keydown', 'click', 'scroll'];
		eventsList.forEach((e) => window.addEventListener(e, resetTimer));
		resetTimer();
		return () => {
			clearTimeout(timeoutId);
			eventsList.forEach((e) =>
				window.removeEventListener(e, resetTimer),
			);
		};
	}, []);

	/* ─── Modular Data Fetchers for Active Tabs / Pages ─── */
	const fetchGroups = useCallback(async () => {
		try {
			const data = await apiClient.fetchGroups();
			if (data.groups) setGroups(data.groups);
		} catch (e) {
			console.error('fetchGroups failed:', e);
		}
	}, []);

	const fetchRequests = useCallback(async () => {
		try {
			const data = await apiClient.fetchRequests();
			if (data.requests) setRequests(data.requests);
		} catch (e) {
			console.error('fetchRequests failed:', e);
		}
	}, []);

	const fetchUsers = useCallback(async () => {
		try {
			const data = await apiClient.fetchUsers();
			if (data.users) setUsers(data.users);
		} catch (e) {
			console.error('fetchUsers failed:', e);
		}
	}, []);

	const fetchEvents = useCallback(
		async (
			groupId?: string,
			type?: 'activity' | 'attendance' | 'all',
			eventId?: string,
		) => {
			try {
				const data = await apiClient.fetchEvents({ groupId, type, eventId });
				if (data.events) {
					setEvents((prev) => {
						if (!groupId && !eventId) return data.events!;
						if (eventId) {
							const eventMap = new Map(
								prev.map((e) => [e.id, e]),
							);
							data.events!.forEach((ev: MeetingEvent) => {
								eventMap.set(ev.id, ev);
							});
							return Array.from(eventMap.values());
						}
						const otherGroupEvents = prev.filter(
							(e) => e.groupId !== groupId,
						);
						return [...data.events!, ...otherGroupEvents];
					});
				}
			} catch (e) {
				console.error('fetchEvents failed:', e);
			}
		},
		[],
	);

	const fetchAttendances = useCallback(
		async (groupId?: string, eventId?: string) => {
			try {
				const data = await apiClient.fetchAttendances({ groupId, eventId });
				if (data.attendances) setAttendances(data.attendances);
			} catch (e) {
				console.error('fetchAttendances failed:', e);
			}
		},
		[],
	);

	const fetchInvites = useCallback(async () => {
		try {
			const data = await apiClient.fetchInvites();
			if (data.invites) setInvites(data.invites);
		} catch (e) {
			console.error('fetchInvites failed:', e);
		}
	}, []);

	/* ─── Hydrate pure from API ─── */
	const loadData = useCallback(async () => {
		const isPendingPage =
			typeof window !== 'undefined' &&
			window.location.pathname === '/pending';
		await Promise.allSettled([
			fetchGroups(),
			fetchRequests(),
			fetchUsers(),
			isPendingPage ? fetchInvites() : Promise.resolve(),
		]);
	}, [fetchGroups, fetchInvites, fetchRequests, fetchUsers]);

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

		const savedNotifications = localStorage.getItem('demos_notifications');
		if (savedNotifications) {
			try {
				setNotifications(JSON.parse(savedNotifications));
			} catch {
				localStorage.removeItem('demos_notifications');
			}
		}

		const savedSettings = localStorage.getItem(
			'demos_notification_settings',
		);
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
	const settingsRef = useRef(notificationSettings);
	useEffect(() => {
		settingsRef.current = notificationSettings;
	}, [notificationSettings]);

	const userRef = useRef(currentUser);
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
		(
			updater:
				| AppNotification[]
				| ((prev: AppNotification[]) => AppNotification[]),
		) => {
			setNotifications((prev) => {
				const next =
					typeof updater === 'function' ? updater(prev) : updater;
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

			if (currentSettings.soundEnabled) {
				playNotificationSound();
			}

			if (
				currentSettings.browserPushEnabled &&
				typeof document !== 'undefined' &&
				(document.visibilityState !== 'visible' || !document.hasFocus())
			) {
				sendBrowserNotification(title, body, url);
			}
		},
		[saveNotifications],
	);

	/* ─── Background Sync for Incoming Messages & App Data ─── */
	useEffect(() => {
		let active = true;
		let timeoutId: NodeJS.Timeout;
		let isPolling = false;

		async function pollIncomingData() {
			if (!active || isPolling || isIdle) return;
			const user = userRef.current;
			if ((!user && !USE_MOCK_DATA) || typeof window === 'undefined') return;

			const pathname = window.location.pathname;

			if (
				pathname === '/' ||
				pathname === '/terms' ||
				pathname === '/privacy' ||
				pathname === '/auth/login' ||
				pathname === '/auth/register' ||
				pathname === '/join'
			) {
				return;
			}

			isPolling = true;
			try {
				const searchParams = new URLSearchParams(
					window.location.search,
				);
				const currentTab = searchParams.get('tab') || 'feed';

				if (pathname.includes('/group/')) {
					const groupId = pathname.split('/')[2];
					if (currentTab === 'attendance') {
						const sessionId = searchParams.get('session');
						if (sessionId) {
							await Promise.allSettled([
								fetchEvents(groupId, 'attendance', sessionId),
								fetchAttendances(groupId, sessionId),
							]);
						} else {
							await Promise.allSettled([
								fetchEvents(groupId, 'attendance'),
								fetchAttendances(groupId),
							]);
						}
					} else if (
						currentTab === 'roster' ||
						currentTab === 'roles'
					) {
						await fetchUsers();
					}
				} else if (pathname === '/pending') {
					await Promise.allSettled([
						fetchRequests(),
						fetchInvites(),
					]);
				} else if (pathname === '/profile') {
					await fetchUsers();
				}
			} catch {
				// Ignore polling network blips
			} finally {
				isPolling = false;
			}
		}

		async function pollLoop() {
			await pollIncomingData();
			if (active) {
				timeoutId = setTimeout(pollLoop, 5000);
			}
		}

		if (typeof window !== 'undefined' && window.location.pathname !== '/') {
			pollLoop();
		} else {
			timeoutId = setTimeout(pollLoop, 5000);
		}

		return () => {
			active = false;
			clearTimeout(timeoutId);
		};
	}, [
		fetchAttendances,
		fetchEvents,
		fetchGroups,
		fetchInvites,
		fetchRequests,
		fetchUsers,
		isIdle,
		triggerNotification,
	]);

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
			const data = await apiClient.login(email, password);
			if (data.success && data.user) {
				setCurrentUser(data.user);
				localStorage.setItem(
					'demos_current_user',
					JSON.stringify(data.user),
				);
				return { success: true };
			}
			return { success: false, error: data.error || 'Invalid credentials' };
		} catch (e) {
			console.error('Login error:', e);
			return { success: false, error: 'Login network error' };
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
				const data = await apiClient.register({
					email,
					name,
					password,
					role,
					avatarUrl,
					bio,
					major,
					year,
				});
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
					error: data.error || 'Registration failed',
				};
			} catch (e) {
				console.error('Register error:', e);
				return { success: false, error: 'Registration network error' };
			}
		},
		[],
	);

	const logoutUser = useCallback(async () => {
		try {
			await apiClient.logout();
		} catch (e) {
			console.error('Logout error:', e);
		}
		setCurrentUser(null);
		localStorage.removeItem('demos_current_user');
		// eslint-disable-next-line @next/next/no-location-assign-relative-destination
		window.location.href = '/';
	}, []);

	/* ─── Join Request Handlers ─── */
	const sendJoinRequest = useCallback(
		async (groupId: string, message?: string) => {
			if (!currentUser) return;
			try {
				const data = await apiClient.sendJoinRequest(groupId, message);
				if (data.request) {
					setRequests((prev) => [data.request!, ...prev]);
					triggerNotification({
						type: 'join_request',
						title: 'Application Submitted',
						body: `Your request to join has been sent to club leaders.`,
						groupId,
						url: `/pending`,
					});
				}
			} catch (e) {
				console.error('sendJoinRequest error:', e);
			}
		},
		[currentUser, triggerNotification],
	);

	const approveRequest = useCallback(
		async (requestId: string) => {
			try {
				const reqObj = requests.find((r) => r.id === requestId);
				const data = await apiClient.updateRequestStatus(requestId, 'APPROVED');
				if (data.success) {
					setRequests((prev) =>
						prev.map((r) =>
							r.id === requestId ? { ...r, status: 'APPROVED' } : r,
						),
					);
					await fetchGroups();
					if (reqObj) {
						triggerNotification({
							type: 'join_request_status',
							title: 'Application Approved',
							body: `Membership application has been approved.`,
							groupId: reqObj.groupId,
							url: `/group/${reqObj.groupId}/feed?tab=roster`,
						});
					}
				}
			} catch (e) {
				console.error('approveRequest error:', e);
			}
		},
		[fetchGroups, requests, triggerNotification],
	);

	const declineRequest = useCallback(
		async (requestId: string) => {
			try {
				const reqObj = requests.find((r) => r.id === requestId);
				const data = await apiClient.updateRequestStatus(requestId, 'DECLINED');
				if (data.success) {
					setRequests((prev) =>
						prev.map((r) =>
							r.id === requestId ? { ...r, status: 'DECLINED' } : r,
						),
					);
					if (reqObj) {
						triggerNotification({
							type: 'join_request_status',
							title: 'Application Declined',
							body: `Membership request was declined.`,
							groupId: reqObj.groupId,
							url: `/pending`,
						});
					}
				}
			} catch (e) {
				console.error('declineRequest error:', e);
			}
		},
		[requests, triggerNotification],
	);

	/* ─── Club Invite Handlers ─── */
	const generateClubInvite = useCallback(
		async (groupId: string) => {
			try {
				const data = await apiClient.generateClubInvite(groupId);
				if (data.success && data.code) {
					await fetchInvites();
					return { success: true, code: data.code };
				}
				return { success: false, error: data.error || 'Failed to generate code' };
			} catch (e) {
				console.error('generateClubInvite error:', e);
				return { success: false, error: 'Network error generating invite' };
			}
		},
		[fetchInvites],
	);

	const deleteClubInvites = useCallback(
		async (groupId: string) => {
			try {
				const data = await apiClient.deleteClubInvites(groupId);
				if (data.success) {
					setInvites((prev) => prev.filter((i) => i.groupId !== groupId));
					return { success: true };
				}
				return { success: false, error: data.error };
			} catch (e) {
				console.error('deleteClubInvites error:', e);
				return { success: false, error: 'Network error deleting invites' };
			}
		},
		[],
	);

	const joinViaInviteCode = useCallback(
		async (code: string) => {
			try {
				const data = await apiClient.joinViaInviteCode(code);
				if (data.success && data.groupId) {
					await fetchGroups();
					triggerNotification({
						type: 'invite_used',
						title: 'Joined Club!',
						body: `You successfully joined ${data.group?.name || 'the club'} with invite code.`,
						groupId: data.groupId,
						url: `/group/${data.groupId}/feed`,
					});
					return {
						success: true,
						groupId: data.groupId,
						group: data.group,
					};
				}
				return {
					success: false,
					error: data.error || 'Invalid or expired invite code',
				};
			} catch (e) {
				console.error('joinViaInviteCode error:', e);
				return { success: false, error: 'Network error joining club' };
			}
		},
		[fetchGroups, triggerNotification],
	);

	/* ─── Feed Message Handlers ─── */
	const postMessage = useCallback(
		async (
			groupId: string,
			content: string,
			fileName?: string,
			fileUrl?: string,
			isAnnouncement?: boolean,
			pinned?: boolean,
		) => {
			try {
				const data = await apiClient.postMessage({
					groupId,
					content,
					fileName,
					fileUrl,
					isAnnouncement,
					pinned,
				});
				if (data.success && data.message) {
					setFeedMessages((prev) => [data.message!, ...prev]);
				}
			} catch (e) {
				console.error('postMessage error:', e);
			}
		},
		[],
	);

	const deleteMessage = useCallback(async (messageId: string) => {
		try {
			const data = await apiClient.deleteMessage(messageId);
			if (data.success) {
				setFeedMessages((prev) => prev.filter((m) => m.id !== messageId));
			}
		} catch (e) {
			console.error('deleteMessage error:', e);
		}
	}, []);

	const fetchFeedMessages = useCallback(async (groupId: string) => {
		try {
			const data = await apiClient.fetchFeedMessages(groupId);
			if (data.messages) {
				setFeedMessages(data.messages);
			}
		} catch (e) {
			console.error('fetchFeedMessages error:', e);
		}
	}, []);

	/* ─── Profile Update Handler ─── */
	const updateProfile = useCallback(
		async (
			name: string,
			avatarUrl: string,
			bio?: string,
			major?: string,
			year?: string,
			phone?: string,
			birthday?: string,
		) => {
			try {
				const data = await apiClient.updateProfile({
					name,
					avatarUrl,
					bio,
					major,
					year,
					phone,
					birthday,
				});
				if (data.success && data.user) {
					setCurrentUser(data.user);
					localStorage.setItem(
						'demos_current_user',
						JSON.stringify(data.user),
					);
					setUsers((prev) =>
						prev.map((u) => (u.id === data.user!.id ? data.user! : u)),
					);
				}
			} catch (e) {
				console.error('updateProfile error:', e);
			}
		},
		[],
	);

	/* ─── Group Management Handlers ─── */
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
			isPrivate?: boolean;
		}) => {
			try {
				const data = await apiClient.createGroup(groupData);
				if (data.success && data.group) {
					setGroups((prev) => [data.group!, ...prev]);
					return { success: true, group: data.group };
				}
				return {
					success: false,
					error: data.error || 'Failed to create club',
				};
			} catch (e) {
				console.error('createGroup error:', e);
				return { success: false, error: 'Network error creating club' };
			}
		},
		[],
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
				addMemberEmails?: string[];
			},
		) => {
			try {
				const data = await apiClient.updateGroupSettings(groupId, settings);
				if (data.success && data.group) {
					setGroups((prev) =>
						prev.map((g) => (g.id === groupId ? data.group! : g)),
					);
					return { success: true };
				}
				return {
					success: false,
					error: data.error || 'Failed to update club settings',
				};
			} catch (e) {
				console.error('updateGroupSettings error:', e);
				return { success: false, error: 'Network error updating settings' };
			}
		},
		[],
	);

	/* ─── Meeting Event & Attendance Handlers ─── */
	const createMeetingEvent = useCallback(
		async (
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
		) => {
			try {
				const data = await apiClient.createMeetingEvent(groupId, eventData);
				if (data.success && data.event) {
					setEvents((prev) => [data.event!, ...prev]);
					return { success: true, event: data.event };
				}
				return {
					success: false,
					error: data.error || 'Failed to create event',
				};
			} catch (e) {
				console.error('createMeetingEvent error:', e);
				return { success: false, error: 'Network error creating event' };
			}
		},
		[],
	);

	const toggleEventActive = useCallback(
		async (eventId: string, isActive: boolean) => {
			try {
				const data = await apiClient.toggleEventActive(eventId, isActive);
				if (data.success) {
					setEvents((prev) =>
						prev.map((e) =>
							e.id === eventId ? { ...e, isActive } : e,
						),
					);
					return { success: true };
				}
				return { success: false };
			} catch (e) {
				console.error('toggleEventActive error:', e);
				return { success: false };
			}
		},
		[],
	);

	const deleteMeetingEvent = useCallback(async (eventId: string) => {
		try {
			const data = await apiClient.deleteMeetingEvent(eventId);
			if (data.success) {
				setEvents((prev) => prev.filter((e) => e.id !== eventId));
				return { success: true };
			}
			return { success: false };
		} catch (e) {
			console.error('deleteMeetingEvent error:', e);
			return { success: false };
		}
	}, []);

	const checkInToEvent = useCallback(
		async (eventId: string, code: string) => {
			try {
				const data = await apiClient.checkInToEvent({
					eventId,
					code,
					checkInMethod: 'CODE',
				});
				if (data.success) {
					await fetchAttendances(undefined, eventId);
					return { success: true, message: data.message };
				}
				return { success: false, error: data.error || 'Check-in failed' };
			} catch (e) {
				console.error('checkInToEvent error:', e);
				return { success: false, error: 'Network error during check-in' };
			}
		},
		[fetchAttendances],
	);

	const updateAttendanceStatus = useCallback(
		async (
			eventId: string,
			userId: string,
			status: 'PRESENT' | 'LATE' | 'EXCUSED' | 'ABSENT',
		) => {
			try {
				const data = await apiClient.updateAttendanceStatus({
					eventId,
					userId,
					status,
				});
				if (data.success) {
					setAttendances((prev) => {
						const exists = prev.some(
							(a) => a.eventId === eventId && a.userId === userId,
						);
						if (exists) {
							return prev.map((a) =>
								a.eventId === eventId && a.userId === userId
									? { ...a, status, timestamp: new Date().toISOString() }
									: a,
							);
						}
						return [
							...prev,
							{
								id: `att_${Date.now()}_${Math.random()}`,
								eventId,
								groupId: '',
								userId,
								status,
								checkInMethod: 'MANUAL',
								timestamp: new Date().toISOString(),
							},
						];
					});
					return { success: true };
				}
				return { success: false };
			} catch (e) {
				console.error('updateAttendanceStatus error:', e);
				return { success: false };
			}
		},
		[],
	);

	const refreshData = useCallback(async () => {
		await loadData();
	}, [loadData]);

	const value: AppContextType = {
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
		isIdle,
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
		deleteClubInvites,
		joinViaInviteCode,
		fetchGroups,
		fetchInvites,
		fetchEvents,
		fetchAttendances,
		refreshData,
		triggerNotification,
		markNotificationAsRead,
		markAllNotificationsAsRead,
		deleteNotification,
		clearAllNotifications,
		updateNotificationSettings,
	};

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextType {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error('useAppContext must be used within an AppProvider');
	}
	return context;
}
