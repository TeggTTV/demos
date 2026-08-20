import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	FiX,
	FiCalendar,
	FiMapPin,
	FiUsers,
	FiCheckCircle,
	FiCheck,
	FiDollarSign,
	FiChevronDown,
} from 'react-icons/fi';
import { Input } from '@/components/ui/Input';
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
	activityInviteMessage: string;
	setActivityInviteMessage: (val: string) => void;
	activityInviteReminderDays: string;
	setActivityInviteReminderDays: (val: string) => void;
	autoCreateAttendance: boolean;
	setAutoCreateAttendance: (val: boolean) => void;
	modalActiveTab: 'data' | 'login' | 'costs' | 'invitation';
	setModalActiveTab: (val: 'data' | 'login' | 'costs' | 'invitation') => void;
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
	activityInviteMessage,
	setActivityInviteMessage,
	activityInviteReminderDays,
	setActivityInviteReminderDays,
	autoCreateAttendance,
	setAutoCreateAttendance,
	modalActiveTab,
	setModalActiveTab,
	creatingEvent,
}: CreateEventModalProps) {
	// Local UI states for focus & dropdown overlays
	const [descFocused, setDescFocused] = useState(false);
	const [inviteMsgFocused, setInviteMsgFocused] = useState(false);
	const [locTypeFocused, setLocTypeFocused] = useState(false);
	const [isLocDropdownOpen, setIsLocDropdownOpen] = useState(false);

	// Real-time readiness checks
	const missingTitle = !eventTitle.trim();
	const missingDate = !eventDate;
	const missingLocation = !eventLocation.trim();
	const priceRequiresReg =
		parseFloat(activityPrice) > 0 && !activityRegRequired;

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

						{/* Modal Tabs Header */}
						<div className="flex items-center gap-3 border-b border-border pb-0.5">
							{(
								[
									'data',
									'login',
									'costs',
									'invitation',
								] as const
							).map((tab) => {
								const hasError =
									tab === 'data' &&
									(missingTitle || missingDate);
								const labelText =
									tab === 'data'
										? 'Data'
										: tab === 'login'
											? 'Registration'
											: tab === 'costs'
												? 'Costs'
												: 'Invitation';
								return (
									<button
										key={tab}
										type="button"
										onClick={() => setModalActiveTab(tab)}
										className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
											modalActiveTab === tab
												? 'border-primary text-primary'
												: 'border-transparent text-text-muted hover:text-text-primary'
										}`}
									>
										{labelText}
										{hasError && (
											<span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse shrink-0" />
										)}
										{tab === 'costs' &&
											parseFloat(activityPrice) > 0 && (
												<span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded-full border border-primary/20 shrink-0">
													${activityPrice}
												</span>
											)}
									</button>
								);
							})}
						</div>

						{/* Tabs Content */}
						<form onSubmit={onSubmit} className="space-y-4">
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

										{!editingActivityId && (
											<div className="flex items-center gap-2">
												<Checkbox
													id="auto-create-attendance"
													checked={
														autoCreateAttendance
													}
													onChange={(e) =>
														setAutoCreateAttendance(
															e.target.checked,
														)
													}
												/>
												<label
													htmlFor="auto-create-attendance"
													className="text-xs font-semibold text-text-secondary cursor-pointer select-none"
												>
													Automatically create
													attendance session
												</label>
											</div>
										)}
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
														setLocTypeFocused(
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
																	setLocTypeFocused(
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
																		setLocTypeFocused(
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
																		setLocTypeFocused(
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
																		setLocTypeFocused(
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
																		setLocTypeFocused(
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

										<div>
											<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
												Visibility
											</label>
											<select
												value={activityStatus}
												onChange={(e) =>
													setActivityStatus(
														e.target.value,
													)
												}
												className="w-full rounded-xl border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:outline-none cursor-pointer focus:ring-1 focus:ring-primary"
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

									<div>
										<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
											Description / Notes
										</label>
										<motion.div
											animate={{
												scale: descFocused ? 1.01 : 1,
												boxShadow: descFocused
													? '0 4px 12px rgba(79, 70, 229, 0.08)'
													: '0 0px 0px rgba(0,0,0,0)',
											}}
											transition={{
												type: 'spring',
												stiffness: 400,
												damping: 25,
											}}
											className={`rounded-xl border bg-surface-secondary px-3 py-2 transition-colors ${
												descFocused
													? 'border-primary/50 ring-2 ring-primary/10'
													: 'border-border'
											}`}
										>
											<textarea
												rows={3}
												value={eventDesc}
												onChange={(e) =>
													setEventDesc(e.target.value)
												}
												onFocus={() =>
													setDescFocused(true)
												}
												onBlur={() =>
													setDescFocused(false)
												}
												className="w-full bg-transparent text-xs text-text-primary focus:outline-none resize-none"
												placeholder="Provide brief details about this activity..."
											/>
										</motion.div>
									</div>
								</div>
							)}

							{/* Tab 2: REGISTRATION */}
							{modalActiveTab === 'login' && (
								<div className="space-y-4 animate-in fade-in duration-200">
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

							{/* Tab 4: INVITATION */}
							{modalActiveTab === 'invitation' && (
								<div className="space-y-4 animate-in fade-in duration-200">
									{/* Audit Warning Cards */}
									<div className="rounded-xl border border-border bg-surface-secondary/20 p-4 space-y-3">
										<span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
											Invitation Readiness Check
										</span>
										<div className="space-y-2">
											{missingTitle ? (
												<div className="flex items-start gap-2 text-xs text-danger font-semibold">
													<span className="mt-0.5 font-bold">
														✕
													</span>
													<span>
														Title is missing (Go to
														Data tab)
													</span>
												</div>
											) : (
												<div className="flex items-start gap-2 text-xs text-success font-semibold">
													<FiCheck className="mt-0.5 stroke-[3px]" />
													<span>
														Title defined: &ldquo;
														{eventTitle}&rdquo;
													</span>
												</div>
											)}

											{missingDate ? (
												<div className="flex items-start gap-2 text-xs text-danger font-semibold">
													<span className="mt-0.5 font-bold">
														✕
													</span>
													<span>
														Date is missing (Go to
														Data tab)
													</span>
												</div>
											) : (
												<div className="flex items-start gap-2 text-xs text-success font-semibold">
													<FiCheck className="mt-0.5 stroke-[3px]" />
													<span>
														Date set for {eventDate}
													</span>
												</div>
											)}

											{missingLocation ? (
												<div className="flex items-start gap-2 text-xs text-warning font-semibold">
													<span className="mt-0.5 font-bold">
														!
													</span>
													<span>
														No location set. Members
														won&apos;t know where to
														go.
													</span>
												</div>
											) : (
												<div className="flex items-start gap-2 text-xs text-success font-semibold">
													<FiCheck className="mt-0.5 stroke-[3px]" />
													<span>
														Location set:{' '}
														{eventLocation}
													</span>
												</div>
											)}

											{priceRequiresReg && (
												<div className="flex items-start gap-2 text-xs text-warning font-semibold">
													<span className="mt-0.5 font-bold">
														!
													</span>
													<span>
														Price is set but
														Registration is
														disabled. It is highly
														recommended to require
														registration for paid
														activities.
													</span>
												</div>
											)}
										</div>
									</div>

									<div>
										<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
											Email Invitation Message (Optional)
										</label>
										<span className="block text-[10px] text-text-muted mb-1">
											Custom message sent to members when
											this activity is published.
										</span>
										<motion.div
											animate={{
												scale: inviteMsgFocused
													? 1.01
													: 1,
												boxShadow: inviteMsgFocused
													? '0 4px 12px rgba(79, 70, 229, 0.12)'
													: '0 0px 0px rgba(0,0,0,0)',
											}}
											transition={{
												type: 'spring',
												stiffness: 400,
												damping: 25,
											}}
											className={`rounded-xl border bg-surface-secondary px-3 py-2 transition-colors ${
												inviteMsgFocused
													? 'border-primary/50 ring-2 ring-primary/10'
													: 'border-border'
											}`}
										>
											<textarea
												rows={4}
												value={activityInviteMessage}
												onChange={(e) =>
													setActivityInviteMessage(
														e.target.value,
													)
												}
												onFocus={() =>
													setInviteMsgFocused(true)
												}
												onBlur={() =>
													setInviteMsgFocused(false)
												}
												className="w-full bg-transparent text-xs text-text-primary focus:outline-none resize-none"
												placeholder="e.g. Hey team, hope you can join us for this exciting workshop!..."
											/>
										</motion.div>
									</div>

									<div>
										<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
											Remembrance days in advance
										</label>
										<span className="block text-[10px] text-text-muted mb-1">
											Number of days for this activity
											that non-responders receive a
											reminder. Use 0 to disable.
										</span>
										<input
											type="number"
											value={activityInviteReminderDays}
											onChange={(e) =>
												setActivityInviteReminderDays(
													e.target.value,
												)
											}
											className="w-full rounded-xl border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
										/>
									</div>
								</div>
							)}

							{/* Modal Actions Footer */}
							<div className="pt-3 border-t border-border flex justify-end gap-3">
								<button
									type="button"
									onClick={onClose}
									className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary/40 transition-colors cursor-pointer"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={creatingEvent}
									className="rounded-xl bg-primary px-6 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
								>
									{creatingEvent
										? 'Saving...'
										: 'Save activity'}
								</button>
							</div>
						</form>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
