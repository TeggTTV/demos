import { NextResponse } from 'next/server';
import { sendWebPushToUsers } from '@/utils/serverPush';

export async function POST(req: Request) {
	try {
		const { userId } = await req.json();

		if (!userId) {
			return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
		}

		await sendWebPushToUsers([userId], {
			title: '🎉 Demos Test Notification',
			body: 'Background push notifications are working perfectly on your iPhone!',
			url: '/settings',
		});

		return NextResponse.json({ success: true });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Test Push Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
