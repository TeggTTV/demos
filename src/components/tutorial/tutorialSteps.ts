export type TourTrack = 'full' | 'officer' | 'student';

export interface TourStep {
	id: string;
	title: string;
	description: string;
	tip?: string;
	targetSelector: string;
	targetPage: string; // e.g. '/search', '/group/club_acm_01/feed?tab=attendance'
	tab?: string; // Optional sub-tab to switch to
	placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
	actionHint?: string;
	persona?: 'alex_chen' | 'maya_lin' | 'marcus_w'; // recommended persona for this step
}

export const TOUR_TRACKS_INFO: Record<
	TourTrack,
	{ title: string; subtitle: string; icon: string; estimatedTime: string; description: string }
> = {
	full: {
		title: 'Complete App Tour',
		subtitle: 'All platform features end-to-end',
		icon: '🌟',
		estimatedTime: '3 min',
		description:
			'Explore everything from club discovery and discussion feeds to officer live attendance tracking, interactive polls, and campus events.',
	},
	officer: {
		title: 'Club Leader & Officer Playbook',
		subtitle: 'Master administrative tools & attendance',
		icon: '👑',
		estimatedTime: '2 min',
		description:
			'Learn how to run live meeting attendance, generate QR check-in links, manage member roles, and export CSV audit reports.',
	},
	student: {
		title: 'Student Member Journey',
		subtitle: 'Find clubs, RSVP, and engage',
		icon: '🎓',
		estimatedTime: '2 min',
		description:
			'Discover campus clubs, submit applications with notes, vote on active polls, RSVP for upcoming campus events, and participate in club feeds.',
	},
};

