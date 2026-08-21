import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	FiX,
	FiCalendar,
	FiMapPin,
	FiUsers,
	FiCheckCircle,
	FiDollarSign,
	FiChevronDown,
} from 'react-icons/fi';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';

interface CreateEventModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (e: React.FormEvent) => void;
	editingActivityId: string | null;
	eventTitle: string;
	setEventTitle: (val: string) => void;
	eventDesc: string;
	setEventDesc: (val: string) => void;
	eventDate: string;
	setEventDate: (val: string) => void;
	eventTime: string;
	setEventTime: (val: string) => void;
	eventLocation: string;
	setEventLocation: (val: string) => void;
	activityEndDate: string;
	setActivityEndDate: (val: string) => void;
	activityPrice: string;
	setActivityPrice: (val: string) => void;
	activityStatus: string;
	setActivityStatus: (val: string) => void;
	activityLocationType: string;
	setActivityLocationType: (val: string) => void;
	activityAllDay: boolean;
	setActivityAllDay: (val: boolean) => void;
	activityEndTime: string;
	setActivityEndTime: (val: string) => void;
	activityRegRequired: boolean;
	setActivityRegRequired: (val: boolean) => void;
	activityRegCapacity: string;
	setActivityRegCapacity: (val: string) => void;
	activityRegDeadline: string;
	setActivityRegDeadline: (val: string) => void;
	activityInviteMessage?: string;
	setActivityInviteMessage?: (val: string) => void;
	activityInviteReminderDays?: string;
	setActivityInviteReminderDays?: (val: string) => void;
	activityMembersOnly?: boolean;
	setActivityMembersOnly?: (val: boolean) => void;
	activityBannerUrl?: string;
	setActivityBannerUrl?: (val: string) => void;
	modalActiveTab: 'data' | 'login' | 'costs';
	setModalActiveTab: (val: 'data' | 'login' | 'costs') => void;
	creatingEvent: boolean;
}

