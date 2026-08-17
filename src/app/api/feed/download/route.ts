import { NextResponse } from 'next/server';
import { prisma, isDbConnected } from '@/../utils/prisma';

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const messageId = searchParams.get('messageId');

		if (!messageId) {
			return NextResponse.json(
				{ error: 'Missing messageId parameter' },
				{ status: 400 },
			);
		}

		if (!(await isDbConnected())) {
			return NextResponse.json(
				{ error: 'Database unavailable' },
				{ status: 503 },
			);
		}

		const message = await prisma.feedMessage.findUnique({
			where: { id: messageId },
		});

		if (!message || !message.fileUrl) {
			return NextResponse.json(
				{ error: 'File not found' },
				{ status: 404 },
			);
		}

		// Handle base64 data URLs
		if (message.fileUrl.startsWith('data:')) {
			const matches = message.fileUrl.match(
				/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/,
			);
			if (matches) {
				const contentType = matches[1];
				const base64Data = matches[2];
				const buffer = Buffer.from(base64Data, 'base64');

				return new Response(buffer, {
					headers: {
						'Content-Type': contentType,
						'Content-Disposition': `attachment; filename="${message.fileName || 'file'}"`,
					},
				});
			}
		}

		// If it's a standard HTTP URL, redirect to it
		return NextResponse.redirect(new URL(message.fileUrl));
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Download GET Error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
