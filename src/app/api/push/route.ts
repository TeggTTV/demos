import { NextResponse } from 'next/server';
import { prisma, isDbConnected } from '@/../utils/prisma';

export async function POST(req: Request) {
	try {
		const { userId, subscription } = await req.json();

		if (!userId || !subscription || !subscription.endpoint) {
			return NextResponse.json(
				{ error: 'Missing userId or subscription payload' },
				{ status: 400 },
			);
		}

		if (!(await isDbConnected())) {
			return NextResponse.json(
				{ error: 'Database unavailable' },
				{ status: 503 },
			);
		}

		const p256dh = subscription.keys?.p256dh || '';
		const auth = subscription.keys?.auth || '';

		const savedSub = await prisma.pushSubscription.upsert({
			where: { endpoint: subscription.endpoint },
			update: {
				userId,
				p256dh,
				auth,
			},
			create: {
				userId,
				endpoint: subscription.endpoint,
				p256dh,
				auth,
			},
		});

		return NextResponse.json({ success: true, subscription: savedSub });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Push Subscription POST Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function DELETE(req: Request) {
	try {
		const { endpoint } = await req.json();

		if (!endpoint) {
			return NextResponse.json(
				{ error: 'Missing endpoint' },
				{ status: 400 },
			);
		}

		if (!(await isDbConnected())) {
			return NextResponse.json(
				{ error: 'Database unavailable' },
				{ status: 503 },
			);
		}

		await prisma.pushSubscription
			.delete({
				where: { endpoint },
			})
			.catch(() => {});

		return NextResponse.json({ success: true });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Push Subscription DELETE Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
