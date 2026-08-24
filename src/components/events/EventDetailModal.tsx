'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	FiLock,
	FiCalendar,
	FiClock,
	FiMapPin,
	FiDollarSign,
	FiUsers,
	FiInfo,
	FiArrowRight,
} from 'react-icons/fi';
import { formatTime12H } from '@/utils/dateUtils';
import { useDialogAccessibility } from '@/components/ui/useDialogAccessibility';

export interface EventDetailItem {
	id: string;
	groupId: string;
	title: string;
	description: string | null;
	date: string;
	time: string;
	endTime?: string | null;
	location?: string | null;
	price?: string | null;
	membersOnly?: boolean;
	group?: {
		id: string;
		name: string;
		bannerUrl?: string | null;
		category?: string;
	};
}

interface EventDetailModalProps {
	selectedEvent: EventDetailItem | null;
	onClose: () => void;
	onRSVPClick: (event: EventDetailItem) => void;
}

export default function EventDetailModal({
	selectedEvent,
	onClose,
	onRSVPClick,
}: EventDetailModalProps) {
	const dialogRef = useRef<HTMLDivElement>(null);
	useDialogAccessibility(Boolean(selectedEvent), onClose, dialogRef);

	if (!selectedEvent) return null;

	const formatDate = (dateStr: string) => {
		try {
			const d = new Date(dateStr + 'T00:00:00');
			return d.toLocaleDateString('en-US', {
				weekday: 'long',
				month: 'long',
				day: 'numeric',
				year: 'numeric',
			});
		} catch {
			return dateStr;
		}
	};

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto" onMouseDown={onClose}>
				<motion.div
					ref={dialogRef}
					role="dialog"
					aria-modal="true"
					aria-labelledby="event-detail-title"
					onMouseDown={(event) => event.stopPropagation()}
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
										<span className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary-light px-2 py-0.5 text-[10px] font-bold text-primary">
											<FiLock size={10} /> Members Only
										</span>
									)}
								</div>
									<h2 id="event-detail-title" className="text-xl font-extrabold text-text-primary mt-2">
									{selectedEvent.title}
								</h2>
							</div>
							<button
								onClick={onClose}
								aria-label="Close event details"
								className="h-8 w-8 rounded-full bg-surface-secondary text-text-muted flex items-center justify-center hover:bg-border/60 hover:text-text-primary transition-all cursor-pointer"
							>
								✕
							</button>
						</div>
					</div>

					{/* Modal Body */}
					<div className="p-6 space-y-3">
						{/* Date */}
						<div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-secondary/40 hover:bg-primary-light/20 hover:border-primary/30 transition-all group">
							<div className="flex items-center gap-2.5">
								<div className="h-8 w-8 rounded-lg bg-primary-light text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
									<FiCalendar size={15} />
								</div>
								<span className="text-xs font-bold text-text-primary">
									Date
								</span>
							</div>
							<span className="text-xs font-semibold text-text-secondary">
								{formatDate(selectedEvent.date)}
							</span>
						</div>

						{/* Time */}
						<div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-secondary/40 hover:bg-primary-light/20 hover:border-primary/30 transition-all group">
							<div className="flex items-center gap-2.5">
								<div className="h-8 w-8 rounded-lg bg-primary-light text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
									<FiClock size={15} />
								</div>
								<span className="text-xs font-bold text-text-primary">
									Time
								</span>
							</div>
							<span className="text-xs font-semibold text-text-secondary">
								{formatTime12H(selectedEvent.time)}
								{selectedEvent.endTime &&
									` - ${formatTime12H(selectedEvent.endTime)}`}
							</span>
						</div>

						{/* Location */}
						<div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-secondary/40 hover:bg-primary-light/20 hover:border-primary/30 transition-all group">
							<div className="flex items-center gap-2.5">
								<div className="h-8 w-8 rounded-lg bg-primary-light text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
									<FiMapPin size={15} />
								</div>
								<span className="text-xs font-bold text-text-primary">
									Location
								</span>
							</div>
							<span className="text-xs font-semibold text-text-secondary text-right max-w-55 truncate">
								{selectedEvent.location || 'No location specified'}
							</span>
						</div>

						{/* Entry Cost */}
						<div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-secondary/40 hover:bg-primary-light/20 hover:border-primary/30 transition-all group">
							<div className="flex items-center gap-2.5">
								<div className="h-8 w-8 rounded-lg bg-success/15 text-success flex items-center justify-center group-hover:scale-105 transition-transform">
									<FiDollarSign size={15} />
								</div>
								<span className="text-xs font-bold text-text-primary">
									Entry Cost
								</span>
							</div>
							<span className="text-xs font-bold text-text-primary">
								{selectedEvent.price
									? selectedEvent.price
									: 'No entry cost'}
							</span>
						</div>

						{/* Audience */}
						<div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-secondary/40 hover:bg-primary-light/20 hover:border-primary/30 transition-all group">
							<div className="flex items-center gap-2.5">
								<div className="h-8 w-8 rounded-lg bg-primary-light text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
									<FiUsers size={15} />
								</div>
								<span className="text-xs font-bold text-text-primary">
									Audience
								</span>
							</div>
							<span className="text-xs font-semibold text-text-secondary">
								{selectedEvent.membersOnly
									? 'Club Members Only'
									: 'Open to All Students'}
							</span>
						</div>

						{/* Description */}
						<div className="p-3.5 rounded-xl border border-border bg-surface-secondary/40 hover:bg-primary-light/20 hover:border-primary/30 transition-all space-y-1.5">
							<div className="flex items-center gap-2 text-xs font-bold text-text-primary">
								<FiInfo className="text-primary" size={14} />
								<span>Description</span>
							</div>
							<p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line pl-6">
								{selectedEvent.description ||
									'No description added'}
							</p>
						</div>
					</div>

					{/* Modal Footer */}
					<div className="p-5 border-t border-border flex items-center justify-end gap-3 bg-surface-secondary/20">
						<button
							onClick={onClose}
							className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-secondary cursor-pointer transition-colors"
						>
							Close
						</button>
						<button
							onClick={() => onRSVPClick(selectedEvent)}
							className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
						>
							<span>RSVP to Event</span>
							<FiArrowRight size={13} />
						</button>
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
