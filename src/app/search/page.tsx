'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/components/AppContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { FiKey, FiPlusCircle, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import { Group } from '@/types/models';
import { parseGroupFrequency } from '@/constants/categories';
import SearchFilters from '@/components/search/SearchFilters';
import ClubDetailModal from '@/components/group/ClubDetailModal';
import RedeemInviteModal from '@/components/modals/RedeemInviteModal';
import AuthGateModal from '@/components/modals/AuthGateModal';
import GroupCard from '@/components/group/GroupCard';
import { ClubCardSkeleton } from '@/components/ui/Skeleton';
import PageLoader from '@/components/ui/PageLoader';
import ScrollReveal, {
	ScrollStaggerContainer,
	ScrollStaggerItem,
} from '@/components/ui/ScrollReveal';
import { USE_MOCK_DATA } from '@/mock/mockConfig';
import { MOCK_GROUPS, MOCK_USERS } from '@/mock/mockData';
import { mockStore } from '@/mock/mockStore';

function SearchContent() {
	const {
		currentUser,
		groups,
		requests,
		sendJoinRequest,
		events,
		hydrated,
		fetchGroups,
		fetchEvents,
		isTutorialMode,
	} = useAppContext();
	const searchParams = useSearchParams();
	const router = useRouter();

	const clubList = isTutorialMode
		? MOCK_GROUPS
		: groups.length > 0
		? groups
		: mockStore.getGroups();
	const effectiveUser = currentUser || (isTutorialMode ? MOCK_USERS[0] : null);

	// One-time refresh when redirecting to explore page to ensure fresh club data
	useEffect(() => {
		fetchGroups();
		fetchEvents(undefined, 'all');
	}, [fetchGroups, fetchEvents]);

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

	// Auth Modal & Invite Code Modal State
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [inviteModalOpen, setInviteModalOpen] = useState(false);
	const [inviteCodeInput, setInviteCodeInput] = useState('');

	/* eslint-disable react-hooks/set-state-in-effect */
	useEffect(() => {
		const q = searchParams.get('q');
		if (q) setQuery(q);
		const cat = searchParams.get('cat');
		if (cat) setSelectedCategory(cat);
		const clubId = searchParams.get('club');
		if (clubId) {
			const found =
				clubList.find((g) => g.id === clubId) ||
				mockStore.getGroupById(clubId);
			if (found) setSelectedClub(found);
		}
		const codeParam = searchParams.get('code');
		if (codeParam) {
			setInviteCodeInput(codeParam);
			setInviteModalOpen(true);
		}
	}, [searchParams, clubList]);

	useEffect(() => {
		setIsLoading(true);
		const timer = setTimeout(() => setIsLoading(false), 150);
		return () => clearTimeout(timer);
	}, [query, selectedCategory, searchDays]);
	/* eslint-enable react-hooks/set-state-in-effect */

	const filteredClubs = clubList.filter((g) => {
		const isMember =
			effectiveUser &&
			(g.leaderId === effectiveUser.id ||
				g.memberIds.includes(effectiveUser.id));

		const isPublicToGuests =
			g.isPublicToGuests !== undefined ? g.isPublicToGuests : !g.isPrivate;
		const isPublicToMembers =
			g.isPublicToMembers !== undefined ? g.isPublicToMembers : true;

		// 1. If in tutorial mode: always visible
		// 2. If a club member/leader: always visible
		// 3. If logged in but not a member: must have isPublicToMembers
		// 4. If guest: must have isPublicToGuests and isPublicToMembers
		let isVisible = false;
		if (isTutorialMode || isMember) {
			isVisible = true;
		} else if (effectiveUser) {
			isVisible = isPublicToMembers;
		} else {
			isVisible = isPublicToGuests && isPublicToMembers;
		}

		if (!isVisible) return false;

		const matchQ =
			!query.trim() ||
			g.name.toLowerCase().includes(query.toLowerCase()) ||
			(g.tagline &&
				g.tagline.toLowerCase().includes(query.toLowerCase())) ||
			g.description.toLowerCase().includes(query.toLowerCase()) ||
			(g.category &&
				g.category.toLowerCase().includes(query.toLowerCase())) ||
			(g.tags &&
				g.tags.some((t) =>
					t.toLowerCase().includes(query.toLowerCase()),
				));

		const matchCat =
			!selectedCategory ||
			g.category.toLowerCase() === selectedCategory.toLowerCase();

		const activeFilterDays = Object.keys(searchDays).filter(
			(d) => searchDays[d],
		);

		let matchDays = true;
		if (activeFilterDays.length > 0) {
			const parsed = parseGroupFrequency(g.meetingFrequency);
			if (parsed.hasCustomDays) {
				matchDays = activeFilterDays.some(
					(day) => parsed.days[day] === true,
				);
			} else {
				matchDays = true;
			}
		}

		return isVisible && matchQ && matchCat && matchDays;
	});

	const [joinError, setJoinError] = useState('');
	const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);

	const handleRequestJoin = async (groupId: string) => {
		setIsSubmittingJoin(true);
		setJoinError('');
		setJoinSuccess(false);

		const res = await sendJoinRequest(groupId, joinMessage);
		setIsSubmittingJoin(false);

		if (res.success) {
			setJoinSuccess(true);
			setTimeout(() => {
				setJoinSuccess(false);
				setSelectedClub(null);
				setJoinMessage('');
			}, 1500);
		} else {
			setJoinError(res.error || 'Failed to submit application. Please try again.');
		}
	};

	const handleCreateClubClick = () => {
		if (currentUser || USE_MOCK_DATA) {
			router.push('/groups?create=true');
		} else {
			setShowAuthModal(true);
		}
	};

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Nav />

			<main id="main-content" className="grow mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
				{/* Top Bar Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
					<div>
						<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
							Campus Club Directory &amp; Showcase
						</h1>
						<p className="mt-1 text-xs sm:text-sm text-text-muted">
							Discover active university clubs, engineering design
							teams, honor societies, and campus organizations.
						</p>
					</div>

					<div className="flex items-center gap-2.5">
						<button
							onClick={() => setInviteModalOpen(true)}
							className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary shadow-2xs transition-all cursor-pointer"
						>
							<FiKey size={14} className="text-primary" />
							<span>Join with Code</span>
						</button>
					</div>
				</div>

				{/* Want to create your own club hub? Section */}
				<ScrollReveal direction="up">
					<div className="rounded-2xl border border-primary/20 bg-linear-to-r from-primary-light/70 via-surface to-primary-light/30 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
						<div className="space-y-1">
							<h2 className="text-base sm:lg font-bold text-text-primary flex items-center gap-2">
								<span>✨ Want to create your own club hub?</span>
							</h2>
							<p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
								Launch a dedicated space to recruit members, publish announcements, manage rosters, and track meeting attendance.
							</p>
						</div>
						<button
							onClick={handleCreateClubClick}
							className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm transition-all cursor-pointer shrink-0"
						>
							<FiPlusCircle size={15} />
							<span>Create Club Hub</span>
						</button>
					</div>
				</ScrollReveal>

				{/* Search Filters */}
				<div data-tour="search-filters">
					<SearchFilters
						query={query}
						setQuery={setQuery}
						selectedCategory={selectedCategory}
						setSelectedCategory={setSelectedCategory}
						searchDays={searchDays}
						setSearchDays={setSearchDays}
						showFilters={showFilters}
						setShowFilters={setShowFilters}
						totalResults={filteredClubs.length}
					/>
				</div>

				{/* Results Grid / Loading / Empty State */}
				{!hydrated || isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{Array.from({ length: 6 }).map((_, i) => (
							<ClubCardSkeleton key={i} />
						))}
					</div>
				) : filteredClubs.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center max-w-lg mx-auto space-y-3">
						<h3 className="text-base font-bold text-text-primary">
							No clubs found
						</h3>
						<p className="text-xs text-text-muted leading-relaxed">
							Try adjusting your search keywords, clearing
							category filters, or exploring all campus
							organizations.
						</p>
						<div className="pt-2">
							<button
								onClick={() => {
									setQuery('');
									setSelectedCategory('');
									setSearchDays({
										Mon: false,
										Tue: false,
										Wed: false,
										Thu: false,
										Fri: false,
										Sat: false,
										Sun: false,
									});
								}}
								className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition-all cursor-pointer"
							>
								Reset All Filters
							</button>
						</div>
					</div>
				) : (
					<ScrollStaggerContainer
						key={`${selectedCategory}-${query}-${filteredClubs.length}`}
						staggerDelay={0.07}
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
					>
						{filteredClubs.map((club) => (
							<ScrollStaggerItem key={club.id}>
								<GroupCard
									club={club}
									currentUser={currentUser}
									activeEvents={events}
									onClick={() => setSelectedClub(club)}
								/>
							</ScrollStaggerItem>
						))}
					</ScrollStaggerContainer>
				)}

				{/* In-Depth FAQ & Resource Footer */}
				<ScrollReveal direction="up">
					<section className="mt-12 rounded-2xl border border-border bg-surface-secondary/40 p-6 sm:p-8 space-y-6">
						<div>
							<h2 className="text-lg font-bold text-text-primary">
								How to Choose the Right Campus Organization
							</h2>
							<p className="mt-2 text-xs sm:text-sm text-text-secondary leading-relaxed">
								Getting involved in university extracurriculars
								accelerates networking, leadership development,
								portfolio building, and strengthens friendships.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
							<div className="rounded-xl border border-border bg-surface p-4 space-y-2">
								<h3 className="font-bold text-text-primary">
									Official Rosters
								</h3>
								<p className="text-text-secondary leading-relaxed">
									Every club listed on Demos maintains active
									student leadership and faculty advisor contacts.
								</p>
							</div>
							<div className="rounded-xl border border-border bg-surface p-4 space-y-2">
								<h3 className="font-bold text-text-primary">
									Fast Check-Ins
								</h3>
								<p className="text-text-secondary leading-relaxed">
									Never wait in line to sign attendance sheets
									again. Enter the meeting link to verify your
									presence.
								</p>
							</div>
							<div className="rounded-xl border border-border bg-surface p-4 space-y-2">
								<h3 className="font-bold text-text-primary">
									Instant Recruitment Invites
								</h3>
								<p className="text-text-secondary leading-relaxed">
									Club officers can distribute invite links or QR
									codes during orientation fairs.
								</p>
							</div>
						</div>

						<div className="pt-2 flex justify-end">
							<Link
								href="/join"
								className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
							>
								<span>Have an invite code from a club table?</span>
								<FiArrowRight size={12} />
							</Link>
						</div>
					</section>
				</ScrollReveal>
			</main>

			<ClubDetailModal
				club={selectedClub}
				onClose={() => {
					setSelectedClub(null);
					setJoinError('');
				}}
				currentUser={currentUser}
				requests={requests}
				joinMessage={joinMessage}
				setJoinMessage={setJoinMessage}
				joinSuccess={joinSuccess}
				joinError={joinError}
				isSubmitting={isSubmittingJoin}
				onRequestJoin={handleRequestJoin}
			/>

			<RedeemInviteModal
				isOpen={inviteModalOpen}
				onClose={() => setInviteModalOpen(false)}
				initialCode={inviteCodeInput}
			/>

			<AuthGateModal
				isOpen={showAuthModal}
				onClose={() => setShowAuthModal(false)}
				onSuccess={() => router.push('/groups?create=true')}
			/>

			<Footer />
		</div>
	);
}

export default function SearchPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center bg-background">
					<PageLoader
						message="Discovering Clubs"
						subMessage="Searching campus directories..."
					/>
				</div>
			}
		>
			<SearchContent />
		</Suspense>
	);
}
