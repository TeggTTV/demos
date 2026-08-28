import { MOCK_USERS } from '@/mock/mockData';
import { AttendanceRecord, FeedMessage, JoinRequest, Poll } from '@/types/models';
import { playNotificationSound } from '@/utils/notificationUtils';

export interface SimulationResult {
	success: boolean;
	message: string;
	details?: string;
}

export const SimulationEngine = {
	/**
	 * Simulates a student checking into the active ACM Chapter meeting
	 */
	simulateCheckIn: (
		groupId = 'club_acm_01',
		eventId = 'event_acm_01',
	): { record: AttendanceRecord; studentName: string } => {
		const randomStudents = [
			{ id: 'user_marcus_w', name: 'Marcus Washington', email: 'marcus.w@campus.edu' },
			{ id: 'user_david_kim', name: 'David Kim', email: 'david.kim@campus.edu' },
			{ id: 'user_lucas_v', name: 'Lucas Vance', email: 'lucas.v@campus.edu' },
			{ id: 'user_priya_s', name: 'Priya Sharma', email: 'priya.s@campus.edu' },
		];
		const selected = randomStudents[Math.floor(Math.random() * randomStudents.length)];

		const record: AttendanceRecord = {
			id: `att_sim_${Date.now()}`,
			eventId,
			groupId,
			userId: selected.id,
			userName: selected.name,
			userEmail: selected.email,
			status: 'PRESENT',
			timestamp: new Date().toISOString(),
			checkInMethod: 'LINK',
			verifiedBy: 'Self Check-in (Simulated Link)',
		};

		playNotificationSound();
		return { record, studentName: selected.name };
	},

	/**
	 * Simulates an incoming vote on a poll
	 */
	simulatePollVote: (
		polls: Poll[],
		pollId = 'poll_acm_01',
	): { updatedPolls: Poll[]; voterName: string } => {
		const voters = ['Marcus Washington', 'Elena Rostova', 'David Kim', 'Lucas Vance'];
		const voterName = voters[Math.floor(Math.random() * voters.length)];
		const mockUserId = `user_sim_${Date.now()}`;

		const updatedPolls = polls.map((p) => {
			if (p.id !== pollId) return p;
			// Pick option with lowest votes to balance or random
			const minOptionIndex = p.options.reduce(
				(minIdx, opt, idx, arr) => (opt.votes.length < arr[minIdx].votes.length ? idx : minIdx),
				0,
			);
			const updatedOptions = p.options.map((opt, idx) => {
				if (idx === minOptionIndex) {
					return {
						...opt,
						votes: [...opt.votes, mockUserId],
					};
				}
				return opt;
			});
			return {
				...p,
				options: updatedOptions,
			};
		});

		playNotificationSound();
		return { updatedPolls, voterName };
	},

	/**
	 * Simulates a student applying to join a club
	 */
	simulateJoinRequest: (groupId = 'club_acm_01'): { request: JoinRequest; applicantName: string } => {
		const applicants = [
			{
				id: 'user_marcus_w',
				name: 'Marcus Washington',
				email: 'marcus.w@campus.edu',
				note: 'Excited about the upcoming cybersecurity CTF and web dev tracks! Would love to contribute to the open-source team.',
			},
			{
				id: 'user_david_kim',
				name: 'David Kim',
				email: 'david.kim@campus.edu',
				note: 'Freshman CS student with React experience looking to build projects and meet mentors.',
			},
		];
		const selected = applicants[Math.floor(Math.random() * applicants.length)];

		const request: JoinRequest = {
			id: `req_sim_${Date.now()}`,
			groupId,
			userId: selected.id,
			status: 'PENDING',
			message: selected.note,
			createdAt: new Date().toISOString(),
		};

		playNotificationSound();
		return { request, applicantName: selected.name };
	},

	/**
	 * Simulates an incoming campus announcement notification
	 */
	simulateNotification: (title?: string, message?: string) => {
		playNotificationSound();
		return {
			id: `notif_sim_${Date.now()}`,
			title: title || '📢 ACM Chapter: Hackathon Workshop',
			message:
				message ||
				'General meeting starts in 15 minutes in Science Hall 204. Live check-in link is now active!',
			type: 'feed_message' as const,
			link: '/group/club_acm_01/feed?tab=attendance',
			read: false,
			createdAt: new Date().toISOString(),
		};
	},

	/**
	 * Simulates a new feed message from a club officer
	 */
	simulateFeedMessage: (groupId = 'club_acm_01'): FeedMessage => {
		const messages = [
			'🚀 Excited to announce our guest speaker from Google DeepMind this Thursday at 6:00 PM!',
			'📋 Reminder: Please RSVP for the upcoming Fall Hackathon by Friday midnight so we can finalize catering.',
			'💡 New workshop slides and starter repositories have been uploaded to our resources tab.',
		];
		const content = messages[Math.floor(Math.random() * messages.length)];
		const leader = MOCK_USERS[0];

		return {
			id: `msg_sim_${Date.now()}`,
			groupId,
			userId: leader.id,
			content,
			isAnnouncement: true,
			pinned: false,
			createdAt: new Date().toISOString(),
			user: {
				id: leader.id,
				name: leader.name,
				avatarUrl: leader.avatarUrl,
			},
		};
	},
};
