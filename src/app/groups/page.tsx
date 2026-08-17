'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppContext, Group } from '@/components/AppContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import {
	FiUsers,
	FiArrowRight,
	FiPlus,
	FiMoreVertical,
	FiCalendar,
	FiMapPin,
	FiShare2,
	FiKey,
	FiCheck,
	FiShield,
} from 'react-icons/fi';
import { Input } from '@/components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/Checkbox';

export const BANNER_COLOR_PRESETS = [
	{
		id: 'indigo',
		name: 'Indigo Violet',
		value: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
	},
	{
		id: 'ocean',
		name: 'Ocean Cyan',
		value: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
	},
	{
		id: 'emerald',
		name: 'Emerald Mint',
		value: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
	},
	{
		id: 'amber',
		name: 'Sunset Amber',
		value: 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
	},
	{
		id: 'rose',
		name: 'Crimson Rose',
		value: 'linear-gradient(135deg, #e11d48 0%, #be185d 100%)',
	},
	{
		id: 'purple',
		name: 'Neon Purple',
		value: 'linear-gradient(135deg, #9333ea 0%, #c026d3 100%)',
	},
	{
		id: 'slate',
		name: 'Midnight Slate',
		value: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
	},
	{
		id: 'teal',
		name: 'Teal Lagoon',
		value: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
	},
];

const parseCustomFrequency = (freq: string) => {
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
	let isCustom = false;

	if (freq && freq.startsWith('Weekly on ')) {
		isCustom = true;
		const parts = freq.replace('Weekly on ', '').split(' at ');
		if (parts[0]) {
			parts[0].split(', ').forEach((day) => {
				if (daysMap[day] !== undefined) daysMap[day] = true;
			});
		}
		if (parts[1]) {
			time = parts[1];
		}
	}
	return { isCustom, days: daysMap, time };
};

const compileFrequency = (
	isCustom: boolean,
	preset: string,
	days: Record<string, boolean>,
	time: string,
) => {
	if (!isCustom) return preset;
	const selectedDays = Object.keys(days).filter((d) => days[d]);
	if (selectedDays.length === 0) return `Weekly at ${time}`;
	return `Weekly on ${selectedDays.join(', ')} at ${time}`;
};

