'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	FiX,
	FiCalendar,
	FiClock,
	FiMapPin,
	FiDollarSign,
	FiUsers,
	FiCheckCircle,
	FiShield,
	FiAward,
} from 'react-icons/fi';
import { MeetingEvent, User, AttendanceRecord } from '@/types/models';

interface ActivityDetailModalProps {
	isOpen: boolean;
	activity: MeetingEvent | null;
	onClose: () => void;
	currentUser: User | null;
	attendances: AttendanceRecord[];
	onRSVP: (eventId: string, status: string) => Promise<void>;
}

export default function ActivityDetailModal({
	isOpen,
	activity,
	onClose,
	currentUser,
	attendances,
	onRSVP,
}: ActivityDetailModalProps) {
	if (!activity) return null;

	const evAtts = attendances.filter((a) => a.eventId === activity.id);
	const yesCount = evAtts.filter(
		(a) => a.status === 'RSVP_YES' || a.status === 'PRESENT',
	).length;
	const isUserGoing = currentUser
		? evAtts.some(
				(a) =>
					a.userId === currentUser.id &&
					(a.status === 'RSVP_YES' || a.status === 'PRESENT'),
		  )
		: false;

	const formatPrice = (price?: string) => {
		if (!price || price === '0' || price.toLowerCase() === 'free')
			return 'Free';
		return price.startsWith('$') ? price : `$${price}`;
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 10 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 10 }}
						transition={{ duration: 0.2 }}
						className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden my-8 space-y-0"
					>
						{/* Header Card Gradient */}
						<div className="relative p-6 bg-gradient-to-br from-primary-light via-surface to-surface border-b border-border">
							<button
								onClick={onClose}
								className="absolute top-4 right-4 p-1.5 rounded-full bg-surface/80 hover:bg-surface border border-border text-text-muted hover:text-text-primary transition-all cursor-pointer shadow-2xs"
							>
								<FiX size={16} />
							</button>

							<div className="space-y-2 pr-6">
								<div className="flex flex-wrap items-center gap-2">
									<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-primary text-white shadow-2xs">
										<FiAward size={11} /> Activity
									</span>
									{activity.membersOnly && (
										<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-light text-primary border border-primary/20">
											<FiShield size={10} /> Members Only
										</span>
									)}
								</div>

								<h2 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
									{activity.title}
								</h2>

								{activity.description && (
									<p className="text-xs text-text-secondary leading-relaxed pt-1 whitespace-pre-wrap">
										{activity.description}
									</p>
								)}
							</div>
						</div>

						{/* Details Grid */}
						<div className="p-6 space-y-5 text-xs">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
								{/* Date & Time */}
								<div className="p-3.5 rounded-xl border border-border bg-surface-secondary/30 space-y-1">
									<span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
										<FiCalendar className="text-primary" />{' '}
										Schedule
									</span>
									<p className="font-semibold text-text-primary">
										{activity.date}
										{activity.endDate && ` to ${activity.endDate}`}
									</p>
									<p className="text-text-muted text-[11px] flex items-center gap-1">
										<FiClock size={11} />
										{activity.allDay
											? 'All Day Event'
											: activity.time || 'TBD'}
										{activity.endTime &&
											` - ${activity.endTime}`}
									</p>
								</div>

								{/* Location */}
								<div className="p-3.5 rounded-xl border border-border bg-surface-secondary/30 space-y-1">
									<span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
										<FiMapPin className="text-primary" />{' '}
										Location
									</span>
									<p className="font-semibold text-text-primary truncate">
										{activity.location || 'Campus Center'}
									</p>
									<p className="text-text-muted text-[11px]">
										{activity.locationType === 'house'
											? "Member's House"
											: 'Campus Venue'}
									</p>
								</div>

								{/* Price */}
								<div className="p-3.5 rounded-xl border border-border bg-surface-secondary/30 space-y-1">
									<span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
										<FiDollarSign className="text-primary" />{' '}
										Entry Cost
									</span>
									<p className="font-semibold text-text-primary text-sm">
										{formatPrice(activity.price)}
									</p>
									<p className="text-text-muted text-[11px]">
										{activity.price &&
										activity.price !== '0' &&
										activity.price.toLowerCase() !== 'free'
											? 'Admission fee required'
											: 'Free admission for attendees'}
									</p>
								</div>

								{/* Attendance / RSVPs */}
								<div className="p-3.5 rounded-xl border border-border bg-surface-secondary/30 space-y-1">
									<span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
										<FiUsers className="text-primary" /> RSVPs
										&amp; Turnout
									</span>
									<p className="font-semibold text-text-primary text-sm">
										{yesCount}{' '}
										<span className="text-xs font-normal text-text-muted">
											attending
										</span>
									</p>
									{activity.regCapacity && (
										<p className="text-text-muted text-[11px]">
											Capacity: {activity.regCapacity}{' '}
											attendees max
										</p>
									)}
								</div>
							</div>

							{/* Footer RSVP Action */}
							<div className="pt-2 border-t border-border flex items-center justify-between gap-3">
								<button
									onClick={onClose}
									className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
								>
									Close
								</button>

								<button
									onClick={async () => {
										await onRSVP(
											activity.id,
											isUserGoing
												? 'RSVP_NO'
												: 'RSVP_YES',
										);
									}}
									className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold transition-all shadow-sm cursor-pointer ${
										isUserGoing
											? 'bg-success text-white hover:bg-success/90'
											: 'bg-primary text-white hover:bg-primary-hover'
									}`}
								>
									<FiCheckCircle size={14} />
									<span>
										{isUserGoing
											? 'You are Going (Click to Cancel)'
											: 'RSVP: I am Going'}
									</span>
								</button>
							</div>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
