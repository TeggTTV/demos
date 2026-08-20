/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext, User } from '@/components/AppContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import {
	FiSend,
	FiPaperclip,
	FiFile,
	FiDownload,
	FiTrash2,
	FiCalendar,
	FiMapPin,
	FiClock,
	FiCheckCircle,
	FiUsers,
	FiShare2,
	FiPlus,
	FiArrowLeft,
	FiGlobe,
	FiInstagram,
	FiShield,
	FiUserCheck,
	FiUserMinus,
	FiSearch,
	FiLink,
	FiKey,
	FiEye,
	FiMail,
	FiEdit2,
	FiUpload,
	FiX,
	FiChevronUp,
	FiChevronDown,
	FiGift,
	FiChevronRight,
} from 'react-icons/fi';
import { FaDiscord } from 'react-icons/fa';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { BANNER_COLOR_PRESETS } from '@/app/groups/page';
import { ClipLoader } from 'react-spinners';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

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
		fetchGroups,
		fetchInvites,
		fetchEvents,
		fetchAttendances,
		isIdle,
		invites,
		triggerNotification,
	} = useAppContext();
	const router = useRouter();

	const group = groups.find((g) => g.id === id);
	const isLeader = group?.leaderId === currentUser?.id;
	const isOfficer = Boolean(
		group?.officerIds && group.officerIds.includes(currentUser?.id || ''),
	);
	const canManage = isLeader || isOfficer;

	type FeedTab =
		| 'feed'
		| 'attendance'
		| 'roster'
		| 'roles'
		| 'settings'
		| 'activities';

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
	const [rosterSearchQuery, setRosterSearchQuery] = useState('');
	const [rosterRoleFilter, setRosterRoleFilter] = useState<
		'all' | 'leaders' | 'officers' | 'members'
	>('all');

	// Feed State
	const [messageText, setMessageText] = useState('');
	const [isAnnouncement, setIsAnnouncement] = useState(false);
	const [fileInput, setFileInput] = useState<File | null>(null);
	const [resourceLink, setResourceLink] = useState('');
	const [resourceTitle, setResourceTitle] = useState('');
	const [feedFilter, setFeedFilter] = useState<
		'all' | 'announcements' | 'files' | 'links'
	>('all');
	const [isLoading, setIsLoading] = useState(true);

	const messagesContainerRef = useRef<HTMLDivElement>(null);

	// Attendance State
	const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
	const [checkInInput, setCheckInInput] = useState('');
	const [checkInResult, setCheckInResult] = useState<{
		success?: boolean;
		message?: string;
		error?: string;
	} | null>(null);
	const [createEventModal, setCreateEventModal] = useState(false);
	const [eventTitle, setEventTitle] = useState('');
	const [eventDesc, setEventDesc] = useState('');
	const [eventDate, setEventDate] = useState(
		new Date().toISOString().split('T')[0],
	);
	const [eventTime, setEventTime] = useState('18:00');
	const [eventLocation, setEventLocation] = useState('');
	const [creatingEvent, setCreatingEvent] = useState(false);

	// Activities Tab State
	const [activityEndDate, setActivityEndDate] = useState('');
	const [activityPrice, setActivityPrice] = useState('');
	const [activityStatus, setActivityStatus] = useState('NOT_SENT');
	const [editingActivityId, setEditingActivityId] = useState<string | null>(
		null,
	);
	const [showBirthdaysTab, setShowBirthdaysTab] = useState(true);
	const [modalActiveTab, setModalActiveTab] = useState<
		'data' | 'login' | 'costs' | 'invitation'
	>('data');
	const [activityLocationType, setActivityLocationType] = useState('');
	const [activityAllDay, setActivityAllDay] = useState(false);
	const [activityEndTime, setActivityEndTime] = useState('10:00');
	const [activityRegRequired, setActivityRegRequired] = useState(false);
	const [activityRegCapacity, setActivityRegCapacity] = useState('');
	const [activityRegDeadline, setActivityRegDeadline] = useState('');
	const [activityInviteMessage, setActivityInviteMessage] = useState('');
	const [activityInviteReminderDays, setActivityInviteReminderDays] =
		useState('0');
	const [descFocused, setDescFocused] = useState(false);
	const [inviteMsgFocused, setInviteMsgFocused] = useState(false);
	const [locTypeFocused, setLocTypeFocused] = useState(false);
	const [isLocDropdownOpen, setIsLocDropdownOpen] = useState(false);
	const [createMeetingModal, setCreateMeetingModal] = useState(false);
	const [meetingTitle, setMeetingTitle] = useState('');
	const [meetingDesc, setMeetingDesc] = useState('');
	const [meetingDate, setMeetingDate] = useState('');
	const [meetingTime, setMeetingTime] = useState('18:00');
	const [meetingLocation, setMeetingLocation] = useState('');
	const [meetingEndDate, setMeetingEndDate] = useState('');
	const [meetingPrice, setMeetingPrice] = useState('');
	const [meetingStatus, setMeetingStatus] = useState('PUBLISHED');
	const [autoCreateAttendance, setAutoCreateAttendance] = useState(false);

	// Settings & Invites State
	const [isEditingSettings, setIsEditingSettings] = useState(false);
	const [settingsName, setSettingsName] = useState('');
	const [settingsTagline, setSettingsTagline] = useState('');
	const [settingsDesc, setSettingsDesc] = useState('');
	const [settingsLocation, setSettingsLocation] = useState('');
	const [settingsEnableCustomBanner, setSettingsEnableCustomBanner] =
		useState(false);
	const [settingsBannerColor, setSettingsBannerColor] = useState(
		BANNER_COLOR_PRESETS[0].value,
	);
	const [settingsBannerPreview, setSettingsBannerPreview] = useState('');
	const [settingsDiscord, setSettingsDiscord] = useState('');
	const [settingsInstagram, setSettingsInstagram] = useState('');
	const [settingsWebsite, setSettingsWebsite] = useState('');
	const [generatedInviteCode, setGeneratedInviteCode] = useState('');
	const [copiedInvite, setCopiedInvite] = useState(false);
	const [copiedInviteLink, setCopiedInviteLink] = useState(false);
	const [copiedPin, setCopiedPin] = useState(false);
	const [updatingSettings, setUpdatingSettings] = useState(false);
	const [settingsSuccess, setSettingsSuccess] = useState(false);
	const [memberSearchQuery, setMemberSearchQuery] = useState('');
	const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);
	const [roleChangeSuccess, setRoleChangeSuccess] = useState<string | null>(
		null,
	);
	const [memberRosterFilter, setMemberRosterFilter] = useState<
		'all' | 'active' | 'inactive' | 'officers' | 'leader'
	>('all');
	const [memberSortOrder, setMemberSortOrder] = useState<'asc' | 'desc'>(
		'asc',
	);

	const [showAddMemberModal, setShowAddMemberModal] = useState(false);
	const [addMemberEmailInput, setAddMemberEmailInput] = useState('');
	const [addMemberSuccessMsg, setAddMemberSuccessMsg] = useState('');
	const [addMemberErrorMsg, setAddMemberErrorMsg] = useState('');
	const [isAddingMember, setIsAddingMember] = useState(false);

	const [showImportModal, setShowImportModal] = useState(false);
	const [importSuccessMsg, setImportSuccessMsg] = useState('');
	const [importErrorMsg, setImportErrorMsg] = useState('');
	const [isImporting, setIsImporting] = useState(false);

	const [viewingProfileUser, setViewingProfileUser] = useState<User | null>(
		null,
	);
	const [editingRoleUser, setEditingRoleUser] = useState<User | null>(null);

	const [importEmailsText, setImportEmailsText] = useState('');

	const formatLastActive = (dateString?: string) => {
		if (!dateString) return 'Never';
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60)
			return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
		if (diffHours < 24)
			return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
		if (diffDays < 7)
			return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
		return date.toLocaleDateString();
	};

	const exportRosterToCSV = () => {
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
			const role = isMemLeader
				? 'Leader'
				: isMemOfficer
					? 'Officer'
					: 'Member';
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
				row
					.map((val) => `"${String(val).replace(/"/g, '""')}"`)
					.join(','),
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
	};

	const handleAddMember = async (email: string) => {
		if (!group || !email.trim()) return;
		setIsAddingMember(true);
		setAddMemberErrorMsg('');
		setAddMemberSuccessMsg('');
		try {
			const res = await fetch('/api/groups', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					groupId: group.id,
					addMemberEmails: [email.trim()],
				}),
			});
			const data = await res.json();
			if (data.error) {
				setAddMemberErrorMsg(data.error);
			} else {
				setAddMemberSuccessMsg(`Successfully added member: ${email}`);
				setAddMemberEmailInput('');
				await fetchGroups(); // refresh groups
			}
		} catch (e) {
			setAddMemberErrorMsg('Failed to add member due to network error.');
		} finally {
			setIsAddingMember(false);
		}
	};

	const handleImportCSV = async (text: string) => {
		if (!group || !text.trim()) return;
		setIsImporting(true);
		setImportErrorMsg('');
		setImportSuccessMsg('');

		const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
		const emails = Array.from(new Set(text.match(emailRegex) || []));

		if (emails.length === 0) {
			setImportErrorMsg('No valid email addresses found.');
			setIsImporting(false);
			return;
		}

		try {
			const res = await fetch('/api/groups', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					groupId: group.id,
					addMemberEmails: emails,
				}),
			});
			const data = await res.json();
			if (data.error) {
				setImportErrorMsg(data.error);
			} else {
				setImportSuccessMsg(
					`Import complete! Successfully requested adding ${emails.length} member(s).`,
				);
				setImportEmailsText('');
				await fetchGroups(); // refresh groups
			}
		} catch (e) {
			setImportErrorMsg('Failed to import members due to network error.');
		} finally {
			setIsImporting(false);
		}
	};

	const handlePromoteToOfficer = async (targetUserId: string) => {
		if (!group || !isLeader) return;
		setRoleUpdatingId(targetUserId);
		const currentOfficers = group.officerIds || [];
		if (!currentOfficers.includes(targetUserId)) {
			const newOfficerIds = [...currentOfficers, targetUserId];
			const res = await updateGroupSettings(group.id, {
				officerIds: newOfficerIds,
			});
			if (res.success) {
				const targetUser = users.find((u) => u.id === targetUserId);
				triggerNotification({
					type: 'member_promoted',
					title: 'Officer Promoted',
					body: `${targetUser?.name || 'A member'} was promoted to Officer in "${group.name}".`,
					groupId: group.id,
					groupName: group.name,
					url: `/group/${group.id}/feed`,
				});
				setRoleChangeSuccess(
					'Member promoted to Officer successfully!',
				);
				setTimeout(() => setRoleChangeSuccess(null), 3000);
			}
		}
		setRoleUpdatingId(null);
	};

	const handleDemoteOfficer = async (targetUserId: string) => {
		if (!group || !isLeader) return;
		setRoleUpdatingId(targetUserId);
		const currentOfficers = group.officerIds || [];
		const newOfficerIds = currentOfficers.filter(
			(oId) => oId !== targetUserId,
		);
		const res = await updateGroupSettings(group.id, {
			officerIds: newOfficerIds,
		});
		if (res.success) {
			const targetUser = users.find((u) => u.id === targetUserId);
			triggerNotification({
				type: 'member_demoted',
				title: 'Officer Demoted',
				body: `${targetUser?.name || 'An officer'} was demoted to Member in "${group.name}".`,
				groupId: group.id,
				groupName: group.name,
				url: `/group/${group.id}/feed`,
			});
			setRoleChangeSuccess('Officer demoted to Member successfully!');
			setTimeout(() => setRoleChangeSuccess(null), 3000);
		}
		setRoleUpdatingId(null);
	};

	const handleKickMember = async (
		targetUserId: string,
		targetName: string,
	) => {
		if (!group || !canManage) return;
		if (targetUserId === group.leaderId) {
			alert('Cannot remove the club creator/leader.');
			return;
		}
		if (
			!confirm(
				`Are you sure you want to remove ${targetName} from the club?`,
			)
		) {
			return;
		}
		setRoleUpdatingId(targetUserId);
		const res = await updateGroupSettings(group.id, {
			kickUserId: targetUserId,
		});
		if (res.success) {
			setRoleChangeSuccess(`${targetName} was removed from the club.`);
			setTimeout(() => setRoleChangeSuccess(null), 3000);
		}
		setRoleUpdatingId(null);
	};

	/* eslint-disable react-hooks/set-state-in-effect */
	useEffect(() => {
		if (group) {
			setSettingsName(group.name);
			setSettingsTagline(group.tagline || '');
			setSettingsDesc(group.description);
			setSettingsLocation(group.meetingLocation || '');
			if (
				group.bannerUrl?.startsWith('data:') ||
				group.bannerUrl?.startsWith('http')
			) {
				setSettingsEnableCustomBanner(true);
				setSettingsBannerPreview(group.bannerUrl);
				setSettingsBannerColor(BANNER_COLOR_PRESETS[0].value);
			} else if (group.bannerUrl) {
				setSettingsEnableCustomBanner(false);
				setSettingsBannerPreview('');
				setSettingsBannerColor(group.bannerUrl);
			} else {
				setSettingsEnableCustomBanner(false);
				setSettingsBannerPreview('');
				setSettingsBannerColor(BANNER_COLOR_PRESETS[0].value);
			}
			setSettingsDiscord(group.discordUrl || '');
			setSettingsInstagram(group.instagramUrl || '');
			setSettingsWebsite(group.websiteUrl || '');
			setEventLocation(group.meetingLocation || '');
		}
	}, [group]);
	/* eslint-enable react-hooks/set-state-in-effect */

	// Auto-scroll to bottom of messages
	const prevLengthRef = useRef(0);
	useEffect(() => {
		if (!isLoading && messagesContainerRef.current) {
			const currentLength = feedMessages.length;
			if (currentLength > prevLengthRef.current) {
				messagesContainerRef.current.scrollTo({
					top: messagesContainerRef.current.scrollHeight,
					behavior: prevLengthRef.current === 0 ? 'auto' : 'smooth',
				});
			}
			prevLengthRef.current = currentLength;
		}
	}, [feedMessages, isLoading]);

	useEffect(() => {
		async function loadFeed() {
			if (id) {
				setIsLoading(true);
				await fetchFeedMessages(id);
				setIsLoading(false);
			}
		}
		loadFeed();
	}, [id, fetchFeedMessages]);

	// Sync generated invite code with database values from global context
	const activeInvite = invites.find((i) => i.groupId === id);
	useEffect(() => {
		if (activeInvite) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setGeneratedInviteCode(activeInvite.code);
		} else {
			setGeneratedInviteCode('');
		}
	}, [activeInvite]);

	// Fetch groups and invites once when loading settings page/tab
	useEffect(() => {
		if (activeTab === 'settings') {
			fetchGroups();
			fetchInvites();
		}
	}, [activeTab, fetchGroups, fetchInvites]);

	// Fetch events and attendances once when loading attendance tab
	useEffect(() => {
		if (activeTab === 'attendance') {
			fetchEvents();
			fetchAttendances(id);
		}
	}, [activeTab, id, fetchEvents, fetchAttendances]);

	useEffect(() => {
		if (!id || isIdle) return;
		let active = true;
		let timeoutId: NodeJS.Timeout;

		const poll = async () => {
			if (!active) return;
			try {
				await fetchFeedMessages(id);
			} catch (e) {
				console.error('Feed poll failed:', e);
			}
			if (active) {
				timeoutId = setTimeout(poll, 4000);
			}
		};

		timeoutId = setTimeout(poll, 4000);

		return () => {
			active = false;
			clearTimeout(timeoutId);
		};
	}, [id, fetchFeedMessages, isIdle]);

	if (!hydrated) {
		return (
			<div className="flex min-h-screen flex-col bg-background">
				<Nav />
				<main className="grow flex items-center justify-center py-20">
					<ClipLoader color="var(--primary)" size={35} />
				</main>
				<Footer />
			</div>
		);
	}

	if (!currentUser || !group) {
		return (
			<div className="flex min-h-screen flex-col bg-background">
				<Nav />
				<main className="grow flex items-center justify-center p-6 text-center">
					<div>
						<h2 className="text-xl font-bold text-text-primary">
							Club Not Found
						</h2>
						<p className="text-xs text-text-muted mt-1">
							You may lack permission or the club does not exist.
						</p>
						<button
							onClick={() => router.push('/groups')}
							className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white"
						>
							Back to My Clubs
						</button>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	const isMember = group.memberIds.includes(currentUser.id) || isLeader;
	if (!isMember) {
		router.push('/groups');
		return null;
	}

	const groupMessages = feedMessages.filter((m) => m.groupId === id);
	const clubEvents = events
		.filter((e) => e.groupId === id)
		.filter((e) => {
			if (canManage) return true;
			const eventDateTime = new Date(`${e.date}T${e.time || '00:00'}`);
			const isTimeReached = new Date() >= eventDateTime;
			const isEventActive =
				e.isActive ||
				(e.status !== 'CLOSED' &&
					e.status !== 'NOT_SENT' &&
					isTimeReached);
			return isEventActive;
		});
	const activeEvent = clubEvents.find((e) => e.isActive) || clubEvents[0];
	const currentSelectedEvent = selectedEventId
		? clubEvents.find((e) => e.id === selectedEventId) || null
		: null;

	const eventAttendances = currentSelectedEvent
		? attendances.filter((a) => a.eventId === currentSelectedEvent.id)
		: [];

	const userIsCheckedIn = currentSelectedEvent
		? attendances.some(
				(a) =>
					a.eventId === currentSelectedEvent.id &&
					a.userId === currentUser.id,
			)
		: false;

	const handlePost = (e: React.FormEvent) => {
		e.preventDefault();
		if (!messageText.trim() && !fileInput) return;

		if (fileInput) {
			const reader = new FileReader();
			reader.onload = () => {
				const base64Url = reader.result as string;
				postMessage(
					id,
					messageText || `Shared file: ${fileInput.name}`,
					fileInput.name,
					base64Url,
					isAnnouncement,
					isAnnouncement,
				);
				setFileInput(null);
				setMessageText('');
				setIsAnnouncement(false);
			};
			reader.readAsDataURL(fileInput);
		} else {
			postMessage(
				id,
				messageText,
				undefined,
				undefined,
				isAnnouncement,
				isAnnouncement,
			);
			setMessageText('');
			setIsAnnouncement(false);
		}
	};

	const handlePostResource = (e: React.FormEvent) => {
		e.preventDefault();
		if (!resourceLink.trim() || !resourceTitle.trim()) return;
		postMessage(
			id,
			`🔗 Resource shared: [${resourceTitle}](${resourceLink})`,
		);
		setResourceTitle('');
		setResourceLink('');
	};

	const handleCreateEvent = async (e: React.FormEvent) => {
		e.preventDefault();
		setCreatingEvent(true);

		const payload = {
			title: eventTitle,
			description: eventDesc || '',
			date: eventDate,
			time: eventTime,
			location: eventLocation || '',
			endDate: activityEndDate || undefined,
			price: activityPrice || undefined,
			status: activityStatus,
			locationType: activityLocationType || undefined,
			allDay: activityAllDay,
			endTime: activityEndTime || undefined,
			regRequired: activityRegRequired,
			regCapacity: activityRegCapacity
				? parseInt(activityRegCapacity)
				: undefined,
			regDeadline: activityRegDeadline || undefined,
			inviteMessage: activityInviteMessage || undefined,
			inviteReminderDays: activityInviteReminderDays
				? parseInt(activityInviteReminderDays)
				: 0,
		};

		if (editingActivityId) {
			try {
				const res = await fetch('/api/events', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						eventId: editingActivityId,
						...payload,
					}),
				});
				const data = await res.json();
				if (data.success) {
					fetchEvents();
					setCreateEventModal(false);
					setEditingActivityId(null);
					setEventTitle('');
					setEventDesc('');
					setActivityEndDate('');
					setActivityPrice('');
					setActivityStatus('NOT_SENT');
					setActivityLocationType('');
					setActivityAllDay(false);
					setActivityEndTime('10:00');
					setActivityRegRequired(false);
					setActivityRegCapacity('');
					setActivityRegDeadline('');
					setActivityInviteMessage('');
					setActivityInviteReminderDays('0');
					setModalActiveTab('data');
				}
			} catch (err) {
				console.error('Error updating event:', err);
			}
		} else {
			const res = await createMeetingEvent(id, payload);
			if (res.success && res.event) {
				if (autoCreateAttendance) {
					try {
						await createMeetingEvent(id, {
							title: `${eventTitle} (Attendance)`,
							description: `Attendance tracking session automatically created for ${eventTitle}`,
							date: eventDate,
							time: eventTime,
							location: eventLocation || '',
							endDate: activityEndDate || undefined,
							price: activityPrice || undefined,
							status: 'PUBLISHED',
						});
					} catch (e) {
						console.error(
							'Failed to automatically create attendance session:',
							e,
						);
					}
				}
				setCreateEventModal(false);
				setEventTitle('');
				setEventDesc('');
				setActivityEndDate('');
				setActivityPrice('');
				setActivityStatus('NOT_SENT');
				setActivityLocationType('');
				setActivityAllDay(false);
				setActivityEndTime('10:00');
				setActivityRegRequired(false);
				setActivityRegCapacity('');
				setActivityRegDeadline('');
				setActivityInviteMessage('');
				setActivityInviteReminderDays('0');
				setModalActiveTab('data');
				setAutoCreateAttendance(false);
				setSelectedEventId(res.event.id);
			}
		}
		setCreatingEvent(false);
	};

	const handleCreateMeetingSession = async (e: React.FormEvent) => {
		e.preventDefault();
		setCreatingEvent(true);
		const payload = {
			title: meetingTitle,
			description: meetingDesc || '',
			date: meetingDate,
			time: meetingTime,
			location: meetingLocation || '',
			endDate: meetingEndDate || undefined,
			price: meetingPrice || undefined,
			status: meetingStatus,
		};
		const res = await createMeetingEvent(id, payload);
		if (res.success && res.event) {
			setCreateMeetingModal(false);
			setMeetingTitle('');
			setMeetingDesc('');
			setMeetingDate('');
			setMeetingTime('18:00');
			setMeetingLocation('');
			setMeetingEndDate('');
			setMeetingPrice('');
			setMeetingStatus('PUBLISHED');
		}
		setCreatingEvent(false);
	};

	const handleDeleteActivity = async (eventId: string) => {
		if (!confirm('Are you sure you want to delete this activity?')) return;
		try {
			const res = await fetch(`/api/events?eventId=${eventId}`, {
				method: 'DELETE',
			});
			const data = await res.json();
			if (data.success) {
				fetchEvents();
			}
		} catch (err) {
			console.error('Failed to delete activity:', err);
		}
	};

	const handleSelfCheckIn = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!currentSelectedEvent) return;
		setCheckInResult(null);
		const res = await checkInToEvent(currentSelectedEvent.id, checkInInput);
		setCheckInResult(res);
		if (res.success) {
			setCheckInInput('');
		}
	};

	const handleSaveClubSettings = async (e: React.FormEvent) => {
		e.preventDefault();
		setUpdatingSettings(true);
		const finalBanner =
			settingsEnableCustomBanner && settingsBannerPreview
				? settingsBannerPreview
				: settingsBannerColor;

		const res = await updateGroupSettings(id, {
			name: settingsName,
			tagline: settingsTagline,
			description: settingsDesc,
			meetingLocation: settingsLocation,
			bannerUrl: finalBanner,
			discordUrl: settingsDiscord,
			instagramUrl: settingsInstagram,
			websiteUrl: settingsWebsite,
		});
		setUpdatingSettings(false);
		if (res.success) {
			setSettingsSuccess(true);
			setIsEditingSettings(false);
			setTimeout(() => setSettingsSuccess(false), 3000);
		}
	};

	const exportAttendanceCSV = () => {
		if (!currentSelectedEvent) return;
		const headers = [
			'Member Name',
			'Email',
			'Status',
			'Method',
			'Check-In Timestamp',
		];
		const rows = group.memberIds.map((mId) => {
			const u = users.find((user) => user.id === mId);
			const att = eventAttendances.find((a) => a.userId === mId);
			return [
				`"${u?.name || 'Member'}"`,
				`"${u?.email || ''}"`,
				`"${att?.status || 'ABSENT'}"`,
				`"${att?.checkInMethod || 'N/A'}"`,
				`"${att?.timestamp || 'N/A'}"`,
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
			`${group.name.replace(/\s+/g, '_')}_Attendance_${currentSelectedEvent.date}.csv`,
		);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const filteredMessages = groupMessages.filter((m) => {
		if (feedFilter === 'announcements') return m.isAnnouncement;
		if (feedFilter === 'files') return Boolean(m.fileName);
		if (feedFilter === 'links')
			return m.content.startsWith('🔗 Resource shared:');
		return true;
	});

	const getUserAvatar = (uid: string) =>
		users.find((u) => u.id === uid)?.avatarUrl;
	const getUserName = (uid: string) =>
		users.find((u) => u.id === uid)?.name || 'Member';

	const filteredAndSortedMemberIds = group.memberIds
		.filter((mId) => {
			const mem = users.find((u) => u.id === mId);
			if (!mem) return false;

			// Search filter
			const q = memberSearchQuery.toLowerCase().trim();
			const matchesSearch =
				!q ||
				mem.name?.toLowerCase().includes(q) ||
				mem.email?.toLowerCase().includes(q) ||
				mem.major?.toLowerCase().includes(q) ||
				(mem.phone && mem.phone.toLowerCase().includes(q));

			if (!matchesSearch) return false;

			// Status/Role filter
			if (memberRosterFilter === 'all') return true;
			if (memberRosterFilter === 'officers') {
				return (
					group.officerIds?.includes(mId) && group.leaderId !== mId
				);
			}
			if (memberRosterFilter === 'leader') {
				return group.leaderId === mId;
			}
			if (memberRosterFilter === 'active') {
				if (!mem.lastActive) return false;
				const diffDays =
					(new Date().getTime() -
						new Date(mem.lastActive).getTime()) /
					86400000;
				return diffDays <= 7;
			}
			if (memberRosterFilter === 'inactive') {
				if (!mem.lastActive) return true;
				const diffDays =
					(new Date().getTime() -
						new Date(mem.lastActive).getTime()) /
					86400000;
				return diffDays > 7;
			}
			return true;
		})
		.sort((aId, bId) => {
			const aMem = users.find((u) => u.id === aId);
			const bMem = users.find((u) => u.id === bId);
			const aName = aMem?.name || '';
			const bName = bMem?.name || '';

			if (memberSortOrder === 'asc') {
				return aName.localeCompare(bName);
			} else {
				return bName.localeCompare(aName);
			}
		});

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Nav />

			{/* ═══════════ Club Banner & Header ═══════════ */}
			<div className="border-b border-border bg-surface">
				{/* Banner */}
				<div className="h-40 sm:h-32 w-full relative bg-surface-secondary overflow-hidden">
					{group.bannerUrl?.startsWith('data:') ||
					group.bannerUrl?.startsWith('http') ? (
						<Image
							src={group.bannerUrl}
							alt={group.name}
							fill
							priority
							className="object-cover"
						/>
					) : (
						<div
							className="w-full h-full"
							style={{
								background:
									group.bannerUrl ||
									'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
							}}
						/>
					)}
					{/* <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20" /> */}

					<div className="absolute bottom-4 left-4 sm:left-8 right-4 sm:right-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
						<div>
							<span className="inline-block bg-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1.5 shadow-xs">
								{group.category}
							</span>
							<h1 className="text-xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm">
								{group.name}
							</h1>
							{group.tagline && (
								<p className="text-xs sm:text-sm text-white/90 font-medium drop-shadow-sm mt-0.5">
									{group.tagline}
								</p>
							)}
						</div>

						{/* Quick Social & Invite buttons */}
						<div className="flex items-center gap-2">
							{group.discordUrl && (
								<a
									href={group.discordUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-white hover:bg-white/30 transition-all"
									title="Discord"
								>
									<FaDiscord size={16} />
								</a>
							)}
							{group.instagramUrl && (
								<a
									href={group.instagramUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-white hover:bg-white/30 transition-all"
									title="Instagram"
								>
									<FiInstagram size={16} />
								</a>
							)}
							{group.websiteUrl && (
								<a
									href={group.websiteUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-white hover:bg-white/30 transition-all"
									title="Website"
								>
									<FiGlobe size={16} />
								</a>
							)}
						</div>
					</div>
				</div>

				{/* Tab Navigation */}
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex items-center space-x-6 overflow-x-auto pt-3 border-t border-border/40 scrollbar-none">
						<button
							onClick={() => setActiveTab('feed')}
							className={`pb-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
								activeTab === 'feed'
									? 'border-primary text-primary'
									: 'border-transparent text-text-muted hover:text-text-primary'
							}`}
						>
							💬 Feed
						</button>
						<button
							onClick={() => setActiveTab('attendance')}
							className={`pb-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
								activeTab === 'attendance'
									? 'border-primary text-primary'
									: 'border-transparent text-text-muted hover:text-text-primary'
							}`}
						>
							⏱️ Attendance
							{clubEvents.some((e) => e.isActive) && (
								<span className="h-2 w-2 rounded-full bg-success animate-pulse" />
							)}
						</button>
						<button
							onClick={() => setActiveTab('roster')}
							className={`pb-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
								activeTab === 'roster'
									? 'border-primary text-primary'
									: 'border-transparent text-text-muted hover:text-text-primary'
							}`}
						>
							👥 Member Roster
						</button>
						<button
							onClick={() => setActiveTab('activities')}
							className={`pb-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
								activeTab === 'activities'
									? 'border-primary text-primary'
									: 'border-transparent text-text-muted hover:text-text-primary'
							}`}
						>
							📅 Activities
						</button>
						{canManage && (
							<button
								onClick={() => setActiveTab('roles')}
								className={`pb-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
									activeTab === 'roles'
										? 'border-primary text-primary'
										: 'border-transparent text-text-muted hover:text-text-primary'
								}`}
							>
								🛡️ Member Roles
							</button>
						)}
						{isLeader && (
							<button
								onClick={() => setActiveTab('settings')}
								className={`pb-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
									activeTab === 'settings'
										? 'border-primary text-primary'
										: 'border-transparent text-text-muted hover:text-text-primary'
								}`}
							>
								⚙️ Club Settings
							</button>
						)}
					</div>
				</div>
			</div>

			{/* ═══════════ Tab 1: Feed & Announcements ═══════════ */}
			{activeTab === 'feed' && (
				<main className="grow mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* Left: Message Feed */}
					<div className="lg:col-span-3 bg-surface border border-border rounded-2xl flex flex-col overflow-hidden shadow-xs">
						{/* Sub-filters */}
						<div className="border-b border-border px-5 py-3 flex items-center justify-between gap-3 bg-surface-secondary/40">
							<div className="flex items-center gap-2">
								<button
									onClick={() => setFeedFilter('all')}
									className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
										feedFilter === 'all'
											? 'bg-primary text-white shadow-xs'
											: 'text-text-muted hover:text-text-primary'
									}`}
								>
									All Messages
								</button>
								<button
									onClick={() =>
										setFeedFilter('announcements')
									}
									className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
										feedFilter === 'announcements'
											? 'bg-primary text-white shadow-xs'
											: 'text-text-muted hover:text-text-primary'
									}`}
								>
									📢 Announcements
								</button>
								<button
									onClick={() => setFeedFilter('files')}
									className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
										feedFilter === 'files'
											? 'bg-primary text-white shadow-xs'
											: 'text-text-muted hover:text-text-primary'
									}`}
								>
									📁 Files &amp; Slides
								</button>
							</div>

							<span className="text-[11px] text-text-muted hidden sm:inline">
								{groupMessages.length} posts
							</span>
						</div>

						{/* Messages Container */}
						<div
							className="grow p-5 space-y-4 h-[55vh] lg:h-[65vh] overflow-y-auto"
							ref={messagesContainerRef}
						>
							{isLoading ? (
								<div className="flex justify-center items-center py-20">
									<ClipLoader
										color="var(--primary)"
										size={35}
									/>
								</div>
							) : filteredMessages.length === 0 ? (
								<div className="text-center py-16 text-text-muted text-xs">
									No messages found in this category. Be the
									first to post!
								</div>
							) : (
								filteredMessages.map((msg) => {
									const isMe = msg.userId === currentUser.id;
									const authorName = getUserName(msg.userId);
									const avatar = getUserAvatar(msg.userId);
									const authorIsLeader =
										group.leaderId === msg.userId;
									const authorIsOfficer = Boolean(
										group.officerIds &&
										group.officerIds.includes(msg.userId),
									);

									return (
										<div
											key={msg.id}
											className={`flex items-start space-x-3 ${
												isMe
													? 'flex-row-reverse space-x-reverse'
													: ''
											}`}
										>
											{avatar ? (
												<Image
													src={avatar}
													alt=""
													width={32}
													height={32}
													className="h-8 w-8 rounded-full object-cover border border-border shrink-0 mt-0.5"
													unoptimized
												/>
											) : (
												<div className="h-8 w-8 rounded-full bg-primary-light text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
													{authorName[0]}
												</div>
											)}

											<div
												className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${
													isMe
														? 'items-end'
														: 'items-start'
												}`}
											>
												<div className="flex items-center space-x-1.5 mb-1 px-1">
													<span className="text-[11px] font-bold text-text-primary">
														{authorName}
													</span>
													{authorIsLeader ? (
														<span className="text-[9px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full shadow-2xs">
															Leader
														</span>
													) : authorIsOfficer ? (
														<span className="text-[9px] font-bold bg-primary-light text-primary px-1.5 py-0.5 rounded-full border border-primary/20">
															Officer
														</span>
													) : null}
													<span className="text-[10px] text-text-muted">
														{new Date(
															msg.createdAt,
														).toLocaleTimeString(
															[],
															{
																hour: '2-digit',
																minute: '2-digit',
															},
														)}
													</span>
													{(isMe || canManage) && (
														<button
															onClick={() =>
																deleteMessage(
																	msg.id,
																)
															}
															className="text-text-muted hover:text-danger p-0.5"
															title="Delete message"
														>
															<FiTrash2
																size={11}
															/>
														</button>
													)}
												</div>

												{/* Message Bubble */}
												<div
													className={`rounded-2xl p-3 text-xs leading-relaxed ${
														msg.isAnnouncement
															? 'bg-primary-light border border-primary/30 text-text-primary font-medium shadow-xs'
															: isMe
																? 'bg-primary text-white rounded-tr-xs'
																: 'bg-surface-secondary border border-border text-text-primary rounded-tl-xs'
													}`}
												>
													{msg.isAnnouncement && (
														<div className="text-[10px] font-bold text-primary flex items-center gap-1 uppercase tracking-wider mb-1">
															📢 Announcement
														</div>
													)}

													<p className="whitespace-pre-wrap">
														{msg.content}
													</p>

													{/* File attachment preview */}
													{msg.fileName &&
														msg.fileUrl && (
															<div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between gap-3">
																<span className="flex items-center gap-1.5 text-[11px] font-semibold truncate">
																	<FiFile className="shrink-0" />{' '}
																	{
																		msg.fileName
																	}
																</span>
																<a
																	href={
																		msg.fileUrl
																	}
																	download={
																		msg.fileName
																	}
																	className="rounded-lg bg-surface px-2 py-1 text-[10px] font-bold text-primary hover:underline border border-border shadow-2xs shrink-0"
																>
																	Download
																</a>
															</div>
														)}
												</div>
											</div>
										</div>
									);
								})
							)}
						</div>

						{/* Chat Input Bar */}
						<form
							onSubmit={handlePost}
							className="border-t border-border p-3 bg-surface space-y-2"
						>
							{fileInput && (
								<div className="flex items-center justify-between p-2 rounded-lg bg-primary-light text-xs text-primary">
									<span className="flex items-center gap-1.5 truncate">
										<FiPaperclip /> {fileInput.name}
									</span>
									<button
										type="button"
										onClick={() => setFileInput(null)}
										className="text-danger hover:underline text-xs"
									>
										Remove
									</button>
								</div>
							)}

							<div className="flex items-center gap-2">
								<input
									type="text"
									placeholder={
										isAnnouncement
											? 'Type an announcement for all club members...'
											: 'Share an update, question, or discussion point...'
									}
									value={messageText}
									onChange={(e) =>
										setMessageText(e.target.value)
									}
									className="grow rounded-xl border border-border bg-surface-secondary px-3.5 py-2.5 text-xs text-text-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
								/>

								<label
									className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-secondary cursor-pointer transition-colors"
									title="Attach File or Flyer"
								>
									<FiPaperclip size={18} />
									<input
										type="file"
										className="hidden"
										onChange={(e) => {
											if (e.target.files?.[0]) {
												const file = e.target.files[0];
												if (file.size > 200000) {
													alert(
														'File size must be less than 200 KB (200,000 bytes).',
													);
													e.target.value = '';
													return;
												}
												setFileInput(file);
											}
										}}
									/>
								</label>

								{canManage && (
									<button
										type="button"
										onClick={() =>
											setIsAnnouncement(!isAnnouncement)
										}
										className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
											isAnnouncement
												? 'bg-primary text-white'
												: 'text-text-muted hover:text-text-primary hover:bg-surface-secondary'
										}`}
										title="Toggle Announcement Badge"
									>
										📢
									</button>
								)}

								<button
									type="submit"
									className="rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm transition-all cursor-pointer"
								>
									<FiSend size={15} />
								</button>
							</div>
						</form>
					</div>

					{/* Right Sidebar: Club Meeting Times & Resource Links */}
					<div className="space-y-6">
						{/* Active Meeting Info Card */}
						<div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-3">
							<span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
								Meeting Schedule
							</span>
							<div className="space-y-2 text-xs">
								<div className="flex items-start gap-2 text-text-secondary">
									<FiCalendar className="text-primary mt-0.5 shrink-0" />
									<span className="font-semibold text-text-primary">
										{group.meetingFrequency}
									</span>
								</div>
								<div className="flex items-start gap-2 text-text-secondary">
									<FiMapPin className="text-primary mt-0.5 shrink-0" />
									<span>
										{group.meetingLocation ||
											'Campus Center'}
									</span>
								</div>
							</div>

							<button
								onClick={() => setActiveTab('attendance')}
								className="w-full mt-2 rounded-xl bg-primary-light py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-all text-center block"
							>
								Open Attendance Check-In →
							</button>
						</div>

						{/* Upcoming Activities Side Card (Next 3) */}
						<div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-3">
							<span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
								Upcoming Activities
							</span>
							<div className="space-y-3">
								{(() => {
									const sortedFutureEvents = events
										.filter((e) => e.groupId === id)
										.map((e) => ({
											...e,
											dateObj: new Date(
												`${e.date}T${e.time || '00:00'}`,
											),
										}))
										.filter(
											(e) =>
												e.dateObj >=
												new Date(
													new Date().setHours(
														0,
														0,
														0,
														0,
													),
												),
										)
										.sort(
											(a, b) =>
												a.dateObj.getTime() -
												b.dateObj.getTime(),
										)
										.slice(0, 3);

									if (sortedFutureEvents.length === 0) {
										return (
											<p className="text-[11px] text-text-muted italic">
												No upcoming activities.
											</p>
										);
									}

									return sortedFutureEvents.map((ev) => (
										<div
											key={ev.id}
											className="text-xs border-b border-border/40 pb-2 last:border-0 last:pb-0"
										>
											<span className="font-bold text-text-primary block truncate">
												{ev.title}
											</span>
											<span className="text-[10px] text-text-muted block mt-0.5">
												📅 {ev.date} at{' '}
												{ev.time || 'All Day'}
											</span>
											{ev.location && (
												<span className="text-[9px] text-text-muted block mt-0.5 truncate">
													📍 {ev.location}
												</span>
											)}
										</div>
									));
								})()}
							</div>

							<button
								onClick={() =>
									router.push(`/group/${id}/activities`)
								}
								className="w-full mt-2 rounded-xl bg-surface border border-border py-1.5 text-[10px] font-bold text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-all text-center block cursor-pointer"
							>
								View Calendar Schedule →
							</button>
						</div>

						{/* Quick Resource Link Sharing */}
						<div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-3">
							<span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
								Share Resource Link
							</span>
							<form
								onSubmit={handlePostResource}
								className="space-y-2 text-xs"
							>
								<input
									type="text"
									value={resourceTitle}
									onChange={(e) =>
										setResourceTitle(e.target.value)
									}
									className="w-full rounded-lg border border-border bg-surface-secondary p-2 text-xs text-text-primary"
									placeholder="Resource Title"
								/>
								<input
									type="url"
									value={resourceLink}
									onChange={(e) =>
										setResourceLink(e.target.value)
									}
									className="w-full rounded-lg border border-border bg-surface-secondary p-2 text-xs text-text-primary"
									placeholder="Resource Link"
								/>
								<button
									type="submit"
									className="w-full rounded-lg bg-surface border border-border py-1.5 text-xs font-semibold text-text-primary hover:bg-surface-secondary transition-all"
								>
									Post Link to Feed
								</button>
							</form>
						</div>
					</div>
				</main>
			)}

			{/* ═══════════ Tab 2: Attendance Tracking ═══════════ */}
			{activeTab === 'attendance' && (
				<main className="grow mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
					{/* Top Actions: Schedule Meeting & Export */}
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
						<div>
							<h2 className="text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2">
								⏱️ Meeting Attendance Tracker
							</h2>
							<p className="text-xs text-text-muted mt-0.5">
								Self check-in with link, live roster
								verification, and attendance reports.
							</p>
						</div>

						<div className="flex items-center gap-2">
							{currentSelectedEvent && (
								<button
									onClick={exportAttendanceCSV}
									className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary shadow-2xs"
								>
									<FiDownload size={13} /> Export CSV Report
								</button>
							)}
							{canManage && (
								<button
									onClick={() => {
										setMeetingTitle('');
										setMeetingDesc('');
										setMeetingDate(
											new Date()
												.toISOString()
												.split('T')[0],
										);
										setMeetingTime('18:00');
										setMeetingLocation('');
										setMeetingEndDate('');
										setMeetingPrice('');
										setMeetingStatus('PUBLISHED');
										setCreateMeetingModal(true);
									}}
									className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm cursor-pointer"
								>
									<FiPlus size={14} /> Schedule Meeting
									Session
								</button>
							)}
						</div>
					</div>

					{/* Active / Selected Event Card */}
					<AnimatePresence mode="wait">
						{clubEvents.length === 0 ? (
							<motion.div
								key="empty"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 10 }}
								transition={{ duration: 0.2 }}
								className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center"
							>
							<div className="mx-auto h-12 w-12 rounded-full bg-primary-light flex items-center justify-center text-primary mb-3">
								<FiClock size={24} />
							</div>
							<h3 className="text-base font-bold text-text-primary">
								No meeting sessions scheduled yet
							</h3>
							<p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
								Officers and Leaders can create a meeting
								session to enable link attendance check-in for
								members.
							</p>
							{canManage && (
								<button
									onClick={() => {
										setMeetingTitle('');
										setMeetingDesc('');
										setMeetingDate(
											new Date()
												.toISOString()
												.split('T')[0],
										);
										setMeetingTime('18:00');
										setMeetingLocation('');
										setMeetingEndDate('');
										setMeetingPrice('');
										setMeetingStatus('PUBLISHED');
										setCreateMeetingModal(true);
									}}
									className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white cursor-pointer"
								>
									Create First Session
								</button>
							)}
						</motion.div>
					) : !currentSelectedEvent ? (
						<motion.div
							key="list"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 10 }}
							transition={{ duration: 0.2 }}
							className="space-y-4"
						>
							<div className="flex items-center justify-between">
								<h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
									All Meeting Sessions ({clubEvents.length})
								</h3>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								{clubEvents.map((evt) => {
									const evtTurnout = attendances.filter(
										(a) => a.eventId === evt.id,
									).length;

									return (
										<button
											key={evt.id}
											onClick={() =>
												setSelectedEventId(evt.id)
											}
											className="w-full text-left p-5 rounded-2xl border border-border bg-surface hover:border-primary hover:shadow-md transition-all cursor-pointer space-y-3 group"
										>
											<div className="flex items-center justify-between">
												<span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors truncate">
													{evt.title}
												</span>
												{evt.isActive ? (
													<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success-bg text-success border border-success/20 animate-pulse">
														● Active
													</span>
												) : (
													<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-secondary text-text-muted border border-border">
														Closed
													</span>
												)}
											</div>

											<div className="flex items-center gap-2 text-xs text-text-muted">
												<FiCalendar
													size={12}
													className="text-primary shrink-0"
												/>
												<span>
													{evt.date} at {evt.time}
												</span>
											</div>

											{evt.description && (
												<p className="text-xs text-text-muted line-clamp-2 mt-1">
													{evt.description}
												</p>
											)}

											<div className="flex items-center justify-between text-xs text-text-muted border-t border-border/40 pt-2 mt-2">
												<span>
													👥 {evtTurnout} Attendees
												</span>
												{canManage && (
													<span className="font-mono font-semibold text-primary">
														Code: {evt.checkInCode}
													</span>
												)}
											</div>
										</button>
									);
								})}
							</div>
						</motion.div>
					) : (
						<motion.div
							key="detail"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 10 }}
							transition={{ duration: 0.2 }}
							className="space-y-4"
						>
							<div className="mb-4">
								<button
									onClick={() => setSelectedEventId(null)}
									className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary/40 shadow-2xs cursor-pointer transition-colors"
								>
									<FiArrowLeft size={13} /> Back to all
									sessions
								</button>
							</div>

							<div className="w-full space-y-6">
								{currentSelectedEvent && (
									<div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-5">
										<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border pb-4">
											<div>
												<div className="flex items-center gap-2">
													<span
														className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
															currentSelectedEvent.isActive
																? 'bg-success-bg text-success border border-success/20'
																: 'bg-surface-secondary text-text-muted border border-border'
														}`}
													>
														{currentSelectedEvent.isActive
															? '● Check-in Open'
															: 'Check-in Closed'}
													</span>
													<span className="text-xs text-text-muted">
														{
															currentSelectedEvent.date
														}{' '}
														at{' '}
														{
															currentSelectedEvent.time
														}
													</span>
												</div>
												<h3 className="text-lg font-bold text-text-primary mt-1.5">
													{currentSelectedEvent.title}
												</h3>
												{currentSelectedEvent.description && (
													<p className="text-xs text-text-secondary mt-1">
														{
															currentSelectedEvent.description
														}
													</p>
												)}
											</div>

											{canManage && (
												<div className="flex items-center gap-2 shrink-0">
													<button
														onClick={() =>
															toggleEventActive(
																currentSelectedEvent.id,
																!currentSelectedEvent.isActive,
															)
														}
														className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary"
													>
														{currentSelectedEvent.isActive
															? 'Close Check-in'
															: 'Re-open Check-in'}
													</button>
													<button
														onClick={() => {
															if (
																confirm(
																	'Are you sure you want to delete this meeting session?',
																)
															) {
																deleteMeetingEvent(
																	currentSelectedEvent.id,
																);
															}
														}}
														className="text-text-muted hover:text-danger p-1.5 cursor-pointer"
														title="Delete meeting session"
													>
														<FiTrash2 size={16} />
													</button>
												</div>
											)}
										</div>

										{/* Big Check-in PIN Display (Officers Only) / Check-in Form */}
										{canManage ? (
											<div className="rounded-xl bg-primary-light/50 border border-primary/20 p-4 flex flex-col justify-between">
												<div>
													<span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
														Meeting Check-In Code
													</span>
													<p className="text-xs text-text-muted mt-0.5">
														Project this code on
														screen for attendees.
													</p>
												</div>
												<div className="my-3 text-center">
													<span className="text-3xl sm:text-4xl font-extrabold tracking-widest font-mono text-primary select-all">
														{
															currentSelectedEvent.checkInCode
														}
													</span>
												</div>
												<button
													onClick={() => {
														navigator.clipboard.writeText(
															currentSelectedEvent.checkInCode,
														);
														setCopiedPin(true);
														setTimeout(
															() =>
																setCopiedPin(
																	false,
																),
															2000,
														);
													}}
													className="w-full rounded-lg bg-primary py-1.5 text-xs font-semibold text-white shadow-2xs cursor-pointer hover:bg-primary-hover transition-all"
												>
													{copiedPin
														? 'Copied Code!'
														: 'Copy Code'}
												</button>
											</div>
										) : (
											/* Member-Only Self Check-in Form (No Code Visible) */
											<div className="rounded-2xl border border-border bg-surface-secondary/30 p-5 space-y-4">
												<div>
													<span className="text-xs font-bold text-text-primary uppercase tracking-wider block">
														Self Check-In
													</span>
													<p className="text-xs text-text-muted mt-0.5">
														Enter the check-in PIN
														displayed by club
														officers on the screen
														to verify your
														attendance.
													</p>
												</div>

												{userIsCheckedIn ? (
													<div className="py-4 text-center rounded-xl bg-success-bg border border-success/20">
														<span className="text-sm font-bold text-success flex items-center justify-center gap-2">
															<FiCheckCircle
																size={20}
															/>
															You are checked into
															this meeting!
														</span>
													</div>
												) : (
													<form
														onSubmit={
															handleSelfCheckIn
														}
														className="space-y-3 max-w-md"
													>
														{checkInResult?.error && (
															<div className="text-xs text-danger bg-danger-bg border border-danger/20 p-2.5 rounded-xl text-center font-medium">
																{
																	checkInResult.error
																}
															</div>
														)}
														<div className="flex items-center gap-2">
															<input
																type="text"
																required
																placeholder="Enter PIN"
																value={
																	checkInInput
																}
																onChange={(e) =>
																	setCheckInInput(
																		e.target
																			.value,
																	)
																}
																className="grow rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-mono font-bold text-center text-text-primary uppercase tracking-widest focus:ring-2 focus:ring-primary/30 focus:outline-none placeholder:font-sans placeholder:font-normal placeholder:tracking-normal"
															/>
															<button
																type="submit"
																disabled={
																	!currentSelectedEvent.isActive ||
																	!checkInInput.trim()
																}
																className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm transition-all disabled:opacity-50 cursor-pointer shrink-0"
															>
																Check In
															</button>
														</div>
														{!currentSelectedEvent.isActive && (
															<p className="text-[11px] text-text-muted italic">
																This meeting
																session is
																currently
																inactive or
																concluded.
															</p>
														)}
													</form>
												)}
											</div>
										)}

										{/* Live Member Roster Checklist */}
										<div className="space-y-3 pt-4 border-t border-border">
											<div className="flex items-center justify-between">
												<h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
													Meeting Roster &amp;
													Verification
												</h4>
												<span className="text-xs text-text-muted">
													{canManage
														? 'Officers & Leaders can toggle status below'
														: 'Live member turnout'}
												</span>
											</div>

											<div className="rounded-xl border border-border overflow-hidden">
												<table className="w-full text-left text-xs">
													<thead className="bg-surface-secondary/70 border-b border-border text-text-muted text-[11px]">
														<tr>
															<th className="p-3">
																Member
															</th>
															<th className="p-3">
																Status
															</th>
															{canManage && (
																<>
																	<th className="p-3 hidden sm:table-cell">
																		Method
																	</th>
																	<th className="p-3 text-right">
																		Officer
																		Actions
																	</th>
																</>
															)}
														</tr>
													</thead>
													<tbody className="divide-y divide-border">
														{group.memberIds.map(
															(mId) => {
																const memberUser =
																	users.find(
																		(u) =>
																			u.id ===
																			mId,
																	);
																const attRecord =
																	eventAttendances.find(
																		(a) =>
																			a.userId ===
																			mId,
																	);
																const status =
																	attRecord?.status ||
																	'ABSENT';

																return (
																	<tr
																		key={
																			mId
																		}
																		className="hover:bg-surface-secondary/30 transition-colors"
																	>
																		<td className="p-3 flex items-center gap-2">
																			{memberUser?.avatarUrl ? (
																				<Image
																					src={
																						memberUser.avatarUrl
																					}
																					alt=""
																					width={
																						24
																					}
																					height={
																						24
																					}
																					className="h-6 w-6 rounded-full object-cover border border-border"
																					unoptimized
																				/>
																			) : (
																				<div className="h-6 w-6 rounded-full bg-primary-light text-primary flex items-center justify-center text-[10px] font-bold">
																					{memberUser
																						?.name?.[0] ||
																						'M'}
																				</div>
																			)}
																			<div>
																				<span className="font-semibold text-text-primary block">
																					{memberUser?.name ||
																						'Member'}
																				</span>
																				<span className="text-[10px] text-text-muted">
																					{
																						memberUser?.email
																					}
																				</span>
																			</div>
																		</td>

																		<td className="p-3">
																			<span
																				className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
																					status ===
																					'PRESENT'
																						? 'bg-success-bg text-success border border-success/20'
																						: status ===
																							  'LATE'
																							? 'bg-warning-bg text-warning border border-warning/20'
																							: status ===
																								  'EXCUSED'
																								? 'bg-primary-light text-primary border border-primary/20'
																								: 'bg-surface-secondary text-text-muted border border-border'
																				}`}
																			>
																				{
																					status
																				}
																			</span>
																		</td>

																		{canManage && (
																			<td className="p-3 text-text-muted hidden sm:table-cell text-[11px]">
																				{attRecord?.checkInMethod ||
																					'—'}
																			</td>
																		)}

																		{canManage && (
																			<td className="p-3 text-right">
																				<div className="inline-flex items-center gap-1">
																					<button
																						onClick={() =>
																							updateAttendanceStatus(
																								currentSelectedEvent.id,
																								mId,
																								'PRESENT',
																							)
																						}
																						className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
																							status ===
																							'PRESENT'
																								? 'bg-success text-white border-success'
																								: 'border-border text-text-secondary hover:text-success'
																						}`}
																					>
																						Present
																					</button>
																					<button
																						onClick={() =>
																							updateAttendanceStatus(
																								currentSelectedEvent.id,
																								mId,
																								'LATE',
																							)
																						}
																						className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
																							status ===
																							'LATE'
																								? 'bg-warning text-white border-warning'
																								: 'border-border text-text-secondary hover:text-warning'
																						}`}
																					>
																						Late
																					</button>
																					<button
																						onClick={() =>
																							updateAttendanceStatus(
																								currentSelectedEvent.id,
																								mId,
																								'EXCUSED',
																							)
																						}
																						className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
																							status ===
																							'EXCUSED'
																								? 'bg-primary text-white border-primary'
																								: 'border-border text-text-secondary hover:text-primary'
																						}`}
																					>
																						Excused
																					</button>
																				</div>
																			</td>
																		)}
																	</tr>
																);
															},
														)}
													</tbody>
												</table>
											</div>
										</div>
									</div>
								)}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
				</main>
			)}

			{/* ═══════════ Tab 4: Member Roster ═══════════ */}
			{activeTab === 'roster' && (
				<main className="grow mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
					<div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
							<div>
								<h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
									<FiUsers className="text-primary" /> Member
									Roster
								</h2>
								<p className="text-xs text-text-muted mt-0.5">
									Explore active club members, leaders, and
									officers.
								</p>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-xs font-semibold bg-primary-light text-primary px-3 py-1 rounded-full border border-primary/20">
									{group.officerIds?.length || 0} Officers
								</span>
								<span className="text-xs font-semibold bg-surface-secondary border border-border text-text-secondary px-3 py-1 rounded-full">
									{group.memberIds.length} Total Members
								</span>
							</div>
						</div>

						{/* Search & Role Filters */}
						<div className="flex flex-col sm:flex-row items-center gap-3">
							<div className="relative w-full sm:max-w-md">
								<FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
								<input
									type="text"
									placeholder="Search members by name, email, or major..."
									value={rosterSearchQuery}
									onChange={(e) =>
										setRosterSearchQuery(e.target.value)
									}
									className="w-full rounded-xl border border-border bg-surface-secondary pl-8 pr-3.5 py-2 text-xs text-text-primary focus:ring-2 focus:ring-primary/30 focus:outline-none placeholder:text-text-muted"
								/>
							</div>
							<div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
								<button
									onClick={() => setRosterRoleFilter('all')}
									className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
										rosterRoleFilter === 'all'
											? 'bg-primary text-white shadow-2xs'
											: 'bg-surface-secondary text-text-muted hover:text-text-primary'
									}`}
								>
									All ({group.memberIds.length})
								</button>
								<button
									onClick={() =>
										setRosterRoleFilter('leaders')
									}
									className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
										rosterRoleFilter === 'leaders'
											? 'bg-primary-500 text-white shadow-2xs'
											: 'bg-surface-secondary text-text-muted hover:text-text-primary'
									}`}
								>
									Leadership (1)
								</button>
								<button
									onClick={() =>
										setRosterRoleFilter('officers')
									}
									className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
										rosterRoleFilter === 'officers'
											? 'bg-primary text-white shadow-2xs'
											: 'bg-surface-secondary text-text-muted hover:text-text-primary'
									}`}
								>
									Officers ({group.officerIds?.length || 0})
								</button>
								<button
									onClick={() =>
										setRosterRoleFilter('members')
									}
									className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
										rosterRoleFilter === 'members'
											? 'bg-primary text-white shadow-2xs'
											: 'bg-surface-secondary text-text-muted hover:text-text-primary'
									}`}
								>
									Members (
									{Math.max(
										0,
										group.memberIds.length -
											(group.officerIds?.length || 0) -
											1,
									)}
									)
								</button>
							</div>
						</div>

						{/* Member Grid */}
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
							{group.memberIds
								.filter((mId) => {
									const mem = users.find((u) => u.id === mId);
									const isLeaderMem = group.leaderId === mId;
									const isOfficerMem = Boolean(
										group.officerIds &&
										group.officerIds.includes(mId),
									);
									if (
										rosterRoleFilter === 'leaders' &&
										!isLeaderMem
									)
										return false;
									if (
										rosterRoleFilter === 'officers' &&
										!isOfficerMem
									)
										return false;
									if (
										rosterRoleFilter === 'members' &&
										(isLeaderMem || isOfficerMem)
									)
										return false;
									const q = rosterSearchQuery
										.toLowerCase()
										.trim();
									if (!q) return true;
									return (
										mem?.name?.toLowerCase().includes(q) ||
										mem?.email?.toLowerCase().includes(q) ||
										mem?.major?.toLowerCase().includes(q)
									);
								})
								.map((mId) => {
									const mem = users.find((u) => u.id === mId);
									const isLeaderMem = group.leaderId === mId;
									const isOfficerMem = Boolean(
										group.officerIds &&
										group.officerIds.includes(mId),
									);

									return (
										<div
											key={mId}
											className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-surface-secondary/30 hover:border-primary/30 transition-all"
										>
											{mem?.avatarUrl ? (
												<Image
													src={mem.avatarUrl}
													alt=""
													width={40}
													height={40}
													className="h-10 w-10 rounded-full object-cover border border-border shrink-0"
													unoptimized
												/>
											) : (
												<div className="h-10 w-10 rounded-full bg-primary-light text-primary flex items-center justify-center text-xs font-bold shrink-0">
													{mem?.name?.[0] || 'M'}
												</div>
											)}
											<div className="min-w-0">
												<div className="flex items-center gap-1.5">
													<span className="text-xs font-bold text-text-primary truncate">
														{mem?.name ||
															'Club Member'}
													</span>
													{isLeaderMem ? (
														<span className="text-[9px] font-bold bg-primary-500 text-white px-1.5 py-0.5 rounded-full shadow-2xs flex items-center gap-0.5">
															<FiShield
																size={9}
															/>{' '}
															Leader
														</span>
													) : isOfficerMem ? (
														<span className="text-[9px] font-bold bg-primary-light text-primary px-1.5 py-0.5 rounded-full border border-primary/20">
															Officer
														</span>
													) : (
														<span className="text-[9px] font-medium bg-surface text-text-muted px-1.5 py-0.5 rounded-full border border-border">
															Member
														</span>
													)}
												</div>
												<span className="text-[11px] text-text-muted block truncate mt-0.5">
													{mem?.email}
												</span>
												{mem?.major && (
													<span className="text-[10px] text-primary/80 font-medium block truncate">
														{mem.major}{' '}
														{mem.year
															? `• Year ${mem.year}`
															: ''}
													</span>
												)}
											</div>
										</div>
									);
								})}
						</div>
					</div>
				</main>
			)}

			{/* ═══════════ Tab 5: Member Roles ═══════════ */}
			{activeTab === 'roles' && canManage && (
				<main className="grow mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
					<div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
						{/* Title Header */}
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
							<div>
								<h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
									<FiShield className="text-primary" />{' '}
									Members
								</h2>
								<p className="text-xs text-text-muted mt-0.5">
									View and manage all members, roles, and
									activity.
								</p>
							</div>
							<div className="flex flex-wrap items-center gap-2">
								{/* Export / Import / Add Member Buttons */}
								<button
									onClick={exportRosterToCSV}
									className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-text-secondary hover:text-text-primary px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
								>
									<FiDownload size={12} />
									<span>Export Members</span>
								</button>
								{isLeader && (
									<>
										<button
											onClick={() =>
												setShowImportModal(true)
											}
											className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-text-secondary hover:text-text-primary px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
										>
											<FiUpload size={12} />
											<span>Import Members</span>
										</button>
										<button
											onClick={() =>
												setShowAddMemberModal(true)
											}
											className="inline-flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
										>
											<FiPlus size={13} />
											<span>Add Member</span>
										</button>
									</>
								)}
							</div>
						</div>

						{/* Notification Success Toast */}
						{roleChangeSuccess && (
							<div className="text-xs text-success bg-success-bg border border-success/20 p-3 rounded-xl flex items-center gap-2 font-medium">
								<FiCheckCircle className="shrink-0" />
								<span>{roleChangeSuccess}</span>
							</div>
						)}

						{/* Search & Filters */}
						<div className="flex flex-col sm:flex-row gap-3">
							<div className="relative grow">
								<FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
								<input
									type="text"
									placeholder="Search members by name, email, or major..."
									value={memberSearchQuery}
									onChange={(e) =>
										setMemberSearchQuery(e.target.value)
									}
									className="w-full rounded-xl border border-border bg-surface-secondary pl-8 pr-3.5 py-2 text-xs text-text-primary focus:ring-2 focus:ring-primary/30 focus:outline-none placeholder:text-text-muted"
								/>
							</div>
							<div className="w-full sm:w-48 shrink-0">
								<select
									value={memberRosterFilter}
									onChange={(e) =>
										setMemberRosterFilter(
											e.target.value as any,
										)
									}
									className="w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-xs text-text-primary focus:ring-2 focus:ring-primary/30 focus:outline-none cursor-pointer"
								>
									<option value="all">All Members</option>
									<option value="active">
										Active (Recent)
									</option>
									<option value="inactive">Inactive</option>
									<option value="officers">
										Officers Only
									</option>
									<option value="leader">Leader Only</option>
								</select>
							</div>
						</div>

						{/* Premium Member Table */}
						<div className="border border-border rounded-2xl bg-surface overflow-hidden shadow-2xs">
							<div className="overflow-x-auto">
								<table className="w-full text-left border-collapse min-w-175">
									<thead>
										<tr className="bg-surface-secondary/70 border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider select-none">
											<th
												onClick={() =>
													setMemberSortOrder(
														(prev) =>
															prev === 'asc'
																? 'desc'
																: 'asc',
													)
												}
												className="py-3.5 px-4 cursor-pointer hover:text-text-primary transition-colors flex items-center gap-1.5"
											>
												<span>Name</span>
												{memberSortOrder === 'asc' ? (
													<FiChevronUp size={12} />
												) : (
													<FiChevronDown size={12} />
												)}
											</th>
											<th className="py-3.5 px-4">
												Email
											</th>
											<th className="py-3.5 px-4">
												Major / Program
											</th>
											<th className="py-3.5 px-4">
												Phone
											</th>
											<th className="py-3.5 px-4">
												Role
											</th>
											<th className="py-3.5 px-4">
												Last Active
											</th>
											<th className="py-3.5 px-4 text-right">
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border text-xs">
										{(() => {
											const filteredIds =
												filteredAndSortedMemberIds;
											if (filteredIds.length === 0) {
												return (
													<tr>
														<td
															colSpan={7}
															className="py-8 text-center text-text-muted italic"
														>
															No club members
															found matching
															filters.
														</td>
													</tr>
												);
											}
											return filteredIds.map((mId) => {
												const mem = users.find(
													(u) => u.id === mId,
												);
												const isMemLeader =
													group.leaderId === mId;
												const isMemOfficer = Boolean(
													group.officerIds &&
													group.officerIds.includes(
														mId,
													),
												);
												const isUpdating =
													roleUpdatingId === mId;

												return (
													<tr
														key={mId}
														className="hover:bg-surface-secondary/20 transition-colors"
													>
														{/* Name */}
														<td className="py-3 px-4 font-semibold text-text-primary">
															<div className="flex items-center gap-3">
																{mem?.avatarUrl ? (
																	<Image
																		src={
																			mem.avatarUrl
																		}
																		alt=""
																		width={
																			32
																		}
																		height={
																			32
																		}
																		className="h-8 w-8 rounded-full object-cover border border-border shrink-0"
																		unoptimized
																	/>
																) : (
																	<div className="h-8 w-8 rounded-full bg-primary-light text-primary flex items-center justify-center text-xs font-bold shrink-0">
																		{mem
																			?.name?.[0] ||
																			'M'}
																	</div>
																)}
																<span className="truncate max-w-37.5">
																	{mem?.name ||
																		'Club Member'}
																</span>
															</div>
														</td>

														{/* Email */}
														<td className="py-3 px-4 text-text-secondary">
															<a
																href={`mailto:${mem?.email}`}
																className="text-primary hover:underline font-medium block truncate max-w-45"
															>
																{mem?.email}
															</a>
														</td>

														{/* Major */}
														<td className="py-3 px-4 text-text-secondary truncate max-w-37.5">
															{mem?.major || '-'}
														</td>

														{/* Phone */}
														<td className="py-3 px-4 text-text-secondary whitespace-nowrap">
															{mem?.phone || '-'}
														</td>

														{/* Role */}
														<td className="py-3 px-4">
															{isMemLeader ? (
																<span className="inline-flex items-center gap-1 text-[9px] font-bold bg-primary/20 text-primary-200 px-2 py-0.5 rounded-full shadow-2xs">
																	<FiShield
																		size={9}
																	/>
																	Leader
																</span>
															) : isMemOfficer ? (
																<span className="inline-flex items-center gap-1 text-[9px] font-bold bg-primary/20 text-primary-200 px-2 py-0.5 rounded-full shadow-2xs">
																	<FiUserCheck
																		size={9}
																	/>
																	Officer
																</span>
															) : (
																<span className="text-[10px] text-text-muted font-medium bg-surface-secondary border border-border px-2 py-0.5 rounded-full">
																	Member
																</span>
															)}
														</td>

														{/* Last Active */}
														<td className="py-3 px-4 text-text-secondary whitespace-nowrap">
															{formatLastActive(
																mem?.lastActive,
															)}
														</td>

														{/* Actions */}
														<td className="py-3 px-4 text-right whitespace-nowrap">
															<div className="inline-flex items-center gap-1.5">
																<button
																	type="button"
																	onClick={() =>
																		setViewingProfileUser(
																			mem ||
																				null,
																		)
																	}
																	className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
																	title="View Profile Details"
																>
																	<FiEye
																		size={
																			13
																		}
																	/>
																</button>
																{mem?.email && (
																	<a
																		href={`mailto:${mem.email}`}
																		className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors inline-block"
																		title="Send Email"
																	>
																		<FiMail
																			size={
																				13
																			}
																		/>
																	</a>
																)}
																{isLeader &&
																	!isMemLeader && (
																		<>
																			<button
																				type="button"
																				disabled={
																					isUpdating
																				}
																				onClick={() =>
																					setEditingRoleUser(
																						mem ||
																							null,
																					)
																				}
																				className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary-light transition-colors cursor-pointer disabled:opacity-50"
																				title="Edit Role / Permissions"
																			>
																				<FiEdit2
																					size={
																						13
																					}
																				/>
																			</button>
																			<button
																				type="button"
																				disabled={
																					isUpdating
																				}
																				onClick={() =>
																					handleKickMember(
																						mId,
																						mem?.name ||
																							'Member',
																					)
																				}
																				className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger-bg transition-colors cursor-pointer disabled:opacity-50"
																				title="Remove from Club"
																			>
																				<FiTrash2
																					size={
																						13
																					}
																				/>
																			</button>
																		</>
																	)}
															</div>
														</td>
													</tr>
												);
											});
										})()}
									</tbody>
								</table>
							</div>

							{/* Table Footer / Pagination stats */}
							<div className="bg-surface-secondary/70 border-t border-border px-4 py-3 text-[11px] text-text-muted font-medium flex items-center justify-between">
								<span>
									Showing 1 to{' '}
									{filteredAndSortedMemberIds.length} of{' '}
									{filteredAndSortedMemberIds.length} results
								</span>
								<span className="italic">
									Toon {filteredAndSortedMemberIds.length} van{' '}
									{filteredAndSortedMemberIds.length}{' '}
									resultaten
								</span>
							</div>
						</div>
					</div>

					{/* Modals definitions */}
					{/* 1. View Profile Modal */}
					{viewingProfileUser && (
						<div className="fixed inset-0 z-50 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
							<div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden relative">
								<button
									onClick={() => setViewingProfileUser(null)}
									className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
								>
									<FiX size={16} />
								</button>
								<div className="p-6 space-y-6">
									<div className="flex items-center gap-4">
										{viewingProfileUser.avatarUrl ? (
											<Image
												src={
													viewingProfileUser.avatarUrl
												}
												alt=""
												width={64}
												height={64}
												className="h-16 w-16 rounded-full object-cover border border-border shrink-0"
												unoptimized
											/>
										) : (
											<div className="h-16 w-16 rounded-full bg-primary-light text-primary flex items-center justify-center text-xl font-bold shrink-0">
												{viewingProfileUser.name?.[0] ||
													'U'}
											</div>
										)}
										<div>
											<h3 className="text-lg font-bold text-text-primary">
												{viewingProfileUser.name}
											</h3>
											<p className="text-xs text-text-muted">
												{viewingProfileUser.email}
											</p>
											<div className="mt-1.5">
												{group.leaderId ===
												viewingProfileUser.id ? (
													<span className="inline-flex items-center gap-1 text-[9px] font-bold bg-primary/20 text-primary-200 px-2 py-0.5 rounded-full shadow-2xs">
														<FiShield size={9} />
														Leader
													</span>
												) : group.officerIds?.includes(
														viewingProfileUser.id,
												  ) ? (
													<span className="inline-flex items-center gap-1 text-[9px] font-bold bg-primary/20 text-primary-200 px-2 py-0.5 rounded-full shadow-2xs">
														<FiUserCheck size={9} />
														Officer
													</span>
												) : (
													<span className="inline-flex text-[9px] text-text-muted font-medium bg-surface-secondary border border-border px-2 py-0.5 rounded-full">
														Member
													</span>
												)}
											</div>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-4 text-xs border-t border-border pt-4">
										<div>
											<span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
												Major / Program
											</span>
											<span className="text-text-primary font-medium">
												{viewingProfileUser.major ||
													'Not specified'}
											</span>
										</div>
										<div>
											<span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
												Class / Year
											</span>
											<span className="text-text-primary font-medium">
												{viewingProfileUser.year ||
													'Not specified'}
											</span>
										</div>
										<div>
											<span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
												Phone Number
											</span>
											<span className="text-text-primary font-medium">
												{viewingProfileUser.phone ||
													'Not specified'}
											</span>
										</div>
										<div>
											<span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
												Last Active
											</span>
											<span className="text-text-primary font-medium">
												{viewingProfileUser.lastActive
													? new Date(
															viewingProfileUser.lastActive,
														).toLocaleString()
													: 'Never'}
											</span>
										</div>
									</div>

									<div className="border-t border-border pt-4 text-xs">
										<span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
											Bio & Interests
										</span>
										<p className="text-text-secondary bg-surface-secondary p-3 rounded-xl border border-border min-h-15 whitespace-pre-line leading-relaxed">
											{viewingProfileUser.bio ||
												'This user has not written a bio yet.'}
										</p>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* 2. Add Member Modal */}
					{showAddMemberModal && (
						<div className="fixed inset-0 z-50 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
							<div className="bg-surface border border-border w-full max-w-sm rounded-2xl shadow-xl overflow-hidden relative">
								<button
									onClick={() => {
										setShowAddMemberModal(false);
										setAddMemberErrorMsg('');
										setAddMemberSuccessMsg('');
										setAddMemberEmailInput('');
									}}
									className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
								>
									<FiX size={16} />
								</button>
								<form
									onSubmit={(e) => {
										e.preventDefault();
										handleAddMember(addMemberEmailInput);
									}}
									className="p-6 space-y-4"
								>
									<div>
										<h3 className="text-sm font-bold text-text-primary">
											Add Member to Club
										</h3>
										<p className="text-[11px] text-text-muted mt-0.5">
											Add an existing student directly by
											email.
										</p>
									</div>

									<div className="space-y-1.5">
										<label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">
											Email Address
										</label>
										<input
											type="email"
											required
											placeholder="student@example.com"
											value={addMemberEmailInput}
											onChange={(e) =>
												setAddMemberEmailInput(
													e.target.value,
												)
											}
											className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
										/>
									</div>

									{addMemberErrorMsg && (
										<p className="text-[11px] font-medium text-danger bg-danger-bg border border-danger/10 p-2.5 rounded-lg">
											{addMemberErrorMsg}
										</p>
									)}
									{addMemberSuccessMsg && (
										<p className="text-[11px] font-medium text-success bg-success-bg border border-success/10 p-2.5 rounded-lg">
											{addMemberSuccessMsg}
										</p>
									)}

									<button
										type="submit"
										disabled={isAddingMember}
										className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-primary hover:bg-primary-hover text-white py-2 text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
									>
										{isAddingMember
											? 'Adding...'
											: 'Add Student'}
									</button>
								</form>
							</div>
						</div>
					)}

					{/* 3. Import Members Modal */}
					{showImportModal && (
						<div className="fixed inset-0 z-50 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
							<div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden relative">
								<button
									onClick={() => {
										setShowImportModal(false);
										setImportErrorMsg('');
										setImportSuccessMsg('');
										setImportEmailsText('');
									}}
									className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
								>
									<FiX size={16} />
								</button>
								<div className="p-6 space-y-4 text-xs">
									<div>
										<h3 className="text-sm font-bold text-text-primary">
											Import Members
										</h3>
										<p className="text-[11px] text-text-muted mt-0.5">
											Upload a CSV/text file or paste
											emails below.
										</p>
									</div>

									<div className="space-y-1.5">
										<label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">
											CSV/Text File Roster
										</label>
										<input
											type="file"
											accept=".csv,.txt"
											onChange={(e) => {
												const file =
													e.target.files?.[0];
												if (file) {
													if (file.size > 200000) {
														alert(
															'File size must be less than 200 KB (200,000 bytes).',
														);
														e.target.value = '';
														return;
													}
													const reader =
														new FileReader();
													reader.onload = (event) => {
														const text = event
															.target
															?.result as string;
														setImportEmailsText(
															text,
														);
													};
													reader.readAsText(file);
												}
											}}
											className="block w-full text-xs text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary-light/80 cursor-pointer"
										/>
									</div>

									<div className="space-y-1.5">
										<label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">
											Or Paste Email List
										</label>
										<textarea
											rows={5}
											placeholder="Paste student emails separated by commas or lines here..."
											value={importEmailsText}
											onChange={(e) =>
												setImportEmailsText(
													e.target.value,
												)
											}
											className="w-full rounded-xl border border-border bg-surface p-2.5 text-xs text-text-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
										/>
									</div>

									{importErrorMsg && (
										<p className="text-[11px] font-medium text-danger bg-danger-bg border border-danger/10 p-2.5 rounded-lg">
											{importErrorMsg}
										</p>
									)}
									{importSuccessMsg && (
										<p className="text-[11px] font-medium text-success bg-success-bg border border-success/10 p-2.5 rounded-lg">
											{importSuccessMsg}
										</p>
									)}

									<button
										onClick={() =>
											handleImportCSV(importEmailsText)
										}
										disabled={
											isImporting ||
											!importEmailsText.trim()
										}
										className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-primary hover:bg-primary-hover text-white py-2 text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
									>
										{isImporting
											? 'Importing...'
											: 'Import Members'}
									</button>
								</div>
							</div>
						</div>
					)}

					{/* 4. Edit Role Modal */}
					{editingRoleUser && (
						<div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
							<div className="bg-surface border border-border w-full max-w-sm rounded-2xl shadow-xl overflow-hidden relative">
								<button
									onClick={() => setEditingRoleUser(null)}
									className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
								>
									<FiX size={16} />
								</button>
								<div className="p-6 space-y-4">
									<div>
										<h3 className="text-sm font-bold text-text-primary">
											Change Member Role
										</h3>
										<p className="text-[11px] text-text-muted mt-0.5">
											Update {editingRoleUser.name}&apos;s
											permissions in {group.name}.
										</p>
									</div>

									<div className="flex items-center gap-3 bg-surface-secondary p-3 rounded-xl border border-border">
										{editingRoleUser.avatarUrl ? (
											<Image
												src={editingRoleUser.avatarUrl}
												alt=""
												width={36}
												height={36}
												className="h-9 w-9 rounded-full object-cover border border-border shrink-0"
												unoptimized
											/>
										) : (
											<div className="h-9 w-9 rounded-full bg-primary-light text-primary flex items-center justify-center text-xs font-bold shrink-0">
												{editingRoleUser.name?.[0] ||
													'M'}
											</div>
										)}
										<div>
											<span className="block font-bold text-text-primary text-xs">
												{editingRoleUser.name}
											</span>
											<span className="text-[10px] text-text-muted block">
												{editingRoleUser.email}
											</span>
										</div>
									</div>

									<div className="space-y-2 border-t border-border pt-4">
										{group.officerIds?.includes(
											editingRoleUser.id,
										) ? (
											<button
												onClick={async () => {
													await handleDemoteOfficer(
														editingRoleUser.id,
													);
													setEditingRoleUser(null);
												}}
												disabled={
													roleUpdatingId ===
													editingRoleUser.id
												}
												className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface hover:bg-surface-secondary text-text-secondary hover:text-text-primary py-2.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
											>
												<FiUserMinus
													size={13}
													className="text-warning"
												/>
												<span>Demote to Member</span>
											</button>
										) : (
											<button
												onClick={async () => {
													await handlePromoteToOfficer(
														editingRoleUser.id,
													);
													setEditingRoleUser(null);
												}}
												disabled={
													roleUpdatingId ===
													editingRoleUser.id
												}
												className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white py-2.5 text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
											>
												<FiUserCheck size={13} />
												<span>Promote to Officer</span>
											</button>
										)}
									</div>
								</div>
							</div>
						</div>
					)}
				</main>
			)}

			{/* ═══════════ Tab 6: Club Settings ═══════════ */}
			{activeTab === 'settings' && (
				<main className="grow mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
					<div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
						<div className="flex justify-between items-center border-b border-border pb-4">
							<div>
								<h2 className="text-xl font-bold text-text-primary">
									Club Details &amp; Settings
								</h2>
								<p className="text-xs text-text-muted mt-0.5">
									View information about {group.name} and
									configure settings if you are an officer.
								</p>
							</div>
							{canManage && !isEditingSettings && (
								<button
									onClick={() => {
										setSettingsName(group.name);
										setSettingsTagline(group.tagline || '');
										setSettingsDesc(group.description);
										setSettingsLocation(
											group.meetingLocation || '',
										);
										setSettingsEnableCustomBanner(
											group.bannerUrl?.startsWith(
												'data:',
											) ||
												group.bannerUrl?.startsWith(
													'http',
												) ||
												false,
										);
										if (
											group.bannerUrl?.startsWith(
												'data:',
											) ||
											group.bannerUrl?.startsWith('http')
										) {
											setSettingsBannerPreview(
												group.bannerUrl,
											);
										} else {
											setSettingsBannerColor(
												group.bannerUrl ||
													BANNER_COLOR_PRESETS[0]
														.value,
											);
										}
										setSettingsDiscord(
											group.discordUrl || '',
										);
										setSettingsInstagram(
											group.instagramUrl || '',
										);
										setSettingsWebsite(
											group.websiteUrl || '',
										);
										setIsEditingSettings(true);
									}}
									className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-2xs transition-all cursor-pointer"
								>
									Edit Club Info
								</button>
							)}
						</div>

						{/* Invite Link & Code Generator Box */}
						{isLeader && !isEditingSettings && (
							<div className="rounded-2xl bg-primary-light/50 border border-primary/20 p-5 space-y-4">
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-primary/15 pb-3">
									<div>
										<span className="text-xs font-bold text-primary flex items-center gap-1.5">
											<FiShare2 /> Shareable Recruitment
											Invite
										</span>
										<p className="text-[11px] text-text-muted mt-0.5">
											Share a 1-click link or code with
											prospective members to join
											immediately.
										</p>
									</div>
									<div className="flex items-center gap-2 self-start sm:self-auto">
										<button
											type="button"
											onClick={async () => {
												const res =
													await generateClubInvite(
														id,
													);
												if (res.success && res.code) {
													setGeneratedInviteCode(
														res.code,
													);
												}
											}}
											className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-2xs transition-all cursor-pointer"
										>
											{generatedInviteCode
												? 'Regenerate Invite'
												: 'Generate Invite Link'}
										</button>
										{generatedInviteCode && (
											<button
												type="button"
												onClick={async () => {
													if (
														confirm(
															'Are you sure you want to delete all invite links for this club? Existing codes/links will no longer work.',
														)
													) {
														const res =
															await deleteClubInvites(
																id,
															);
														if (res.success) {
															setGeneratedInviteCode(
																'',
															);
														}
													}
												}}
												className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 shadow-2xs transition-all cursor-pointer"
											>
												Delete Link
											</button>
										)}
									</div>
								</div>

								{generatedInviteCode ? (
									<div className="space-y-3">
										{/* Direct 1-Click Link */}
										<div>
											<label className="block text-[10px] font-bold text-primary uppercase tracking-wider mb-1 items-center gap-1">
												<FiLink size={11} /> 1-Click
												Direct Join Link
											</label>
											<div className="flex items-center gap-2">
												<input
													readOnly
													value={
														typeof window !==
														'undefined'
															? `${window.location.origin}/join/${generatedInviteCode}`
															: `/join/${generatedInviteCode}`
													}
													className="grow rounded-lg border border-primary/30 bg-surface px-3 py-2 text-xs font-mono font-bold text-primary"
												/>
												<button
													type="button"
													onClick={() => {
														const link = `${window.location.origin}/join/${generatedInviteCode}`;
														navigator.clipboard.writeText(
															link,
														);
														setCopiedInviteLink(
															true,
														);
														setTimeout(
															() =>
																setCopiedInviteLink(
																	false,
																),
															2000,
														);
													}}
													className="rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition-all cursor-pointer shrink-0 flex items-center gap-1"
												>
													<FiLink size={12} />
													<span>
														{copiedInviteLink
															? 'Link Copied!'
															: 'Copy Link'}
													</span>
												</button>
											</div>
										</div>

										{/* Raw Code for Explore Clubs */}
										<div>
											<label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 items-center gap-1">
												<FiKey size={11} /> Invite Code
												(For Explore Clubs Page)
											</label>
											<div className="flex items-center gap-2">
												<input
													readOnly
													value={generatedInviteCode}
													className="grow rounded-lg border border-border bg-surface px-3 py-2 text-xs font-mono font-bold text-text-primary"
												/>
												<button
													type="button"
													onClick={() => {
														navigator.clipboard.writeText(
															generatedInviteCode,
														);
														setCopiedInvite(true);
														setTimeout(
															() =>
																setCopiedInvite(
																	false,
																),
															2000,
														);
													}}
													className="rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all cursor-pointer shrink-0 flex items-center gap-1"
												>
													<FiKey size={12} />
													<span>
														{copiedInvite
															? 'Code Copied!'
															: 'Copy Code'}
													</span>
												</button>
											</div>
										</div>
									</div>
								) : (
									<p className="text-xs text-text-secondary">
										Click{' '}
										<strong>Generate Invite Link</strong> to
										create a direct link (e.g.{' '}
										<code className="font-mono text-primary font-bold">
											/join/DEMOS-GDSC-2026
										</code>
										) that instantly adds members to your
										club roster.
									</p>
								)}
							</div>
						)}

						{/* Showcase Content */}
						{!isEditingSettings ? (
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border">
								{/* About Info */}
								<div className="md:col-span-2 space-y-4">
									<h3 className="text-base font-bold text-text-primary">
										About the Club
									</h3>
									<p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
										{group.description}
									</p>

									{group.tags && group.tags.length > 0 && (
										<div className="pt-2">
											<h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
												Focus Areas &amp; Activities
											</h4>
											<div className="flex flex-wrap gap-1.5">
												{group.tags.map((t) => (
													<span
														key={t}
														className="bg-primary-light text-primary text-xs font-semibold px-2.5 py-1 rounded-lg"
													>
														#{t}
													</span>
												))}
											</div>
										</div>
									)}
								</div>

								{/* Club Details Column */}
								<div className="space-y-4 rounded-xl bg-surface-secondary/40 p-4 border border-border">
									<h3 className="text-sm font-bold text-text-primary">
										Quick Facts
									</h3>
									<div className="space-y-3 text-xs">
										<div>
											<span className="text-text-muted block text-[10px] uppercase font-semibold">
												Meeting Schedule:
											</span>
											<span className="font-semibold text-text-primary mt-0.5 flex items-center gap-1.5">
												<FiCalendar className="text-primary" />{' '}
												{group.meetingFrequency}
											</span>
										</div>
										<div>
											<span className="text-text-muted block text-[10px] uppercase font-semibold">
												Meeting Room:
											</span>
											<span className="font-semibold text-text-primary mt-0.5 flex items-center gap-1.5">
												<FiMapPin className="text-primary" />{' '}
												{group.meetingLocation ||
													'Campus Center'}
											</span>
										</div>
										<div>
											<span className="text-text-muted block text-[10px] uppercase font-semibold">
												Category:
											</span>
											<span className="font-semibold text-text-primary mt-0.5">
												{group.category}
											</span>
										</div>
										{(group.discordUrl ||
											group.instagramUrl ||
											group.websiteUrl) && (
											<div className="pt-2 border-t border-border/60 space-y-2">
												<span className="text-text-muted block text-[10px] uppercase font-semibold mb-1">
													Social Links &amp; Web
												</span>
												{group.discordUrl && (
													<a
														href={group.discordUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="font-semibold text-primary hover:underline flex items-center gap-1.5 truncate"
													>
														<FaDiscord className="text-primary shrink-0" />{' '}
														Discord
													</a>
												)}
												{group.instagramUrl && (
													<a
														href={
															group.instagramUrl
														}
														target="_blank"
														rel="noopener noreferrer"
														className="font-semibold text-primary hover:underline flex items-center gap-1.5 truncate"
													>
														<FiInstagram className="text-primary shrink-0" />{' '}
														Instagram
													</a>
												)}
												{group.websiteUrl && (
													<a
														href={group.websiteUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="font-semibold text-primary hover:underline flex items-center gap-1.5 truncate"
													>
														<FiGlobe className="text-primary shrink-0" />{' '}
														Website
													</a>
												)}
											</div>
										)}
									</div>
								</div>
							</div>
						) : (
							/* Edit Club Profile Form */
							<form
								onSubmit={handleSaveClubSettings}
								className="space-y-4 text-xs border-t border-border pt-4"
							>
								{settingsSuccess && (
									<div className="text-xs text-success bg-success-bg p-2.5 rounded-lg text-center font-medium">
										Club settings updated successfully!
									</div>
								)}

								<Input
									label="Club Name"
									value={settingsName}
									onChange={(e) =>
										setSettingsName(e.target.value)
									}
								/>

								<Input
									label="Tagline"
									value={settingsTagline}
									onChange={(e) =>
										setSettingsTagline(e.target.value)
									}
								/>

								<div>
									<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
										Description &amp; Mission
									</label>
									<textarea
										rows={4}
										value={settingsDesc}
										onChange={(e) =>
											setSettingsDesc(e.target.value)
										}
										className="w-full rounded-xl border border-border bg-surface p-3 text-xs text-text-primary"
									/>
								</div>

								<Input
									label="Meeting Location"
									value={settingsLocation}
									onChange={(e) =>
										setSettingsLocation(e.target.value)
									}
								/>

								{/* Banner Setting */}
								<div className="rounded-xl border border-border bg-surface-secondary/40 p-3.5 space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
											Club Banner
										</span>
										<label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
											<Checkbox
												checked={
													settingsEnableCustomBanner
												}
												onChange={() =>
													setSettingsEnableCustomBanner(
														!settingsEnableCustomBanner,
													)
												}
											/>
											<span>Upload custom image</span>
										</label>
									</div>

									<div className="relative h-24 w-full rounded-lg overflow-hidden border border-border flex items-center justify-center">
										{settingsEnableCustomBanner &&
										settingsBannerPreview ? (
											<>
												<Image
													src={settingsBannerPreview}
													alt="Banner Preview"
													fill
													className="object-cover"
												/>
												<button
													type="button"
													onClick={() =>
														setSettingsBannerPreview(
															'',
														)
													}
													className="absolute top-1 right-1 bg-black/60 text-white rounded px-2 py-0.5 text-[10px]"
												>
													Remove
												</button>
											</>
										) : (
											<div
												className="w-full h-full flex items-center justify-center text-white font-bold text-xs shadow-inner"
												style={{
													background:
														settingsBannerColor,
												}}
											>
												{settingsName ||
													'Banner Preview'}
											</div>
										)}
									</div>

									{settingsEnableCustomBanner ? (
										<input
											type="file"
											accept="image/*"
											onChange={(e) => {
												const file =
													e.target.files?.[0];
												if (file) {
													if (file.size > 200000) {
														alert(
															'File size must be less than 200 KB (200,000 bytes).',
														);
														e.target.value = '';
														return;
													}
													const reader =
														new FileReader();
													reader.onload = () => {
														setSettingsBannerPreview(
															reader.result as string,
														);
													};
													reader.readAsDataURL(file);
												}
											}}
											className="block w-full text-xs text-text-secondary file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary-light/80 cursor-pointer"
										/>
									) : (
										<select
											value={settingsBannerColor}
											onChange={(e) =>
												setSettingsBannerColor(
													e.target.value,
												)
											}
											className="w-full rounded-lg border border-border bg-surface p-2 text-xs text-text-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
										>
											{BANNER_COLOR_PRESETS.map(
												(preset) => (
													<option
														key={preset.id}
														value={preset.value}
													>
														{preset.name}
													</option>
												),
											)}
										</select>
									)}
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
									<Input
										label="Discord URL"
										value={settingsDiscord}
										onChange={(e) =>
											setSettingsDiscord(e.target.value)
										}
									/>
									<Input
										label="Instagram URL"
										value={settingsInstagram}
										onChange={(e) =>
											setSettingsInstagram(e.target.value)
										}
									/>
									<Input
										label="Website URL"
										value={settingsWebsite}
										onChange={(e) =>
											setSettingsWebsite(e.target.value)
										}
									/>
								</div>

								<div className="pt-3 flex justify-end gap-2">
									<button
										type="button"
										onClick={() =>
											setIsEditingSettings(false)
										}
										className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={updatingSettings}
										className="rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm disabled:opacity-50"
									>
										{updatingSettings
											? 'Saving...'
											: 'Save Club Settings'}
									</button>
								</div>
							</form>
						)}
					</div>
				</main>
			)}

			{/* ═══════════ Tab 7: Activities Schedule & Management ═══════════ */}
			{activeTab === 'activities' && (
				<main className="grow mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
						<div>
							<h2 className="text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2">
								📅 Activities &amp; Schedule
							</h2>
							<p className="text-xs text-text-muted mt-0.5">
								{canManage
									? 'Manage activities, schedule new sessions, and track RSVP statuses.'
									: 'View club activity schedule, member birthdays, and RSVP to upcoming events.'}
							</p>
						</div>

						<div className="flex items-center gap-3">
							<Checkbox
								checked={showBirthdaysTab}
								onChange={(e) =>
									setShowBirthdaysTab(e.target.checked)
								}
								label={
									<span className="font-semibold text-xs text-text-secondary">
										Show birthdays
									</span>
								}
							/>

							{canManage && (
								<button
									onClick={() => {
										console.log(
											'starting activity creation',
										);
										setEditingActivityId(null);
										setEventTitle('');
										setEventDesc('');
										setEventDate(
											new Date()
												.toISOString()
												.split('T')[0],
										);
										setEventTime('18:00');
										setEventLocation('');
										setActivityEndDate('');
										setActivityPrice('');
										setActivityStatus('NOT_SENT');
										setCreateEventModal(true);
									}}
									className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm cursor-pointer"
								>
									<FiPlus size={14} /> Add Activity
								</button>
							)}
						</div>
					</div>

					{/* Timeline Render */}
					{(() => {
						const getEnglishWeekday = (date: Date) => {
							const days = [
								'Sun',
								'Mon',
								'Tue',
								'Wed',
								'Thu',
								'Fri',
								'Sat',
							];
							return days[date.getDay()];
						};

						const getEnglishMonth = (date: Date) => {
							const months = [
								'Jan',
								'Feb',
								'Mar',
								'Apr',
								'May',
								'Jun',
								'Jul',
								'Aug',
								'Sep',
								'Oct',
								'Nov',
								'Dec',
							];
							return months[date.getMonth()];
						};

						const handleRSVP = async (
							eventId: string,
							status: string,
						) => {
							try {
								await fetch('/api/attendance', {
									method: 'POST',
									headers: {
										'Content-Type': 'application/json',
									},
									body: JSON.stringify({
										eventId,
										userId: currentUser.id,
										status,
										checkInMethod: 'MANUAL',
									}),
								});
								fetchAttendances(id);
							} catch (e) {
								console.error(e);
							}
						};

						// Gather and sort items
						const clubEvts = events
							.filter((e) => e.groupId === id)
							.map((e) => ({
								...e,
								isBirthday: false,
								dateTime: new Date(
									`${e.date}T${e.time || '00:00'}`,
								),
							}));

						const bdayEvts: any[] = [];
						if (showBirthdaysTab) {
							const groupMembers = users.filter(
								(u) =>
									group.memberIds.includes(u.id) ||
									group.leaderId === u.id,
							);
							groupMembers.forEach((mem) => {
								if (mem.birthday) {
									const bParts = mem.birthday.split('-');
									if (bParts.length === 3) {
										const birthYear = parseInt(bParts[0]);
										const birthMonth =
											parseInt(bParts[1]) - 1;
										const birthDay = parseInt(bParts[2]);

										const bDate = new Date(
											2026,
											birthMonth,
											birthDay,
										);
										const age = 2026 - birthYear;

										bdayEvts.push({
											id: `bday_${mem.id}_${mem.birthday}`,
											isBirthday: true,
											title: mem.name,
											date: `2026-${String(birthMonth + 1).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`,
											dateTime: bDate,
											age,
										});
									}
								}
							});
						}

						const items = [...clubEvts, ...bdayEvts].sort(
							(a, b) =>
								a.dateTime.getTime() - b.dateTime.getTime(),
						);

						const grouped: { [key: string]: unknown[] } = {};
						items.forEach((item) => {
							const mStr = `${getEnglishMonth(item.dateTime)} ${item.dateTime.getFullYear()}`;
							if (!grouped[mStr]) grouped[mStr] = [];
							grouped[mStr].push(item);
						});

						if (items.length === 0) {
							return (
								<div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-text-muted italic text-xs">
									No activities scheduled yet.
								</div>
							);
						}

						return Object.keys(grouped).map((monthHeader) => (
							<div key={monthHeader} className="space-y-4">
								<h3 className="text-xs font-bold text-primary tracking-wide uppercase px-1 border-l-2 border-primary pl-2">
									{monthHeader}
								</h3>

								<div className="divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden shadow-2xs">
									{grouped[monthHeader].map((item: any) => {
										const dateObj = item.dateTime;

										if (item.isBirthday) {
											return (
												<div
													key={item.id}
													className="flex items-center justify-between p-4 hover:bg-pink-500/5 transition-colors group"
												>
													<div className="flex items-center gap-4">
														<div className="text-center w-16 shrink-0 border-r border-border/60 pr-4">
															<span className="block text-[10px] font-bold text-pink-500 uppercase">
																{getEnglishWeekday(
																	dateObj,
																)}
															</span>
															<span className="block text-2xl font-extrabold text-pink-500/90 leading-tight">
																{dateObj.getDate()}
															</span>
															<span className="block text-[9px] text-text-muted font-medium">
																{getEnglishMonth(
																	dateObj,
																)}
															</span>
														</div>
														<div>
															<div className="flex items-center gap-1.5 font-bold text-text-primary text-sm">
																<FiGift
																	className="text-pink-500"
																	size={14}
																/>
																<span>
																	{item.title}
																</span>
															</div>
															<span className="text-xs text-text-muted mt-0.5 block font-medium">
																Turns {item.age}{' '}
																years old
															</span>
														</div>
													</div>
													<FiChevronRight className="text-text-muted/40" />
												</div>
											);
										}

										const isUserGoing = attendances.some(
											(a) =>
												a.eventId === item.id &&
												a.userId === currentUser.id &&
												(a.status === 'RSVP_YES' ||
													a.status === 'PRESENT'),
										);
										const evAtts = attendances.filter(
											(a) => a.eventId === item.id,
										);
										const yesCount = evAtts.filter(
											(a) =>
												a.status === 'RSVP_YES' ||
												a.status === 'PRESENT',
										).length;
										const noCount = evAtts.filter(
											(a) =>
												a.status === 'RSVP_NO' ||
												a.status === 'ABSENT',
										).length;
										const maybeCount = evAtts.filter(
											(a) =>
												a.status === 'RSVP_MAYBE' ||
												a.status === 'EXCUSED',
										).length;

										return (
											<div
												key={item.id}
												className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 hover:bg-surface-secondary/20 transition-colors group"
											>
												<div className="flex items-start gap-4">
													<div className="text-center w-16 shrink-0 border-r border-border/60 pr-4 mt-1">
														<span className="block text-[10px] font-bold text-primary uppercase">
															{getEnglishWeekday(
																dateObj,
															)}
														</span>
														<span className="block text-2xl font-extrabold text-text-primary leading-tight">
															{dateObj.getDate()}
														</span>
														<span className="block text-[9px] text-text-muted font-medium">
															{getEnglishMonth(
																dateObj,
															)}
														</span>
													</div>

													<div className="space-y-1">
														<div className="flex flex-wrap items-center gap-2">
															<span className="font-bold text-text-primary text-sm group-hover:text-primary transition-colors">
																{item.title}
															</span>
															{item.status ===
																'NOT_SENT' && (
																<span className="text-[9px] font-bold bg-primary/20 text-primary-200 px-1.5 py-0.5 rounded-md">
																	Draft / Not
																	sent
																</span>
															)}
														</div>

														<div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-text-muted font-medium">
															<span className="flex items-center gap-1">
																<FiCalendar
																	size={11}
																/>
																{item.date}{' '}
																{item.endDate
																	? `- ${item.endDate}`
																	: ''}
															</span>
															<span className="flex items-center gap-1">
																<FiClock
																	size={11}
																/>
																{item.time ||
																	'All Day'}
															</span>
															{item.location && (
																<span className="flex items-center gap-1">
																	<FiMapPin
																		size={
																			11
																		}
																	/>
																	{
																		item.location
																	}
																</span>
															)}
														</div>

														<div className="flex items-center gap-2 pt-1 text-[10px] font-bold text-text-muted">
															<span className="text-success flex items-center gap-0.5">
																✓ {yesCount}
															</span>
															<span className="text-danger flex items-center gap-0.5">
																✗ {noCount}
															</span>
															<span className="text-warning flex items-center gap-0.5">
																o {maybeCount}
															</span>
														</div>
													</div>
												</div>

												<div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 border-border/40 pt-3 sm:pt-0">
													{item.price && (
														<span className="text-[10px] font-bold bg-primary/20 text-primary-200 px-2 py-0.5 rounded-lg shadow-2xs">
															{item.price.includes(
																'p',
															)
																? item.price
																: `$${item.price} p/p`}
														</span>
													)}

													<div className="flex items-center gap-1.5">
														{canManage ? (
															<>
																<button
																	onClick={() => {
																		setEditingActivityId(
																			item.id,
																		);
																		setEventTitle(
																			item.title,
																		);
																		setEventDesc(
																			item.description ||
																				'',
																		);
																		setEventDate(
																			item.date,
																		);
																		setEventTime(
																			item.time ||
																				'18:00',
																		);
																		setEventLocation(
																			item.location ||
																				'',
																		);
																		setActivityEndDate(
																			item.endDate ||
																				'',
																		);
																		setActivityPrice(
																			item.price ||
																				'',
																		);
																		setActivityStatus(
																			item.status ||
																				'NOT_SENT',
																		);
																		setActivityLocationType(
																			item.locationType ||
																				'',
																		);
																		setActivityAllDay(
																			item.allDay ||
																				false,
																		);
																		setActivityEndTime(
																			item.endTime ||
																				'10:00',
																		);
																		setActivityRegRequired(
																			item.regRequired ||
																				false,
																		);
																		setActivityRegCapacity(
																			item.regCapacity
																				? String(
																						item.regCapacity,
																					)
																				: '',
																		);
																		setActivityRegDeadline(
																			item.regDeadline ||
																				'',
																		);
																		setActivityInviteMessage(
																			item.inviteMessage ||
																				'',
																		);
																		setActivityInviteReminderDays(
																			item.inviteReminderDays
																				? String(
																						item.inviteReminderDays,
																					)
																				: '0',
																		);
																		setModalActiveTab(
																			'data',
																		);
																		setCreateEventModal(
																			true,
																		);
																	}}
																	className="p-1.5 rounded-lg border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all cursor-pointer"
																	title="Edit Activity"
																>
																	✏️
																</button>
																<button
																	onClick={() =>
																		handleDeleteActivity(
																			item.id,
																		)
																	}
																	className="p-1.5 rounded-lg border border-border bg-surface text-danger hover:bg-danger/10 transition-all cursor-pointer"
																	title="Delete Activity"
																>
																	🗑️
																</button>
															</>
														) : (
															<button
																onClick={() =>
																	handleRSVP(
																		item.id,
																		isUserGoing
																			? 'RSVP_NO'
																			: 'RSVP_YES',
																	)
																}
																className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all cursor-pointer shadow-2xs ${
																	isUserGoing
																		? 'bg-success text-white hover:bg-success/80'
																		: 'border border-border bg-surface text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
																}`}
															>
																<FiCheckCircle
																	size={11}
																/>
																<span>
																	{isUserGoing
																		? 'Going'
																		: 'RSVP'}
																</span>
															</button>
														)}
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						));
					})()}
				</main>
			)}

			{/* Standalone Schedule Meeting Session Modal */}
			<AnimatePresence>
				{createMeetingModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in duration-200"
						>
							<div className="flex items-start justify-between border-b border-border pb-3">
								<div>
									<h3 className="text-base font-bold text-text-primary">
										Schedule Meeting Session
									</h3>
									<p className="text-[10px] text-text-muted mt-0.5">
										Create a meeting session to enable link
										attendance check-in for members.
									</p>
								</div>
								<button
									onClick={() => setCreateMeetingModal(false)}
									className="text-text-muted hover:text-text-primary p-1 cursor-pointer transition-colors"
								>
									<FiX size={16} />
								</button>
							</div>

							<form
								onSubmit={handleCreateMeetingSession}
								className="space-y-4"
							>
								<Input
									label="Meeting Title"
									required
									placeholder="e.g. Weekly Club Assembly"
									value={meetingTitle}
									onChange={(e) =>
										setMeetingTitle(e.target.value)
									}
								/>

								<div className="grid grid-cols-2 gap-3">
									<div>
										<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
											Date
										</label>
										<input
											type="date"
											required
											value={meetingDate}
											onChange={(e) =>
												setMeetingDate(e.target.value)
											}
											className="w-full rounded-xl border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:outline-none"
										/>
									</div>

									<div>
										<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
											Time
										</label>
										<input
											type="time"
											required
											value={meetingTime}
											onChange={(e) =>
												setMeetingTime(e.target.value)
											}
											className="w-full rounded-xl border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:outline-none"
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<Input
										label="Location"
										placeholder="e.g. Room 402 or Main Hall"
										value={meetingLocation}
										onChange={(e) =>
											setMeetingLocation(e.target.value)
										}
									/>

									<Input
										label="Price (Optional)"
										placeholder="e.g. Free"
										value={meetingPrice}
										onChange={(e) =>
											setMeetingPrice(e.target.value)
										}
									/>
								</div>

								<div>
									<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
										Description / Agenda
									</label>
									<textarea
										rows={3}
										value={meetingDesc}
										onChange={(e) =>
											setMeetingDesc(e.target.value)
										}
										className="w-full rounded-xl border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:outline-none resize-none"
										placeholder="Agenda or notes for this meeting..."
									/>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div>
										<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
											End Date (Optional)
										</label>
										<input
											type="date"
											value={meetingEndDate}
											onChange={(e) =>
												setMeetingEndDate(
													e.target.value,
												)
											}
											className="w-full rounded-xl border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:outline-none"
										/>
									</div>

									<div>
										<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
											Status
										</label>
										<select
											value={meetingStatus}
											onChange={(e) =>
												setMeetingStatus(e.target.value)
											}
											className="w-full rounded-xl border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:outline-none cursor-pointer"
										>
											<option value="PUBLISHED">
												Published / Open
											</option>
											<option value="NOT_SENT">
												Draft / Closed
											</option>
										</select>
									</div>
								</div>

								<div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-2">
									<button
										type="button"
										onClick={() =>
											setCreateMeetingModal(false)
										}
										className="rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={
											creatingEvent ||
											!meetingTitle.trim() ||
											!meetingDate
										}
										className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
									>
										{creatingEvent
											? 'Scheduling...'
											: 'Schedule Meeting'}
									</button>
								</div>
							</form>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			{/* Add Activity Modal */}
			<AnimatePresence>
				{createEventModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="w-full max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
						>
							{/* Modal Header */}
							<div className="flex items-start justify-between border-b border-border pb-3">
								<div className="space-y-1 grow">
									<h3 className="text-base font-bold text-text-primary">
										{editingActivityId
											? 'Edit Activity'
											: 'Add activity'}
									</h3>

									{/* Subtitle live metadata */}
									<div className="text-[11px] text-text-muted space-y-0.5">
										<span className="font-semibold block truncate">
											{eventTitle ? (
												eventTitle
											) : (
												<span className="italic">
													No title yet
												</span>
											)}
										</span>
										<div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
											<span className="flex items-center gap-1">
												<FiCalendar
													size={11}
													className="text-primary shrink-0"
												/>
												<span>
													{eventDate
														? new Date(
																eventDate,
															).toLocaleDateString(
																'en-US',
																{
																	weekday:
																		'short',
																	day: 'numeric',
																	month: 'short',
																	year: 'numeric',
																},
															)
														: 'No date yet'}
													{!activityAllDay &&
														eventTime &&
														` , ${eventTime}`}
													{!activityAllDay &&
														activityEndTime &&
														`–${activityEndTime}`}
												</span>
											</span>
											<span className="flex items-center gap-1">
												<FiMapPin
													size={11}
													className="text-primary shrink-0"
												/>
												<span className="truncate max-w-[150px]">
													{eventLocation
														? eventLocation
														: 'No location yet'}
												</span>
											</span>
											<span className="flex items-center gap-1">
												<FiUsers
													size={11}
													className="text-primary shrink-0"
												/>
												<span>All members</span>
											</span>
										</div>
									</div>
								</div>
								<button
									onClick={() => {
										setCreateEventModal(false);
										setEditingActivityId(null);
										setEventTitle('');
										setEventDesc('');
										setActivityEndDate('');
										setActivityPrice('');
										setActivityStatus('NOT_SENT');
										setActivityLocationType('');
										setActivityAllDay(false);
										setActivityEndTime('10:00');
										setActivityRegRequired(false);
										setActivityRegCapacity('');
										setActivityRegDeadline('');
										setActivityInviteMessage('');
										setActivityInviteReminderDays('0');
										setModalActiveTab('data');
									}}
									className="text-text-muted hover:text-text-primary text-base ml-2 shrink-0 cursor-pointer"
								>
									✕
								</button>
							</div>

							{/* Horizontal Tabs */}
							<div className="flex items-center border-b border-border text-xs font-semibold">
								<button
									type="button"
									onClick={() => setModalActiveTab('data')}
									className={`pb-2 px-3 relative cursor-pointer flex items-center gap-1.5 transition-colors ${
										modalActiveTab === 'data'
											? 'text-primary border-b-2 border-primary'
											: 'text-text-muted hover:text-text-primary'
									}`}
								>
									<span>ℹ️ Data</span>
									{(!eventTitle || !eventDate) && (
										<span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
									)}
								</button>

								<button
									type="button"
									onClick={() => setModalActiveTab('login')}
									className={`pb-2 px-3 relative cursor-pointer flex items-center gap-1.5 transition-colors ${
										modalActiveTab === 'login'
											? 'text-primary border-b-2 border-primary'
											: 'text-text-muted hover:text-text-primary'
									}`}
								>
									<span>👥 Login</span>
									{activityRegRequired && (
										<span className="bg-primary/20 text-primary text-[9px] px-1 rounded">
											On
										</span>
									)}
								</button>

								<button
									type="button"
									onClick={() => setModalActiveTab('costs')}
									className={`pb-2 px-3 relative cursor-pointer flex items-center gap-1.5 transition-colors ${
										modalActiveTab === 'costs'
											? 'text-primary border-b-2 border-primary'
											: 'text-text-muted hover:text-text-primary'
									}`}
								>
									<span>💵 Costs</span>
									{activityPrice && (
										<span className="bg-primary/20 text-primary text-[9px] px-1 rounded">
											1
										</span>
									)}
								</button>

								<button
									type="button"
									onClick={() =>
										setModalActiveTab('invitation')
									}
									className={`pb-2 px-3 relative cursor-pointer flex items-center gap-1.5 transition-colors ${
										modalActiveTab === 'invitation'
											? 'text-primary border-b-2 border-primary'
											: 'text-text-muted hover:text-text-primary'
									}`}
								>
									<span>📢 Invitation</span>
								</button>
							</div>

							{/* Tab Contents Panel */}
							<form
								onSubmit={handleCreateEvent}
								className="space-y-4 text-xs"
							>
								{modalActiveTab === 'data' && (
									<div className="space-y-3">
										<p className="text-[11px] text-text-muted">
											What happens, where it is and when.
											This is what members see first.
										</p>

										<Input
											label="Title"
											required
											placeholder="Title"
											value={eventTitle}
											onChange={(e) =>
												setEventTitle(e.target.value)
											}
										/>

										<div>
											<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
												Description
											</label>
											<span className="block text-[10px] text-text-muted mb-1">
												Shown in the app and in the
												invitation email.
											</span>
											<motion.div
												animate={{
													scale: descFocused
														? 1.01
														: 1,
													boxShadow: descFocused
														? '0 4px 12px rgba(79, 70, 229, 0.12)'
														: '0 0px 0px rgba(0,0,0,0)',
												}}
												transition={{
													type: 'spring',
													stiffness: 400,
													damping: 25,
												}}
												className={`rounded-xl border bg-surface-secondary px-3 py-2 transition-colors ${
													descFocused
														? 'border-primary/50 ring-2 ring-primary/10'
														: 'border-border'
												}`}
											>
												<textarea
													rows={3}
													value={eventDesc}
													onChange={(e) =>
														setEventDesc(
															e.target.value,
														)
													}
													onFocus={() =>
														setDescFocused(true)
													}
													onBlur={() =>
														setDescFocused(false)
													}
													className="w-full bg-transparent text-xs text-text-primary placeholder-text-muted focus:outline-none resize-none"
												/>
											</motion.div>
										</div>

										<div>
											<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
												Location type
											</label>
											<div className="relative">
												<motion.button
													type="button"
													onClick={() => {
														setIsLocDropdownOpen(
															!isLocDropdownOpen,
														);
														setLocTypeFocused(
															!isLocDropdownOpen,
														);
													}}
													animate={{
														scale: isLocDropdownOpen
															? 1.01
															: 1,
														boxShadow:
															isLocDropdownOpen
																? '0 4px 12px rgba(79, 70, 229, 0.12)'
																: '0 0px 0px rgba(0,0,0,0)',
													}}
													transition={{
														type: 'spring',
														stiffness: 400,
														damping: 25,
													}}
													className={`w-full rounded-xl bg-surface-secondary border px-3 py-2.5 flex items-center justify-between text-xs text-text-primary focus:outline-none transition-colors cursor-pointer ${
														isLocDropdownOpen
															? 'border-primary/50 ring-2 ring-primary/10'
															: 'border-border'
													}`}
												>
													<span>
														{activityLocationType ===
															'fixed' &&
															'📍 Fixed location'}
														{activityLocationType ===
															'house' &&
															"🏠 Member's house"}
														{activityLocationType ===
															'custom' &&
															'✏️ Type address myself'}
														{!activityLocationType &&
															'Select location type...'}
													</span>
													<FiChevronDown
														className={`transition-transform duration-200 ${isLocDropdownOpen ? 'rotate-180' : ''}`}
													/>
												</motion.button>

												<AnimatePresence>
													{isLocDropdownOpen && (
														<>
															<div
																className="fixed inset-0 z-10"
																onClick={() => {
																	setIsLocDropdownOpen(
																		false,
																	);
																	setLocTypeFocused(
																		false,
																	);
																}}
															/>
															<motion.div
																initial={{
																	opacity: 0,
																	y: -4,
																	scale: 0.98,
																}}
																animate={{
																	opacity: 1,
																	y: 0,
																	scale: 1,
																}}
																exit={{
																	opacity: 0,
																	y: -4,
																	scale: 0.98,
																}}
																transition={{
																	duration: 0.15,
																}}
																className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-surface p-1 shadow-lg space-y-0.5"
															>
																<button
																	type="button"
																	onClick={() => {
																		setActivityLocationType(
																			'',
																		);
																		setIsLocDropdownOpen(
																			false,
																		);
																		setLocTypeFocused(
																			false,
																		);
																	}}
																	className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
																		!activityLocationType
																			? 'bg-primary/10 text-primary'
																			: 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
																	}`}
																>
																	<span>
																		-
																	</span>
																	{!activityLocationType && (
																		<FiCheckCircle
																			size={
																				12
																			}
																		/>
																	)}
																</button>
																<button
																	type="button"
																	onClick={() => {
																		setActivityLocationType(
																			'fixed',
																		);
																		setIsLocDropdownOpen(
																			false,
																		);
																		setLocTypeFocused(
																			false,
																		);
																	}}
																	className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
																		activityLocationType ===
																		'fixed'
																			? 'bg-primary/10 text-primary'
																			: 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
																	}`}
																>
																	<span className="flex items-center gap-2">
																		📍 Fixed
																		location
																	</span>
																	{activityLocationType ===
																		'fixed' && (
																		<FiCheckCircle
																			size={
																				12
																			}
																		/>
																	)}
																</button>
																<button
																	type="button"
																	onClick={() => {
																		setActivityLocationType(
																			'house',
																		);
																		setIsLocDropdownOpen(
																			false,
																		);
																		setLocTypeFocused(
																			false,
																		);
																	}}
																	className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
																		activityLocationType ===
																		'house'
																			? 'bg-primary/10 text-primary'
																			: 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
																	}`}
																>
																	<span className="flex items-center gap-2">
																		🏠
																		Member's
																		house
																	</span>
																	{activityLocationType ===
																		'house' && (
																		<FiCheckCircle
																			size={
																				12
																			}
																		/>
																	)}
																</button>
																<button
																	type="button"
																	onClick={() => {
																		setActivityLocationType(
																			'custom',
																		);
																		setIsLocDropdownOpen(
																			false,
																		);
																		setLocTypeFocused(
																			false,
																		);
																	}}
																	className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
																		activityLocationType ===
																		'custom'
																			? 'bg-primary/10 text-primary'
																			: 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
																	}`}
																>
																	<span className="flex items-center gap-2">
																		✏️ Type
																		address
																		myself
																	</span>
																	{activityLocationType ===
																		'custom' && (
																		<FiCheckCircle
																			size={
																				12
																			}
																		/>
																	)}
																</button>
															</motion.div>
														</>
													)}
												</AnimatePresence>
											</div>
											<span className="block text-[10px] text-text-muted mt-1">
												Choose a fixed location, a
												member's house, or type an
												address yourself. Members are
												then given a route link.
											</span>
										</div>

										{activityLocationType && (
											<Input
												label="Address"
												value={eventLocation}
												onChange={(e) =>
													setEventLocation(
														e.target.value,
													)
												}
												placeholder="Enter location address"
											/>
										)}

										<Checkbox
											checked={activityAllDay}
											onChange={(e) =>
												setActivityAllDay(
													e.target.checked,
												)
											}
											label={
												<div className="space-y-0.5 ml-1">
													<span className="font-semibold block text-text-primary">
														All day
													</span>
													<span className="text-[10px] text-text-muted block">
														Without start and end
														time, for example a
														weekend or a whole day.
													</span>
												</div>
											}
										/>

										<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
											<div>
												<label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
													Start date
												</label>
												<input
													type="date"
													required
													value={eventDate}
													onChange={(e) =>
														setEventDate(
															e.target.value,
														)
													}
													className="w-full rounded-xl border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:outline-none"
												/>
											</div>

											{!activityAllDay && (
												<div>
													<label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
														Start time
													</label>
													<input
														type="time"
														required
														value={eventTime}
														onChange={(e) =>
															setEventTime(
																e.target.value,
															)
														}
														className="w-full rounded-xl border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:outline-none"
													/>
												</div>
											)}

											<div>
												<label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
													End date
												</label>
												<div className="relative">
													<input
														type="date"
														value={activityEndDate}
														onChange={(e) =>
															setActivityEndDate(
																e.target.value,
															)
														}
														className="w-full rounded-xl border border-border bg-surface-secondary p-3 pr-8 text-xs text-text-primary focus:outline-none"
													/>
													{activityEndDate && (
														<button
															type="button"
															onClick={() =>
																setActivityEndDate(
																	'',
																)
															}
															className="absolute right-2.5 top-3.5 text-text-muted hover:text-text-primary"
														>
															✕
														</button>
													)}
												</div>
											</div>

											{!activityAllDay && (
												<div>
													<label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
														End time
													</label>
													<input
														type="time"
														required
														value={activityEndTime}
														onChange={(e) =>
															setActivityEndTime(
																e.target.value,
															)
														}
														className="w-full rounded-xl border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:outline-none"
													/>
												</div>
											)}
										</div>

										<Checkbox
											label={
												<div className="space-y-0.5 ml-1">
													<span className="font-semibold block text-text-primary">
														Create multiple dates
													</span>
													<span className="text-[10px] text-text-muted block">
														Create the same activity
														at once for several
														months, for example
														every first Tuesday.
													</span>
												</div>
											}
										/>

										<Checkbox
											checked={autoCreateAttendance}
											onChange={(e) =>
												setAutoCreateAttendance(
													e.target.checked,
												)
											}
											label={
												<div className="space-y-0.5 ml-1">
													<span className="font-semibold block text-text-primary">
														Automatically create
														attendance session
													</span>
													<span className="text-[10px] text-text-muted block">
														Create a separate
														meeting session for this
														date to track member
														attendance check-in.
													</span>
												</div>
											}
										/>
									</div>
								)}

								{modalActiveTab === 'login' && (
									<div className="space-y-3">
										<p className="text-[11px] text-text-muted">
											Configure registration settings for
											the activity.
										</p>

										<Checkbox
											checked={activityRegRequired}
											onChange={(e) =>
												setActivityRegRequired(
													e.target.checked,
												)
											}
											label={
												<div className="space-y-0.5 ml-1">
													<span className="font-semibold block text-text-primary">
														Require registration to
														attend
													</span>
													<span className="text-[10px] text-text-muted block">
														Users must register and
														confirm attendance prior
														to the deadline.
													</span>
												</div>
											}
										/>

										{activityRegRequired && (
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
												<Input
													type="number"
													label="Maximum capacity (optional)"
													placeholder="e.g. 50"
													value={activityRegCapacity}
													onChange={(e) =>
														setActivityRegCapacity(
															e.target.value,
														)
													}
												/>

												<div>
													<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
														Registration Deadline
													</label>
													<input
														type="datetime-local"
														value={
															activityRegDeadline
														}
														onChange={(e) =>
															setActivityRegDeadline(
																e.target.value,
															)
														}
														className="w-full rounded-xl border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:outline-none"
													/>
												</div>
											</div>
										)}
									</div>
								)}

								{modalActiveTab === 'costs' && (
									<div className="space-y-3">
										<p className="text-[11px] text-text-muted">
											Indicate how much the activity costs
											for the member.
										</p>

										<Input
											type="text"
											label="Costs (e.g. $10.00)"
											placeholder="e.g. $ 10.00 or Free"
											value={activityPrice}
											onChange={(e) =>
												setActivityPrice(e.target.value)
											}
										/>
									</div>
								)}

								{modalActiveTab === 'invitation' && (
									<div className="space-y-4">
										<div className="space-y-3">
											<p className="text-[11px] text-text-muted">
												What goes to the club, and when.
												The invitation only goes away
												when you click &quot;Send&quot;.
											</p>

											<div>
												<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
													Email message
												</label>
												<span className="block text-[10px] text-text-muted mb-1">
													Optional message to include
													in the invitation email. Use
													this for specific details
													about this activity (e.g.
													speaker information, special
													instructions).
												</span>
												<motion.div
													animate={{
														scale: inviteMsgFocused
															? 1.01
															: 1,
														boxShadow:
															inviteMsgFocused
																? '0 4px 12px rgba(79, 70, 229, 0.12)'
																: '0 0px 0px rgba(0,0,0,0)',
													}}
													transition={{
														type: 'spring',
														stiffness: 400,
														damping: 25,
													}}
													className={`rounded-xl border bg-surface-secondary px-3 py-2 transition-colors ${
														inviteMsgFocused
															? 'border-primary/50 ring-2 ring-primary/10'
															: 'border-border'
													}`}
												>
													<textarea
														rows={3}
														value={
															activityInviteMessage
														}
														onChange={(e) =>
															setActivityInviteMessage(
																e.target.value,
															)
														}
														onFocus={() =>
															setInviteMsgFocused(
																true,
															)
														}
														onBlur={() =>
															setInviteMsgFocused(
																false,
															)
														}
														className="w-full bg-transparent text-xs text-text-primary placeholder-text-muted focus:outline-none resize-none"
														placeholder="Type invitation message..."
													/>
												</motion.div>
											</div>

											<div>
												<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
													Remembrance days in advance
												</label>
												<span className="block text-[10px] text-text-muted mb-1">
													Number of days for this
													activity that non-responders
													receive a reminder. Use 0 to
													disable.
												</span>
												<input
													type="number"
													value={
														activityInviteReminderDays
													}
													onChange={(e) =>
														setActivityInviteReminderDays(
															e.target.value,
														)
													}
													className="w-full rounded-xl border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
												/>
											</div>
										</div>
									</div>
								)}

								{/* Modal Actions Footer */}
								<div className="pt-3 border-t border-border flex justify-end gap-3">
									<button
										type="button"
										onClick={() => {
											setCreateEventModal(false);
											setEditingActivityId(null);
											setEventTitle('');
											setEventDesc('');
											setActivityEndDate('');
											setActivityPrice('');
											setActivityStatus('NOT_SENT');
											setActivityLocationType('');
											setActivityAllDay(false);
											setActivityEndTime('10:00');
											setActivityRegRequired(false);
											setActivityRegCapacity('');
											setActivityRegDeadline('');
											setActivityInviteMessage('');
											setActivityInviteReminderDays('0');
											setModalActiveTab('data');
										}}
										className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary/40 transition-colors cursor-pointer"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={creatingEvent}
										className="rounded-xl bg-primary px-6 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
									>
										{creatingEvent
											? 'Saving...'
											: 'Save activity'}
									</button>
								</div>
							</form>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			<Footer />
		</div>
	);
}
