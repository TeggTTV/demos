'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppContext } from '@/components/AppContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import {
	FiCalendar,
	FiClock,
	FiMapPin,
	FiSearch,
	FiLock,
	FiArrowRight,
	FiCheck,
} from 'react-icons/fi';
import { EVENT_CATEGORIES } from '@/constants/categories';
import { formatTime12H } from '@/utils/dateUtils';
import EventDetailModal, {
	EventDetailItem,
} from '@/components/events/EventDetailModal';
import MembersOnlyModal from '@/components/modals/MembersOnlyModal';
import AuthGateModal from '@/components/modals/AuthGateModal';
import { EventCardSkeleton } from '@/components/ui/Skeleton';
import { Input } from '@/components/ui/Input';
import ScrollReveal, {
	ScrollStaggerContainer,
	ScrollStaggerItem,
} from '@/components/ui/ScrollReveal';

import { USE_MOCK_DATA } from '@/mock/mockConfig';

export default function EventsPage() {
	const { currentUser, groups, hydrated } = useAppContext();
	const [events, setEvents] = useState<EventDetailItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('All');
	const [selectedEvent, setSelectedEvent] = useState<EventDetailItem | null>(
		null,
	);
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [membersOnlyModalEvent, setMembersOnlyModalEvent] =
		useState<EventDetailItem | null>(null);
	const [rsvpSuccessEventId, setRsvpSuccessEventId] = useState<string | null>(
		null,
	);
	const [rsvpLoadingEventId, setRsvpLoadingEventId] = useState<string | null>(
		null,
	);

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const res = await fetch('/api/events?type=activity');
				const data = await res.json();
				if (data.events) {
					setEvents(
						data.events.filter(
							(e: EventDetailItem) =>
								e.price !== undefined || e.title !== undefined,
						),
					);
				}
			} catch (err) {
				console.error('Failed to fetch events:', err);
			} finally {
				setIsLoading(false);
			}
		};
		fetchEvents();
	}, []);

	const isUserMemberOfGroup = (groupId: string) => {
		if (!currentUser) return Boolean(USE_MOCK_DATA);
		const targetGroup = groups.find((g) => g.id === groupId);
		if (!targetGroup) return false;
		return (
			targetGroup.leaderId === currentUser.id ||
			targetGroup.memberIds.includes(currentUser.id) ||
			Boolean(
				targetGroup.officerIds &&
				targetGroup.officerIds.includes(currentUser.id),
			)
		);
	};

	const handleRSVPClick = async (event: EventDetailItem) => {
		if (event.membersOnly && !USE_MOCK_DATA) {
			const isMember = isUserMemberOfGroup(event.groupId);
			if (!isMember) {
				setMembersOnlyModalEvent(event);
				return;
			}
		}

		if (!currentUser && !USE_MOCK_DATA) {
			setShowAuthModal(true);
			return;
		}

		try {
			setRsvpLoadingEventId(event.id);
			const res = await fetch('/api/attendance', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					eventId: event.id,
					userId: currentUser?.id || 'user_demo',
					status: 'RSVP_YES',
					checkInMethod: 'CODE',
				}),
			});
			const data = await res.json();
			if (data.success) {
				setRsvpSuccessEventId(event.id);
				setTimeout(() => setRsvpSuccessEventId(null), 3000);
			} else if (data.isMembersOnly) {
				setMembersOnlyModalEvent(event);
			}
		} catch (err) {
			console.error('RSVP Error:', err);
		} finally {
			setRsvpLoadingEventId(null);
		}
	};

	const filteredEvents = events.filter((e) => {
		const matchSearch =
			!searchQuery.trim() ||
			e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(e.description &&
				e.description
					.toLowerCase()
					.includes(searchQuery.toLowerCase())) ||
			(e.group?.name &&
				e.group.name
					.toLowerCase()
					.includes(searchQuery.toLowerCase())) ||
			(e.location &&
				e.location.toLowerCase().includes(searchQuery.toLowerCase()));

		const matchCat =
			selectedCategory === 'All' ||
			(e.group?.category &&
				e.group.category.toLowerCase() ===
					selectedCategory.toLowerCase());

		return matchSearch && matchCat;
	});

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Nav />

			<main id="main-content" className="grow mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
				{/* Top Bar Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
					<div>
						<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
							Campus Club Events &amp; Activities
						</h1>
						<p className="mt-1 text-xs sm:text-sm text-text-muted">
							Discover workshops, hackathons, speaker panels, and
							general meetings across all campus clubs.
						</p>
					</div>

					<div className="flex items-center gap-2">
						<Link
							href="/groups"
							className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm transition-all cursor-pointer"
						>
							<FiCalendar size={14} />
							<span>Host an Event</span>
						</Link>
					</div>
				</div>

				{/* Search & Category Filter Bar */}
				<div className="space-y-4">
					<div className="flex flex-col sm:flex-row gap-3">
						<div className="grow">
							<Input
								icon={FiSearch}
								placeholder="Search events by title, description, club name, or campus room..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
					</div>

					{/* Category Filter Chips */}
					<div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
						{EVENT_CATEGORIES.map((cat) => (
							<button
								key={cat}
								onClick={() => setSelectedCategory(cat)}
								className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
									selectedCategory === cat
										? 'bg-primary text-white shadow-2xs'
										: 'bg-surface border border-border text-text-secondary hover:text-text-primary'
								}`}
							>
								{cat}
							</button>
						))}
					</div>
				</div>

				{/* Event Grid / Loading / Empty State */}
				{!hydrated || isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{Array.from({ length: 6 }).map((_, i) => (
							<EventCardSkeleton key={i} />
						))}
					</div>
				) : filteredEvents.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center max-w-md mx-auto space-y-3">
						<div className="mx-auto h-12 w-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center text-xl">
							<FiCalendar size={24} />
						</div>
						<h3 className="text-base font-bold text-text-primary">
							No events found
						</h3>
						<p className="text-xs text-text-muted leading-relaxed">
							There are no upcoming club events matching your
							filter criteria. Try adjusting your search query.
						</p>
						<button
							onClick={() => {
								setSearchQuery('');
								setSelectedCategory('All');
							}}
							className="mt-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition-all cursor-pointer"
						>
							Reset Filters
						</button>
					</div>
				) : (
					<ScrollStaggerContainer
						staggerDelay={0.07}
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
					>
						{filteredEvents.map((event) => {
							const isRsvpd = rsvpSuccessEventId === event.id;
							const isRsvpLoading =
								rsvpLoadingEventId === event.id;

							return (
								<ScrollStaggerItem key={event.id}>
									<div className="h-full group rounded-2xl border border-border bg-surface overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all flex flex-col justify-between">
										<div className="p-5 space-y-3">
											{/* Top Header: Club Badge & Members Only Tag */}
											<div className="flex items-center justify-between gap-2">
												<span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary-light px-2.5 py-0.5 rounded-full border border-primary/20 truncate max-w-45">
													{event.group?.name ||
														'Campus Club'}
												</span>
												{event.membersOnly && (
													<span className="text-[10px] font-bold text-purple-700 bg-purple-100 dark:bg-purple-950/70 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-300/40 flex items-center gap-1 shrink-0">
														<FiLock size={10} />{' '}
														Members Only
													</span>
												)}
											</div>

											{/* Event Title */}
											<h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
												{event.title}
											</h3>

											{/* Event Description */}
											<p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
												{event.description ||
													'No description added'}
											</p>

											{/* Date, Time, Location details */}
											<div className="pt-2 border-t border-border space-y-1.5 text-xs text-text-muted">
												<div className="flex items-center gap-2">
													<FiCalendar
														size={13}
														className="text-primary shrink-0"
													/>
													<span className="font-medium text-text-primary">
														{event.date}
													</span>
												</div>
												<div className="flex items-center gap-2">
													<FiClock
														size={13}
														className="text-primary shrink-0"
													/>
													<span>
														{formatTime12H(
															event.time,
														)}
														{event.endTime &&
															` - ${formatTime12H(
																event.endTime,
															)}`}
													</span>
												</div>
												{event.location && (
													<div className="flex items-center gap-2">
														<FiMapPin
															size={13}
															className="text-primary shrink-0"
														/>
														<span className="truncate">
															{event.location}
														</span>
													</div>
												)}
											</div>
										</div>

										{/* Bottom Action Footer */}
										<div className="p-4 pt-3 border-t border-border bg-surface-secondary/20 flex items-center justify-between gap-2">
											<button
												onClick={() =>
													setSelectedEvent(event)
												}
												className="text-xs font-semibold text-text-secondary hover:text-primary transition-colors cursor-pointer"
											>
												View Details
											</button>

											<button
												onClick={() =>
													handleRSVPClick(event)
												}
												disabled={isRsvpLoading}
												className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
													isRsvpd
														? 'bg-success text-white'
														: 'bg-primary text-white hover:bg-primary-hover shadow-2xs'
												}`}
											>
												{isRsvpd ? (
													<>
														<FiCheck size={13} />
														<span>RSVP&apos;d</span>
													</>
												) : isRsvpLoading ? (
													<span>...</span>
												) : (
													<>
														<span>
															RSVP to Event
														</span>
														<FiArrowRight
															size={12}
														/>
													</>
												)}
											</button>
										</div>
									</div>
								</ScrollStaggerItem>
							);
						})}
					</ScrollStaggerContainer>
				)}

				{/* Campus Events & Activities Guide Section */}
				<ScrollReveal direction="up">
					<section className="mt-16 rounded-3xl border border-border bg-surface-secondary/40 p-6 sm:p-10 space-y-8">
						<div className="max-w-3xl space-y-2">
							<span className="text-xs font-bold text-primary uppercase tracking-wider">
								Student Guide &amp; Resources
							</span>
							<h2 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
								Campus Club Events &amp; Extracurricular
								Participation
							</h2>
							<p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
								Getting involved in student organizations
								accelerates your academic journey, builds
								hands-on portfolio experience, and develops
								lasting friendships. Learn how attendance
								tracking, RSVPs, and membership requirements
								work on Demos.
							</p>
						</div>

						{/* 3 Guidance Highlight Cards */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
							<div className="rounded-2xl border border-border bg-surface p-5 space-y-2.5 shadow-2xs">
								<div className="h-9 w-9 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold text-sm">
									🔓
								</div>
								<h3 className="text-sm font-bold text-text-primary">
									Open vs. Members-Only
								</h3>
								<p className="text-text-secondary leading-relaxed">
									Public campus events are open to all
									enrolled students. Workshops, hackathons,
									and executive planning meetings marked with
									a{' '}
									<span className="font-semibold text-purple-600">
										Members Only
									</span>{' '}
									badge require active membership in the host
									organization.
								</p>
							</div>

							<div className="rounded-2xl border border-border bg-surface p-5 space-y-2.5 shadow-2xs">
								<div className="h-9 w-9 rounded-xl bg-success-bg text-success flex items-center justify-center font-bold text-sm">
									⏱️
								</div>
								<h3 className="text-sm font-bold text-text-primary">
									Verified Digital Attendance
								</h3>
								<p className="text-text-secondary leading-relaxed">
									Never wait in line to sign paper rosters.
									When officers launch an active meeting
									session, attendees can scan the projector QR
									code or enter the event check-in PIN to
									automatically log verified attendance
									records.
								</p>
							</div>

							<div className="rounded-2xl border border-border bg-surface p-5 space-y-2.5 shadow-2xs">
								<div className="h-9 w-9 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold text-sm">
									📊
								</div>
								<h3 className="text-sm font-bold text-text-primary">
									Official Roster &amp; CSV Reports
								</h3>
								<p className="text-text-secondary leading-relaxed">
									Student organization leaders can review
									real-time presence checklists, adjust
									attendance statuses (Present, Late, Excused,
									Absent), and export compliant CSV
									spreadsheets for university funding
									allocations and student government audits.
								</p>
							</div>
						</div>

						{/* Student Event Participation FAQ Grid */}
						<div className="pt-4 border-t border-border space-y-4">
							<h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
								Frequently Asked Questions About Campus Events
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-text-secondary">
								<div className="space-y-1 rounded-xl bg-surface p-4 border border-border/80">
									<h4 className="font-bold text-text-primary">
										How do I RSVP for an upcoming campus
										event?
									</h4>
									<p className="leading-relaxed">
										Simply click the &quot;RSVP to
										Event&quot; button on any event card. If
										you are not signed in, you will be
										prompted to authenticate with your
										campus account so your RSVP can be
										recorded on the organizer&apos;s
										attendee roster.
									</p>
								</div>

								<div className="space-y-1 rounded-xl bg-surface p-4 border border-border/80">
									<h4 className="font-bold text-text-primary">
										How do I join a club hosting a
										members-only session?
									</h4>
									<p className="leading-relaxed">
										Visit the club showcase in the Explore
										directory to submit a membership
										application, or request a 1-click invite
										link from club officers during club rush
										and orientation fairs.
									</p>
								</div>

								<div className="space-y-1 rounded-xl bg-surface p-4 border border-border/80">
									<h4 className="font-bold text-text-primary">
										Can student leaders host events in
										campus facilities?
									</h4>
									<p className="leading-relaxed">
										Yes! Leaders can schedule general
										meetings, workshops, social mixers, and
										design sessions. Meeting entries display
										room numbers, building locations, start
										and end times, and direct check-in
										codes.
									</p>
								</div>

								<div className="space-y-1 rounded-xl bg-surface p-4 border border-border/80">
									<h4 className="font-bold text-text-primary">
										Are attendance records saved to my
										student profile?
									</h4>
									<p className="leading-relaxed">
										Yes, every verified check-in contributes
										to your extracurricular participation
										record, helping club officers evaluate
										active standing, voting privileges, and
										leadership officer eligibility.
									</p>
								</div>
							</div>
						</div>

						{/* Navigation Links Footer */}
						<div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-border">
							<span className="text-text-muted">
								Looking for student organization directories or
								leadership tools?
							</span>
							<div className="flex items-center gap-4">
								<Link
									href="/search"
									className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
								>
									<span>Explore All Campus Clubs</span>
									<FiArrowRight size={12} />
								</Link>
								{/* <Link
								href="/groups"
								className="text-xs font-semibold text-text-secondary hover:text-text-primary hover:underline"
							>
								My Clubs Hub
							</Link> */}
							</div>
						</div>
					</section>
				</ScrollReveal>
			</main>

			<EventDetailModal
				selectedEvent={selectedEvent}
				onClose={() => setSelectedEvent(null)}
				onRSVPClick={handleRSVPClick}
			/>

			<MembersOnlyModal
				event={membersOnlyModalEvent}
				onClose={() => setMembersOnlyModalEvent(null)}
			/>

			<AuthGateModal
				isOpen={showAuthModal}
				onClose={() => setShowAuthModal(false)}
			/>

			<Footer />
		</div>
	);
}
