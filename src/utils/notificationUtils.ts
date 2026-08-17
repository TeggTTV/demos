export type NotificationType =
	| 'feed_message'
	| 'feed_attachment'
	| 'feed_link'
	| 'join_request'
	| 'join_request_status'
	| 'invite_used'
	| 'member_added'
	| 'member_promoted'
	| 'member_demoted'
	| 'member_removed'
	| 'attendance_opened'
	| 'attendance_closed'
	| 'attendance_status';

export interface AppNotification {
	id: string;
	type: NotificationType;
	title: string;
	body: string;
	groupId?: string;
	groupName?: string;
	url: string;
	read: boolean;
	createdAt: string;
	meta?: Record<string, unknown>;
}

export interface NotificationSettings {
	// Master Toggles
	browserPushEnabled: boolean;
	soundEnabled: boolean;
	inAppBannersEnabled: boolean;

	// Granular Notification Toggles (Direct names)
	feed_message: boolean;
	feed_attachment: boolean;
	feed_link: boolean;
	join_request: boolean;
	join_request_status: boolean;
	invite_used: boolean;
	member_added: boolean;
	member_promoted: boolean;
	member_demoted: boolean;
	member_removed: boolean;
	attendance_opened: boolean;
	attendance_closed: boolean;
	attendance_status: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
	browserPushEnabled: true,
	soundEnabled: true,
	inAppBannersEnabled: true,

	feed_message: true,
	feed_attachment: true,
	feed_link: true,
	join_request: true,
	join_request_status: true,
	invite_used: true,
	member_added: true,
	member_promoted: true,
	member_demoted: true,
	member_removed: true,
	attendance_opened: true,
	attendance_closed: true,
	attendance_status: true,
};

export const NOTIFICATION_CONFIG_MAP: Record<
	NotificationType,
	{ label: string; description: string; icon: string; category: string }
> = {
	feed_message: {
		label: 'Feed Message',
		description: 'New chat and discussion posts in your clubs',
		icon: '💬',
		category: 'Club Feed',
	},
	feed_attachment: {
		label: 'Feed Attachment',
		description: 'Files, documents, and flyers shared in your clubs',
		icon: '📎',
		category: 'Club Feed',
	},
	feed_link: {
		label: 'Feed Link',
		description: 'Resource links and links shared in your clubs',
		icon: '🔗',
		category: 'Club Feed',
	},
	join_request: {
		label: 'Join Request',
		description: 'New member applications for clubs you lead or manage',
		icon: '📩',
		category: 'Membership & Invites',
	},
	join_request_status: {
		label: 'Join Request Status',
		description: 'Updates when your club application is approved or declined',
		icon: '📋',
		category: 'Membership & Invites',
	},
	invite_used: {
		label: 'Invite Used',
		description: 'When someone redeems your club invite code',
		icon: '🎟️',
		category: 'Membership & Invites',
	},
	member_added: {
		label: 'Member Added',
		description: 'New members joining your club roster',
		icon: '👋',
		category: 'Club Officers & Members',
	},
	member_promoted: {
		label: 'Member Promoted',
		description: 'When you or a member is promoted to Officer or Leader',
		icon: '⭐',
		category: 'Club Officers & Members',
	},
	member_demoted: {
		label: 'Member Demoted',
		description: 'When an officer role is changed back to member',
		icon: '🛡️',
		category: 'Club Officers & Members',
	},
	member_removed: {
		label: 'Member Removed',
		description: 'When a member is removed from the club roster',
		icon: '🚫',
		category: 'Club Officers & Members',
	},
	attendance_opened: {
		label: 'Attendance Opened',
		description: 'When meeting check-in is opened with PIN code',
		icon: '⏱️',
		category: 'Attendance & Meetings',
	},
	attendance_closed: {
		label: 'Attendance Closed',
		description: 'When attendance session check-in is marked closed',
		icon: '🔒',
		category: 'Attendance & Meetings',
	},
	attendance_status: {
		label: 'Attendance Status',
		description: 'Updates to your attendance record (Present, Late, Excused)',
		icon: '✅',
		category: 'Attendance & Meetings',
	},
};

