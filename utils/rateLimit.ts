// A simple in-memory rate limiter for serverless environments (suitable for single-instance or basic dev/production)
const tracker = new Map<string, { timestamps: number[] }>();

export function isRateLimited(
	key: string,
	limit: number,
	windowMs: number
): boolean {
	const now = Date.now();
	const record = tracker.get(key) || { timestamps: [] };

	// Clean up expired timestamps
	record.timestamps = record.timestamps.filter(
		(timestamp) => now - timestamp < windowMs
	);

	if (record.timestamps.length >= limit) {
		return true;
	}

	record.timestamps.push(now);
	tracker.set(key, record);
	return false;
}
