export const CLUB_CATEGORIES = [
	'Technology & Coding',
	'Arts & Design',
	'Engineering & Robotics',
	'Business & Entrepreneurship',
	'Media & Photography',
	'Science & Research',
	'Cultural & Social',
	'Sports & Recreation',
] as const;

export const EVENT_CATEGORIES = ['All', ...CLUB_CATEGORIES] as const;

export const MEETING_FREQUENCY_PRESETS = [
	'Weekly',
	'Bi-Weekly',
	'Monthly',
	'Custom Schedule',
] as const;

export const compileFrequency = (
	isCustom: boolean,
	preset: string,
	days: Record<string, boolean>,
	time: string,
): string => {
	if (!isCustom) return preset;
	const selectedDays = Object.keys(days).filter((d) => days[d]);
	if (selectedDays.length === 0) return `Weekly at ${time}`;
	return `Weekly on ${selectedDays.join(', ')} at ${time}`;
};

export const parseGroupFrequency = (freq?: string) => {
	const daysMap: Record<string, boolean> = {
		Mon: false,
		Tue: false,
		Wed: false,
		Thu: false,
		Fri: false,
		Sat: false,
		Sun: false,
	};
	let time = '18:00';
	let hasCustomDays = false;

	if (freq && freq.startsWith('Weekly on ')) {
		hasCustomDays = true;
		const parts = freq.replace('Weekly on ', '').split(' at ');
		if (parts[0]) {
			parts[0].split(', ').forEach((day) => {
				const trimmed = day.trim();
				if (daysMap[trimmed] !== undefined) daysMap[trimmed] = true;
			});
		}
		if (parts[1]) {
			time = parts[1].trim();
		}
	} else if (freq && freq.startsWith('Weekly at ')) {
		time = freq.replace('Weekly at ', '').trim();
	}
	return { hasCustomDays, days: daysMap, time };
};
