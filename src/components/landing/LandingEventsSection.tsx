'use client';

import React from 'react';
import Link from 'next/link';
import { FiLock } from 'react-icons/fi';
import { ScrollStaggerContainer, ScrollStaggerItem } from '@/components/ui/ScrollReveal';

export interface LandingEvent {
	id: string;
	groupId: string;
	title: string;
	description: string | null;
	date: string;
	time: string;
	membersOnly?: boolean;
	isAttendanceSession?: boolean;
	eventType?: string;
	group?: {
		id: string;
		name: string;
	};
}

interface LandingEventsSectionProps {
	events: LandingEvent[];
	rsvpSuccessEventId: string | null;
	rsvpLoadingEventId: string | null;
	onRSVPClick: (event: LandingEvent) => void;
}

export default function LandingEventsSection({
	events,
	rsvpSuccessEventId,
	rsvpLoadingEventId,
	onRSVPClick,
}: LandingEventsSectionProps) {
	return (
		<section className="max-w-5xl mx-auto min-h-[25vh] border-y border-border bg-surface overflow-hidden">
			<ScrollStaggerContainer
				staggerDelay={0.08}
				className="w-full h-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border"
			>
				{events.map((event) => {
					let dateNumber = 24;
					let monthName = 'AUG';
					try {
						const dateObj = new Date(event.date + 'T00:00:00');
						if (!isNaN(dateObj.getDate())) {
							dateNumber = dateObj.getDate();
							monthName = dateObj
								.toLocaleString('en-US', { month: 'short' })
								.toUpperCase();
						}
					} catch {
						// fallback defaults
					}

					const isRsvpd = rsvpSuccessEventId === event.id;
					const isRsvpLoading = rsvpLoadingEventId === event.id;

					return (
						<ScrollStaggerItem
							key={event.id}
							className="group relative p-4 m-0 bg-white dark:bg-surface hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors duration-200 flex flex-col justify-between"
						>
							{/* Top Info */}
							<div className="space-y-1.5">
								<div className="flex items-baseline gap-2">
									<span className="text-3xl sm:text-4xl font-black text-text-primary leading-none tracking-tight">
										{dateNumber}
									</span>
									<span className="text-xs font-bold text-primary uppercase tracking-wider">
										{monthName}
									</span>
									{event.membersOnly && (
										<span className="ml-auto text-[9px] font-bold text-purple-700 bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
											<FiLock size={8} /> Members
										</span>
									)}
								</div>

								<h4 className="font-bold text-xs sm:text-sm text-text-primary group-hover:text-primary transition-colors line-clamp-1">
									{event.title}
								</h4>

								<p className="text-[11px] sm:text-xs text-text-secondary line-clamp-2 leading-snug font-normal">
									{event.description || 'No description added'}
								</p>
							</div>

							{/* Bottom Actions */}
							<div className="pt-3 mt-auto flex items-center justify-between gap-1 w-full border-t border-border/40">
								<Link
									href={`/search?club=${event.groupId}`}
									className="text-[11px] font-semibold text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
								>
									<span>View Club</span>
								</Link>

								<button
									onClick={() => onRSVPClick(event)}
									disabled={isRsvpLoading}
									className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
										isRsvpd
											? 'bg-success text-white'
											: 'bg-primary text-white hover:bg-primary-hover shadow-2xs'
									}`}
								>
									{isRsvpd
										? '✓ RSVP'
										: isRsvpLoading
											? '...'
											: 'RSVP to Event'}
								</button>
							</div>
						</ScrollStaggerItem>
					);
				})}
			</ScrollStaggerContainer>
		</section>
	);
}
