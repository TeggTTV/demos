'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/components/AppContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { MeetingEvent } from '@/types/models';
import { ClubHubSkeleton } from '@/components/ui/Skeleton';
import ClubFeedHeader, { FeedTab } from '@/components/group/ClubFeedHeader';
import ClubFeedTab from '@/components/group/tabs/ClubFeedTab';
import ClubAttendanceTab from '@/components/group/tabs/ClubAttendanceTab';
import ClubRosterTab from '@/components/group/tabs/ClubRosterTab';
import ClubRolesTab from '@/components/group/tabs/ClubRolesTab';
import ClubSettingsTab from '@/components/group/tabs/ClubSettingsTab';
import ClubActivitiesTab from '@/components/group/tabs/ClubActivitiesTab';
import CreateEventModal from '@/components/group/CreateEventModal';
import ScheduleMeetingModal from '@/components/group/ScheduleMeetingModal';
import { USE_MOCK_DATA } from '@/mock/mockConfig';

export default function GroupFeedPage() {
	const { id } = useParams() as { id: string };
	const {
		currentUser,
		groups,
		feedMessages,
		postMessage,
		users,
		hydrated,
		fetchFeedMessages,
		deleteMessage,
		updateGroupSettings,
		events,
		attendances,
		createMeetingEvent,
		toggleEventActive,
		deleteMeetingEvent,
		checkInToEvent,
		updateAttendanceStatus,
		generateClubInvite,
		deleteClubInvites,
		invites,
		fetchGroups,
		fetchInvites,
		fetchEvents,
		fetchAttendances,
		isIdle,
	} = useAppContext();
	const router = useRouter();

	const group = groups.find((g) => g.id === id);
	const isLeader = currentUser
		? group?.leaderId === currentUser.id
		: Boolean(USE_MOCK_DATA);
	const isOfficer = Boolean(
		group?.officerIds && group.officerIds.includes(currentUser?.id || ''),
	);
	const canManage = isLeader || isOfficer || (!currentUser && USE_MOCK_DATA);

	const [activeTab, setActiveTabState] = useState<FeedTab>('feed');

	// Sync activeTab with URL search params / localStorage
	/* eslint-disable react-hooks/set-state-in-effect */
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const params = new URLSearchParams(window.location.search);
			const tabParam = params.get('tab') as FeedTab | null;
			const savedTab = localStorage.getItem(
				`demos_tab_${id}`,
			) as FeedTab | null;
			const validTabs: FeedTab[] = [
				'feed',
				'attendance',
				'roster',
				'activities',
			];
			if (canManage) validTabs.push('roles');
			if (isLeader) validTabs.push('settings');

			if (tabParam && validTabs.includes(tabParam)) {
				setActiveTabState(tabParam);
			} else if (savedTab && validTabs.includes(savedTab)) {
				setActiveTabState(savedTab);
			} else {
				setActiveTabState('feed');
			}
		}
	}, [id, isLeader, canManage]);
	/* eslint-enable react-hooks/set-state-in-effect */

	const setActiveTab = (tab: FeedTab) => {
		setActiveTabState(tab);
		if (typeof window !== 'undefined') {
			localStorage.setItem(`demos_tab_${id}`, tab);
			const url = new URL(window.location.href);
			url.searchParams.set('tab', tab);
			window.history.replaceState({}, '', url.toString());
		}
	};

	// Feed State
	const [isLoading, setIsLoading] = useState(true);

	// Attendance State
	const [selectedEventId, setSelectedEventIdState] = useState<string | null>(
		null,
	);
	const [activeSubTab, setActiveSubTabState] = useState<'roster' | 'info'>(
		'roster',
	);

	/* eslint-disable react-hooks/set-state-in-effect */
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const sessionParam = params.get('session');
		if (sessionParam) {
			setSelectedEventIdState(sessionParam);
		}
		const subParam = params.get('sub');
		if (subParam === 'info' || subParam === 'roster') {
			setActiveSubTabState(subParam);
		}
	}, []);
	/* eslint-enable react-hooks/set-state-in-effect */

	const setSelectedEventId = (sessionId: string | null) => {
		setSelectedEventIdState(sessionId);
		const url = new URL(window.location.href);
		if (sessionId) {
			url.searchParams.set('session', sessionId);
			url.searchParams.set('sub', activeSubTab);
		} else {
			url.searchParams.delete('session');
			url.searchParams.delete('sub');
		}
		window.history.replaceState(null, '', url.pathname + url.search);
	};

	const setActiveSubTab = (tab: 'roster' | 'info') => {
		setActiveSubTabState(tab);
		const url = new URL(window.location.href);
		url.searchParams.set('sub', tab);
		window.history.replaceState(null, '', url.pathname + url.search);
	};

	// Event Creation / Editing Modals State
	const [createEventModal, setCreateEventModal] = useState(false);
	const [editingActivityId, setEditingActivityId] = useState<string | null>(
		null,
	);
	const [eventTitle, setEventTitle] = useState('');
	const [eventDesc, setEventDesc] = useState('');
	const [eventDate, setEventDate] = useState(
		new Date().toISOString().split('T')[0],
	);
	const [eventTime, setEventTime] = useState('18:00');
	const [eventLocation, setEventLocation] = useState('');
	const [activityEndDate, setActivityEndDate] = useState('');
	const [activityPrice, setActivityPrice] = useState('');
	const [activityStatus, setActivityStatus] = useState('NOT_SENT');
	const [activityLocationType, setActivityLocationType] = useState('');
	const [activityAllDay, setActivityAllDay] = useState(false);
	const [activityEndTime, setActivityEndTime] = useState('10:00');
	const [activityRegRequired, setActivityRegRequired] = useState(false);
	const [activityRegCapacity, setActivityRegCapacity] = useState('');
	const [activityRegDeadline, setActivityRegDeadline] = useState('');
	const [activityMembersOnly, setActivityMembersOnly] = useState(false);
	const [activityInviteMessage, setActivityInviteMessage] = useState('');
	const [activityInviteReminderDays, setActivityInviteReminderDays] =
		useState('0');
	const [modalActiveTab, setModalActiveTab] = useState<
		'data' | 'login' | 'costs'
	>('data');
	const [creatingEvent, setCreatingEvent] = useState(false);

	// Schedule Meeting Modal State
	const [createMeetingModal, setCreateMeetingModal] = useState(false);
	const [meetingTitle, setMeetingTitle] = useState('');
	const [meetingDesc, setMeetingDesc] = useState('');
	const [meetingDate, setMeetingDate] = useState('');
	const [meetingTime, setMeetingTime] = useState('18:00');
	const [meetingLocation, setMeetingLocation] = useState('');
	const [meetingEndDate, setMeetingEndDate] = useState('');
	const [meetingPrice, setMeetingPrice] = useState('');
	const [meetingStatus, setMeetingStatus] = useState('PUBLISHED');

	// Activities Birthday Toggle
	const [showBirthdaysTab, setShowBirthdaysTab] = useState(true);

	// Data Fetching Effects
	useEffect(() => {
		if (id && activeTab === 'feed') {
			fetchFeedMessages(id).finally(() => setIsLoading(false));
		}
	}, [id, activeTab, fetchFeedMessages]);

	useEffect(() => {
		if (id && activeTab === 'feed') {
			let isPolling = false;
			const pollFeed = async () => {
				if (isPolling || isIdle) return;
				isPolling = true;
				try {
					await fetchFeedMessages(id);
				} catch {
					// Network blip
				} finally {
					isPolling = false;
				}
			};
			const interval = setInterval(pollFeed, 3000);
			return () => clearInterval(interval);
		}
	}, [id, activeTab, isIdle, fetchFeedMessages]);

	useEffect(() => {
		if (activeTab === 'settings') {
			fetchGroups();
			fetchInvites();
		}
	}, [activeTab, fetchGroups, fetchInvites]);

	useEffect(() => {
		if (activeTab === 'attendance') {
			fetchEvents(id, 'attendance');
			fetchAttendances(id);
		}
	}, [activeTab, id, fetchEvents, fetchAttendances]);

	useEffect(() => {
		if (activeTab === 'activities') {
			fetchEvents(id, 'activity');
			fetchAttendances(id);
		}
	}, [activeTab, id, fetchEvents, fetchAttendances]);

	if (!hydrated) {
		return (
			<div className="flex min-h-screen flex-col bg-background">
				<Nav />
				<ClubHubSkeleton />
				<Footer />
			</div>
		);
	}

	if (!group || (!currentUser && !USE_MOCK_DATA)) {
		return (
			<div className="flex min-h-screen flex-col bg-background">
				<Nav />
				<main className="grow flex items-center justify-center p-6 text-center">
					<div>
						<h2 className="text-xl font-bold text-text-primary">
							Club Not Found
						</h2>
						<p className="text-xs text-text-muted mt-1">
							The club does not exist or you lack permission.
						</p>
						<button
							onClick={() => router.push('/groups')}
							className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white cursor-pointer"
						>
							Back to My Clubs
						</button>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	// Security / Privacy check: only members can view private groups
	const isMember = currentUser
		? group.memberIds.includes(currentUser.id) ||
			group.leaderId === currentUser.id
		: Boolean(USE_MOCK_DATA);

	if (group.isPrivate && !isMember && !USE_MOCK_DATA) {
		return (
			<div className="flex min-h-screen flex-col bg-background">
				<Nav />
				<main className="grow flex items-center justify-center p-6 text-center">
					<div>
						<h2 className="text-xl font-bold text-text-primary">
							Private Club
						</h2>
						<p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
							This is a private student organization. You must be invited or approved to view the club feed.
						</p>
						<button
							onClick={() => router.push('/search')}
							className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white cursor-pointer"
						>
							Explore Other Clubs
						</button>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	const clubEvents = events.filter(
		(e) =>
			e.groupId === id &&
			(e.isAttendanceSession === true ||
				e.eventType === 'ATTENDANCE_SESSION'),
	);

	const clubActivities = events.filter(
		(e) =>
			e.groupId === id &&
			e.isAttendanceSession !== true &&
			e.eventType !== 'ATTENDANCE_SESSION',
	);

	// Handle Create Activity / Event Submit
	const handleCreateEvent = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!eventTitle.trim() || !eventDate) return;
		setCreatingEvent(true);
		try {
			if (editingActivityId) {
				await fetch('/api/events', {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						eventId: editingActivityId,
						title: eventTitle.trim(),
						description: eventDesc.trim(),
						date: eventDate,
						time: eventTime,
						location: eventLocation.trim(),
						endDate: activityEndDate || undefined,
						price: activityPrice || undefined,
						status: activityStatus || undefined,
						locationType: activityLocationType || undefined,
						allDay: activityAllDay,
						endTime: activityEndTime || undefined,
						regRequired: activityRegRequired,
						regCapacity: activityRegCapacity
							? parseInt(activityRegCapacity, 10)
							: undefined,
						regDeadline: activityRegDeadline || undefined,
						inviteMessage: activityInviteMessage || undefined,
						inviteReminderDays: activityInviteReminderDays
							? parseInt(activityInviteReminderDays, 10)
							: undefined,
						membersOnly: activityMembersOnly,
						isAttendanceSession: false,
						eventType: 'ACTIVITY',
					}),
				});
				await fetchEvents(id, 'activity', editingActivityId);
			} else {
				await createMeetingEvent(group.id, {
					title: eventTitle.trim(),
					description: eventDesc.trim(),
					date: eventDate,
					time: eventTime,
					location: eventLocation.trim(),
					endDate: activityEndDate || undefined,
					price: activityPrice || undefined,
					status: activityStatus || 'PUBLISHED',
					locationType: activityLocationType || undefined,
					allDay: activityAllDay,
					endTime: activityEndTime || undefined,
					regRequired: activityRegRequired,
					regCapacity: activityRegCapacity
						? parseInt(activityRegCapacity, 10)
						: undefined,
					regDeadline: activityRegDeadline || undefined,
					inviteMessage: activityInviteMessage || undefined,
					inviteReminderDays: activityInviteReminderDays
						? parseInt(activityInviteReminderDays, 10)
						: undefined,
					membersOnly: activityMembersOnly,
					isAttendanceSession: false,
					eventType: 'ACTIVITY',
				});
			}

			setCreateEventModal(false);
			setEditingActivityId(null);
			setEventTitle('');
			setEventDesc('');
			setEventLocation('');
			setActivityEndDate('');
			setActivityPrice('');
			setActivityStatus('NOT_SENT');
			setModalActiveTab('data');
			fetchEvents(id, 'activity');
		} catch (err) {
			console.error('Failed to create/edit event:', err);
		} finally {
			setCreatingEvent(false);
		}
	};

	// Handle Schedule Meeting Submit
	const handleCreateMeeting = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!meetingTitle.trim() || !meetingDate) return;
		setCreatingEvent(true);
		try {
			await createMeetingEvent(group.id, {
				title: meetingTitle.trim(),
				description: meetingDesc.trim(),
				date: meetingDate,
				time: meetingTime,
				location: meetingLocation.trim(),
				endDate: meetingEndDate || undefined,
				price: meetingPrice || undefined,
				status: meetingStatus || 'PUBLISHED',
				isAttendanceSession: true,
				eventType: 'ATTENDANCE_SESSION',
			});

			setCreateMeetingModal(false);
			setMeetingTitle('');
			setMeetingDesc('');
			setMeetingDate('');
			setMeetingTime('18:00');
			setMeetingLocation('');
			setMeetingEndDate('');
			setMeetingPrice('');
			setMeetingStatus('PUBLISHED');
			fetchEvents(id, 'attendance');
		} catch (err) {
			console.error('Failed to schedule meeting:', err);
		} finally {
			setCreatingEvent(false);
		}
	};

	const handleEditActivity = (item: MeetingEvent) => {
		setEditingActivityId(item.id);
		setEventTitle(item.title);
		setEventDesc(item.description || '');
		setEventDate(item.date);
		setEventTime(item.time || '18:00');
		setEventLocation(item.location || '');
		setActivityEndDate(item.endDate || '');
		setActivityPrice(item.price || '');
		setActivityStatus(item.status || 'NOT_SENT');
		setActivityLocationType(item.locationType || '');
		setActivityAllDay(item.allDay || false);
		setActivityEndTime(item.endTime || '10:00');
		setActivityRegRequired(item.regRequired || false);
		setActivityRegCapacity(
			item.regCapacity ? String(item.regCapacity) : '',
		);
		setActivityRegDeadline(item.regDeadline || '');
		setActivityInviteMessage(item.inviteMessage || '');
		setActivityInviteReminderDays(
			item.inviteReminderDays ? String(item.inviteReminderDays) : '0',
		);
		setActivityMembersOnly(item.membersOnly || false);
		setModalActiveTab('data');
		setCreateEventModal(true);
	};

	const handleDeleteActivity = async (activityId: string) => {
		if (confirm('Are you sure you want to delete this activity?')) {
			await deleteMeetingEvent(activityId);
			fetchEvents(id, 'activity');
		}
	};

	const handleRSVP = async (eventId: string, status: string) => {
		try {
			await fetch('/api/attendance', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					eventId,
					userId: currentUser?.id || 'user_demo',
					status,
					checkInMethod: 'MANUAL',
				}),
			});
			fetchAttendances(id);
		} catch (e) {
			console.error('RSVP error:', e);
		}
	};

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Nav />

			<ClubFeedHeader
				group={group}
				activeTab={activeTab}
				setActiveTab={setActiveTab}
				canManage={canManage}
				isLeader={isLeader}
				clubEvents={clubEvents}
			/>

			{activeTab === 'feed' && (
				<ClubFeedTab
					group={group}
					currentUser={currentUser}
					users={users}
					feedMessages={feedMessages}
					clubActivities={clubActivities}
					canManage={canManage}
					isLoading={isLoading}
					postMessage={postMessage}
					deleteMessage={deleteMessage}
					setActiveTab={setActiveTab}
				/>
			)}

			{activeTab === 'attendance' && (
				<ClubAttendanceTab
					group={group}
					currentUser={currentUser}
					users={users}
					clubEvents={clubEvents}
					attendances={attendances}
					canManage={canManage}
					selectedEventId={selectedEventId}
					setSelectedEventId={setSelectedEventId}
					activeSubTab={activeSubTab}
					setActiveSubTab={setActiveSubTab}
					toggleEventActive={toggleEventActive}
					deleteMeetingEvent={deleteMeetingEvent}
					checkInToEvent={checkInToEvent}
					updateAttendanceStatus={updateAttendanceStatus}
					onOpenScheduleModal={() => {
						setMeetingTitle('');
						setMeetingDesc('');
						setMeetingDate(
							new Date().toISOString().split('T')[0],
						);
						setMeetingTime('18:00');
						setMeetingLocation('');
						setMeetingEndDate('');
						setMeetingPrice('');
						setMeetingStatus('PUBLISHED');
						setCreateMeetingModal(true);
					}}
				/>
			)}

			{activeTab === 'roster' && (
				<ClubRosterTab group={group} users={users} />
			)}

			{activeTab === 'roles' && canManage && (
				<ClubRolesTab
					group={group}
					users={users}
					isLeader={isLeader}
					updateGroupSettings={updateGroupSettings}
					fetchGroups={fetchGroups}
				/>
			)}

			{activeTab === 'settings' && (
				<ClubSettingsTab
					group={group}
					canManage={canManage}
					isLeader={isLeader}
					invites={invites}
					generateClubInvite={generateClubInvite}
					deleteClubInvites={deleteClubInvites}
					updateGroupSettings={updateGroupSettings}
					fetchGroups={fetchGroups}
				/>
			)}

			{activeTab === 'activities' && (
				<ClubActivitiesTab
					group={group}
					currentUser={currentUser}
					users={users}
					clubActivities={clubActivities}
					attendances={attendances}
					canManage={canManage}
					showBirthdaysTab={showBirthdaysTab}
					setShowBirthdaysTab={setShowBirthdaysTab}
					onOpenCreateModal={() => {
						setEditingActivityId(null);
						setEventTitle('');
						setEventDesc('');
						setEventDate(
							new Date().toISOString().split('T')[0],
						);
						setEventTime('18:00');
						setEventLocation('');
						setActivityEndDate('');
						setActivityPrice('');
						setActivityStatus('NOT_SENT');
						setCreateEventModal(true);
					}}
					onEditActivity={handleEditActivity}
					onDeleteActivity={handleDeleteActivity}
					onRSVP={handleRSVP}
				/>
			)}

			<CreateEventModal
				isOpen={createEventModal}
				onClose={() => setCreateEventModal(false)}
				onSubmit={handleCreateEvent}
				editingActivityId={editingActivityId}
				eventTitle={eventTitle}
				setEventTitle={setEventTitle}
				eventDesc={eventDesc}
				setEventDesc={setEventDesc}
				eventDate={eventDate}
				setEventDate={setEventDate}
				eventTime={eventTime}
				setEventTime={setEventTime}
				eventLocation={eventLocation}
				setEventLocation={setEventLocation}
				activityEndDate={activityEndDate}
				setActivityEndDate={setActivityEndDate}
				activityPrice={activityPrice}
				setActivityPrice={setActivityPrice}
				activityStatus={activityStatus}
				setActivityStatus={setActivityStatus}
				activityLocationType={activityLocationType}
				setActivityLocationType={setActivityLocationType}
				activityAllDay={activityAllDay}
				setActivityAllDay={setActivityAllDay}
				activityEndTime={activityEndTime}
				setActivityEndTime={setActivityEndTime}
				activityRegRequired={activityRegRequired}
				setActivityRegRequired={setActivityRegRequired}
				activityRegCapacity={activityRegCapacity}
				setActivityRegCapacity={setActivityRegCapacity}
				activityRegDeadline={activityRegDeadline}
				setActivityRegDeadline={setActivityRegDeadline}
				activityMembersOnly={activityMembersOnly}
				setActivityMembersOnly={setActivityMembersOnly}
				modalActiveTab={modalActiveTab}
				setModalActiveTab={setModalActiveTab}
				creatingEvent={creatingEvent}
			/>

			<ScheduleMeetingModal
				isOpen={createMeetingModal}
				onClose={() => setCreateMeetingModal(false)}
				onSubmit={handleCreateMeeting}
				meetingTitle={meetingTitle}
				setMeetingTitle={setMeetingTitle}
				meetingDate={meetingDate}
				setMeetingDate={setMeetingDate}
				meetingTime={meetingTime}
				setMeetingTime={setMeetingTime}
				meetingLocation={meetingLocation}
				setMeetingLocation={setMeetingLocation}
				meetingPrice={meetingPrice}
				setMeetingPrice={setMeetingPrice}
				meetingDesc={meetingDesc}
				setMeetingDesc={setMeetingDesc}
				meetingEndDate={meetingEndDate}
				setMeetingEndDate={setMeetingEndDate}
				meetingStatus={meetingStatus}
				setMeetingStatus={setMeetingStatus}
				creatingEvent={creatingEvent}
			/>

			<Footer />
		</div>
	);
}
