'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/components/AppContext';
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
	FiGlobe,
	FiInstagram,
	FiShield,
	FiUserCheck,
	FiUserMinus,
	FiSearch,
	FiLink,
	FiKey,
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
		triggerNotification,
	} = useAppContext();
	const router = useRouter();

	const [activeTab, setActiveTab] = useState<
		'feed' | 'attendance' | 'showcase' | 'roster' | 'roles' | 'settings'
	>('feed');
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
	const [isIdle, setIsIdle] = useState(false);

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

	// Settings & Invites State
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

	const group = groups.find((g) => g.id === id);
	const isLeader = group?.leaderId === currentUser?.id;
	const isOfficer = Boolean(
		group?.officerIds && group.officerIds.includes(currentUser?.id || ''),
	);
	const canManage = isLeader || isOfficer;

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

	// Idle detection & feed polling
	useEffect(() => {
		if (isIdle) return;
		let timeoutId: NodeJS.Timeout;
		const resetTimer = () => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => setIsIdle(true), 5 * 60 * 1000);
		};
		const eventsList = ['mousemove', 'keydown', 'click', 'scroll'];
		eventsList.forEach((e) => window.addEventListener(e, resetTimer));
		resetTimer();
		return () => {
			clearTimeout(timeoutId);
			eventsList.forEach((e) =>
				window.removeEventListener(e, resetTimer),
			);
		};
	}, [isIdle]);

	useEffect(() => {
		if (!id || isIdle) return;
		const interval = setInterval(() => {
			fetchFeedMessages(id);
		}, 4000);
		return () => clearInterval(interval);
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
	const clubEvents = events.filter((e) => e.groupId === id);
	const activeEvent = clubEvents.find((e) => e.isActive) || clubEvents[0];
	const currentSelectedEvent =
		clubEvents.find((e) => e.id === selectedEventId) || activeEvent;

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
		const res = await createMeetingEvent(id, {
			title: eventTitle,
			description: eventDesc,
			date: eventDate,
			time: eventTime,
			location: eventLocation,
		});
		setCreatingEvent(false);
		if (res.success && res.event) {
			setCreateEventModal(false);
			setEventTitle('');
			setEventDesc('');
			setSelectedEventId(res.event.id);
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

		await updateGroupSettings(id, {
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
		setSettingsSuccess(true);
		setTimeout(() => setSettingsSuccess(false), 3000);
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
							onClick={() => setActiveTab('showcase')}
							className={`pb-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
								activeTab === 'showcase'
									? 'border-primary text-primary'
									: 'border-transparent text-text-muted hover:text-text-primary'
							}`}
						>
							🏛️ Showcase
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
						{canManage && (
							<>
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
							</>
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
														<span className="text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.2 rounded-full shadow-2xs">
															Leader
														</span>
													) : authorIsOfficer ? (
														<span className="text-[9px] font-bold bg-primary-light text-primary px-1.5 py-0.2 rounded-full border border-primary/20">
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
												setFileInput(e.target.files[0]);
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
								Self check-in with 4-digit PIN codes, live
								roster verification, and attendance reports.
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
									onClick={() => setCreateEventModal(true)}
									className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm"
								>
									<FiPlus size={14} /> Schedule Meeting
									Session
								</button>
							)}
						</div>
					</div>

					{/* Active / Selected Event Card */}
					{clubEvents.length === 0 ? (
						<div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
							<div className="mx-auto h-12 w-12 rounded-full bg-primary-light flex items-center justify-center text-primary mb-3">
								<FiClock size={24} />
							</div>
							<h3 className="text-base font-bold text-text-primary">
								No meeting sessions scheduled yet
							</h3>
							<p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
								Officers and Leaders can create a meeting
								session to enable 4-digit PIN attendance
								check-in for members.
							</p>
							{canManage && (
								<button
									onClick={() => setCreateEventModal(true)}
									className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white"
								>
									Create First Session
								</button>
							)}
						</div>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							{/* Left 2 Cols: Selected Event Details & Officer PIN / Member Check-in */}
							<div className="lg:col-span-2 space-y-6">
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
																placeholder="Enter 4-Digit Meeting PIN"
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

							{/* Right Col: Sessions List History */}
							<div className="space-y-4">
								<h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
									All Meeting Sessions ({clubEvents.length})
								</h3>

								<div className="space-y-2">
									{clubEvents.map((evt) => {
										const isSelected =
											currentSelectedEvent?.id === evt.id;
										const evtTurnout = attendances.filter(
											(a) => a.eventId === evt.id,
										).length;

										return (
											<button
												key={evt.id}
												onClick={() =>
													setSelectedEventId(evt.id)
												}
												className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
													isSelected
														? 'border-primary bg-primary-light/40 shadow-xs ring-1 ring-primary/30'
														: 'border-border bg-surface hover:border-text-muted'
												}`}
											>
												<div className="flex items-center justify-between">
													<span className="text-xs font-bold text-text-primary truncate">
														{evt.title}
													</span>
													{evt.isActive && (
														<span className="h-2 w-2 rounded-full bg-success shrink-0" />
													)}
												</div>
												<div className="mt-1 flex items-center gap-2 text-[11px] text-text-muted">
													<FiCalendar size={11} />
													<span>
														{evt.date} at {evt.time}
													</span>
												</div>
												<div className="mt-2 flex items-center justify-between text-[10px] text-text-muted border-t border-border/40 pt-1.5">
													<span>
														👥 {evtTurnout}{' '}
														Attendees
													</span>
													{canManage && (
														<span className="font-mono font-semibold text-primary">
															Code:{' '}
															{evt.checkInCode}
														</span>
													)}
												</div>
											</button>
										);
									})}
								</div>
							</div>
						</div>
					)}

					{/* Schedule Meeting Session Modal */}
					<AnimatePresence>
						{createEventModal && (
							<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
								<motion.div
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.95 }}
									className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4"
								>
									<div className="flex items-center justify-between border-b border-border pb-3">
										<h3 className="text-base font-bold text-text-primary">
											Schedule Meeting Session
										</h3>
										<button
											onClick={() =>
												setCreateEventModal(false)
											}
											className="text-text-muted hover:text-text-primary"
										>
											✕
										</button>
									</div>

									<form
										onSubmit={handleCreateEvent}
										className="space-y-3 text-xs"
									>
										<Input
											label="Meeting / Event Title"
											required
											value={eventTitle}
											onChange={(e) =>
												setEventTitle(e.target.value)
											}
										/>
										<Input
											label="Agenda / Notes"
											value={eventDesc}
											onChange={(e) =>
												setEventDesc(e.target.value)
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
													value={eventDate}
													onChange={(e) =>
														setEventDate(
															e.target.value,
														)
													}
													className="w-full rounded-lg border border-border bg-surface p-2 text-xs text-text-primary"
												/>
											</div>
											<div>
												<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
													Time
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
													className="w-full rounded-lg border border-border bg-surface p-2 text-xs text-text-primary"
												/>
											</div>
										</div>

										<Input
											label="Meeting Room / Location"
											value={eventLocation}
											onChange={(e) =>
												setEventLocation(e.target.value)
											}
										/>

										<p className="text-[11px] text-text-muted">
											A unique 4-digit check-in PIN code
											will be automatically generated for
											this session.
										</p>

										<div className="pt-2 flex justify-end gap-2">
											<button
												type="button"
												onClick={() =>
													setCreateEventModal(false)
												}
												className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary"
											>
												Cancel
											</button>
											<button
												type="submit"
												disabled={creatingEvent}
												className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-white shadow-sm"
											>
												{creatingEvent
													? 'Creating...'
													: 'Create Session'}
											</button>
										</div>
									</form>
								</motion.div>
							</div>
						)}
					</AnimatePresence>
				</main>
			)}

			{/* ═══════════ Tab 3: Showcase ═══════════ */}
			{activeTab === 'showcase' && (
				<main className="grow mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* About Info */}
						<div className="lg:col-span-2 space-y-6">
							<div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
								<h2 className="text-xl font-bold text-text-primary">
									About {group.name}
								</h2>
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
						</div>

						{/* Right: Quick Facts Card */}
						<div className="space-y-6">
							<div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
								<h3 className="text-base font-bold text-text-primary">
									Club Details
								</h3>
								<div className="space-y-3 text-xs">
									<div>
										<span className="text-text-muted block">
											Meeting Schedule:
										</span>
										<span className="font-semibold text-text-primary mt-0.5 flex items-center gap-1.5">
											<FiCalendar className="text-primary" />{' '}
											{group.meetingFrequency}
										</span>
									</div>
									<div>
										<span className="text-text-muted block">
											Meeting Room:
										</span>
										<span className="font-semibold text-text-primary mt-0.5 flex items-center gap-1.5">
											<FiMapPin className="text-primary" />{' '}
											{group.meetingLocation ||
												'Campus Center'}
										</span>
									</div>
									<div>
										<span className="text-text-muted block">
											Category:
										</span>
										<span className="font-semibold text-text-primary mt-0.5">
											{group.category}
										</span>
									</div>
									{group.discordUrl && (
										<div>
											<span className="text-text-muted block">
												Discord:
											</span>
											<a
												href={group.discordUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="font-semibold text-primary hover:underline mt-0.5 block truncate"
											>
												{group.discordUrl}
											</a>
										</div>
									)}
									{group.instagramUrl && (
										<div>
											<span className="text-text-muted block">
												Instagram:
											</span>
											<a
												href={group.instagramUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="font-semibold text-primary hover:underline mt-0.5 block truncate"
											>
												{group.instagramUrl}
											</a>
										</div>
									)}
									{group.websiteUrl && (
										<div>
											<span className="text-text-muted block">
												Website:
											</span>
											<a
												href={group.websiteUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="font-semibold text-primary hover:underline mt-0.5 block truncate"
											>
												{group.websiteUrl}
											</a>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
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
											? 'bg-amber-500 text-white shadow-2xs'
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
														<span className="text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full shadow-2xs flex items-center gap-0.5">
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
				<main className="grow mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
					<div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
							<div>
								<h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
									<FiShield className="text-primary" /> Member
									Roles
								</h2>
								<p className="text-xs text-text-muted mt-0.5">
									{isLeader
										? 'Promote members to Officer, revoke officer privileges, or manage club membership.'
										: 'View active club members and officer role assignments.'}
								</p>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-xs font-semibold bg-primary-light text-primary px-3 py-1 rounded-full border border-primary/20">
									{group.officerIds?.length || 0} Officers
								</span>
								<span className="text-xs font-semibold bg-surface-secondary border border-border text-text-secondary px-3 py-1 rounded-full">
									{group.memberIds.length} Members
								</span>
							</div>
						</div>

						{roleChangeSuccess && (
							<div className="text-xs text-success bg-success-bg border border-success/20 p-3 rounded-xl flex items-center gap-2 font-medium">
								<FiCheckCircle className="shrink-0" />
								<span>{roleChangeSuccess}</span>
							</div>
						)}

						{/* Search filter for members */}
						<div className="relative">
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

						{/* Member List */}
						<div className="divide-y divide-border rounded-xl border border-border bg-surface overflow-hidden">
							{group.memberIds
								.filter((mId) => {
									const mem = users.find((u) => u.id === mId);
									const q = memberSearchQuery
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
									const isMemLeader = group.leaderId === mId;
									const isMemOfficer = Boolean(
										group.officerIds &&
										group.officerIds.includes(mId),
									);
									const isUpdating = roleUpdatingId === mId;

									return (
										<div
											key={mId}
											className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-surface-secondary/40 transition-colors"
										>
											{/* Member Details */}
											<div className="flex items-center gap-3 min-w-0">
												{mem?.avatarUrl ? (
													<Image
														src={mem.avatarUrl}
														alt=""
														width={36}
														height={36}
														className="h-9 w-9 rounded-full object-cover border border-border shrink-0"
													/>
												) : (
													<div className="h-9 w-9 rounded-full bg-primary-light text-primary flex items-center justify-center text-xs font-bold shrink-0">
														{mem?.name?.[0] || 'M'}
													</div>
												)}
												<div className="min-w-0">
													<div className="flex items-center gap-2">
														<span className="text-xs font-bold text-text-primary truncate">
															{mem?.name ||
																'Club Member'}
														</span>
														{isMemLeader ? (
															<span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
																<FiShield
																	size={10}
																/>{' '}
																Leader
															</span>
														) : isMemOfficer ? (
															<span className="text-[10px] font-bold bg-primary-light text-primary px-2 py-0.5 rounded-full border border-primary/20 flex items-center gap-1">
																<FiUserCheck
																	size={10}
																/>{' '}
																Officer
															</span>
														) : (
															<span className="text-[10px] font-medium bg-surface-secondary text-text-muted px-2 py-0.5 rounded-full border border-border">
																Member
															</span>
														)}
													</div>
													<span className="text-[11px] text-text-muted block truncate mt-0.5">
														{mem?.email}{' '}
														{mem?.major
															? `• ${mem.major}`
															: ''}
													</span>
												</div>
											</div>

											{/* Role Actions */}
											<div className="flex items-center gap-2 self-end sm:self-center shrink-0">
												{isMemLeader ? (
													<span className="text-[11px] font-semibold text-text-muted italic px-2 py-1">
														Club Creator
													</span>
												) : isLeader ? (
													<>
														{isMemOfficer ? (
															<button
																type="button"
																disabled={
																	isUpdating
																}
																onClick={() =>
																	handleDemoteOfficer(
																		mId,
																	)
																}
																className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all cursor-pointer disabled:opacity-50"
																title="Demote Officer to Member"
															>
																<FiUserMinus
																	size={12}
																	className="text-warning"
																/>
																<span>
																	Demote to
																	Member
																</span>
															</button>
														) : (
															<button
																type="button"
																disabled={
																	isUpdating
																}
																onClick={() =>
																	handlePromoteToOfficer(
																		mId,
																	)
																}
																className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-2xs transition-all cursor-pointer disabled:opacity-50"
																title="Promote Member to Officer"
															>
																<FiUserCheck
																	size={12}
																/>
																<span>
																	Promote to
																	Officer
																</span>
															</button>
														)}

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
															title="Remove member from club"
														>
															<FiTrash2
																size={14}
															/>
														</button>
													</>
												) : (
													<span className="text-[11px] text-text-muted">
														{isMemOfficer
															? 'Officer Role'
															: 'Active Member'}
													</span>
												)}
											</div>
										</div>
									);
								})}
						</div>
						{!isLeader && (
							<p className="text-[11px] text-text-muted italic text-center pt-1">
								Note: Only the Club Leader can modify Officer
								roles and permissions.
							</p>
						)}
					</div>
				</main>
			)}

			{/* ═══════════ Tab 6: Club Settings ═══════════ */}
			{activeTab === 'settings' && canManage && (
				<main className="grow mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
					<div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
						<div className="border-b border-border pb-4">
							<h2 className="text-xl font-bold text-text-primary">
								Club Settings
							</h2>
							<p className="text-xs text-text-muted mt-0.5">
								Configure club details, meeting locations,
								visual banners, and recruit with shareable
								codes.
							</p>
						</div>

						{/* Invite Link & Code Generator Box */}
						<div className="rounded-2xl bg-primary-light/50 border border-primary/20 p-5 space-y-4">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-primary/15 pb-3">
								<div>
									<span className="text-xs font-bold text-primary flex items-center gap-1.5">
										<FiShare2 /> Shareable Recruitment
										Invite
									</span>
									<p className="text-[11px] text-text-muted mt-0.5">
										Share a 1-click link or code with
										prospective members to join immediately.
									</p>
								</div>
								<button
									type="button"
									onClick={async () => {
										const res =
											await generateClubInvite(id);
										if (res.success && res.code) {
											setGeneratedInviteCode(res.code);
										}
									}}
									className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
								>
									{generatedInviteCode
										? 'Regenerate Invite'
										: 'Generate Invite Link'}
								</button>
							</div>

							{generatedInviteCode ? (
								<div className="space-y-3">
									{/* Direct 1-Click Link */}
									<div>
										<label className="block text-[10px] font-bold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
											<FiLink size={11} /> 1-Click Direct
											Join Link
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
													setCopiedInviteLink(true);
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
										<label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
											<FiKey size={11} /> Invite Code (For
											Explore Clubs Page)
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
									Click <strong>Generate Invite Link</strong>{' '}
									to create a direct link (e.g.{' '}
									<code className="font-mono text-primary font-bold">
										/join/DEMOS-GDSC-2026
									</code>
									) that instantly adds members to your club
									roster.
								</p>
							)}
						</div>

						{/* Edit Club Profile Form */}
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
											checked={settingsEnableCustomBanner}
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
													setSettingsBannerPreview('')
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
												background: settingsBannerColor,
											}}
										>
											{settingsName || 'Banner Preview'}
										</div>
									)}
								</div>

								{settingsEnableCustomBanner ? (
									<input
										type="file"
										accept="image/*"
										onChange={(e) => {
											const file = e.target.files?.[0];
											if (file) {
												const reader = new FileReader();
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
										{BANNER_COLOR_PRESETS.map((preset) => (
											<option
												key={preset.id}
												value={preset.value}
											>
												{preset.name}
											</option>
										))}
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

							<div className="pt-3 flex justify-end">
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
					</div>
				</main>
			)}

			<Footer />
		</div>
	);
}