export const TOUR_STEPS: Record<TourTrack, TourStep[]> = {
	full: [
		{
			id: 'welcome-hub',
			title: 'Welcome to Demos Club Platform',
			description:
				'Demos is your unified campus hub to discover student organizations, participate in active discussions, vote on polls, and track meeting attendance seamlessly.',
			tip: 'This tour will guide you through all major areas of the platform using interactive mock data.',
			targetSelector: '[data-tour="nav-brand"]',
			targetPage: '/',
			placement: 'bottom',
			actionHint: 'Click Next to explore campus clubs.',
		},
		{
			id: 'explore-search',
			title: '1. Discover & Explore Campus Clubs',
			description:
				'Browse active student organizations with categorized tags (Tech, Creative, Academic, Cultural) and search keywords. Click any club card to inspect meeting schedules and leadership rosters.',
			tip: 'Try clicking category chips like "Tech" or "Arts" to filter in real-time.',
			targetSelector: '[data-tour="search-filters"]',
			targetPage: '/search',
			placement: 'bottom',
		},
		{
			id: 'club-feed-hub',
			title: '2. Dedicated Club Feeds & Announcements',
			description:
				'Every club features a centralized feed with pinned leader announcements, markdown posts, flyer attachments, and emoji reactions.',
			tip: 'Members can reply with threaded discussions to stay coordinated.',
			targetSelector: '[data-tour="feed-composer"]',
			targetPage: '/group/club_acm_01/feed?tab=feed',
			tab: 'feed',
			placement: 'bottom',
		},
		{
			id: 'club-subapps',
			title: '3. Quick Action Sub-Apps',
			description:
				'Officers and leaders can quickly launch events, schedule meetings, create polls, share flyers, or copy quick check-in links directly from the header toolbar.',
			tip: 'Click the "+" button to open the quick action popover anytime.',
			targetSelector: '[data-tour="feed-subapps"]',
			targetPage: '/group/club_acm_01/feed?tab=feed',
			tab: 'feed',
			placement: 'left',
		},
		{
			id: 'attendance-center',
			title: '4. Live Officer Attendance Command Center',
			description:
				'Run live meeting sessions with one click. Generate shareable self check-in links and QR codes, or take attendance directly on the live officer roster checklist (Present, Late, Excused, Absent).',
			tip: 'You can export complete attendance records to CSV for campus audits.',
			targetSelector: '[data-tour="attendance-stats"]',
			targetPage: '/group/club_acm_01/feed?tab=attendance',
			tab: 'attendance',
			placement: 'bottom',
		},
		{
			id: 'interactive-polls',
			title: '5. Interactive Campus Polls & Live Voting',
			description:
				'Gather instant member feedback with single or multiple choice polls, anonymous voting options, and animated real-time percentage charts.',
			tip: 'Click any poll option to cast a vote and see the live percentage calculate immediately.',
			targetSelector: '[data-tour="polls-list"]',
			targetPage: '/group/club_acm_01/feed?tab=polls',
			tab: 'polls',
			placement: 'top',
		},
		{
			id: 'roster-and-roles',
			title: '6. Member Roster & Officer Hierarchy',
			description:
				'Manage member permissions, appoint new officers, transfer leadership, or generate invite codes with usage limits and expiration dates.',
			tip: 'Leaders have dedicated permission to edit club details and manage roles.',
			targetSelector: '[data-tour="roles-management"]',
			targetPage: '/group/club_acm_01/feed?tab=roles',
			tab: 'roles',
			placement: 'top',
		},
		{
			id: 'campus-events',
			title: '7. Campus Events & RSVP Hub',
			description:
				'View all public and members-only campus events in list or grid view. Filter by category, track your RSVP status (Going, Interested), and access meeting check-in links.',
			tip: 'Click the RSVP button on any event to update your attendance status.',
			targetSelector: '[data-tour="events-calendar-filters"]',
			targetPage: '/events',
			placement: 'bottom',
		},
		{
			id: 'notifications-profile',
			title: '8. Real-time Notifications & Preferences',
			description:
				'Stay informed with instant sound effects and notification badges for new announcements, poll updates, and attendance check-ins. Customize themes (Dark/Light) and notification preferences in Settings.',
			tip: 'Click the Bell icon in the top right to open the notification drawer.',
			targetSelector: '[data-tour="nav-notifications"]',
			targetPage: '/events',
			placement: 'left',
		},
	],
	officer: [
		{
			id: 'officer-overview',
			title: 'Officer Hub Overview',
			description:
				'As a club leader or officer, you have full administrative controls over meeting sessions, member rosters, invite codes, and club settings.',
			tip: 'Currently simulated as Alex Chen (ACM Chapter President).',
			targetSelector: '[data-tour="nav-brand"]',
			targetPage: '/group/club_acm_01/feed?tab=feed',
			tab: 'feed',
			placement: 'bottom',
		},
		{
			id: 'officer-attendance-checklist',
			title: '1. Live Meeting Roster Checklist',
			description:
				'Track member attendance in real-time. Click any status pill (Present, Late, Excused, Absent) to mark individual members.',
			tip: 'Use the "Mark All Present" button to quickly register everyone during general meetings.',
			targetSelector: '[data-tour="attendance-roster-checklist"]',
			targetPage: '/group/club_acm_01/feed?tab=attendance',
			tab: 'attendance',
			placement: 'top',
		},
		{
			id: 'officer-checkin-link',
			title: '2. Shareable Self Check-In & QR Code',
			description:
				'Project or share the active meeting link with attendees. Members can check in from their mobile devices with one tap.',
			tip: 'Click "Copy Check-in Link" to copy the direct URL.',
			targetSelector: '[data-tour="attendance-checkin-link"]',
			targetPage: '/group/club_acm_01/feed?tab=attendance',
			tab: 'attendance',
			placement: 'bottom',
		},
		{
			id: 'officer-roles',
			title: '3. Role Management & Appointments',
			description:
				'Easily promote active members to Officer status, assign custom duties, or revoke permissions when leadership transitions occur.',
			tip: 'Role changes take effect immediately across all club sub-pages.',
			targetSelector: '[data-tour="roles-management"]',
			targetPage: '/group/club_acm_01/feed?tab=roles',
			tab: 'roles',
			placement: 'top',
		},
		{
			id: 'officer-invites',
			title: '4. Generate Shareable Invite Codes',
			description:
				'Create direct join codes with custom usage limits (e.g. 50 uses for orientation week) or expiration dates.',
			tip: 'Invite codes allow new recruits to bypass the pending queue.',
			targetSelector: '[data-tour="settings-invite-codes"]',
			targetPage: '/group/club_acm_01/feed?tab=settings',
			tab: 'settings',
			placement: 'top',
		},
	],
	student: [
		{
			id: 'student-search',
			title: '1. Find Clubs Matching Your Interests',
			description:
				'Use search keywords, tags, or browse the spotlight clubs to find organizations that fit your career and social goals.',
			tip: 'Click "Apply to Join" on any club card to send an application.',
			targetSelector: '[data-tour="search-filters"]',
			targetPage: '/search',
			placement: 'bottom',
		},
		{
			id: 'student-feed-engagement',
			title: '2. Stay in the Loop with Feeds',
			description:
				'Read the latest announcements, download shared slides/flyers, and interact with fellow members.',
			tip: 'Use emoji reactions to quickly support posts.',
			targetSelector: '[data-tour="feed-composer"]',
			targetPage: '/group/club_acm_01/feed?tab=feed',
			tab: 'feed',
			placement: 'bottom',
		},
		{
			id: 'student-polls',
			title: '3. Cast Your Vote on Campus Polls',
			description:
				'Make your voice heard on meeting times, event topics, and club merchandise choices through real-time polls.',
			tip: 'Your vote is tallied instantly with live percentage animations.',
			targetSelector: '[data-tour="polls-list"]',
			targetPage: '/group/club_acm_01/feed?tab=polls',
			tab: 'polls',
			placement: 'top',
		},
		{
			id: 'student-events',
			title: '4. RSVP to Upcoming Events',
			description:
				'Never miss a meeting, workshop, or hackathon. Keep track of events you are attending in the Campus Events Hub.',
			tip: 'RSVPing sends reminders and adds the event to your schedule.',
			targetSelector: '[data-tour="events-calendar-filters"]',
			targetPage: '/events',
			placement: 'bottom',
		},
	],
};
