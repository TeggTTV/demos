import { Group, User, AttendanceRecord, MeetingEvent } from '@/types/models';

/**
 * Downloads a CSV of the club roster.
 */
export function exportRosterToCSV(group: Group, users: User[]): void {
	if (!group) return;
	const headers = [
		'Name',
		'Email',
		'Major/Program',
		'Phone',
		'Role',
		'Last Active',
	];

	const rows = group.memberIds.map((mId) => {
		const mem = users.find((u) => u.id === mId);
		const isMemLeader = group.leaderId === mId;
		const isMemOfficer = Boolean(
			group.officerIds && group.officerIds.includes(mId),
		);
		const role = isMemLeader ? 'Leader' : isMemOfficer ? 'Officer' : 'Member';
		const lastActiveStr = mem?.lastActive
			? new Date(mem.lastActive).toLocaleString()
			: 'Never';

		return [
			mem?.name || 'Club Member',
			mem?.email || '',
			mem?.major || '',
			mem?.phone || '',
			role,
			lastActiveStr,
		];
	});

	const csvString = [
		headers.join(','),
		...rows.map((row) =>
			row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','),
		),
	].join('\n');

	const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.setAttribute('href', url);
	link.setAttribute(
		'download',
		`${group.name.replace(/\s+/g, '_')}_roster.csv`,
	);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

/**
 * Downloads a CSV of the attendance for a given meeting session.
 */
export function exportAttendanceCSV(
	group: Group,
	event: MeetingEvent,
	attendances: AttendanceRecord[],
	users: User[],
): void {
	if (!group || !event) return;
	const headers = [
		'Member Name',
		'Email',
		'Status',
		'Method',
		'Check-In Timestamp',
	];

	const eventAttendances = attendances.filter((a) => a.eventId === event.id);

	const rows = group.memberIds.map((mId) => {
		const u = users.find((user) => user.id === mId);
		const att = eventAttendances.find((a) => a.userId === mId);
		return [
			`"${(u?.name || 'Member').replace(/"/g, '""')}"`,
			`"${(u?.email || '').replace(/"/g, '""')}"`,
			`"${(att?.status || 'ABSENT').replace(/"/g, '""')}"`,
			`"${(att?.checkInMethod || 'N/A').replace(/"/g, '""')}"`,
			`"${(att?.timestamp || 'N/A').replace(/"/g, '""')}"`,
		];
	});

	const csvContent =
		'data:text/csv;charset=utf-8,' +
		[headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
	const encodedUri = encodeURI(csvContent);
	const link = document.createElement('a');
	link.setAttribute('href', encodedUri);
	link.setAttribute(
		'download',
		`${group.name.replace(/\s+/g, '_')}_Attendance_${event.date}.csv`,
	);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
