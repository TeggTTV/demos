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
	FiTag,
	FiDollarSign,
	FiArrowRight,
	FiInfo,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipLoader } from 'react-spinners';
import Link from 'next/link';

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
	group?: GroupInfo;
}

export default function EventsPage() {
	const { currentUser } = useAppContext();
	const [events, setEvents] = useState<EventWithGroup[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('All');
	const [selectedEvent, setSelectedEvent] = useState<EventWithGroup | null>(null);

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const res = await fetch('/api/events');
				const data = await res.json();
				if (data.events) {
					setEvents(data.events);
				}
			} catch (error) {
				console.error('Failed to fetch events:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchEvents();
	}, []);

	const categories = ['All', 'Technology & Coding', 'Arts & Design', 'Engineering & Robotics', 'Business & Entrepreneurship', 'Media & Photography', 'Science & Research'];

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
								className="text-text-muted hover:text-text-primary text-xs p-1"
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
							return (
								<div
									key={event.id}
									className="group rounded-2xl border border-border bg-surface overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all flex flex-col"
								>
									{/* Club Header Banner preview */}
									<div className="h-20 w-full relative bg-surface-secondary overflow-hidden border-b border-border/40">
										{event.group?.bannerUrl ? (
											<div
												className="absolute inset-0 bg-cover bg-center filter brightness-90 group-hover:scale-102 transition-transform duration-300"
												style={{ backgroundImage: `url(${event.group.bannerUrl})` }}
											/>
										) : (
											<div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-600/30" />
										)}
										<div className="absolute bottom-2 left-3 bg-surface/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-bold text-primary border border-border shadow-xs">
											{event.group?.name || 'Club'}
										</div>
									</div>

									{/* Body */}
									<div className="p-5 flex flex-col grow justify-between space-y-4">
										<div className="space-y-2">
											<h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
												{event.title}
											</h3>
											{event.description && (
												<p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
													{event.description}
												</p>
											)}
										</div>

										{/* Event Metadata */}
										<div className="space-y-1.5 pt-3 border-t border-border/60 text-xs text-text-muted">
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
											{event.location && (
												<div className="flex items-center gap-2">
													<FiMapPin className="text-primary shrink-0" size={13} />
													<span className="truncate">{event.location}</span>
												</div>
											)}
											{event.price && (
												<div className="flex items-center gap-2 font-semibold text-success">
													<FiDollarSign className="shrink-0" size={13} />
													<span>{event.price}</span>
												</div>
											)}
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

											<Link
												href={`/group/${event.groupId}/feed`}
												className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover group-hover:translate-x-0.5 transition-transform"
											>
												<span>Visit Club Hub</span>
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

			{/* Interactive Event Detail Modal */}
			<AnimatePresence>
				{selectedEvent && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden my-8"
						>
							<div className="p-6 space-y-4">
								<div className="flex items-start justify-between gap-4">
									<div>
										<span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary-light px-2 py-0.5 rounded">
											{selectedEvent.group?.name || 'Club Event'}
										</span>
										<h2 className="text-xl font-extrabold text-text-primary mt-1.5">
											{selectedEvent.title}
										</h2>
									</div>
									<button
										onClick={() => setSelectedEvent(null)}
										className="h-8 w-8 rounded-full bg-surface-secondary text-text-muted flex items-center justify-center hover:bg-border/60 transition-all cursor-pointer"
									>
										✕
									</button>
								</div>

								{selectedEvent.description && (
									<div className="space-y-1">
										<span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Description</span>
										<p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
											{selectedEvent.description}
										</p>
									</div>
								)}

								<div className="rounded-xl border border-border bg-surface-secondary/50 p-4 space-y-2 text-xs">
									<div className="flex items-center gap-2">
										<FiCalendar className="text-primary" size={14} />
										<span className="font-semibold text-text-primary">Date:</span>
										<span className="text-text-secondary">{formatDate(selectedEvent.date)}</span>
									</div>
									<div className="flex items-center gap-2">
										<FiClock className="text-primary" size={14} />
										<span className="font-semibold text-text-primary">Time:</span>
										<span className="text-text-secondary">
											{formatTime(selectedEvent.time)}
											{selectedEvent.endTime && ` - ${formatTime(selectedEvent.endTime)}`}
										</span>
									</div>
									{selectedEvent.location && (
										<div className="flex items-center gap-2">
											<FiMapPin className="text-primary" size={14} />
											<span className="font-semibold text-text-primary">Location:</span>
											<span className="text-text-secondary">{selectedEvent.location}</span>
										</div>
									)}
									{selectedEvent.price && (
										<div className="flex items-center gap-2">
											<FiDollarSign className="text-primary" size={14} />
											<span className="font-semibold text-text-primary">Price / Fee:</span>
											<span className="text-text-secondary font-bold">{selectedEvent.price}</span>
										</div>
									)}
								</div>

								<div className="pt-3 border-t border-border flex justify-end gap-3">
									<button
										onClick={() => setSelectedEvent(null)}
										className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-secondary cursor-pointer"
									>
										Close
									</button>
									<Link
										href={`/group/${selectedEvent.groupId}/feed`}
										className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-xs transition-all cursor-pointer"
									>
										Go to Club Hub
									</Link>
								</div>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			<Footer />
		</div>
	);
}
