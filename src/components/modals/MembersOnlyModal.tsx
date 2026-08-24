'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShield, FiExternalLink } from 'react-icons/fi';
import Link from 'next/link';
import { useDialogAccessibility } from '@/components/ui/useDialogAccessibility';

export interface MembersOnlyModalEvent {
	id?: string;
	groupId: string;
	title?: string;
	group?: {
		id?: string;
		name?: string;
	};
}

interface MembersOnlyModalProps {
	event: MembersOnlyModalEvent | null;
	onClose: () => void;
}

export default function MembersOnlyModal({
	event,
	onClose,
}: MembersOnlyModalProps) {
	const dialogRef = useRef<HTMLDivElement>(null);
	useDialogAccessibility(Boolean(event), onClose, dialogRef);

	return (
		<AnimatePresence>
			{event && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onMouseDown={onClose}>
					<motion.div
						ref={dialogRef}
						role="dialog"
						aria-modal="true"
						aria-labelledby="members-only-title"
						onMouseDown={(event) => event.stopPropagation()}
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						className="w-full max-w-md rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden p-6 space-y-5"
					>
						{/* Header with X button */}
						<div className="flex items-start justify-between gap-4">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary-light text-primary">
									<FiShield size={20} />
								</div>
								<div>
									<h3 id="members-only-title" className="text-base font-bold text-text-primary">
										Members Only Event
									</h3>
									<span className="text-xs font-semibold text-primary">
										{event.group?.name || 'Club Activity'}
									</span>
								</div>
							</div>
							<button
								onClick={onClose}
								aria-label="Close members-only dialog"
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
									{event.group?.name || 'this club'}
								</strong>
								.
							</p>
							<p className="text-xs text-text-muted leading-relaxed">
								You must join or be an active member of this student organization to register, RSVP, and attend this activity.
							</p>
						</div>

						{/* Actions */}
						<div className="flex items-center justify-end gap-3 pt-2">
							<button
								onClick={onClose}
								className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-secondary cursor-pointer transition-colors"
							>
								Cancel
							</button>
							<Link
								href={`/search?club=${event.groupId}`}
								onClick={onClose}
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
	);
}
