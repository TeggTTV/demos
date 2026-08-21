'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/components/AppContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import {
	FiCalendar,
	FiMapPin,
	FiClock,
	FiSearch,
	FiDollarSign,
	FiInfo,
	FiCheckCircle,
	FiLock,
	FiUsers,
	FiShield,
	FiExternalLink,
	FiArrowRight,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipLoader } from 'react-spinners';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface GroupInfo {
	id: string;
	name: string;
	bannerUrl: string | null;
	category: string;
}

interface EventWithGroup {
	id: string;
	groupId: string;
	title: string;
	description: string | null;
	date: string;
	time: string;
	location: string | null;
	endDate: string | null;
	price: string | null;
	status: string | null;
	locationType: string | null;
	allDay: boolean;
	endTime: string | null;
	regRequired: boolean;
	regCapacity: number | null;
	regDeadline: string | null;
	membersOnly?: boolean;
	bannerUrl?: string | null;
	isAttendanceSession?: boolean;
	eventType?: string;
	group?: GroupInfo;
}

export default function EventsPage() {
	const { currentUser, groups } = useAppContext();
	const router = useRouter();
	const [events, setEvents] = useState<EventWithGroup[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('All');
	const [selectedEvent, setSelectedEvent] = useState<EventWithGroup | null>(null);
	const [membersOnlyModalEvent, setMembersOnlyModalEvent] = useState<EventWithGroup | null>(null);
	const [rsvpSuccessEventId, setRsvpSuccessEventId] = useState<string | null>(null);
	const [rsvpLoadingEventId, setRsvpLoadingEventId] = useState<string | null>(null);

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const res = await fetch('/api/events?type=activity');
				const data = await res.json();
				if (data.events) {
					setEvents(
						data.events.filter(
							(e: EventWithGroup) =>
								!e.isAttendanceSession &&
								e.eventType !== 'ATTENDANCE_SESSION',
						),
					);
				}
			} catch (error) {
				console.error('Failed to fetch events:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchEvents();
	}, []);

	const categories = [
		'All',
		'Technology & Coding',
		'Arts & Design',
		'Engineering & Robotics',
		'Business & Entrepreneurship',
		'Media & Photography',
		'Science & Research',
	];

	const filteredEvents = events.filter((event) => {
		const matchesSearch =
			event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(event.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
			(event.group?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

		const matchesCategory =
			selectedCategory === 'All' ||
			event.group?.category === selectedCategory;

		return matchesSearch && matchesCategory;
	});

	const formatDate = (dateStr: string) => {
		try {
			const options: Intl.DateTimeFormatOptions = {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			};
			return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, options);
		} catch {
			return dateStr;
		}
	};

	const formatTime = (timeStr: string) => {
		try {
			const [hour, minute] = timeStr.split(':');
			const h = parseInt(hour);
			const ampm = h >= 12 ? 'PM' : 'AM';
			const formattedHour = h % 12 || 12;
			return `${formattedHour}:${minute} ${ampm}`;
		} catch {
			return timeStr;
		}
	};

	const isUserMemberOfGroup = (groupId: string) => {
		if (!currentUser) return false;
		const targetGroup = groups.find((g) => g.id === groupId);
		if (!targetGroup) return false;
		return (
			targetGroup.leaderId === currentUser.id ||
			targetGroup.memberIds.includes(currentUser.id) ||
			Boolean(targetGroup.officerIds && targetGroup.officerIds.includes(currentUser.id))
		);
	};

	const handleRSVPClick = async (event: EventWithGroup) => {
		// If activity is members-only, verify membership
		if (event.membersOnly) {
			const isMember = isUserMemberOfGroup(event.groupId);
			if (!isMember) {
				// Close any open modals and show Members Only notice
				setSelectedEvent(null);
				setMembersOnlyModalEvent(event);
				return;
			}
		}

		if (!currentUser) {
			router.push('/auth/login');
			return;
		}

		try {
			setRsvpLoadingEventId(event.id);
			const res = await fetch('/api/attendance', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					eventId: event.id,
					status: 'RSVP_YES',
					checkInMethod: 'CODE',
				}),
			});
			const data = await res.json();
			if (data.success) {
				setRsvpSuccessEventId(event.id);
				setTimeout(() => setRsvpSuccessEventId(null), 3000);
			} else if (data.isMembersOnly) {
				setSelectedEvent(null);
				setMembersOnlyModalEvent(event);
			}
		} catch (err) {
			console.error('RSVP Error:', err);
		} finally {
			setRsvpLoadingEventId(null);
		}
	};

	return (
		<div className="flex min-h-screen flex-col bg-background text-text-primary">
			<Nav />

			<main className="grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
				{/* Header Section */}
				<div className="text-center sm:text-left space-y-3">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary-light/40 text-primary text-xs font-semibold">
						<FiCalendar size={13} />
						<span>Discover Activities</span>
					</div>
					<h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
						Upcoming Club Events
					</h1>
					<p className="text-sm text-text-secondary max-w-xl">
						Explore workshops, general body meetings, social gatherings, and hackathons hosted by all campus student organizations.
					</p>
				</div>

				{/* Filters & Search Control */}
				<div className="rounded-2xl border border-border bg-surface p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
					{/* Search input */}
					<div className="relative flex items-center w-full md:max-w-md rounded-xl border border-border bg-surface-secondary px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
						<FiSearch size={16} className="text-text-muted shrink-0 mr-2" />
						<input
							type="text"
							placeholder="Search events, descriptions, or clubs..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="grow bg-transparent text-xs sm:text-sm text-text-primary placeholder-text-muted focus:outline-none"
						/>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery('')}
								className="text-text-muted hover:text-text-primary text-xs p-1 cursor-pointer"
							>
								✕
							</button>
						)}
					</div>

					{/* Category Horizontal Scroll Pills */}
					<div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
						{categories.map((cat) => {
							const isSelected = selectedCategory === cat;
							return (
								<button
									key={cat}
									onClick={() => setSelectedCategory(cat)}
									className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
										isSelected
											? 'bg-primary text-white shadow-xs'
											: 'bg-surface border border-border text-text-secondary hover:border-primary hover:text-primary'
									}`}
								>
									{cat}
								</button>
							);
						})}
					</div>
				</div>

				{/* Events Cards Grid */}
				{loading ? (
					<div className="flex justify-center items-center py-24">
						<ClipLoader color="var(--primary)" size={35} />
					</div>
				) : filteredEvents.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center my-8">
						<div className="mx-auto h-12 w-12 rounded-full bg-primary-light flex items-center justify-center text-primary mb-3">
							<FiCalendar size={22} />
						</div>
						<h3 className="text-base font-bold text-text-primary">
							No events found
						</h3>
						<p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
							Try adjusting your search terms or selecting a different category filter.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredEvents.map((event) => {
							const bgSource = event.bannerUrl || event.group?.bannerUrl;
							const hasCustomBg = Boolean(bgSource);
							const isRsvpd = rsvpSuccessEventId === event.id;
							const isRsvpLoading = rsvpLoadingEventId === event.id;

							return (
								<div
									key={event.id}
									className="group rounded-2xl border border-border bg-surface overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all flex flex-col"
								>
									{/* Club Header Banner preview - styled with club background or activity background */}
									<div
										className="h-24 w-full relative overflow-hidden border-b border-border/40"
										style={{
											backgroundImage: hasCustomBg ? `url(${bgSource})` : undefined,
											backgroundSize: 'cover',
											backgroundPosition: 'center',
										}}
									>
										{!hasCustomBg && (
											<div className="absolute inset-0 bg-gradient-to-r from-primary/35 via-purple-600/30 to-indigo-700/40" />
										)}
										<div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" />

										<div className="absolute top-2.5 right-3 flex items-center gap-1.5">
											{event.membersOnly && (
												<span className="bg-purple-950/80 backdrop-blur-xs text-purple-200 border border-purple-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
													<FiLock size={10} /> Members Only
												</span>
											)}
										</div>

										<div className="absolute bottom-2.5 left-3">
											<span className="bg-surface/90 dark:bg-surface/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-bold text-primary border border-border shadow-xs">
												{event.group?.name || 'Club'}
											</span>
										</div>
									</div>

									{/* Body */}
									<div className="p-5 flex flex-col grow justify-between space-y-4">
										<div className="space-y-2">
											<h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
												{event.title}
											</h3>
											<p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
												{event.description || 'No description added'}
											</p>
										</div>

										{/* Event Metadata */}
										<div className="space-y-2 pt-3 border-t border-border/60 text-xs text-text-muted">
											<div className="flex items-center gap-2">
												<FiCalendar className="text-primary shrink-0" size={13} />
												<span className="truncate">{formatDate(event.date)}</span>
											</div>
											<div className="flex items-center gap-2">
												<FiClock className="text-primary shrink-0" size={13} />
												<span>
													{formatTime(event.time)}
													{event.endTime && ` - ${formatTime(event.endTime)}`}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<FiMapPin className="text-primary shrink-0" size={13} />
												<span className="truncate">{event.location || 'No location specified'}</span>
											</div>
											<div className="flex items-center gap-2 font-medium text-text-primary">
												<FiDollarSign className="text-success shrink-0" size={13} />
												<span>
													<strong className="font-semibold text-text-muted">Entry Cost:</strong>{' '}
													{event.price ? event.price : 'No entry cost'}
												</span>
											</div>
										</div>

										{/* Actions */}
										<div className="pt-2 flex items-center justify-between gap-2">
											<button
												onClick={() => setSelectedEvent(event)}
												className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all cursor-pointer flex items-center gap-1"
											>
												<FiInfo size={12} />
												Details
											</button>

											<button
												onClick={() => handleRSVPClick(event)}
												disabled={isRsvpLoading}
												className={`inline-flex items-center gap-1 text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-2xs transition-all cursor-pointer ${
													isRsvpd
														? 'bg-success text-white'
														: 'bg-primary text-white hover:bg-primary-hover'
												}`}
											>
												{isRsvpd ? (
													<>
														<FiCheckCircle size={12} />
														<span>RSVP Confirmed</span>
													</>
												) : isRsvpLoading ? (
													<span>Saving...</span>
												) : (
													<>
														<span>RSVP to Event</span>
														<FiArrowRight size={12} />
													</>
												)}
											</button>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</main>

			{/* ═══════════ Interactive Event Detail Modal ═══════════ */}
			<AnimatePresence>
				{selectedEvent && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden my-8"
						>
							{/* Modal Header */}
							<div className="p-6 pb-4 border-b border-border space-y-2">
								<div className="flex items-start justify-between gap-4">
									<div>
										<div className="flex items-center gap-2">
											<span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary-light px-2.5 py-0.5 rounded-full border border-primary/20">
												{selectedEvent.group?.name || 'Club Event'}
											</span>
											{selectedEvent.membersOnly && (
												<span className="text-[10px] font-bold text-purple-700 bg-purple-100 dark:bg-purple-950/70 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-300/40 flex items-center gap-1">
													<FiLock size={10} /> Members Only
												</span>
											)}
										</div>
										<h2 className="text-xl font-extrabold text-text-primary mt-2">
											{selectedEvent.title}
										</h2>
									</div>
									<button
										onClick={() => setSelectedEvent(null)}
										className="h-8 w-8 rounded-full bg-surface-secondary text-text-muted flex items-center justify-center hover:bg-border/60 hover:text-text-primary transition-all cursor-pointer"
									>
										✕
									</button>
								</div>
							</div>

							{/* Modal Body: List of Separate Items with Padding & Hover Animation */}
							<div className="p-6 space-y-3">
								{/* Item 1: Date */}
								<div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-secondary/40 hover:bg-primary-light/20 hover:border-primary/30 transition-all group">
									<div className="flex items-center gap-2.5">
										<div className="h-8 w-8 rounded-lg bg-primary-light text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
											<FiCalendar size={15} />
										</div>
										<span className="text-xs font-bold text-text-primary">Date</span>
									</div>
									<span className="text-xs font-semibold text-text-secondary">
										{formatDate(selectedEvent.date)}
									</span>
								</div>

								{/* Item 2: Time */}
								<div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-secondary/40 hover:bg-primary-light/20 hover:border-primary/30 transition-all group">
									<div className="flex items-center gap-2.5">
										<div className="h-8 w-8 rounded-lg bg-primary-light text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
											<FiClock size={15} />
										</div>
										<span className="text-xs font-bold text-text-primary">Time</span>
									</div>
									<span className="text-xs font-semibold text-text-secondary">
										{formatTime(selectedEvent.time)}
										{selectedEvent.endTime && ` - ${formatTime(selectedEvent.endTime)}`}
									</span>
								</div>

								{/* Item 3: Location */}
								<div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-secondary/40 hover:bg-primary-light/20 hover:border-primary/30 transition-all group">
									<div className="flex items-center gap-2.5">
										<div className="h-8 w-8 rounded-lg bg-primary-light text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
											<FiMapPin size={15} />
										</div>
										<span className="text-xs font-bold text-text-primary">Location</span>
									</div>
									<span className="text-xs font-semibold text-text-secondary text-right max-w-[220px] truncate">
										{selectedEvent.location || 'No location specified'}
									</span>
								</div>

								{/* Item 4: Entry Cost */}
								<div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-secondary/40 hover:bg-primary-light/20 hover:border-primary/30 transition-all group">
									<div className="flex items-center gap-2.5">
										<div className="h-8 w-8 rounded-lg bg-success/15 text-success flex items-center justify-center group-hover:scale-105 transition-transform">
											<FiDollarSign size={15} />
										</div>
										<span className="text-xs font-bold text-text-primary">Entry Cost</span>
									</div>
									<span className="text-xs font-bold text-text-primary">
										{selectedEvent.price ? selectedEvent.price : 'No entry cost'}
									</span>
								</div>

								{/* Item 5: Audience & Eligibility */}
								<div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-secondary/40 hover:bg-primary-light/20 hover:border-primary/30 transition-all group">
									<div className="flex items-center gap-2.5">
										<div className="h-8 w-8 rounded-lg bg-primary-light text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
											<FiUsers size={15} />
										</div>
										<span className="text-xs font-bold text-text-primary">Audience</span>
									</div>
									<span className="text-xs font-semibold text-text-secondary">
										{selectedEvent.membersOnly ? 'Club Members Only' : 'Open to All Students'}
									</span>
								</div>

								{/* Item 6: Description */}
								<div className="p-3.5 rounded-xl border border-border bg-surface-secondary/40 hover:bg-primary-light/20 hover:border-primary/30 transition-all space-y-1.5">
									<div className="flex items-center gap-2 text-xs font-bold text-text-primary">
										<FiInfo className="text-primary" size={14} />
										<span>Description</span>
									</div>
									<p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line pl-6">
										{selectedEvent.description || 'No description added'}
									</p>
								</div>
							</div>

							{/* Modal Footer */}
							<div className="p-5 border-t border-border flex items-center justify-end gap-3 bg-surface-secondary/20">
								<button
									onClick={() => setSelectedEvent(null)}
									className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-secondary cursor-pointer transition-colors"
								>
									Close
								</button>
								<button
									onClick={() => handleRSVPClick(selectedEvent)}
									className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
								>
									<span>RSVP to Event</span>
									<FiArrowRight size={13} />
								</button>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			{/* ═══════════ Members-Only Notice Modal ═══════════ */}
			<AnimatePresence>
				{membersOnlyModalEvent && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="w-full max-w-md rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden p-6 space-y-5"
						>
							{/* Header with X button */}
							<div className="flex items-start justify-between gap-4">
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800/40">
										<FiShield size={20} />
									</div>
									<div>
										<h3 className="text-base font-bold text-text-primary">
											Members Only Event
										</h3>
										<span className="text-xs font-semibold text-primary">
											{membersOnlyModalEvent.group?.name || 'Club Activity'}
										</span>
									</div>
								</div>
								<button
									onClick={() => setMembersOnlyModalEvent(null)}
									className="h-8 w-8 rounded-full bg-surface-secondary text-text-muted hover:text-text-primary flex items-center justify-center hover:bg-border/60 transition-colors cursor-pointer"
								>
									✕
								</button>
							</div>

							{/* Body explanation */}
							<div className="p-4 rounded-xl border border-border bg-surface-secondary/40 space-y-2">
								<p className="text-xs text-text-secondary leading-relaxed">
									This event is restricted to registered members of{' '}
									<strong className="text-text-primary font-bold">
										{membersOnlyModalEvent.group?.name || 'this club'}
									</strong>.
								</p>
								<p className="text-xs text-text-muted leading-relaxed">
									You must join or be an active member of this student organization to register, RSVP, and attend this activity.
								</p>
							</div>

							{/* Actions: View Club button on bottom right */}
							<div className="flex items-center justify-end gap-3 pt-2">
								<button
									onClick={() => setMembersOnlyModalEvent(null)}
									className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-secondary cursor-pointer transition-colors"
								>
									Cancel
								</button>
								<Link
									href={`/search?club=${membersOnlyModalEvent.groupId}`}
									onClick={() => setMembersOnlyModalEvent(null)}
									className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-sm transition-all inline-flex items-center gap-1.5"
								>
									<span>View Club</span>
									<FiExternalLink size={13} />
								</Link>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			<Footer />
		</div>
	);
}
