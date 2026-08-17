'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppContext, Group } from '@/components/AppContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import {
	FiSearch,
	FiCalendar,
	FiMapPin,
	FiGlobe,
	FiInstagram,
	FiSend,
	FiCheck,
	FiTag,
	FiFilter,
	FiKey,
	FiArrowRight,
	FiX,
} from 'react-icons/fi';
import { FaDiscord } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const parseGroupFrequency = (freq: string) => {
	const daysMap: Record<string, boolean> = {
		Mon: false,
		Tue: false,
		Wed: false,
		Thu: false,
		Fri: false,
		Sat: false,
		Sun: false,
	};
	let time = null;
	let hasCustomDays = false;

	if (freq && freq.startsWith('Weekly on ')) {
		hasCustomDays = true;
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
	return { hasCustomDays, days: daysMap, time };
};

function SearchContent() {
	const {
		currentUser,
		groups,
		requests,
		sendJoinRequest,
		users,
		hydrated,
		joinViaInviteCode,
	} = useAppContext();
	const searchParams = useSearchParams();
	const router = useRouter();

	const [query, setQuery] = useState(searchParams.get('q') || '');
	const [selectedCategory, setSelectedCategory] = useState(
		searchParams.get('cat') || '',
	);
	const [searchDays, setSearchDays] = useState<Record<string, boolean>>({
		Mon: false,
		Tue: false,
		Wed: false,
		Thu: false,
		Fri: false,
		Sat: false,
		Sun: false,
	});
	const [selectedClub, setSelectedClub] = useState<Group | null>(null);
	const [joinMessage, setJoinMessage] = useState('');
	const [joinSuccess, setJoinSuccess] = useState(false);
	const [showFilters, setShowFilters] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Invite Code Modal State
	const [inviteModalOpen, setInviteModalOpen] = useState(false);
	const [inviteCodeInput, setInviteCodeInput] = useState('');
	const [inviteLoading, setInviteLoading] = useState(false);
	const [inviteError, setInviteError] = useState('');
	const [inviteSuccess, setInviteSuccess] = useState('');

	/* eslint-disable react-hooks/set-state-in-effect */
	useEffect(() => {
		const q = searchParams.get('q');
		if (q) setQuery(q);
		const cat = searchParams.get('cat');
		if (cat) setSelectedCategory(cat);
		const clubId = searchParams.get('club');
		if (clubId) {
			const found = groups.find((g) => g.id === clubId);
			if (found) setSelectedClub(found);
		}
		const codeParam = searchParams.get('code');
		if (codeParam) {
			setInviteCodeInput(codeParam);
			setInviteModalOpen(true);
		}
	}, [searchParams, groups]);

	useEffect(() => {
		setIsLoading(true);
		const timer = setTimeout(() => setIsLoading(false), 250);
		return () => clearTimeout(timer);
	}, [query, selectedCategory, searchDays]);
	/* eslint-enable react-hooks/set-state-in-effect */

	const categories = [
		'All Categories',
		'Technology & Coding',
		'Arts & Design',
		'Engineering & Robotics',
		'Business & Entrepreneurship',
		'Media & Photography',
		'Science & Research',
		'Cultural & Social',
		'Sports & Recreation',
	];

	const filteredClubs = groups.filter((g) => {
		const isPrivate = g.isPrivate === true;
		const isMember =
			currentUser &&
			(g.leaderId === currentUser.id || g.memberIds.includes(currentUser.id));
		const isVisible = !isPrivate || isMember;

		const matchQ =
			g.name.toLowerCase().includes(query.toLowerCase()) ||
			(g.tagline && g.tagline.toLowerCase().includes(query.toLowerCase())) ||
			g.description.toLowerCase().includes(query.toLowerCase()) ||
			(g.category && g.category.toLowerCase().includes(query.toLowerCase())) ||
			(g.tags && g.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())));

		const matchCat =
			!selectedCategory ||
			selectedCategory === 'All Categories' ||
			g.category === selectedCategory;

		const { hasCustomDays, days: groupDays } = parseGroupFrequency(
			g.meetingFrequency,
		);
		const activeSearchDays = Object.keys(searchDays).filter(
			(d) => searchDays[d],
		);
		const matchDays =
			activeSearchDays.length === 0 ||
			(hasCustomDays && activeSearchDays.some((day) => groupDays[day]));

		return isVisible && matchQ && matchCat && matchDays;
	});

	const getLeaderUser = (id: string) => users.find((u) => u.id === id);

	const handleRequestJoin = async (clubId: string) => {
		if (!currentUser) {
			router.push('/auth/login');
			return;
		}
		await sendJoinRequest(clubId, joinMessage);
		setJoinSuccess(true);
		setTimeout(() => {
			setJoinSuccess(false);
			setJoinMessage('');
		}, 3000);
	};

	const handleRedeemInvite = async (e: React.FormEvent) => {
		e.preventDefault();
		const clean = inviteCodeInput.trim();
		if (!clean) return;

		if (!currentUser) {
			router.push(`/auth/login?redirect=/join/${encodeURIComponent(clean)}`);
			return;
		}

		setInviteLoading(true);
		setInviteError('');
		setInviteSuccess('');

		const res = await joinViaInviteCode(clean);
		setInviteLoading(false);

		if (res.success && res.group) {
			setInviteSuccess(`Successfully joined ${res.group.name}!`);
			setTimeout(() => {
				setInviteModalOpen(false);
				setInviteCodeInput('');
				setInviteSuccess('');
				router.push(`/group/${res.group?.id}/feed`);
			}, 1200);
		} else if (res.success && res.groupId) {
			setInviteSuccess('Successfully joined club!');
			setTimeout(() => {
				setInviteModalOpen(false);
				setInviteCodeInput('');
				setInviteSuccess('');
				router.push(`/group/${res.groupId}/feed`);
			}, 1200);
		} else {
			setInviteError(res.error || 'Invalid or expired invite code');
		}
	};

	const hasRequested = (clubId: string) =>
		requests.some(
			(r) =>
				r.groupId === clubId &&
				r.userId === currentUser?.id &&
				r.status === 'PENDING',
		);

	const isMember = (club: Group) =>
		currentUser &&
		(club.memberIds.includes(currentUser.id) || club.leaderId === currentUser.id);

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

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Nav />

			<main className="grow mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
				{/* Top Search & Filter Bar */}
				<div className="mb-6 space-y-4">
					<div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
						<div>
							<h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
								Explore Campus Clubs
							</h1>
							<p className="text-xs text-text-muted mt-1">
								Discover student organizations, attend upcoming workshops,
								and join active communities.
							</p>
						</div>

						<div className="flex items-center gap-2.5 w-full md:w-auto">
							<button
								onClick={() => setInviteModalOpen(true)}
								className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary-light/50 px-3.5 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-white shadow-2xs transition-all cursor-pointer shrink-0"
							>
								<FiKey size={14} />
								<span>Join with Code</span>
							</button>

							{/* Search input */}
							<div className="flex items-center gap-2 max-w-md w-full rounded-xl border border-border bg-surface px-3 py-1.5 shadow-xs focus-within:ring-2 focus-within:ring-primary/30 transition-all">
								<FiSearch size={16} className="text-text-muted shrink-0" />
								<input
									type="text"
									placeholder="Search by name, tags (#Figma), or keyword..."
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									className="grow bg-transparent text-xs sm:text-sm text-text-primary placeholder-text-muted focus:outline-none"
								/>
								{query && (
									<button
										onClick={() => setQuery('')}
										className="text-text-muted hover:text-text-primary text-xs p-1"
									>
										✕
									</button>
								)}
							</div>
						</div>
					</div>

					{/* Category Horizontal Scroll Pills */}
					<div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
						{categories.map((cat) => {
							const isSelected =
								selectedCategory === cat ||
								(!selectedCategory && cat === 'All Categories');
							return (
								<button
									key={cat}
									onClick={() =>
										setSelectedCategory(
											cat === 'All Categories' ? '' : cat,
										)
									}
									className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
										isSelected
											? 'bg-primary text-white shadow-xs'
											: 'bg-surface border border-border text-text-secondary hover:border-primary hover:text-primary'
									}`}
								>
									{cat}
								</button>
							);
						})}
						<button
							onClick={() => setShowFilters(!showFilters)}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-surface border border-border text-text-secondary hover:text-text-primary transition-colors shrink-0 ml-auto cursor-pointer"
						>
							<FiFilter size={12} />
							<span>Filters</span>
						</button>
					</div>

					{/* Extended Day-of-week filter panel */}
					{showFilters && (
						<div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
							<span className="text-xs font-bold text-text-primary block mb-2">
								Filter by Meeting Days:
							</span>
							<div className="flex flex-wrap gap-2">
								{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
									(day) => (
										<button
											key={day}
											onClick={() =>
												setSearchDays((prev) => ({
													...prev,
													[day]: !prev[day],
												}))
											}
											className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
												searchDays[day]
													? 'bg-primary text-white border-primary'
													: 'bg-surface-secondary text-text-secondary border-border hover:border-text-muted'
											}`}
										>
											{day}
										</button>
									),
								)}
								<button
									onClick={() =>
										setSearchDays({
											Mon: false,
											Tue: false,
											Wed: false,
											Thu: false,
											Fri: false,
											Sat: false,
											Sun: false,
										})
									}
									className="text-xs text-text-muted hover:text-danger ml-3"
								>
									Reset days
								</button>
							</div>
						</div>
					)}
				</div>

				{/* Club Cards Grid */}
				{isLoading ? (
					<div className="flex justify-center items-center py-24">
						<ClipLoader color="var(--primary)" size={35} />
					</div>
				) : filteredClubs.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center my-8">
						<div className="mx-auto h-12 w-12 rounded-full bg-primary-light flex items-center justify-center text-primary mb-3">
							<FiSearch size={22} />
						</div>
						<h3 className="text-base font-bold text-text-primary">
							No matching clubs found
						</h3>
						<p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
							Try adjusting your search terms, changing the category filter,
							or registering a new club.
						</p>
						<div className="mt-5 flex justify-center gap-3">
							<button
								onClick={() => {
									setQuery('');
									setSelectedCategory('');
								}}
								className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary"
							>
								Clear Filters
							</button>
							<Link
								href="/groups"
								className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover"
							>
								Start a New Club
							</Link>
						</div>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredClubs.map((club) => {
							const leader = getLeaderUser(club.leaderId);
							const userIsMember = isMember(club);
							const userRequested = hasRequested(club.id);

							return (
								<div
									key={club.id}
									className="group rounded-2xl border border-border bg-surface overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all flex flex-col"
								>
									{/* Club Banner */}
									<div className="h-36 w-full relative bg-surface-secondary overflow-hidden">
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
										<div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-bold text-primary border border-border shadow-xs">
											{club.category}
										</div>
									</div>

									{/* Body */}
									<div className="p-5 flex flex-col grow">
										<div className="flex items-start justify-between gap-2">
											<div>
												<h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
													{club.name}
												</h3>
												{club.tagline && (
													<p className="text-xs text-text-muted mt-0.5 line-clamp-1 font-medium">
														{club.tagline}
													</p>
												)}
											</div>
										</div>

										<p className="text-xs text-text-secondary mt-2 line-clamp-2 leading-relaxed">
											{club.description}
										</p>

										{/* Tags */}
										{club.tags && club.tags.length > 0 && (
											<div className="mt-3 flex flex-wrap gap-1">
												{club.tags.slice(0, 3).map((tag) => (
													<span
														key={tag}
														className="text-[10px] font-medium bg-surface-secondary text-text-muted px-2 py-0.5 rounded-md border border-border/60"
													>
														#{tag}
													</span>
												))}
												{club.tags.length > 3 && (
													<span className="text-[10px] text-text-muted px-1">
														+{club.tags.length - 3}
													</span>
												)}
											</div>
										)}

										{/* Meeting schedule & location info */}
										<div className="mt-4 pt-3 border-t border-border space-y-1.5 text-xs text-text-muted">
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

										{/* Footer with Leader, Members & Action */}
										<div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
											<div className="flex items-center space-x-2 min-w-0">
												{leader?.avatarUrl ? (
													<Image
														src={leader.avatarUrl}
														alt={leader.name}
														width={24}
														height={24}
														className="h-6 w-6 rounded-full object-cover border border-border"
													/>
												) : (
													<div className="h-6 w-6 rounded-full bg-primary-light text-primary flex items-center justify-center text-[10px] font-bold">
														{leader?.name?.[0] || 'C'}
													</div>
												)}
												<span className="text-[11px] text-text-muted truncate">
													{club.memberIds.length} Members
												</span>
											</div>

											<div className="flex items-center gap-2">
												<button
													onClick={() => setSelectedClub(club)}
													className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all cursor-pointer"
												>
													Details
												</button>

												{userIsMember ? (
													<Link
														href={`/group/${club.id}/feed`}
														className="rounded-lg bg-primary-light px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-all shadow-2xs"
													>
														Enter Hub
													</Link>
												) : userRequested ? (
													<span className="rounded-lg bg-warning-bg border border-warning/20 px-2.5 py-1 text-[11px] font-semibold text-warning">
														Applied
													</span>
												) : (
													<button
														onClick={() => setSelectedClub(club)}
														className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover transition-all shadow-2xs cursor-pointer"
													>
														Join
													</button>
												)}
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</main>

			{/* ═══════════ Interactive Club Detail Modal ═══════════ */}
			{selectedClub && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
					<div className="w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden my-8">
						{/* Modal Banner */}
						<div className="h-44 w-full relative bg-surface-secondary overflow-hidden">
							{selectedClub.bannerUrl?.startsWith('data:') ||
							selectedClub.bannerUrl?.startsWith('http') ? (
								<Image
									src={selectedClub.bannerUrl}
									alt={selectedClub.name}
									fill
									className="object-cover"
								/>
							) : (
								<div
									className="w-full h-full"
									style={{
										background:
											selectedClub.bannerUrl ||
											'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
									}}
								/>
							)}
							<button
								onClick={() => setSelectedClub(null)}
								className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-all cursor-pointer z-10"
							>
								✕
							</button>
							<div className="absolute bottom-3 left-4 bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary border border-border shadow-xs">
								{selectedClub.category}
							</div>
						</div>

						<div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
							{/* Header */}
							<div>
								<h2 className="text-2xl font-extrabold text-text-primary">
									{selectedClub.name}
								</h2>
								{selectedClub.tagline && (
									<p className="text-sm font-medium text-text-secondary mt-1">
										{selectedClub.tagline}
									</p>
								)}
							</div>

							{/* Description */}
							<div className="space-y-1">
								<h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
									About the Club
								</h4>
								<p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
									{selectedClub.description}
								</p>
							</div>

							{/* Tags */}
							{selectedClub.tags && selectedClub.tags.length > 0 && (
								<div className="space-y-1.5">
									<h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
										Focus Areas &amp; Perks
									</h4>
									<div className="flex flex-wrap gap-1.5">
										{selectedClub.tags.map((t) => (
											<span
												key={t}
												className="inline-flex items-center gap-1 text-xs font-medium bg-primary-light text-primary px-2.5 py-1 rounded-lg"
											>
												<FiTag size={10} /> {t}
											</span>
										))}
									</div>
								</div>
							)}

							{/* Meeting Schedule & Location Box */}
							<div className="rounded-xl border border-border bg-surface-secondary/50 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
								<div>
									<span className="text-text-muted font-medium block">
										Meeting Schedule:
									</span>
									<span className="font-semibold text-text-primary mt-0.5 flex items-center gap-1.5">
										<FiCalendar className="text-primary" />{' '}
										{selectedClub.meetingFrequency}
									</span>
								</div>
								<div>
									<span className="text-text-muted font-medium block">
										Location / Room:
									</span>
									<span className="font-semibold text-text-primary mt-0.5 flex items-center gap-1.5">
										<FiMapPin className="text-primary" />{' '}
										{selectedClub.meetingLocation || 'Campus Center'}
									</span>
								</div>
							</div>

							{/* Social Media & External Links */}
							{(selectedClub.websiteUrl ||
								selectedClub.instagramUrl ||
								selectedClub.discordUrl) && (
								<div className="space-y-1.5">
									<h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
										Connect with Us
									</h4>
									<div className="flex flex-wrap gap-2">
										{selectedClub.websiteUrl && (
											<a
												href={selectedClub.websiteUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-primary transition-colors"
											>
												<FiGlobe size={13} /> Website
											</a>
										)}
										{selectedClub.instagramUrl && (
											<a
												href={selectedClub.instagramUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-pink-600 transition-colors"
											>
												<FiInstagram size={13} /> Instagram
											</a>
										)}
										{selectedClub.discordUrl && (
											<a
												href={selectedClub.discordUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-indigo-500 transition-colors"
											>
												<FaDiscord size={13} /> Discord
											</a>
										)}
									</div>
								</div>
							)}

							{/* Join / Action Box */}
							<div className="pt-3 border-t border-border">
								{isMember(selectedClub) ? (
									<div className="flex items-center justify-between p-4 rounded-xl bg-success-bg border border-success/20">
										<span className="text-xs font-semibold text-success flex items-center gap-1.5">
											<FiCheck /> You are an active member of this club!
										</span>
										<Link
											href={`/group/${selectedClub.id}/feed`}
											className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition-all"
										>
											Open Club Hub
										</Link>
									</div>
								) : hasRequested(selectedClub.id) ? (
									<div className="p-4 rounded-xl bg-warning-bg border border-warning/20 text-center">
										<p className="text-xs font-semibold text-warning">
											Your application has been submitted and is pending
											review by club officers.
										</p>
									</div>
								) : (
									<div className="space-y-3">
										<label className="block text-xs font-bold text-text-primary">
											Apply to Join {selectedClub.name}
										</label>
										<textarea
											rows={2}
											placeholder="Introduce yourself (major, graduation year, or what you hope to learn)..."
											value={joinMessage}
											onChange={(e) => setJoinMessage(e.target.value)}
											className="w-full rounded-xl border border-border bg-surface p-3 text-xs text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary/30 focus:outline-none"
										/>
										{joinSuccess && (
											<div className="text-xs text-success bg-success-bg p-2 rounded-lg text-center font-medium">
												Application submitted successfully!
											</div>
										)}
										<button
											onClick={() => handleRequestJoin(selectedClub.id)}
											className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-hover shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
										>
											<FiSend size={14} /> Submit Application
										</button>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Join Club with Code Modal */}
			<AnimatePresence>
				{inviteModalOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4"
						>
							<div className="flex items-center justify-between border-b border-border pb-3">
								<div className="flex items-center gap-2.5">
									<div className="h-8 w-8 rounded-lg bg-primary-light text-primary flex items-center justify-center font-bold">
										<FiKey size={16} />
									</div>
									<div>
										<h3 className="text-base font-bold text-text-primary">
											Join Club with Code
										</h3>
										<p className="text-[11px] text-text-muted">
											Enter a recruitment invite code or direct link to join.
										</p>
									</div>
								</div>
								<button
									onClick={() => {
										setInviteModalOpen(false);
										setInviteError('');
										setInviteSuccess('');
									}}
									className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface-secondary cursor-pointer"
								>
									<FiX size={18} />
								</button>
							</div>

							<form onSubmit={handleRedeemInvite} className="space-y-4 text-xs">
								{inviteError && (
									<div className="text-xs text-danger bg-danger-bg border border-danger/20 p-2.5 rounded-lg text-center font-medium">
										{inviteError}
									</div>
								)}

								{inviteSuccess && (
									<div className="text-xs text-success bg-success-bg border border-success/20 p-2.5 rounded-lg text-center font-medium">
										{inviteSuccess}
									</div>
								)}

								<div>
									<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">
										Invite Code or Direct Link
									</label>
									<input
										type="text"
										required
										placeholder="e.g. DEMOS-GDSC-2026 or https://.../join/CODE"
										value={inviteCodeInput}
										onChange={(e) =>
											setInviteCodeInput(e.target.value)
										}
										className="w-full rounded-xl border border-border bg-surface-secondary px-3.5 py-2.5 text-xs font-mono font-bold text-text-primary focus:ring-2 focus:ring-primary/30 focus:outline-none placeholder:font-sans placeholder:font-normal placeholder:text-text-muted"
									/>
								</div>

								<div className="flex justify-end gap-2 pt-2">
									<button
										type="button"
										onClick={() => {
											setInviteModalOpen(false);
											setInviteError('');
											setInviteSuccess('');
										}}
										className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-secondary cursor-pointer"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={inviteLoading || !inviteCodeInput.trim()}
										className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
									>
										<span>{inviteLoading ? 'Joining...' : 'Join Club'}</span>
										<FiArrowRight size={13} />
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

export default function SearchPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen flex-col bg-background">
					<Nav />
					<main className="grow flex items-center justify-center py-20">
						<ClipLoader color="var(--primary)" size={35} />
					</main>
					<Footer />
				</div>
			}
		>
			<SearchContent />
		</Suspense>
	);
}
