import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { Input } from '@/components/ui/Input';

interface ScheduleMeetingModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (e: React.FormEvent) => void;
	meetingTitle: string;
	setMeetingTitle: (val: string) => void;
	meetingDate: string;
	setMeetingDate: (val: string) => void;
	meetingTime: string;
	setMeetingTime: (val: string) => void;
	meetingLocation: string;
	setMeetingLocation: (val: string) => void;
	meetingPrice: string;
	setMeetingPrice: (val: string) => void;
	meetingDesc: string;
	setMeetingDesc: (val: string) => void;
	meetingEndDate: string;
	setMeetingEndDate: (val: string) => void;
	meetingStatus: string;
	setMeetingStatus: (val: string) => void;
	creatingEvent: boolean;
}

export default function ScheduleMeetingModal({
	isOpen,
	onClose,
	onSubmit,
	meetingTitle,
	setMeetingTitle,
	meetingDate,
	setMeetingDate,
	meetingTime,
	setMeetingTime,
	meetingLocation,
	setMeetingLocation,
	meetingPrice,
	setMeetingPrice,
	meetingDesc,
	setMeetingDesc,
	meetingEndDate,
	setMeetingEndDate,
	meetingStatus,
	setMeetingStatus,
	creatingEvent,
}: ScheduleMeetingModalProps) {
	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in duration-200"
					>
						<div className="flex items-start justify-between border-b border-border pb-3">
							<div>
								<h3 className="text-base font-bold text-text-primary">
									Schedule Meeting Session
								</h3>
								<p className="text-[10px] text-text-muted mt-0.5">
									Create a meeting session to enable link
									attendance check-in for members.
								</p>
							</div>
							<button
								onClick={onClose}
								className="text-text-muted hover:text-text-primary p-1 cursor-pointer transition-colors"
							>
								<FiX size={16} />
							</button>
						</div>

						<form
							onSubmit={onSubmit}
							className="space-y-4"
						>
							<Input
								label="Meeting Title"
								required
								placeholder="e.g. Weekly Club Assembly"
								value={meetingTitle}
								onChange={(e) =>
									setMeetingTitle(e.target.value)
								}
							/>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
										Date
									</label>
									<input
										type="date"
										required
										value={meetingDate}
										onChange={(e) =>
											setMeetingDate(e.target.value)
										}
										className="w-full rounded-xl border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:outline-none"
									/>
								</div>

								<div>
									<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
										Time
									</label>
									<input
										type="time"
										required
										value={meetingTime}
										onChange={(e) =>
											setMeetingTime(e.target.value)
										}
										className="w-full rounded-xl border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:outline-none"
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<Input
									label="Location"
									placeholder="e.g. Room 402 or Main Hall"
									value={meetingLocation}
									onChange={(e) =>
										setMeetingLocation(e.target.value)
									}
								/>

								<Input
									label="Price (Optional)"
									placeholder="e.g. Free"
									value={meetingPrice}
									onChange={(e) =>
										setMeetingPrice(e.target.value)
									}
								/>
							</div>

							<div>
								<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
									Description / Agenda
								</label>
								<textarea
									rows={3}
									value={meetingDesc}
									onChange={(e) =>
										setMeetingDesc(e.target.value)
									}
									className="w-full rounded-xl border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:outline-none resize-none"
									placeholder="Agenda or notes for this meeting..."
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
										End Date (Optional)
									</label>
									<input
										type="date"
										value={meetingEndDate}
										onChange={(e) =>
											setMeetingEndDate(
												e.target.value,
											)
										}
										className="w-full rounded-xl border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:outline-none"
									/>
								</div>

								<div>
									<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
										Status
									</label>
									<select
										value={meetingStatus}
										onChange={(e) =>
											setMeetingStatus(e.target.value)
										}
										className="w-full rounded-xl border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:outline-none cursor-pointer"
									>
										<option value="PUBLISHED">
											Published / Open
										</option>
										<option value="NOT_SENT">
											Draft / Closed
										</option>
									</select>
								</div>
							</div>

							<div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-2">
								<button
									type="button"
									onClick={onClose}
									className="rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={
										creatingEvent ||
										!meetingTitle.trim() ||
										!meetingDate
									}
									className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
								>
									{creatingEvent
										? 'Scheduling...'
										: 'Schedule Meeting'}
								</button>
							</div>
						</form>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