export default function GroupsPage() {
	const {
		currentUser,
		groups,
		hydrated,
		createGroup,
		updateGroupSettings,
		generateClubInvite,
		joinViaInviteCode,
		users,
		events,
	} = useAppContext();
	const router = useRouter();

	const [activeTab, setActiveTab] = useState<'all' | 'leading' | 'joined'>(
		'all',
	);

	// Create Club modal state
	const [modalOpen, setModalOpen] = useState(false);
	const [name, setName] = useState('');
	const [tagline, setTagline] = useState('');
	const [category, setCategory] = useState('Technology & Coding');
	const [description, setDescription] = useState('');
	const [location, setLocation] = useState('');
	const [frequency, setFrequency] = useState('Weekly');
	const [enableCustomBanner, setEnableCustomBanner] = useState(false);
	const [selectedBannerColor, setSelectedBannerColor] = useState(
		BANNER_COLOR_PRESETS[0].value,
	);
	const [customBannerPreview, setCustomBannerPreview] = useState('');
	const [discordUrl, setDiscordUrl] = useState('');
	const [instagramUrl, setInstagramUrl] = useState('');
	const [websiteUrl, setWebsiteUrl] = useState('');
	const [tagsInput, setTagsInput] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	// Redeem Invite state
	const [inviteModalOpen, setInviteModalOpen] = useState(false);
	const [inviteCodeInput, setInviteCodeInput] = useState('');
	const [inviteError, setInviteError] = useState('');
	const [inviteSuccess, setInviteSuccess] = useState('');

	// Settings state
	const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [settingsName, setSettingsName] = useState('');
	const [settingsTagline, setSettingsTagline] = useState('');
	const [settingsDesc, setSettingsDesc] = useState('');
	const [settingsCategory, setSettingsCategory] = useState('');
	const [settingsFreq, setSettingsFreq] = useState('Weekly');
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
	const [settingsPrivate, setSettingsPrivate] = useState(false);
	const [settingsFilter, setSettingsFilter] = useState(false);
	const [generatedCode, setGeneratedCode] = useState('');
	const [copiedCode, setCopiedCode] = useState(false);
	const [updating, setUpdating] = useState(false);
	const [settingsError, setSettingsError] = useState('');

	// Custom frequency state variables
	const [isCustomFreq, setIsCustomFreq] = useState(false);
	const [customDays, setCustomDays] = useState<Record<string, boolean>>({
		Mon: false,
		Tue: false,
		Wed: false,
		Thu: false,
		Fri: false,
		Sat: false,
		Sun: false,
	});
	const [customTime, setCustomTime] = useState('18:00');

	const categoriesList = [
		'Technology & Coding',
		'Arts & Design',
		'Engineering & Robotics',
		'Business & Entrepreneurship',
		'Media & Photography',
		'Science & Research',
		'Cultural & Social',
		'Sports & Recreation',
	];

	const openCreateModal = () => {
		setName('');
		setTagline('');
		setDescription('');
		setLocation('');
		setFrequency('Weekly');
		setDiscordUrl('');
		setInstagramUrl('');
		setWebsiteUrl('');
		setTagsInput('');
		setError('');
		setEnableCustomBanner(false);
		setCustomBannerPreview('');
		const randomPreset =
			BANNER_COLOR_PRESETS[
				Math.floor(Math.random() * BANNER_COLOR_PRESETS.length)
			].value;
		setSelectedBannerColor(randomPreset);
		setIsCustomFreq(false);
		setCustomDays({
			Mon: false,
			Tue: false,
			Wed: false,
			Thu: false,
			Fri: false,
			Sat: false,
			Sun: false,
		});
		setCustomTime('18:00');
		setModalOpen(true);
	};

	const openSettings = (g: Group) => {
		setSelectedGroupId(g.id);
		setSettingsName(g.name);
		setSettingsTagline(g.tagline || '');
		setSettingsDesc(g.description);
		setSettingsCategory(g.category || 'General');
		setSettingsFreq(g.meetingFrequency);
		setSettingsLocation(g.meetingLocation || '');
		setSettingsDiscord(g.discordUrl || '');
		setSettingsInstagram(g.instagramUrl || '');
		setSettingsWebsite(g.websiteUrl || '');
		setSettingsPrivate(!!g.isPrivate);
		setSettingsFilter(!!g.profanityFilter);
		setGeneratedCode('');
		setCopiedCode(false);

		if (
			g.bannerUrl?.startsWith('data:') ||
			g.bannerUrl?.startsWith('http')
		) {
			setSettingsEnableCustomBanner(true);
			setSettingsBannerPreview(g.bannerUrl);
			setSettingsBannerColor(BANNER_COLOR_PRESETS[0].value);
		} else if (g.bannerUrl) {
			setSettingsEnableCustomBanner(false);
			setSettingsBannerPreview('');
			setSettingsBannerColor(g.bannerUrl);
		} else {
			setSettingsEnableCustomBanner(false);
			setSettingsBannerPreview('');
			setSettingsBannerColor(BANNER_COLOR_PRESETS[0].value);
		}

		const { isCustom, days, time } = parseCustomFrequency(
			g.meetingFrequency,
		);
		setIsCustomFreq(isCustom);
		setCustomDays(days);
		setCustomTime(time);

		setSettingsOpen(true);
	};

	const handleSaveSettings = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedGroupId) return;
		setUpdating(true);
		setSettingsError('');

		const finalFreq = compileFrequency(
			isCustomFreq,
			settingsFreq,
			customDays,
			customTime,
		);

		const finalBanner =
			settingsEnableCustomBanner && settingsBannerPreview
				? settingsBannerPreview
				: settingsBannerColor;

		const res = await updateGroupSettings(selectedGroupId, {
			name: settingsName,
			tagline: settingsTagline,
			description: settingsDesc,
			category: settingsCategory,
			meetingFrequency: finalFreq,
			meetingLocation: settingsLocation,
			bannerUrl: finalBanner,
			discordUrl: settingsDiscord,
			instagramUrl: settingsInstagram,
			websiteUrl: settingsWebsite,
			isPrivate: settingsPrivate,
			profanityFilter: settingsFilter,
		});
		setUpdating(false);
		if (res.success) {
			setSettingsOpen(false);
			setSelectedGroupId(null);
		} else {
			setSettingsError(res.error || 'Failed to update settings');
		}
	};

	const handleCreateGroup = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!currentUser) return;
		setLoading(true);
		setError('');

		const finalFreq = compileFrequency(
			isCustomFreq,
			frequency,
			customDays,
			customTime,
		);

		const tagsArray = tagsInput
			.split(',')
			.map((t) => t.trim().replace(/^#/, ''))
			.filter(Boolean);

		const finalBanner =
			enableCustomBanner && customBannerPreview
				? customBannerPreview
				: selectedBannerColor;

		const res = await createGroup({
			name,
			tagline,
			description,
			category,
			meetingFrequency: finalFreq,
			meetingLocation: location,
			minMembers: 1,
			maxMembers: 100,
			bannerUrl: finalBanner,
			discordUrl: discordUrl || undefined,
			instagramUrl: instagramUrl || undefined,
			websiteUrl: websiteUrl || undefined,
			tags: tagsArray,
		});

		setLoading(false);
		if (res.success && res.group) {
			setModalOpen(false);
			router.push(`/group/${res.group.id}/feed`);
		} else {
			setError(res.error || 'Failed to create club');
		}
	};

	const handleRedeemInvite = async (e: React.FormEvent) => {
		e.preventDefault();
		setInviteError('');
		setInviteSuccess('');
		const res = await joinViaInviteCode(inviteCodeInput);
		if (res.success && res.group) {
			setInviteSuccess(`Successfully joined ${res.group.name}!`);
			setTimeout(() => {
				setInviteModalOpen(false);
				setInviteCodeInput('');
				setInviteSuccess('');
				router.push(`/group/${res.group?.id}/feed`);
			}, 1200);
		} else {
			setInviteError(res.error || 'Failed to redeem invite code');
		}
	};

	const handleGenerateCode = async (groupId: string) => {
		const res = await generateClubInvite(groupId);
		if (res.success && res.code) {
			setGeneratedCode(res.code);
		}
	};

	const handleCopyCode = (code: string) => {
		navigator.clipboard.writeText(code);
		setCopiedCode(true);
		setTimeout(() => setCopiedCode(false), 2000);
	};

	const handleKickMember = async (memberId: string) => {
		if (!selectedGroupId) return;
		if (
			confirm(
				'Are you sure you want to remove this member from the club?',
			)
		) {
			const res = await updateGroupSettings(selectedGroupId, {
				kickUserId: memberId,
			});
			if (!res.success) {
				alert(res.error || 'Failed to remove member');
			}
		}
	};

	if (!hydrated) return null;

	if (!currentUser) {
		return (
			<div className="flex min-h-screen flex-col bg-background">
				<Nav />
				<main className="grow flex items-center justify-center p-6 text-center">
					<div className="max-w-md">
						<h2 className="text-xl font-bold text-text-primary">
							Sign In to View Your Clubs
						</h2>
						<p className="text-xs text-text-muted mt-2">
							Access the clubs you lead, view meeting schedules,
							and check into sessions.
						</p>
						<Link
							href="/auth/login"
							className="mt-5 inline-block rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm"
						>
							Sign In Now
						</Link>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	const myLedClubs = groups.filter(
		(g) =>
			g.leaderId === currentUser.id ||
			(g.officerIds && g.officerIds.includes(currentUser.id)),
	);
	const myJoinedClubs = groups.filter(
		(g) =>
			g.memberIds.includes(currentUser.id) &&
			g.leaderId !== currentUser.id &&
			!(g.officerIds && g.officerIds.includes(currentUser.id)),
	);

	const displayedClubs =
		activeTab === 'leading'
			? myLedClubs
			: activeTab === 'joined'
				? myJoinedClubs
				: [...myLedClubs, ...myJoinedClubs];

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Nav />

			<main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
				{/* Top Header & Actions */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6 mb-6">
					<div>
						<h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
							My Campus Clubs
						</h1>
						<p className="text-xs text-text-muted mt-1">
							Manage the organizations you lead, collaborate in
							club hubs, and track attendance.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<button
							onClick={() => setInviteModalOpen(true)}
							className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary shadow-2xs transition-all cursor-pointer"
						>
							<FiKey size={14} className="text-primary" /> Join
							with Code
						</button>
						<button
							onClick={openCreateModal}
							className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm transition-all cursor-pointer"
						>
							<FiPlus size={15} /> Register New Club
						</button>
					</div>
				</div>

				{/* Tabs Navigation */}
				<div className="flex items-center gap-2 border-b border-border mb-6">
					<button
						onClick={() => setActiveTab('all')}
						className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
							activeTab === 'all'
								? 'border-primary text-primary'
								: 'border-transparent text-text-muted hover:text-text-primary'
						}`}
					>
						All Clubs ({myLedClubs.length + myJoinedClubs.length})
					</button>
					<button
						onClick={() => setActiveTab('leading')}
						className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
							activeTab === 'leading'
								? 'border-primary text-primary'
								: 'border-transparent text-text-muted hover:text-text-primary'
						}`}
					>
						Leading ({myLedClubs.length})
					</button>
					<button
						onClick={() => setActiveTab('joined')}
						className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
							activeTab === 'joined'
								? 'border-primary text-primary'
								: 'border-transparent text-text-muted hover:text-text-primary'
						}`}
					>
						Joined ({myJoinedClubs.length})
					</button>
				</div>

				{/* Club Grid */}
				{displayedClubs.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center my-6">
						<div className="mx-auto h-12 w-12 rounded-full bg-primary-light flex items-center justify-center text-primary mb-3">
							<FiUsers size={22} />
						</div>
						<h3 className="text-base font-bold text-text-primary">
							No clubs to display
						</h3>
						<p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
							Explore the campus directory to join active clubs or
							register a new student organization.
						</p>
						<div className="mt-5 flex justify-center gap-3">
							<Link
								href="/search"
								className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary"
							>
								Explore Clubs
							</Link>
							<button
								onClick={openCreateModal}
								className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover"
							>
								Register Club
							</button>
						</div>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{displayedClubs.map((club) => {
							const isLeader = club.leaderId === currentUser.id;
							const isOfficer =
								club.officerIds &&
								club.officerIds.includes(currentUser.id);
							const clubEvents = events.filter(
								(e) => e.groupId === club.id && e.isActive,
							);

							return (
								<div
									key={club.id}
									className="group rounded-2xl border border-border bg-surface overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all flex flex-col"
								>
									{/* Banner */}
									<div className="h-32 w-full relative bg-surface-secondary overflow-hidden">
										{club.bannerUrl?.startsWith('data:') ||
										club.bannerUrl?.startsWith('http') ? (
											<Image
												src={club.bannerUrl}
												alt={club.name}
												fill
												className="object-cover group-hover:scale-102 transition-transform duration-300"
											/>
										) : (
											<div
												className="w-full h-full"
												style={{
													background:
														club.bannerUrl ||
														'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
												}}
											/>
										)}
										<div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-bold text-primary border border-border">
											{club.category}
										</div>

										<div className="absolute top-3 left-3 flex items-center gap-1.5">
											{isLeader ? (
												<span className="bg-primary text-white px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-xs">
													<FiShield size={10} /> Lead
												</span>
											) : isOfficer ? (
												<span className="bg-primary-light text-primary px-2 py-0.5 rounded-md text-[10px] font-bold border border-primary/20">
													Officer
												</span>
											) : null}

											{(isLeader || isOfficer) && (
												<button
													onClick={() =>
														openSettings(club)
													}
													className="h-6 w-6 rounded-full bg-surface/90 backdrop-blur-xs flex items-center justify-center text-text-secondary hover:text-text-primary shadow-xs cursor-pointer border border-border"
													title="Club Settings"
												>
													<FiMoreVertical size={13} />
												</button>
											)}
										</div>
									</div>

									{/* Content */}
									<div className="p-5 flex flex-col grow">
										<h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
											{club.name}
										</h3>
										{club.tagline && (
											<p className="text-xs text-text-muted mt-0.5 line-clamp-1">
												{club.tagline}
											</p>
										)}

										<p className="text-xs text-text-secondary mt-2 line-clamp-2 leading-relaxed">
											{club.description}
										</p>

										{/* Active Event Banner */}
										{clubEvents.length > 0 && (
											<div className="mt-3 rounded-lg bg-primary-light/60 border border-primary/20 p-2.5 flex items-center justify-between text-xs">
												<div className="flex items-center gap-1.5 text-primary font-semibold">
													<span className="flex h-2 w-2 relative">
														<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
														<span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
													</span>
													Live Meeting Session Active
												</div>
												{isLeader || isOfficer ? (
													<span className="text-[10px] font-mono bg-surface px-1.5 py-0.5 rounded border border-border text-primary font-bold">
														{
															clubEvents[0]
																.checkInCode
														}
													</span>
												) : (
													<span className="text-[10px] font-semibold bg-success-bg text-success px-2 py-0.5 rounded-full border border-success/20">
														Active
													</span>
												)}
											</div>
										)}

										{/* Meeting schedule & location */}
										<div className="mt-4 pt-3 border-t border-border space-y-1 text-xs text-text-muted">
											<div className="flex items-center gap-2">
												<FiCalendar
													size={13}
													className="text-primary shrink-0"
												/>
												<span className="truncate">
													{club.meetingFrequency}
												</span>
											</div>
											{club.meetingLocation && (
												<div className="flex items-center gap-2">
													<FiMapPin
														size={13}
														className="text-primary shrink-0"
													/>
													<span className="truncate">
														{club.meetingLocation}
													</span>
												</div>
											)}
										</div>

										{/* Footer */}
										<div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
											<span className="text-[11px] font-medium text-text-muted">
												👥 {club.memberIds.length}{' '}
												Members
											</span>
											<Link
												href={`/group/${club.id}/feed`}
												className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover transition-all shadow-2xs inline-flex items-center gap-1"
											>
												Enter Hub{' '}
												<FiArrowRight size={12} />
											</Link>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</main>

			{/* ═══════════ Register Club Modal ═══════════ */}
			<AnimatePresence>
				{modalOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="w-full max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 my-8"
						>
							<div className="flex items-center justify-between border-b border-border pb-3">
								<div>
									<h2 className="text-lg font-bold text-text-primary">
										Register a New Campus Club
									</h2>
									<p className="text-xs text-text-muted">
										Create a hub for your organization to
										promote, recruit, and track attendance.
									</p>
								</div>
								<button
									onClick={() => setModalOpen(false)}
									className="text-text-muted hover:text-text-primary p-1 rounded-lg"
								>
									✕
								</button>
							</div>

							<form
								onSubmit={handleCreateGroup}
								className="space-y-3.5 text-xs"
							>
								{error && (
									<div className="text-xs text-danger bg-danger-bg p-2.5 rounded-lg text-center">
										{error}
									</div>
								)}

								<Input
									label="Club Name"
									required
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>

								<Input
									label="Tagline / Short Hook"
									value={tagline}
									onChange={(e) => setTagline(e.target.value)}
								/>

								<div>
									<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
										Category
									</label>
									<select
										value={category}
										onChange={(e) =>
											setCategory(e.target.value)
										}
										className="w-full rounded-xl border border-border bg-surface p-2.5 text-xs text-text-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
									>
										{categoriesList.map((cat) => (
											<option key={cat} value={cat}>
												{cat}
											</option>
										))}
									</select>
								</div>

								<div>
									<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
										Mission &amp; Description
									</label>
									<textarea
										required
										rows={3}
										value={description}
										onChange={(e) =>
											setDescription(e.target.value)
										}
										className="w-full rounded-xl border border-border bg-surface p-2.5 text-xs text-text-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
									/>
								</div>

								<Input
									label="Meeting Location / Room"
									value={location}
									onChange={(e) =>
										setLocation(e.target.value)
									}
								/>

								{/* Banner Appearance Selector */}
								<div className="rounded-xl border border-border bg-surface-secondary/40 p-3.5 space-y-3">
									<div className="flex items-center justify-between">
										<div>
											<span className="text-[11px] font-bold text-text-primary uppercase tracking-wider block">
												Club Banner
											</span>
											<span className="text-[10px] text-text-muted">
												Select a color theme or upload a
												custom banner image
											</span>
										</div>
										<label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
											<Checkbox
												checked={enableCustomBanner}
												onChange={() =>
													setEnableCustomBanner(
														!enableCustomBanner,
													)
												}
											/>
											<span>Upload custom image</span>
										</label>
									</div>

									{/* Banner Preview Box */}
									<div className="relative h-24 w-full rounded-lg overflow-hidden border border-border flex items-center justify-center">
										{enableCustomBanner &&
										customBannerPreview ? (
											<>
												<Image
													src={customBannerPreview}
													alt="Banner Preview"
													fill
													className="object-cover"
												/>
												<button
													type="button"
													onClick={() =>
														setCustomBannerPreview(
															'',
														)
													}
													className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-md px-2 py-0.5 text-[10px] font-semibold cursor-pointer"
												>
													Remove
												</button>
											</>
										) : (
											<div
												className="w-full h-full flex items-center justify-center text-white font-bold text-sm shadow-inner"
												style={{
													background:
														selectedBannerColor,
												}}
											>
												{name || 'Banner Preview'}
											</div>
										)}
									</div>

									{enableCustomBanner ? (
										<div className="space-y-1">
											<label className="block text-[10px] font-semibold text-text-muted uppercase">
												Select Image File
											</label>
											<input
												type="file"
												accept="image/*"
												onChange={(e) => {
													const file =
														e.target.files?.[0];
													if (file) {
														const reader =
															new FileReader();
														reader.onload = () => {
															setCustomBannerPreview(
																reader.result as string,
															);
														};
														reader.readAsDataURL(
															file,
														);
													}
												}}
												className="block w-full text-xs text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary-light/80 cursor-pointer"
											/>
										</div>
									) : (
										<div className="space-y-1">
											<label className="block text-[10px] font-semibold text-text-muted uppercase">
												Color Theme Preset
											</label>
											<select
												value={selectedBannerColor}
												onChange={(e) =>
													setSelectedBannerColor(
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
										</div>
									)}
								</div>

								{/* Custom Meeting Days Selector */}
								<div className="rounded-xl border border-border bg-surface-secondary/40 p-3 space-y-2">
									<div className="flex items-center justify-between">
										<span className="font-semibold text-text-primary">
											Meeting Schedule
										</span>
										<label className="flex items-center gap-1.5 text-text-secondary cursor-pointer">
											<Checkbox
												checked={isCustomFreq}
												onChange={() =>
													setIsCustomFreq(
														!isCustomFreq,
													)
												}
											/>
											<span>Custom Days &amp; Time</span>
										</label>
									</div>

									{isCustomFreq ? (
										<div className="space-y-2 pt-1">
											<div className="flex flex-wrap gap-1.5">
												{[
													'Mon',
													'Tue',
													'Wed',
													'Thu',
													'Fri',
													'Sat',
													'Sun',
												].map((day) => (
													<button
														key={day}
														type="button"
														onClick={() =>
															setCustomDays(
																(prev) => ({
																	...prev,
																	[day]: !prev[
																		day
																	],
																}),
															)
														}
														className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
															customDays[day]
																? 'bg-primary text-white border-primary'
																: 'bg-surface text-text-secondary border-border'
														}`}
													>
														{day}
													</button>
												))}
											</div>
											<div className="flex items-center gap-2">
												<span className="text-text-muted">
													At time:
												</span>
												<input
													type="time"
													value={customTime}
													onChange={(e) =>
														setCustomTime(
															e.target.value,
														)
													}
													className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-text-primary"
												/>
											</div>
										</div>
									) : (
										<select
											value={frequency}
											onChange={(e) =>
												setFrequency(e.target.value)
											}
											className="w-full rounded-lg border border-border bg-surface p-2 text-xs text-text-primary"
										>
											<option value="Weekly">
												Weekly
											</option>
											<option value="Bi-weekly">
												Bi-weekly
											</option>
											<option value="Fortnightly">
												Fortnightly
											</option>
											<option value="Monthly">
												Monthly
											</option>
										</select>
									)}
								</div>

								{/* Social handles */}
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
									<Input
										label="Discord URL"
										value={discordUrl}
										onChange={(e) =>
											setDiscordUrl(e.target.value)
										}
									/>
									<Input
										label="Instagram URL"
										value={instagramUrl}
										onChange={(e) =>
											setInstagramUrl(e.target.value)
										}
									/>
									<Input
										label="Website URL"
										value={websiteUrl}
										onChange={(e) =>
											setWebsiteUrl(e.target.value)
										}
									/>
								</div>

								<Input
									label="Focus Tags (Comma separated)"
									value={tagsInput}
									onChange={(e) =>
										setTagsInput(e.target.value)
									}
								/>

								<div className="pt-2 flex justify-end gap-2">
									<button
										type="button"
										onClick={() => setModalOpen(false)}
										className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={loading}
										className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm disabled:opacity-50"
									>
										{loading
											? 'Registering...'
											: 'Register Club'}
									</button>
								</div>
							</form>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			{/* ═══════════ Redeem Invite Code Modal ═══════════ */}
			<AnimatePresence>
				{inviteModalOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4"
						>
							<div className="flex items-center justify-between border-b border-border pb-3">
								<h3 className="text-base font-bold text-text-primary flex items-center gap-2">
									<FiKey className="text-primary" /> Join with
									Invite Code
								</h3>
								<button
									onClick={() => setInviteModalOpen(false)}
									className="text-text-muted hover:text-text-primary"
								>
									✕
								</button>
							</div>

							<form
								onSubmit={handleRedeemInvite}
								className="space-y-3"
							>
								{inviteError && (
									<div className="text-xs text-danger bg-danger-bg p-2.5 rounded-lg text-center font-medium">
										{inviteError}
									</div>
								)}
								{inviteSuccess && (
									<div className="text-xs text-success bg-success-bg p-2.5 rounded-lg text-center font-medium flex items-center justify-center gap-1.5">
										<FiCheck /> {inviteSuccess}
									</div>
								)}

								<Input
									label="Club Invite Code or Direct Link"
									required
									placeholder="e.g. DEMOS-GDSC-2026 or https://.../join/CODE"
									value={inviteCodeInput}
									onChange={(e) =>
										setInviteCodeInput(e.target.value)
									}
								/>

								<button
									type="submit"
									className="w-full rounded-xl bg-primary py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm transition-all cursor-pointer"
								>
									Redeem &amp; Join Club
								</button>
							</form>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			{/* ═══════════ Club Settings Modal ═══════════ */}
			<AnimatePresence>
				{settingsOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="w-full max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 my-8"
						>
							<div className="flex items-center justify-between border-b border-border pb-3">
								<div>
									<h2 className="text-lg font-bold text-text-primary">
										Club Settings &amp; Member Roster
									</h2>
									<p className="text-xs text-text-muted">
										Update details, copy invite codes, and
										manage members.
									</p>
								</div>
								<button
									onClick={() => setSettingsOpen(false)}
									className="text-text-muted hover:text-text-primary p-1 rounded-lg"
								>
									✕
								</button>
							</div>

							{/* Shareable Invite Code Generator */}
							<div className="rounded-xl bg-primary-light/50 border border-primary/20 p-3.5 space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-xs font-bold text-primary flex items-center gap-1.5">
										<FiShare2 /> Shareable Club Invite Code
									</span>
									{selectedGroupId && (
										<button
											type="button"
											onClick={() =>
												handleGenerateCode(
													selectedGroupId,
												)
											}
											className="text-[11px] font-semibold text-primary underline cursor-pointer"
										>
											Generate / Refresh Code
										</button>
									)}
								</div>

								{generatedCode ? (
									<div className="flex items-center gap-2">
										<input
											readOnly
											value={generatedCode}
											className="grow rounded-lg border border-primary/30 bg-surface px-3 py-1.5 text-xs font-mono font-bold text-primary"
										/>
										<button
											type="button"
											onClick={() =>
												handleCopyCode(generatedCode)
											}
											className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
										>
											{copiedCode ? 'Copied!' : 'Copy'}
										</button>
									</div>
								) : (
									<p className="text-xs text-text-secondary">
										Click Generate to create a 1-click code
										for new recruits.
									</p>
								)}
							</div>

							<form
								onSubmit={handleSaveSettings}
								className="space-y-3 text-xs"
							>
								{settingsError && (
									<div className="text-xs text-danger bg-danger-bg p-2 rounded-lg text-center">
										{settingsError}
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
										Description
									</label>
									<textarea
										rows={3}
										value={settingsDesc}
										onChange={(e) =>
											setSettingsDesc(e.target.value)
										}
										className="w-full rounded-xl border border-border bg-surface p-2.5 text-xs text-text-primary"
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
								<div className="rounded-xl border border-border bg-surface-secondary/40 p-3 space-y-3">
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

									<div className="relative h-20 w-full rounded-lg overflow-hidden border border-border flex items-center justify-center">
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
													className="absolute top-1 right-1 bg-black/60 text-white rounded px-1.5 py-0.5 text-[9px]"
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

								{/* Member Roster List */}
								{selectedGroupId && (
									<div className="pt-2 border-t border-border space-y-2">
										<h4 className="font-semibold text-text-primary text-[11px] uppercase tracking-wider">
											Member Roster
										</h4>
										<div className="max-h-36 overflow-y-auto space-y-1.5 divide-y divide-border/40">
											{groups
												.find(
													(g) =>
														g.id ===
														selectedGroupId,
												)
												?.memberIds.map((mId) => {
													const memUser = users.find(
														(u) => u.id === mId,
													);
													const isMemLeader =
														groups.find(
															(g) =>
																g.id ===
																selectedGroupId,
														)?.leaderId === mId;
													return (
														<div
															key={mId}
															className="flex items-center justify-between pt-1.5 text-xs"
														>
															<div className="flex items-center gap-2">
																<span className="font-medium text-text-primary">
																	{memUser?.name ||
																		'Club Member'}
																</span>
																{isMemLeader && (
																	<span className="text-[9px] bg-primary text-white px-1.5 py-0.2 rounded-full font-bold">
																		Leader
																	</span>
																)}
															</div>
															{!isMemLeader && (
																<button
																	type="button"
																	onClick={() =>
																		handleKickMember(
																			mId,
																		)
																	}
																	className="text-[11px] text-danger hover:underline cursor-pointer"
																>
																	Remove
																</button>
															)}
														</div>
													);
												})}
										</div>
									</div>
								)}

								<div className="pt-3 flex justify-end gap-2">
									<button
										type="button"
										onClick={() => setSettingsOpen(false)}
										className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={updating}
										className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm disabled:opacity-50"
									>
										{updating
											? 'Saving...'
											: 'Save Settings'}
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
