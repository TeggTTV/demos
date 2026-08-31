import { NextResponse } from 'next/server';
import { sendWebPushToUsers } from '@/utils/serverPush';
import { prisma, isDbConnected } from '@/../utils/prisma';

export async function POST(req: Request) {
	try {
		const { userId } = await req.json();

		if (!userId) {
			return NextResponse.json(
				{ error: 'Missing userId' },
				{ status: 400 },
			);
		}

		if (!(await isDbConnected())) {
			return NextResponse.json(
				{ error: 'Database unavailable' },
				{ status: 503 },
			);
		}

		const subs = await prisma.pushSubscription.findMany({
			where: { userId },
		});

		console.log(
			`[Test Push] Found ${subs.length} active subscription(s) for user: ${userId}`,
		);

		await sendWebPushToUsers([userId], {
			title: '🎉 Deimos Test Notification',
			body: 'Background push notifications are working perfectly on your device!',
			url: '/settings',
		});

		return NextResponse.json({
			success: true,
			subscriptionCount: subs.length,
			message:
				subs.length === 0
					? 'No push device subscription registered in DB. Make sure you tapped "Enable Permissions" on your Home Screen PWA.'
					: `Test push sent to ${subs.length} device(s).`,
		});
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Test Push Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