/**
 * Play a gentle Web Audio beep notification chime
 */
export function playNotificationSound() {
	try {
		if (typeof window === 'undefined') return;
		const AudioContextClass =
			window.AudioContext ||
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(window as any).webkitAudioContext;
		if (!AudioContextClass) return;

		const ctx = new AudioContextClass();
		if (ctx.state === 'suspended') {
			ctx.resume();
		}

		const now = ctx.currentTime;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.type = 'sine';
		// Friendly rising two-tone chime
		osc.frequency.setValueAtTime(587.33, now); // D5
		osc.frequency.setValueAtTime(880.0, now + 0.08); // A5

		gain.gain.setValueAtTime(0.001, now);
		gain.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
		gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

		osc.connect(gain);
		gain.connect(ctx.destination);

		osc.start(now);
		osc.stop(now + 0.3);
	} catch {
		// Ignore audio autoplay restrictions
	}
}

/**
 * Request standard HTML5 / PWA notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
	if (typeof window === 'undefined' || !('Notification' in window)) {
		return 'denied';
	}
	return await Notification.requestPermission();
}

/**
 * Dispatch system / browser notification via service worker or HTML5
 */
export async function sendBrowserNotification(
	title: string,
	body: string,
	url: string = '/',
) {
	if (typeof window === 'undefined' || !('Notification' in window)) return;
	if (Notification.permission !== 'granted') return;

	// Use ServiceWorkerRegistration if active
	if ('serviceWorker' in navigator) {
		try {
			const reg = await navigator.serviceWorker.ready;
			if (reg && reg.showNotification) {
				reg.showNotification(title, {
					body,
					icon: '/web-app-manifest-192x192.png',
					badge: '/icon1.png',
					data: { url },
				});
				return;
			}
		} catch {
			// Fallback to standard Notification constructor
		}
	}

	try {
		const notification = new Notification(title, {
			body,
			icon: '/web-app-manifest-192x192.png',
			data: { url },
		});
		notification.onclick = () => {
			window.focus();
			if (url) {
				window.location.href = url;
			}
			notification.close();
		};
	} catch {
		// Ignore errors if notification creation fails
	}
}

/**
 * Helper to convert Base64 URL string to Uint8Array for VAPID applicationServerKey
 */
function urlBase64ToUint8Array(base64String: string) {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding)
		.replace(/-/g, '+')
		.replace(/_/g, '/');

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

/**
 * Subscribe device to native PushManager and store on server
 */
export async function subscribeToPushNotifications(userId: string) {
	if (
		typeof window === 'undefined' ||
		!('serviceWorker' in navigator) ||
		!('PushManager' in window)
	) {
		return null;
	}

	try {
		const registration = await navigator.serviceWorker.ready;
		const vapidPublicKey =
			process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
			'BB4eNNEmNKgaMYSnsuOM-GRpIwBvtVusDf64vgeW0hiLN5FEq6IzI_Xi4QWFv6HhQBDDg5WUEXPZ3C08FS16DFs';

		const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

		let subscription = await registration.pushManager.getSubscription();

		if (!subscription) {
			subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: convertedVapidKey,
			});
		}

		// Register subscription with backend
		await fetch('/api/push', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userId,
				subscription,
			}),
		});

		return subscription;
	} catch (error) {
		console.error('Failed to subscribe to Web Push:', error);
		return null;
	}
}

/**
 * Unsubscribe device from PushManager
 */
export async function unsubscribeFromPushNotifications() {
	if (
		typeof window === 'undefined' ||
		!('serviceWorker' in navigator) ||
		!('PushManager' in window)
	) {
		return;
	}

	try {
		const registration = await navigator.serviceWorker.ready;
		const subscription = await registration.pushManager.getSubscription();
		if (subscription) {
			await fetch('/api/push', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ endpoint: subscription.endpoint }),
			});
			await subscription.unsubscribe();
		}
	} catch (e) {
		console.error('Failed to unsubscribe:', e);
	}
}
