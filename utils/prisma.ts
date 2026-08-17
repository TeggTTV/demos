import { PrismaClient } from '../generated/prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		log: ['query'],
	});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function isDbConnected(): Promise<boolean> {
	if (
		!process.env.DATABASE_URL ||
		process.env.DATABASE_URL.includes('not-created-yet')
	) {
		return false;
	}
	try {
		// Quick connection check by querying a minimal command or user record
		const checkPromise = prisma.user.findFirst({ select: { id: true } });

		// Race with a timeout to prevent locking up build/server
		const timeoutPromise = new Promise<null>((_, reject) =>
			setTimeout(
				() => reject(new Error('Prisma database connection timeout')),
				2500,
			),
		);

		await Promise.race([checkPromise, timeoutPromise]);
		return true;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (e) {
		console.warn(
			'Prisma database offline or unreachable. Falling back to local storage.',
		);
		return false;
	}
}
