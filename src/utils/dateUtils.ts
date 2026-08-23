/**
 * Formats a last active timestamp into a human readable relative string.
 */
export function formatLastActive(dateString?: string): string {
	if (!dateString) return 'Never';
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);

	if (diffMins < 1) return 'Just now';
	if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
	if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
	if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
	return date.toLocaleDateString();
}

/**
 * Returns English weekday name (e.g. "Monday").
 */
export function getEnglishWeekday(date: Date): string {
	const days = [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
	];
	return days[date.getDay()];
}

/**
 * Returns English month name (e.g. "August").
 */
export function getEnglishMonth(date: Date): string {
	const months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	];
	return months[date.getMonth()];
}

/**
 * Formats a time string (HH:MM or HH:MM:SS) to 12-hour AM/PM format.
 */
export function formatTime12H(timeStr?: string): string {
	if (!timeStr) return '';
	const [hStr, mStr] = timeStr.split(':');
	const h = parseInt(hStr, 10);
	if (isNaN(h)) return timeStr;
	const period = h >= 12 ? 'PM' : 'AM';
	const h12 = h % 12 === 0 ? 12 : h % 12;
	return `${h12}:${mStr || '00'} ${period}`;
}
