'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
	FiClock,
	FiDownload,
	FiPlus,
	FiCalendar,
	FiArrowLeft,
	FiTrash2,
	FiCheck,
	FiMapPin,
	FiUsers,
	FiLink,
} from 'react-icons/fi';
import { Group, User, MeetingEvent, AttendanceRecord } from '@/types/models';
import { exportAttendanceCSV } from '@/utils/csvExport';
import QRCodeSVG from '@/components/ui/QRCode';
import { Checkbox } from '@/components/ui/Checkbox';
import ConfirmModal from '@/components/modals/ConfirmModal';

interface ClubAttendanceTabProps {
	group: Group;
	currentUser: User | null;
	users: User[];
	clubEvents: MeetingEvent[];
	attendances: AttendanceRecord[];
	canManage: boolean;
	selectedEventId: string | null;
	setSelectedEventId: (id: string | null) => void;
	activeSubTab: 'roster' | 'info';
	setActiveSubTab: (tab: 'roster' | 'info') => void;
	toggleEventActive: (
		eventId: string,
		isActive: boolean,
	) => Promise<{ success: boolean }>;
	deleteMeetingEvent: (eventId: string) => Promise<{ success: boolean }>;
	checkInToEvent: (
		eventId: string,
		code: string,
	) => Promise<{ success: boolean; message?: string; error?: string }>;
	updateAttendanceStatus: (
		eventId: string,
		userId: string,
		status: 'PRESENT' | 'LATE' | 'EXCUSED' | 'ABSENT',
	) => Promise<{ success: boolean }>;
	onOpenScheduleModal: () => void;
}

