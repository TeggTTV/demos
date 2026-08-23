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
	FiCheckCircle,
	FiLink,
} from 'react-icons/fi';
import { Group, User, MeetingEvent, AttendanceRecord } from '@/types/models';
import { exportAttendanceCSV } from '@/utils/csvExport';
import QRCodeSVG from '@/components/ui/QRCode';
import { Checkbox } from '@/components/ui/Checkbox';

interface ClubAttendanceTabProps {
	group: Group;
	currentUser: User;
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
	const [checkInResult, setCheckInResult] = useState<{
		success?: boolean;
		message?: string;
		error?: string;
	} | null>(null);

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

	const eventAttendances = currentSelectedEvent
		? attendances.filter((a) => a.eventId === currentSelectedEvent.id)
		: [];

	const userIsCheckedIn = Boolean(
		currentSelectedEvent &&
		attendances.some(
			(a) =>
				a.eventId === currentSelectedEvent.id &&
				a.userId === currentUser.id &&
				(a.status === 'PRESENT' || a.status === 'LATE'),
		),
	);

	const getUserName = (uid: string) =>
		users.find((u) => u.id === uid)?.name || 'Club Member';

	const handleSelfCheckIn = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!currentSelectedEvent || !checkInInput.trim()) return;
		const res = await checkInToEvent(
			currentSelectedEvent.id,
			checkInInput.trim(),
		);
		setCheckInResult(res);
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
										<div className="flex items-center justify-between">
											<span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors truncate">
												{evt.title}
											</span>
											{evt.isActive ? (
												<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success-bg text-success border border-success/20 animate-pulse">
													● Active
												</span>
											) : (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-secondary text-text-muted border border-border">
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
												onClick={() => {
													if (
														confirm(
															'Are you sure you want to delete this meeting session?',
														)
													) {
														deleteMeetingEvent(
															currentSelectedEvent.id,
														);
													}
												}}
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
													<div>
														<div className="my-3 text-center">
															<span className="text-3xl sm:text-5xl font-extrabold tracking-widest font-mono text-primary select-all">
																{
																	currentSelectedEvent.checkInCode
																}
															</span>
														</div>
														<div className="flex gap-2 mt-3">
															<button
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
																className="grow rounded-lg bg-primary py-2 text-xs font-semibold text-white shadow-2xs cursor-pointer hover:bg-primary-hover transition-all"
															>
																{copiedPin
																	? 'Copied Code!'
																	: 'Copy PIN Code'}
															</button>
															{checkInUrl && (
																<button
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
																	className="rounded-lg border border-primary/30 bg-surface px-4 py-2 text-xs font-semibold text-primary shadow-2xs cursor-pointer hover:bg-surface-secondary transition-all flex items-center gap-1.5"
																>
																	<FiLink
																		size={
																			13
																		}
																	/>
																	<span>
																		{copiedLink
																			? 'Link Copied!'
																			: 'Copy Link'}
																	</span>
																</button>
															)}
														</div>
													</div>
												)}
											</div>
										) : (
											<div className="rounded-2xl border border-border bg-surface-secondary/30 p-5 space-y-4">
												<div>
													<span className="text-xs font-bold text-text-primary uppercase tracking-wider block">
														Self Check-In
													</span>
													<p className="text-xs text-text-muted mt-0.5">
														Enter the check-in PIN
														displayed by club
														officers on the
														projector/smart board or
														scan the QR code to
														verify your attendance.
													</p>
												</div>

												{userIsCheckedIn ? (
													<div className="py-4 text-center rounded-xl bg-success-bg border border-success/20">
														<span className="text-sm font-bold text-success flex items-center justify-center gap-2">
															<FiCheckCircle
																size={20}
															/>
															You are checked into
															this meeting!
														</span>
													</div>
												) : (
													<form
														onSubmit={
															handleSelfCheckIn
														}
														className="space-y-3 max-w-md"
													>
														{checkInResult?.error && (
															<div className="text-xs text-danger bg-danger-bg border border-danger/20 p-2.5 rounded-xl text-center font-medium">
																{
																	checkInResult.error
																}
															</div>
														)}
														<div className="flex items-center gap-2">
															<input
																type="text"
																required
																placeholder="Enter PIN"
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
															<button
																type="submit"
																disabled={
																	!currentSelectedEvent.isActive ||
																	!checkInInput.trim()
																}
																className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm transition-all disabled:opacity-50 cursor-pointer shrink-0"
															>
																Check In
															</button>
														</div>
														{!currentSelectedEvent.isActive && (
															<p className="text-[11px] text-text-muted italic">
																This meeting
																session is
																currently
																inactive or
																concluded.
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
													Meeting Roster &amp;
													Verification
												</h4>
												<span className="text-xs text-text-muted">
													{canManage
														? 'Officers & Leaders can toggle status below'
														: 'Live member turnout'}
												</span>
											</div>

											<div className="rounded-xl border border-border overflow-hidden">
												<table className="w-full text-left text-xs">
													<thead className="bg-surface-secondary/70 border-b border-border text-text-muted text-[11px]">
														<tr>
															<th className="p-3">
																Member
															</th>
															<th className="p-3">
																Status
															</th>
															{canManage && (
																<>
																	<th className="p-3 hidden sm:table-cell">
																		Method
																	</th>
																	<th className="p-3 text-right">
																		Officer
																		Actions
																	</th>
																</>
															)}
														</tr>
													</thead>
													<tbody className="divide-y divide-border">
														{group.memberIds.map(
															(mId) => {
																const memberUser =
																	users.find(
																		(u) =>
																			u.id ===
																			mId,
																	);
																const attRecord =
																	eventAttendances.find(
																		(a) =>
																			a.userId ===
																			mId,
																	);
																const status =
																	attRecord?.status ||
																	'ABSENT';

																return (
																	<tr
																		key={
																			mId
																		}
																		className="hover:bg-surface-secondary/30 transition-colors"
																	>
																		<td className="p-3 flex items-center gap-2">
																			{memberUser?.avatarUrl ? (
																				<Image
																					src={
																						memberUser.avatarUrl
																					}
																					alt=""
																					width={
																						24
																					}
																					height={
																						24
																					}
																					className="h-6 w-6 rounded-full object-cover border border-border"
																					unoptimized
																				/>
																			) : (
																				<div className="h-6 w-6 rounded-full bg-primary-light text-primary flex items-center justify-center text-[10px] font-bold">
																					{memberUser
																						?.name?.[0] ||
																						'M'}
																				</div>
																			)}
																			<div>
																				<span className="font-semibold text-text-primary block">
																					{memberUser?.name ||
																						'Member'}
																				</span>
																				<span className="text-[10px] text-text-muted">
																					{
																						memberUser?.email
																					}
																				</span>
																			</div>
																		</td>

																		<td className="p-3">
																			<span
																				className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
																					status ===
																					'PRESENT'
																						? 'bg-success-bg text-success border border-success/20'
																						: status ===
																							  'LATE'
																							? 'bg-warning-bg text-warning border border-warning/20'
																							: status ===
																								  'EXCUSED'
																								? 'bg-primary-light text-primary border border-primary/20'
																								: 'bg-surface-secondary text-text-muted border border-border'
																				}`}
																			>
																				{
																					status
																				}
																			</span>
																		</td>

																		{canManage && (
																			<td className="p-3 text-text-muted hidden sm:table-cell text-[11px]">
																				{attRecord?.checkInMethod ||
																					'—'}
																			</td>
																		)}

																		{canManage && (
																			<td className="p-3 text-right">
																				<div className="inline-flex items-center gap-1">
																					<button
																						onClick={() =>
																							updateAttendanceStatus(
																								currentSelectedEvent.id,
																								mId,
																								'PRESENT',
																							)
																						}
																						className={`px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer ${
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
																						className={`px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer ${
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
																								'EXCUSED',
																							)
																						}
																						className={`px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer ${
																							status ===
																							'EXCUSED'
																								? 'bg-primary text-white border-primary'
																								: 'border-border text-text-secondary hover:text-primary'
																						}`}
																					>
																						Excused
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
									<div className="space-y-4 pt-2">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="rounded-xl border border-border bg-surface-secondary/20 p-4 space-y-3">
												<span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
													Time &amp; Location
												</span>
												<div className="text-xs text-text-secondary space-y-2">
													<p className="flex items-center gap-2">
														📅{' '}
														<strong>Date:</strong>{' '}
														{
															currentSelectedEvent.date
														}
													</p>
													<p className="flex items-center gap-2">
														⏰{' '}
														<strong>
															Start Time:
														</strong>{' '}
														{
															currentSelectedEvent.time
														}
													</p>
													{currentSelectedEvent.endDate && (
														<p className="flex items-center gap-2">
															📅{' '}
															<strong>
																End Date:
															</strong>{' '}
															{
																currentSelectedEvent.endDate
															}
														</p>
													)}
													<p className="flex items-center gap-2">
														📍{' '}
														<strong>
															Location:
														</strong>{' '}
														{currentSelectedEvent.location ||
															'Campus Center'}
													</p>
												</div>
											</div>

											<div className="rounded-xl border border-border bg-surface-secondary/20 p-4 space-y-3">
												<span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
													Session Status &amp; Cost
												</span>
												<div className="text-xs text-text-secondary space-y-2">
													<p className="flex items-center gap-2">
														💵{' '}
														<strong>Price:</strong>{' '}
														{currentSelectedEvent.price
															? `$${currentSelectedEvent.price}`
															: 'Free'}
													</p>
													<p className="flex items-center gap-2">
														🔔{' '}
														<strong>Status:</strong>{' '}
														{currentSelectedEvent.status ===
														'CLOSED'
															? 'Closed'
															: currentSelectedEvent.status ===
																  'PUBLISHED'
																? 'Published'
																: 'Draft / Not sent'}
													</p>
													<p className="flex items-center gap-2">
														👤{' '}
														<strong>
															Created By:
														</strong>{' '}
														{getUserName(
															currentSelectedEvent.createdById,
														)}
													</p>
												</div>
											</div>
										</div>

										{currentSelectedEvent.description && (
											<div className="rounded-xl border border-border bg-surface-secondary/20 p-4 space-y-2">
												<span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
													Description
												</span>
												<p className="text-xs text-text-secondary whitespace-pre-wrap">
													{
														currentSelectedEvent.description
													}
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
		</main>
	);
}
