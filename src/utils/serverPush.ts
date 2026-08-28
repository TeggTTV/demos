import webpush from 'web-push';
import { prisma, isDbConnected } from '@/../utils/prisma';

const VAPID_PUBLIC_KEY =
	process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
	'BB4eNNEmNKgaMYSnsuOM-GRpIwBvtVusDf64vgeW0hiLN5FEq6IzI_Xi4QWFv6HhQBDDg5WUEXPZ3C08FS16DFs';
const VAPID_PRIVATE_KEY =
	process.env.VAPID_PRIVATE_KEY ||
	'XXyDSwK5de2gduhGAn_EA3xy0HOHOgAAA7v3w_OK3Qs';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@demos-clubs.edu';

try {
	webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (e) {
	console.warn('Failed to set VAPID details:', e);
}

export interface PushPayload {
	title: string;
	body: string;
	url?: string;
	icon?: string;
	badge?: string;
	tag?: string;
	data?: Record<string, unknown>;
}

/**
 * Dispatch Web Push notification to specific user IDs
 */
export async function sendWebPushToUsers(
	userIds: string[],
	payload: PushPayload,
) {
	if (!userIds || userIds.length === 0) return;
	const validUserIds = userIds.filter((id) => /^[0-9a-fA-F]{24}$/.test(id));
	if (validUserIds.length === 0) return;
	if (!(await isDbConnected())) return;

	try {
		const subscriptions = await prisma.pushSubscription.findMany({
			where: {
				userId: { in: validUserIds },
			},
		});

		if (subscriptions.length === 0) return;

		const jsonPayload = JSON.stringify({
			title: payload.title,
			body: payload.body,
			url: payload.url || '/',
			icon: payload.icon || '/web-app-manifest-192x192.png',
			badge: payload.badge || '/icon1.png',
			tag: payload.tag || `demos_${payload.title}`,
			data: { url: payload.url || '/' },
		});

		const sendPromises = subscriptions.map(async (sub) => {
			const pushSubscription = {
				endpoint: sub.endpoint,
				keys: {
					p256dh: sub.p256dh,
					auth: sub.auth,
				},
			};

			try {
				await webpush.sendNotification(pushSubscription, jsonPayload);
			} catch (err: unknown) {
				const pushError = err as { statusCode?: number };
				// 404 or 410 indicates expired or unsubscribed endpoint -> remove from DB
				if (pushError.statusCode === 404 || pushError.statusCode === 410) {
					await prisma.pushSubscription
						.delete({ where: { endpoint: sub.endpoint } })
						.catch(() => {});
				} else {
					console.warn('Web push delivery error:', err);
				}
			}
		});

		await Promise.allSettled(sendPromises);
	} catch (e) {
		console.error('sendWebPushToUsers error:', e);
	}
}

/**
 * Dispatch Web Push notification to members of a club
 */
export async function sendWebPushToGroupMembers(
	groupId: string,
	excludeUserId: string | null,
	payload: PushPayload,
) {
	if (!groupId || !/^[0-9a-fA-F]{24}$/.test(groupId)) return;
	if (!(await isDbConnected())) return;

	try {
		const group = await prisma.group.findUnique({
			where: { id: groupId },
			include: { members: true },
		});

		if (!group) return;

		const memberUserIds = group.members
			.map((m) => m.userId)
			.filter((id) => id !== excludeUserId);

		if (memberUserIds.length > 0) {
			await sendWebPushToUsers(memberUserIds, payload);
		}
	} catch (e) {
		console.error('sendWebPushToGroupMembers error:', e);
	}
}