export default function CreateEventModal({
	isOpen,
	onClose,
	onSubmit,
	editingActivityId,
	eventTitle,
	setEventTitle,
	eventDesc,
	setEventDesc,
	eventDate,
	setEventDate,
	eventTime,
	setEventTime,
	eventLocation,
	setEventLocation,
	activityEndDate,
	setActivityEndDate,
	activityPrice,
	setActivityPrice,
	activityStatus,
	setActivityStatus,
	activityLocationType,
	setActivityLocationType,
	activityAllDay,
	setActivityAllDay,
	activityEndTime,
	setActivityEndTime,
	activityRegRequired,
	setActivityRegRequired,
	activityRegCapacity,
	setActivityRegCapacity,
	activityRegDeadline,
	setActivityRegDeadline,
	activityMembersOnly = false,
	setActivityMembersOnly,
	modalActiveTab,
	setModalActiveTab,
	creatingEvent,
}: CreateEventModalProps) {
	// Local UI states for focus & dropdown overlays
	const [isLocDropdownOpen, setIsLocDropdownOpen] = useState(false);
	const [maxReachedStep, setMaxReachedStep] = useState(0);

	// Real-time readiness checks
	const missingTitle = !eventTitle.trim();
	const missingDate = !eventDate;

	const STEPS: { id: 'data' | 'login' | 'costs'; label: string; num: number }[] = [
		{ id: 'data', label: '1. Basic Details', num: 1 },
		{ id: 'login', label: '2. Registration & Access', num: 2 },
		{ id: 'costs', label: '3. Entry Costs', num: 3 },
	];

	const currentStepIndex = STEPS.findIndex((s) => s.id === modalActiveTab);

	const handleStepClick = (targetIndex: number) => {
		// User can only jump to steps they have unlocked/reached sequentially
		if (targetIndex <= maxReachedStep || editingActivityId) {
			setModalActiveTab(STEPS[targetIndex].id);
		}
	};

	const handleNextStep = () => {
		if (currentStepIndex === 0 && (missingTitle || missingDate)) {
			return; // Validation lock
		}
		const nextIndex = currentStepIndex + 1;
		if (nextIndex < STEPS.length) {
			setMaxReachedStep((prev) => Math.max(prev, nextIndex));
			setModalActiveTab(STEPS[nextIndex].id);
		}
	};

	const handlePrevStep = () => {
		const prevIndex = currentStepIndex - 1;
		if (prevIndex >= 0) {
			setModalActiveTab(STEPS[prevIndex].id);
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						className="w-full max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
					>
						{/* Modal Header */}
						<div className="flex items-start justify-between border-b border-border pb-3">
							<div className="space-y-1 grow">
								<h3 className="text-base font-bold text-text-primary">
									{editingActivityId
										? 'Edit Activity'
										: 'Add activity'}
								</h3>

								{/* Subtitle live metadata */}
								<div className="text-[11px] text-text-muted space-y-0.5">
									<span className="font-semibold block truncate">
										{eventTitle ? (
											eventTitle
										) : (
											<span className="italic">
												No title yet
											</span>
										)}
									</span>
									<div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
										<span className="flex items-center gap-1">
											<FiCalendar
												size={11}
												className="text-primary shrink-0"
											/>
											<span>
												{eventDate
													? new Date(
															eventDate,
														).toLocaleDateString(
															'en-US',
															{
																weekday:
																	'short',
																day: 'numeric',
																month: 'short',
																year: 'numeric',
															},
														)
													: 'No date yet'}
												{!activityAllDay &&
													eventTime &&
													` , ${eventTime}`}
											</span>
										</span>

										<span className="flex items-center gap-1">
											<FiMapPin
												size={11}
												className="text-primary shrink-0"
											/>
											<span className="truncate max-w-37.5">
												{eventLocation ||
													'No location yet'}
											</span>
										</span>

										<span className="flex items-center gap-1">
											<FiUsers
												size={11}
												className="text-primary shrink-0"
											/>
											<span>
												{activityStatus === 'PUBLISHED'
													? 'All members'
													: 'Draft / Not sent'}
											</span>
										</span>
									</div>
								</div>
							</div>
							<button
								onClick={onClose}
								className="text-text-muted hover:text-text-primary p-1 cursor-pointer transition-colors"
							>
								<FiX size={16} />
							</button>
						</div>

						{/* Sequential Steps Navigation Header */}
						<div className="border-b border-border pb-3 space-y-2">
							<div className="flex items-center justify-between text-[11px] font-semibold text-text-muted">
								<span>Step {currentStepIndex + 1} of {STEPS.length}</span>
								<span className="text-primary font-bold">{STEPS[currentStepIndex].label}</span>
							</div>

							{/* Progress Bar */}
							<div className="w-full bg-surface-secondary h-1.5 rounded-full overflow-hidden">
								<div
									className="bg-primary h-full transition-all duration-300 rounded-full"
									style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
								/>
							</div>

							{/* Step Pill Buttons */}
							<div className="grid grid-cols-3 gap-1.5 pt-1">
								{STEPS.map((step, idx) => {
									const isActive = currentStepIndex === idx;
									const isCompleted = idx < currentStepIndex || idx <= maxReachedStep;
									const canClick = idx <= maxReachedStep || Boolean(editingActivityId);

									return (
										<button
											key={step.id}
											type="button"
											disabled={!canClick}
											onClick={() => handleStepClick(idx)}
											className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all text-center truncate ${
												isActive
													? 'bg-primary text-white shadow-xs'
													: isCompleted
														? 'bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer'
														: 'bg-surface-secondary/40 text-text-muted opacity-60 cursor-not-allowed'
											}`}
										>
											{step.label}
										</button>
									);
								})}
							</div>
						</div>

						{/* Tabs Content */}
						<div className="space-y-4">
							{/* Tab 1: DATA */}
							{modalActiveTab === 'data' && (
								<div className="space-y-4 animate-in fade-in duration-200">
									<Input
										label="Title"
										required
										placeholder="e.g. Workshop Advanced Agentic Coding"
										value={eventTitle}
										onChange={(e) =>
											setEventTitle(e.target.value)
										}
									/>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										<div>
											<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
												Date
											</label>
											<input
												type="date"
												required
												value={eventDate}
												onChange={(e) =>
													setEventDate(e.target.value)
												}
												className="w-full rounded-xl border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:outline-none"
											/>
										</div>

										<div>
											<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
												End Date (Optional)
											</label>
											<div className="relative">
												<input
													type="date"
													value={activityEndDate}
													onChange={(e) =>
														setActivityEndDate(
															e.target.value,
														)
													}
													className="w-full rounded-xl border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:outline-none pr-8"
												/>
												{activityEndDate && (
													<button
														type="button"
														onClick={() =>
															setActivityEndDate(
																'',
															)
														}
														className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5"
													>
														<FiX size={14} />
													</button>
												)}
											</div>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
												Start Time
											</label>
											<input
												type="time"
												disabled={activityAllDay}
												value={eventTime}
												onChange={(e) =>
													setEventTime(e.target.value)
												}
												className="w-full rounded-xl border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:outline-none disabled:opacity-50"
											/>
										</div>

										<div>
											<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
												End Time
											</label>
											<input
												type="time"
												disabled={activityAllDay}
												value={activityEndTime}
												onChange={(e) =>
													setActivityEndTime(
														e.target.value,
													)
												}
												className="w-full rounded-xl border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:outline-none disabled:opacity-50"
											/>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-4 py-1">
										<div className="flex items-center gap-2">
											<Checkbox
												id="all-day-checkbox"
												checked={activityAllDay}
												onChange={(e) =>
													setActivityAllDay(
														e.target.checked,
													)
												}
											/>
											<label
												htmlFor="all-day-checkbox"
												className="text-xs font-semibold text-text-secondary cursor-pointer select-none"
											>
												All day event
											</label>
										</div>
									</div>

									<Input
										label="Location / Address"
										placeholder="e.g. Auditorium Hall C or Zoom link"
										value={eventLocation}
										onChange={(e) =>
											setEventLocation(e.target.value)
										}
									/>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										<div>
											<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
												Location type
											</label>
											<div className="relative">
												<motion.button
													type="button"
													onClick={() => {
														setIsLocDropdownOpen(
															!isLocDropdownOpen,
														);
													}}
													animate={{
														scale: isLocDropdownOpen
															? 1.01
															: 1,
														boxShadow:
															isLocDropdownOpen
																? '0 4px 12px rgba(79, 70, 229, 0.12)'
																: '0 0px 0px rgba(0,0,0,0)',
													}}
													transition={{
														type: 'spring',
														stiffness: 400,
														damping: 25,
													}}
													className={`w-full rounded-xl bg-surface-secondary border px-3 py-2.5 flex items-center justify-between text-xs text-text-primary focus:outline-none transition-colors cursor-pointer ${
														isLocDropdownOpen
															? 'border-primary/50 ring-2 ring-primary/10'
															: 'border-border'
													}`}
												>
													<span>
														{activityLocationType ===
															'fixed' &&
															'📍 Fixed location'}
														{activityLocationType ===
															'house' &&
															"🏠 Member's house"}
														{activityLocationType ===
															'custom' &&
															'✏️ Type address myself'}
														{!activityLocationType &&
															'Select location type...'}
													</span>
													<FiChevronDown
														className={`transition-transform duration-200 ${isLocDropdownOpen ? 'rotate-180' : ''}`}
													/>
												</motion.button>

												<AnimatePresence>
													{isLocDropdownOpen && (
														<>
															<div
																className="fixed inset-0 z-10"
																onClick={() => {
																	setIsLocDropdownOpen(
																		false,
																	);
																}}
															/>
															<motion.div
																initial={{
																	opacity: 0,
																	y: -4,
																	scale: 0.98,
																}}
																animate={{
																	opacity: 1,
																	y: 0,
																	scale: 1,
																}}
																exit={{
																	opacity: 0,
																	y: -4,
																	scale: 0.98,
																}}
																transition={{
																	duration: 0.15,
																}}
																className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-surface p-1 shadow-lg space-y-0.5"
															>
																<button
																	type="button"
																	onClick={() => {
																		setActivityLocationType(
																			'',
																		);
																		setIsLocDropdownOpen(
																			false,
																		);
																	}}
																	className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
																		!activityLocationType
																			? 'bg-primary/10 text-primary'
																			: 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
																	}`}
																>
																	<span>
																		-
																	</span>
																	{!activityLocationType && (
																		<FiCheckCircle
																			size={
																				12
																			}
																		/>
																	)}
																</button>
																<button
																	type="button"
																	onClick={() => {
																		setActivityLocationType(
																			'fixed',
																		);
																		setIsLocDropdownOpen(
																			false,
																		);
																	}}
																	className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
																		activityLocationType ===
																		'fixed'
																			? 'bg-primary/10 text-primary'
																			: 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
																	}`}
																>
																	<span className="flex items-center gap-2">
																		📍 Fixed
																		location
																	</span>
																	{activityLocationType ===
																		'fixed' && (
																		<FiCheckCircle
																			size={
																				12
																			}
																		/>
																	)}
																</button>
																<button
																	type="button"
																	onClick={() => {
																		setActivityLocationType(
																			'house',
																		);
																		setIsLocDropdownOpen(
																			false,
																		);
																	}}
																	className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
																		activityLocationType ===
																		'house'
																			? 'bg-primary/10 text-primary'
																			: 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
																	}`}
																>
																	<span className="flex items-center gap-2">
																		🏠
																		Member&apos;s
																		house
																	</span>
																	{activityLocationType ===
																		'house' && (
																		<FiCheckCircle
																			size={
																				12
																			}
																		/>
																	)}
																</button>
																<button
																	type="button"
																	onClick={() => {
																		setActivityLocationType(
																			'custom',
																		);
																		setIsLocDropdownOpen(
																			false,
																		);
																	}}
																	className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
																		activityLocationType ===
																		'custom'
																			? 'bg-primary/10 text-primary'
																			: 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
																	}`}
																>
																	<span className="flex items-center gap-2">
																		✏️ Type
																		address
																		myself
																	</span>
																	{activityLocationType ===
																		'custom' && (
																		<FiCheckCircle
																			size={
																				12
																			}
																		/>
																	)}
																</button>
															</motion.div>
														</>
													)}
												</AnimatePresence>
											</div>
											<span className="block text-[10px] text-text-muted mt-1">
												Choose a fixed location, a
												member&apos;s house, or type an
												address yourself. Members are
												notified about this.
											</span>
										</div>

										<Select
											label="Visibility"
											value={activityStatus}
											onChange={(e) => setActivityStatus(e.target.value)}
										>
											<option value="PUBLISHED">Published / Open</option>
											<option value="NOT_SENT">Draft / Closed</option>
										</Select>
									</div>

									<Textarea
										label="Description / Notes"
										rows={3}
										value={eventDesc}
										onChange={(e) => setEventDesc(e.target.value)}
										placeholder="Provide brief details about this activity..."
									/>
								</div>
							)}

							{/* Tab 2: REGISTRATION & ACCESS */}
							{modalActiveTab === 'login' && (
								<div className="space-y-4 animate-in fade-in duration-200">
									{/* Members-Only Requirement Toggle */}
									<div className="p-3.5 rounded-xl border border-primary/20 bg-primary-light/30 space-y-2">
										<div className="flex items-center gap-2.5">
											<Checkbox
												id="members-only-checkbox"
												checked={activityMembersOnly}
												onChange={(e) =>
													setActivityMembersOnly &&
													setActivityMembersOnly(
														e.target.checked,
													)
												}
											/>
											<label
												htmlFor="members-only-checkbox"
												className="text-xs font-bold text-text-primary cursor-pointer select-none"
											>
												🔒 Members-Only Activity
											</label>
										</div>
										<p className="text-[11px] text-text-secondary pl-6">
											When enabled, only registered club members and officers can RSVP to this event. Non-members will be prompted to view and join the club.
										</p>
									</div>

									<div className="flex items-center gap-2 py-1">
										<Checkbox
											id="reg-required-checkbox"
											checked={activityRegRequired}
											onChange={(e) =>
												setActivityRegRequired(
													e.target.checked,
												)
											}
										/>
										<label
											htmlFor="reg-required-checkbox"
											className="text-xs font-semibold text-text-secondary cursor-pointer select-none"
										>
											Require registration to attend
										</label>
									</div>

									{activityRegRequired && (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{
												opacity: 1,
												height: 'auto',
											}}
											className="space-y-4 pt-1"
										>
											<Input
												label="Max Capacity (Optional)"
												type="number"
												placeholder="Leave empty for unlimited"
												value={activityRegCapacity}
												onChange={(e) =>
													setActivityRegCapacity(
														e.target.value,
													)
												}
											/>

											<div>
												<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
													Registration Deadline
													(Optional)
												</label>
												<input
													type="datetime-local"
													value={activityRegDeadline}
													onChange={(e) =>
														setActivityRegDeadline(
															e.target.value,
														)
													}
													className="w-full rounded-xl border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
												/>
											</div>
										</motion.div>
									)}
								</div>
							)}

							{/* Tab 3: COSTS */}
							{modalActiveTab === 'costs' && (
								<div className="space-y-4 animate-in fade-in duration-200">
									<div className="relative">
										<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
											Cost Price (per member)
										</label>
										<div className="relative">
											<span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted font-bold">
												<FiDollarSign size={14} />
											</span>
											<input
												type="number"
												step="0.01"
												placeholder="0.00 (Free)"
												value={activityPrice}
												onChange={(e) =>
													setActivityPrice(
														e.target.value,
													)
												}
												className="w-full rounded-xl border border-border bg-surface-secondary py-3 pl-8 pr-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono font-bold"
											/>
										</div>
										<span className="block text-[10px] text-text-muted mt-1.5 leading-relaxed">
											Indicates if members need to pay to
											join this activity.
										</span>
									</div>
								</div>
							)}

							{/* Modal Actions Footer: Step by Step Guided Navigation */}
							<div className="pt-3 border-t border-border flex items-center justify-between gap-3">
								<div>
									{currentStepIndex === 0 ? (
										<button
											type="button"
											onClick={onClose}
											className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary/40 transition-colors cursor-pointer"
										>
											Cancel
										</button>
									) : (
										<button
											type="button"
											onClick={handlePrevStep}
											className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary/40 transition-colors cursor-pointer flex items-center gap-1"
										>
											← Back
										</button>
									)}
								</div>

								<div className="flex items-center gap-2">
									{currentStepIndex < STEPS.length - 1 ? (
										<button
											type="button"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												handleNextStep();
											}}
											disabled={currentStepIndex === 0 && (missingTitle || missingDate)}
											className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-sm disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1.5"
										>
											<span>
												Next: {STEPS[currentStepIndex + 1].label.replace(/^\d+\.\s*/, '')}
											</span>
											<span>→</span>
										</button>
									) : (
										<button
											type="button"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												onSubmit(e);
											}}
											disabled={creatingEvent || missingTitle || missingDate}
											className="rounded-xl bg-primary px-6 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-md disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
										>
											{creatingEvent ? 'Saving Activity...' : 'Save Activity ✓'}
										</button>
									)}
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