export default function ClubAttendanceTab({
	group,
	currentUser,
	users,
	clubEvents,
	attendances,
	canManage,
	selectedEventId,
	setSelectedEventId,
	activeSubTab,
	setActiveSubTab,
	toggleEventActive,
	deleteMeetingEvent,
	checkInToEvent,
	updateAttendanceStatus,
	onOpenScheduleModal,
}: ClubAttendanceTabProps) {
	const [copiedPin, setCopiedPin] = useState(false);
	const [copiedLink, setCopiedLink] = useState(false);
	const [showQRCode, setShowQRCode] = useState(false);
	const [checkInInput, setCheckInInput] = useState('');
	const [showDeleteSessionConfirm, setShowDeleteSessionConfirm] =
		useState(false);

	const currentSelectedEvent = clubEvents.find(
		(e) => e.id === selectedEventId,
	);

	// Read URL query params for auto-filling check-in
	/* eslint-disable react-hooks/set-state-in-effect */
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const params = new URLSearchParams(window.location.search);
			const eventParam = params.get('event');
			const codeParam = params.get('code');
			if (eventParam && !selectedEventId) {
				setSelectedEventId(eventParam);
			}
			if (codeParam && !checkInInput) {
				setCheckInInput(codeParam);
			}
		}
	}, [selectedEventId, checkInInput, setSelectedEventId]);
	/* eslint-enable react-hooks/set-state-in-effect */

	const checkInUrl =
		typeof window !== 'undefined' && currentSelectedEvent
			? `${window.location.origin}/group/${group.id}/feed?tab=attendance&event=${currentSelectedEvent.id}&code=${currentSelectedEvent.checkInCode}`
			: '';

	const myAttendance = currentSelectedEvent && currentUser
		? attendances.find(
				(a) =>
					a.eventId === currentSelectedEvent.id &&
					a.userId === currentUser.id,
		  )
		: null;
	const sessionAttendances = currentSelectedEvent
		? attendances.filter((a) => a.eventId === currentSelectedEvent.id)
		: [];

	const rosterMemberIds = Array.from(
		new Set([
			...(group.leaderId ? [group.leaderId] : []),
			...(group.officerIds || []),
			...(group.memberIds || []),
		]),
	);

	const presentCount = sessionAttendances.filter(
		(a) => a.status === 'PRESENT',
	).length;
	const lateCount = sessionAttendances.filter(
		(a) => a.status === 'LATE',
	).length;

	const handleMemberCheckIn = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!currentSelectedEvent || !checkInInput.trim()) return;
		const res = await checkInToEvent(
			currentSelectedEvent.id,
			checkInInput.trim(),
		);
		if (res.success) {
			setCheckInInput('');
		}
	};

	const handleExportCSV = () => {
		if (!currentSelectedEvent) return;
		exportAttendanceCSV(group, currentSelectedEvent, attendances, users);
	};

	return (
		<main className="grow mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
			{/* Top Actions */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
				<div>
					<h2 className="text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2">
						⏱️ Meeting Attendance Tracker
					</h2>
					<p className="text-xs text-text-muted mt-0.5">
						Self check-in with QR code or link, live roster
						verification, and attendance reports.
					</p>
				</div>

				<div className="flex items-center gap-2">
					{canManage && currentSelectedEvent && (
						<button
							onClick={handleExportCSV}
							className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary shadow-2xs cursor-pointer"
						>
							<FiDownload size={13} /> Export CSV Report
						</button>
					)}
					{canManage && (
						<button
							onClick={onOpenScheduleModal}
							className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm cursor-pointer"
						>
							<FiPlus size={14} /> Schedule Meeting Session
						</button>
					)}
				</div>
			</div>

			{/* Active / Selected Event Card */}
			<AnimatePresence mode="wait">
				{clubEvents.length === 0 ? (
					<motion.div
						key="empty"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10 }}
						transition={{ duration: 0.2 }}
						className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center"
					>
						<div className="mx-auto h-12 w-12 rounded-full bg-primary-light flex items-center justify-center text-primary mb-3">
							<FiClock size={24} />
						</div>
						<h3 className="text-base font-bold text-text-primary">
							No meeting sessions scheduled yet
						</h3>
						<p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
							Officers and Leaders can create a meeting session to
							enable link and QR code attendance check-in for
							members.
						</p>
						{canManage && (
							<button
								onClick={onOpenScheduleModal}
								className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white cursor-pointer hover:bg-primary-hover transition-all"
							>
								Create First Session
							</button>
						)}
					</motion.div>
				) : !currentSelectedEvent ? (
					<motion.div
						key="list"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10 }}
						transition={{ duration: 0.2 }}
						className="space-y-4"
					>
						<div className="flex items-center justify-between">
							<h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
								All Meeting Sessions ({clubEvents.length})
							</h3>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{clubEvents.map((evt) => {
								const evtTurnout = attendances.filter(
									(a) => a.eventId === evt.id,
								).length;

								return (
									<button
										key={evt.id}
										onClick={() =>
											setSelectedEventId(evt.id)
										}
										className="w-full text-left p-5 rounded-2xl border border-border bg-surface hover:border-primary hover:shadow-md transition-all cursor-pointer space-y-3 group"
									>
										<div className="flex items-center justify-between gap-3 min-w-0">
											<span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors truncate shrink min-w-0">
												{evt.title}
											</span>
											{evt.isActive ? (
												<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success-bg text-success border border-success/20 animate-pulse shrink-0 whitespace-nowrap">
													● Active
												</span>
											) : (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-secondary text-text-muted border border-border shrink-0 whitespace-nowrap">
													Closed
												</span>
											)}
										</div>

										<div className="flex items-center gap-2 text-xs text-text-muted">
											<FiCalendar
												size={12}
												className="text-primary shrink-0"
											/>
											<span>
												{evt.date} at {evt.time}
											</span>
										</div>

										{evt.description && (
											<p className="text-xs text-text-muted line-clamp-2 mt-1">
												{evt.description}
											</p>
										)}

										<div className="flex items-center justify-between text-xs text-text-muted border-t border-border/40 pt-2 mt-2">
											<span>
												👥 {evtTurnout} Attendees
											</span>
											{canManage && (
												<span className="font-mono font-semibold text-primary">
													Code: {evt.checkInCode}
												</span>
											)}
										</div>
									</button>
								);
							})}
						</div>
					</motion.div>
				) : (
					<motion.div
						key="detail"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10 }}
						transition={{ duration: 0.2 }}
						className="space-y-4"
					>
						<div className="mb-4">
							<button
								onClick={() => setSelectedEventId(null)}
								className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary/40 shadow-2xs cursor-pointer transition-colors"
							>
								<FiArrowLeft size={13} /> Back to all sessions
							</button>
						</div>

						<div className="w-full space-y-6">
							<div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-5">
								<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border pb-4">
									<div>
										<div className="flex items-center gap-2">
											<span
												className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
													currentSelectedEvent.isActive
														? 'bg-success-bg text-success border border-success/20'
														: 'bg-surface-secondary text-text-muted border border-border'
												}`}
											>
												{currentSelectedEvent.isActive
													? '● Check-in Open'
													: 'Check-in Closed'}
											</span>
											<span className="text-xs text-text-muted">
												{currentSelectedEvent.date} at{' '}
												{currentSelectedEvent.time}
											</span>
										</div>
										<h3 className="text-lg font-bold text-text-primary mt-1.5">
											{currentSelectedEvent.title}
										</h3>
										{currentSelectedEvent.description && (
											<p className="text-xs text-text-secondary mt-1">
												{
													currentSelectedEvent.description
												}
											</p>
										)}
									</div>

									{canManage && (
										<div className="flex items-center gap-2 shrink-0">
											<button
												onClick={() =>
													toggleEventActive(
														currentSelectedEvent.id,
														!currentSelectedEvent.isActive,
													)
												}
												className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary cursor-pointer hover:bg-surface-secondary transition-colors"
											>
												{currentSelectedEvent.isActive
													? 'Close Check-in'
													: 'Open Check-in'}
											</button>
											<button
												onClick={() =>
													setShowDeleteSessionConfirm(
														true,
													)
												}
												className="text-text-muted hover:text-danger p-1.5 cursor-pointer"
												title="Delete meeting session"
											>
												<FiTrash2 size={16} />
											</button>
										</div>
									)}
								</div>

								{/* Sub-tab Navigation */}
								<div className="flex border-b border-border gap-4 pb-0.5 mt-2">
									<button
										onClick={() =>
											setActiveSubTab('roster')
										}
										className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
											activeSubTab === 'roster'
												? 'border-primary text-primary font-bold'
												: 'border-transparent text-text-muted hover:text-text-primary'
										}`}
									>
										👥 Roster &amp; Check-In
									</button>
									<button
										onClick={() => setActiveSubTab('info')}
										className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
											activeSubTab === 'info'
												? 'border-primary text-primary font-bold'
												: 'border-transparent text-text-muted hover:text-text-primary'
										}`}
									>
										ℹ️ Session Details
									</button>
								</div>

								{activeSubTab === 'roster' && (
									<>
										{/* Big Check-in PIN Display / Check-in Form */}
										{canManage ? (
											<div className="rounded-2xl bg-primary-light/50 border border-primary/20 p-5 space-y-4">
												<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-primary/15 pb-3">
													<div>
														<span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
															Meeting Check-In
															Screen
														</span>
														<p className="text-xs text-text-muted mt-0.5">
															Project this PIN or
															QR code on screen
															for attendees.
														</p>
													</div>

													<div className="flex items-center gap-2">
														<Checkbox
															id="toggle-qr-code-checkbox"
															checked={showQRCode}
															onChange={(e) =>
																setShowQRCode(
																	e.target
																		.checked,
																)
															}
															label={
																<span className="text-xs font-bold text-primary select-none">
																	Display
																	Projector QR
																	Code
																</span>
															}
														/>
													</div>
												</div>

												{/* Large QR Code Display for Projector Screens & Smart Boards */}
												<AnimatePresence>
													{showQRCode && (
														<motion.div
															initial={{
																opacity: 0,
																height: 0,
															}}
															animate={{
																opacity: 1,
																height: 'auto',
															}}
															exit={{
																opacity: 0,
																height: 0,
															}}
															transition={{
																duration: 0.3,
															}}
															className="overflow-hidden"
														>
															<div className="rounded-2xl bg-surface border-2 border-primary p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
																<div className="space-y-1">
																	<span className="inline-block bg-primary text-white text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-xs">
																		📱 Scan
																		to Check
																		In
																	</span>
																	<h4 className="text-lg sm:text-xl font-extrabold text-text-primary mt-2">
																		{
																			currentSelectedEvent.title
																		}
																	</h4>
																	<p className="text-xs text-text-muted max-w-sm">
																		Point
																		your
																		phone
																		camera
																		at the
																		QR code
																		to
																		verify
																		your
																		attendance
																		instantly.
																	</p>
																</div>
																{/* Extra Large Crisp Vector QR Code for Projector Screens */}
																<div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200">
																	<QRCodeSVG
																		value={
																			checkInUrl
																		}
																		size={
																			280
																		}
																		fgColor="#0f172a"
																		bgColor="#ffffff"
																	/>
																</div>
																<div className="space-y-2 w-full max-w-md">
																	<div className="bg-surface-secondary/80 border border-border rounded-xl p-3 flex items-center justify-between">
																		<span className="text-xs text-text-muted font-medium">
																			Check-In
																			PIN:
																		</span>
																		<span className="font-mono text-xl sm:text-2xl font-black text-primary tracking-widest">
																			{
																				currentSelectedEvent.checkInCode
																			}
																		</span>
																	</div>

																	<div className="flex gap-2">
																		<button
																			type="button"
																			onClick={() => {
																				if (
																					checkInUrl
																				) {
																					navigator.clipboard.writeText(
																						checkInUrl,
																					);
																					setCopiedLink(
																						true,
																					);
																					setTimeout(
																						() =>
																							setCopiedLink(
																								false,
																							),
																						2000,
																					);
																				}
																			}}
																			className="grow inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all cursor-pointer"
																		>
																			<FiLink
																				size={
																					13
																				}
																			/>
																			<span>
																				{copiedLink
																					? 'Link Copied!'
																					: 'Copy Check-In Link'}
																			</span>
																		</button>
																		<button
																			type="button"
																			onClick={() => {
																				navigator.clipboard.writeText(
																					currentSelectedEvent.checkInCode,
																				);
																				setCopiedPin(
																					true,
																				);
																				setTimeout(
																					() =>
																						setCopiedPin(
																							false,
																						),
																					2000,
																				);
																			}}
																			className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm transition-all cursor-pointer"
																		>
																			<span>
																				{copiedPin
																					? 'PIN Copied!'
																					: 'Copy PIN'}
																			</span>
																		</button>
																	</div>
																</div>
															</div>
														</motion.div>
													)}
												</AnimatePresence>

												{/* PIN Section */}
												{!showQRCode && (
													<div className="space-y-4">
														<div className="flex flex-col items-center justify-center my-4">
															<span className="text-[11px] font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
																Click PIN Code to Copy
															</span>
															<motion.button
																whileHover={{ scale: 1.05 }}
																whileTap={{ scale: 0.95 }}
																type="button"
																onClick={() => {
																	navigator.clipboard.writeText(
																		currentSelectedEvent.checkInCode,
																	);
																	setCopiedPin(
																		true,
																	);
																	setTimeout(
																		() =>
																			setCopiedPin(
																				false,
																			),
																		2000,
																	);
																}}
																className="relative inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-surface-secondary border-2 border-primary/40 hover:border-primary text-3xl sm:text-5xl font-extrabold tracking-widest font-mono text-primary cursor-pointer transition-all shadow-md group"
																title="Click to copy PIN code"
															>
																<span>
																	{
																		currentSelectedEvent.checkInCode
																	}
																</span>
																{copiedPin && (
																	<motion.span
																		initial={{ opacity: 0, y: -5 }}
																		animate={{ opacity: 1, y: 0 }}
																		className="absolute -top-3 right-2 bg-success text-white text-[10px] font-extrabold tracking-normal font-sans px-2 py-0.5 rounded-full shadow-md"
																	>
																		✓ Copied!
																	</motion.span>
																)}
															</motion.button>
														</div>

														{checkInUrl && (
															<div className="flex justify-center">
																<motion.button
																	whileHover={{ scale: 1.03 }}
																	whileTap={{ scale: 0.96 }}
																	onClick={() => {
																		navigator.clipboard.writeText(
																			checkInUrl,
																		);
																		setCopiedLink(
																			true,
																		);
																		setTimeout(
																			() =>
																				setCopiedLink(
																					false,
																				),
																			2000,
																		);
																	}}
																	className="rounded-xl border border-primary/30 bg-surface px-5 py-2 text-xs font-semibold text-primary shadow-2xs cursor-pointer hover:bg-surface-secondary transition-all flex items-center gap-1.5"
																>
																	<FiLink size={13} />
																	<span>
																		{copiedLink
																			? 'Link Copied!'
																			: 'Copy Check-In Link'}
																	</span>
																</motion.button>
															</div>
														)}
													</div>
												)}
											</div>
										) : (
											<div className="rounded-2xl border border-border bg-surface-secondary/30 p-5 space-y-4">
												<div>
													<span className="text-xs font-bold text-text-primary uppercase tracking-wider block">
														Self Check-In
													</span>
													<p className="text-[11px] text-text-muted mt-0.5">
														Enter the 4-digit code provided by your club officer to record attendance.
													</p>
												</div>

												{myAttendance ? (
													<div className="p-4 rounded-xl bg-success-bg border border-success/20 flex items-center justify-between gap-3">
														<div className="space-y-0.5">
															<span className="text-xs font-bold text-success flex items-center gap-1.5">
																<FiCheck /> You are checked in!
															</span>
															<span className="text-[11px] text-text-muted block">
																Recorded as{' '}
																<strong>
																	{
																		myAttendance.status
																	}
																</strong>{' '}
																via{' '}
																{
																	myAttendance.checkInMethod
																}
															</span>
														</div>
													</div>
												) : (
													<form
														onSubmit={
															handleMemberCheckIn
														}
														className="space-y-3"
													>
														<div className="flex gap-2">
															<input
																type="text"
																maxLength={6}
																placeholder="ENTER PIN"
																value={
																	checkInInput
																}
																onChange={(e) =>
																	setCheckInInput(
																		e.target
																			.value,
																	)
																}
																className="grow rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-mono font-bold text-center text-text-primary uppercase tracking-widest focus:ring-2 focus:ring-primary/30 focus:outline-none placeholder:font-sans placeholder:font-normal placeholder:tracking-normal"
															/>
															<motion.button
																whileHover={{ scale: 1.03 }}
																whileTap={{ scale: 0.96 }}
																type="submit"
																disabled={
																	!currentSelectedEvent.isActive ||
																	!checkInInput.trim()
																}
																className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm transition-all disabled:opacity-50 cursor-pointer shrink-0"
															>
																Check In
															</motion.button>
														</div>
														{!currentSelectedEvent.isActive && (
															<p className="text-[11px] text-text-muted italic">
																This meeting session is currently inactive or concluded.
															</p>
														)}
													</form>
												)}
											</div>
										)}

										{/* Live Member Roster Checklist */}
										<div className="space-y-3 pt-4 border-t border-border">
											<div className="flex items-center justify-between">
												<h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
													Meeting Roster &amp; Verification
												</h4>
												<span className="text-xs text-text-muted">
													{canManage
														? 'Officers & Leaders can toggle status below'
														: 'Live member turnout'}
												</span>
											</div>

											<div className="rounded-xl border border-border overflow-hidden">
												<table className="w-full text-left text-xs table-fixed">
													<thead className="bg-surface-secondary/70 border-b border-border text-text-muted text-[11px]">
														<tr>
															<th className="p-3 w-[45%] sm:w-[35%]">
																Member
															</th>
															<th className="p-3 w-[25%] sm:w-[20%]">
																Status
															</th>
															{canManage && (
																<>
																	<th className="p-3 hidden sm:table-cell sm:w-[20%]">
																		Method
																	</th>
																	<th className="p-3 text-right w-[30%] sm:w-[25%]">
																		Actions
																	</th>
																</>
															)}
														</tr>
													</thead>
													<tbody className="divide-y divide-border">
														{rosterMemberIds.map(
															(mId) => {
																const mem =
																	users.find(
																		(u) =>
																			u.id ===
																			mId,
																	);
																const attRecord =
																	sessionAttendances.find(
																		(a) =>
																			a.userId ===
																			mId,
																	);
																const status =
																	attRecord?.status ||
																	'ABSENT';

																return (
																	<tr
																		key={mId}
																		className="hover:bg-surface-secondary/20 transition-colors"
																	>
																		<td className="p-3 font-semibold text-text-primary truncate">
																			<div className="flex items-center gap-2.5 min-w-0">
																				{mem?.avatarUrl ? (
																					<Image
																						src={
																							mem.avatarUrl
																						}
																						alt=""
																						width={
																							28
																						}
																						height={
																							28
																						}
																						className="h-7 w-7 rounded-full object-cover border border-border shrink-0"
																						unoptimized
																					/>
																				) : (
																					<div className="h-7 w-7 rounded-full bg-primary-light text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
																						{mem
																							?.name?.[0] ||
																							'M'}
																					</div>
																				)}
																				<span
																					className="truncate block"
																					title={
																						mem?.name ||
																						'Member'
																					}
																				>
																					{mem?.name ||
																						'Member'}
																				</span>
																			</div>
																		</td>

																		<td className="p-3">
																			{status ===
																				'PRESENT' && (
																				<span className="inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success-bg border border-success/20 px-2 py-0.5 rounded-full whitespace-nowrap">
																					✓ Present
																				</span>
																			)}
																			{status ===
																				'LATE' && (
																				<span className="inline-flex items-center gap-1 text-[10px] font-bold text-warning bg-warning-bg border border-warning/20 px-2 py-0.5 rounded-full whitespace-nowrap">
																					⏰ Late
																				</span>
																			)}
																			{status ===
																				'ABSENT' && (
																				<span className="inline-flex items-center text-[10px] font-medium text-text-muted bg-surface-secondary border border-border px-2 py-0.5 rounded-full whitespace-nowrap">
																					Absent
																				</span>
																			)}
																		</td>

																		{canManage && (
																			<td className="p-3 text-text-muted text-[11px] hidden sm:table-cell truncate">
																				{attRecord?.checkInMethod ||
																					'—'}
																			</td>
																		)}

																		{canManage && (
																			<td className="p-3 text-right whitespace-nowrap">
																				<div className="inline-flex items-center gap-1">
																					<button
																						onClick={() =>
																							updateAttendanceStatus(
																								currentSelectedEvent.id,
																								mId,
																								'PRESENT',
																							)
																						}
																						className={`px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer transition-all ${
																							status ===
																							'PRESENT'
																								? 'bg-success text-white border-success'
																								: 'border-border text-text-secondary hover:text-success'
																						}`}
																					>
																						Present
																					</button>
																					<button
																						onClick={() =>
																							updateAttendanceStatus(
																								currentSelectedEvent.id,
																								mId,
																								'LATE',
																							)
																						}
																						className={`px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer transition-all ${
																							status ===
																							'LATE'
																								? 'bg-warning text-white border-warning'
																								: 'border-border text-text-secondary hover:text-warning'
																						}`}
																					>
																						Late
																					</button>
																					<button
																						onClick={() =>
																							updateAttendanceStatus(
																								currentSelectedEvent.id,
																								mId,
																								'ABSENT',
																							)
																						}
																						className={`px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer transition-all ${
																							status ===
																							'ABSENT'
																								? 'bg-surface-secondary text-text-primary border-border'
																								: 'border-border text-text-muted hover:text-danger'
																						}`}
																					>
																						Absent
																					</button>
																				</div>
																			</td>
																		)}
																	</tr>
																);
															},
														)}
													</tbody>
												</table>
											</div>
										</div>
									</>
								)}

								{activeSubTab === 'info' && (
									<div className="space-y-5 pt-2">
										<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
											{/* Schedule Card */}
											<div className="rounded-2xl border border-border bg-gradient-to-br from-surface to-surface-secondary/40 p-4 space-y-2 shadow-2xs">
												<span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
													<FiCalendar /> Time &amp; Schedule
												</span>
												<div className="text-xs text-text-secondary space-y-1.5">
													<p className="font-semibold text-text-primary">
														{currentSelectedEvent.date}
													</p>
													<p className="text-[11px] text-text-muted flex items-center gap-1">
														<FiClock size={11} /> {currentSelectedEvent.time || '18:00'}
													</p>
												</div>
											</div>

											{/* Location Card */}
											<div className="rounded-2xl border border-border bg-gradient-to-br from-surface to-surface-secondary/40 p-4 space-y-2 shadow-2xs">
												<span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
													<FiMapPin /> Location
												</span>
												<div className="text-xs text-text-secondary space-y-1.5">
													<p className="font-semibold text-text-primary truncate">
														{currentSelectedEvent.location || 'Campus Meeting Room'}
													</p>
													<p className="text-[11px] text-text-muted">
														Campus Venue
													</p>
												</div>
											</div>

											{/* Turnout Stats Card */}
											<div className="rounded-2xl border border-border bg-gradient-to-br from-surface to-surface-secondary/40 p-4 space-y-2 shadow-2xs">
												<span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
													<FiUsers /> Session Turnout
												</span>
												<div className="text-xs text-text-secondary space-y-1.5">
													<p className="font-semibold text-text-primary text-sm">
														{presentCount + lateCount} / {rosterMemberIds.length} members
													</p>
													<p className="text-[11px] text-text-muted">
														{presentCount} Present, {lateCount} Late
													</p>
												</div>
											</div>
										</div>

										{currentSelectedEvent.description && (
											<div className="rounded-2xl border border-border bg-surface-secondary/20 p-4 space-y-1.5">
												<span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
													Meeting Notes &amp; Agenda
												</span>
												<p className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">
													{currentSelectedEvent.description}
												</p>
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<ConfirmModal
				isOpen={showDeleteSessionConfirm}
				title="Delete Meeting Session"
				message="Are you sure you want to delete this meeting session? All recorded attendance and check-ins for this session will be permanently removed."
				confirmText="Delete Session"
				isDestructive
				onConfirm={async () => {
					if (currentSelectedEvent) {
						await deleteMeetingEvent(currentSelectedEvent.id);
						setSelectedEventId(null);
					}
					setShowDeleteSessionConfirm(false);
				}}
				onClose={() => setShowDeleteSessionConfirm(false)}
			/>
		</main>
	);
}
