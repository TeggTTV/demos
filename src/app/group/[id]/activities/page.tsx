/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/components/AppContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { Checkbox } from '@/components/ui/Checkbox';
import {
	FiCalendar,
	FiMapPin,
	FiClock,
	FiCheckCircle,
	FiChevronRight,
	FiGift,
	FiChevronLeft,
	FiList,
	FiArrowLeft,
} from 'react-icons/fi';
import PageLoader from '@/components/ui/PageLoader';
import { motion, AnimatePresence } from 'framer-motion';

export default function GroupActivitiesPage() {
	const { id } = useParams() as { id: string };
	const {
		currentUser,
		groups,
		users,
		events,
		attendances,
		hydrated,
		fetchEvents,
		fetchAttendances,
		fetchGroups,
	} = useAppContext();
	const router = useRouter();

	const [showBirthdays, setShowBirthdays] = useState(true);
	const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
	const [currentMonth, setCurrentMonth] = useState(new Date(2026, 7)); // Default to August 2026 to match mockup
	const [rsvpSuccess, setRsvpSuccess] = useState<string | null>(null);

	const group = groups.find((g) => g.id === id);

	useEffect(() => {
		fetchGroups();
		fetchEvents(id, 'activity');
		fetchAttendances(id);
	}, [fetchGroups, fetchEvents, fetchAttendances, id]);

	if (!hydrated) {
		return (
			<div className="flex min-h-screen flex-col bg-background">
				<Nav />
				<main className="grow flex items-center justify-center py-20">
					<PageLoader
						message="Loading Club Activities"
						subMessage="Syncing schedules and calendar..."
					/>
				</main>
				<Footer />
			</div>
		);
	}

	if (!currentUser || !group) {
		return (
			<div className="flex min-h-screen flex-col bg-background">
				<Nav />
				<main className="grow flex items-center justify-center p-6 text-center">
					<div>
						<h2 className="text-xl font-bold text-text-primary">
							Club Not Found
						</h2>
						<p className="text-xs text-text-muted mt-1">
							The club does not exist or you lack permission.
						</p>
						<button
							onClick={() => router.push('/groups')}
							className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white"
						>
							Back to My Clubs
						</button>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	// Security / Privacy check: only members can view private groups
	const isMember =
		group.memberIds.includes(currentUser.id) ||
		group.leaderId === currentUser.id;
	if (group.isPrivate && !isMember) {
		return (
			<div className="flex min-h-screen flex-col bg-background">
				<Nav />
				<main className="grow flex items-center justify-center p-6 text-center">
					<div>
						<h2 className="text-xl font-bold text-text-primary">
							Private Club
						</h2>
						<p className="text-xs text-text-muted mt-1">
							This club is private. Only approved members can view
							its activities.
						</p>
						<button
							onClick={() => router.push('/groups')}
							className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white"
						>
							Go back
						</button>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	// Helper to format weekday in Dutch to match mockup (or fallback English)
	const getEnglishWeekday = (date: Date) => {
		const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		return days[date.getDay()];
	};

	const getEnglishMonth = (date: Date) => {
		const months = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec',
		];
		return months[date.getMonth()];
	};

	// RSVP handler
	const handleRSVP = async (
		eventId: string,
		status: 'RSVP_YES' | 'RSVP_NO' | 'RSVP_MAYBE',
	) => {
		try {
			const res = await fetch('/api/attendance', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					eventId,
					userId: currentUser.id,
					status,
					checkInMethod: 'MANUAL',
				}),
			});
			const data = await res.json();
			if (data.success) {
				setRsvpSuccess('RSVP updated successfully!');
				setTimeout(() => setRsvpSuccess(null), 2500);
				fetchAttendances(id); // Refresh counts
			}
		} catch (e) {
			console.error('RSVP failed:', e);
		}
	};

	// 1. Gather all regular club activities (excluding attendance tracking sessions)
	const clubEvents = events
		.filter(
			(e) =>
				e.groupId === id &&
				!e.isAttendanceSession &&
				e.eventType !== 'ATTENDANCE_SESSION',
		)
		.map((e) => ({
			...e,
			isBirthday: false,
			dateTime: new Date(`${e.date}T${e.time || '00:00'}`),
		}));

	// 2. Gather birthdays of group members
	const birthdayEvents: any[] = [];
	if (showBirthdays) {
		const groupMembers = users.filter(
			(u) => group.memberIds.includes(u.id) || group.leaderId === u.id,
		);

		groupMembers.forEach((mem) => {
			if (mem.birthday) {
				const bParts = mem.birthday.split('-');
				if (bParts.length === 3) {
					const birthYear = parseInt(bParts[0]);
					const birthMonth = parseInt(bParts[1]) - 1;
					const birthDay = parseInt(bParts[2]);

					// Generate birthday for target calendar year (e.g. 2026)
					const bDate = new Date(2026, birthMonth, birthDay);
					const age = 2026 - birthYear;

					birthdayEvents.push({
						id: `bday_${mem.id}_${mem.birthday}`,
						isBirthday: true,
						title: mem.name,
						date: `2026-${String(birthMonth + 1).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`,
						dateTime: bDate,
						age,
					});
				}
			}
		});
	}

	// 3. Merge and sort chronologically
	const timelineItems = [...clubEvents, ...birthdayEvents].sort(
		(a, b) => a.dateTime.getTime() - b.dateTime.getTime(),
	);

	// Group timeline items by month (e.g., "aug. 2026")
	const groupedByMonth: { [key: string]: any[] } = {};
	timelineItems.forEach((item) => {
		const mStr = `${getEnglishMonth(item.dateTime)} ${item.dateTime.getFullYear()}`;
		if (!groupedByMonth[mStr]) {
			groupedByMonth[mStr] = [];
		}
		groupedByMonth[mStr].push(item);
	});

	// Calendar View math
	const daysInMonth = new Date(
		currentMonth.getFullYear(),
		currentMonth.getMonth() + 1,
		0,
	).getDate();
	const firstDayIndex = new Date(
		currentMonth.getFullYear(),
		currentMonth.getMonth(),
		1,
	).getDay(); // 0 is Sunday
	const prevDaysInMonth = new Date(
		currentMonth.getFullYear(),
		currentMonth.getMonth(),
		0,
	).getDate();

	const prevMonthDays = [];
	// Adjust so Monday is first day of the week
	const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
	for (let i = startDay - 1; i >= 0; i--) {
		prevMonthDays.push(prevDaysInMonth - i);
	}

	const currentMonthDays = [];
	for (let i = 1; i <= daysInMonth; i++) {
		currentMonthDays.push(i);
	}

	const nextMonthDays = [];
	const totalCells = 42; // 6 rows
	const remainingCells =
		totalCells - (prevMonthDays.length + currentMonthDays.length);
	for (let i = 1; i <= remainingCells; i++) {
		nextMonthDays.push(i);
	}

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Nav />

			<main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
				{/* Back Button */}
				<button
					onClick={() => router.push(`/group/${id}/feed`)}
					className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
				>
					<FiArrowLeft /> Back to Club Hub
				</button>

				{/* Header Section */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
					<div>
						<h1 className="text-2xl font-bold text-text-primary tracking-tight">
							Activities
						</h1>
						<p className="text-xs text-text-muted mt-1">
							Club activities for {group.name}
						</p>
					</div>

					{/* Filters on Right */}
					<div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
						{/* Birthdays Checkbox */}
						<Checkbox
							checked={showBirthdays}
							onChange={(e) => setShowBirthdays(e.target.checked)}
							label={
								<span className="font-semibold text-xs text-text-secondary">
									Show birthdays
								</span>
							}
						/>

						{/* View Switcher */}
						<div className="flex items-center border border-border rounded-lg bg-surface p-1 shadow-2xs">
							<button
								onClick={() => setViewMode('list')}
								className={`p-1.5 rounded-md transition-all cursor-pointer ${
									viewMode === 'list'
										? 'bg-primary text-white shadow-2xs'
										: 'text-text-muted hover:text-text-primary'
								}`}
								title="List View"
							>
								<FiList size={14} />
							</button>
							<button
								onClick={() => setViewMode('calendar')}
								className={`p-1.5 rounded-md transition-all cursor-pointer ${
									viewMode === 'calendar'
										? 'bg-primary text-white shadow-2xs'
										: 'text-text-muted hover:text-text-primary'
								}`}
								title="Calendar View"
							>
								<FiCalendar size={14} />
							</button>
						</div>
					</div>
				</div>

				{/* RSVP Success Alert */}
				{rsvpSuccess && (
					<div className="text-xs text-success bg-success-bg border border-success/20 p-3 rounded-xl flex items-center gap-2 font-medium">
						<FiCheckCircle className="shrink-0" />
						<span>{rsvpSuccess}</span>
					</div>
				)}

				{/* MAIN VIEWPORT */}
				<AnimatePresence mode="wait">
					{viewMode === 'list' ? (
						<motion.div
							key="list"
							initial={{ opacity: 0, y: 5 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -5 }}
							className="space-y-8"
						>
							{Object.keys(groupedByMonth).length === 0 ? (
								<div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-text-muted italic text-xs">
									No activities scheduled yet.
								</div>
							) : (
								Object.keys(groupedByMonth).map(
									(monthHeader) => (
										<div
											key={monthHeader}
											className="space-y-4"
										>
											{/* Month Title */}
											<h3 className="text-xs font-bold text-primary tracking-wide uppercase px-1 border-l-2 border-primary pl-2">
												{monthHeader}
											</h3>

											{/* Month Items */}
											<div className="divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden shadow-2xs">
												{groupedByMonth[
													monthHeader
												].map((item) => {
													const dateObj =
														item.dateTime;
													const isUserGoing =
														attendances.some(
															(a) =>
																a.eventId ===
																	item.id &&
																a.userId ===
																	currentUser.id &&
																(a.status ===
																	'RSVP_YES' ||
																	a.status ===
																		'PRESENT'),
														);

													if (item.isBirthday) {
														return (
															<div
																key={item.id}
																className="flex items-center justify-between p-4 hover:bg-pink-500/5 transition-colors group"
															>
																<div className="flex items-center gap-4">
																	{/* Date Circle */}
																	<div className="text-center w-16 shrink-0 border-r border-border/60 pr-4">
																		<span className="block text-[10px] font-bold text-pink-500 uppercase">
																			{getEnglishWeekday(
																				dateObj,
																			)}
																		</span>
																		<span className="block text-2xl font-extrabold text-pink-500/90 leading-tight">
																			{dateObj.getDate()}
																		</span>
																		<span className="block text-[9px] text-text-muted font-medium">
																			{getEnglishMonth(
																				dateObj,
																			)}
																		</span>
																	</div>

																	{/* Birthday Content */}
																	<div>
																		<div className="flex items-center gap-1.5 font-bold text-text-primary text-sm">
																			<FiGift
																				className="text-pink-500 animate-bounce"
																				size={
																					14
																				}
																			/>
																			<span>
																				{
																					item.title
																				}
																			</span>
																		</div>
																		<span className="text-xs text-text-muted mt-0.5 block font-medium">
																			Turns{' '}
																			{
																				item.age
																			}{' '}
																			years
																			old
																		</span>
																	</div>
																</div>
																<FiChevronRight className="text-text-muted/40 group-hover:text-pink-500 transition-colors" />
															</div>
														);
													}

													// Regular Activity Counts
													const evAtts =
														attendances.filter(
															(a) =>
																a.eventId ===
																item.id,
														);
													const yesCount =
														evAtts.filter(
															(a) =>
																a.status ===
																	'RSVP_YES' ||
																a.status ===
																	'PRESENT',
														).length;
													const noCount =
														evAtts.filter(
															(a) =>
																a.status ===
																	'RSVP_NO' ||
																a.status ===
																	'ABSENT',
														).length;
													const maybeCount =
														evAtts.filter(
															(a) =>
																a.status ===
																	'RSVP_MAYBE' ||
																a.status ===
																	'EXCUSED',
														).length;

													return (
														<div
															key={item.id}
															className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 hover:bg-surface-secondary/20 transition-colors group"
														>
															<div className="flex items-start gap-4">
																{/* Date Circle */}
																<div className="text-center w-16 shrink-0 border-r border-border/60 pr-4 mt-1">
																	<span className="block text-[10px] font-bold text-primary uppercase">
																		{getEnglishWeekday(
																			dateObj,
																		)}
																	</span>
																	<span className="block text-2xl font-extrabold text-text-primary leading-tight">
																		{dateObj.getDate()}
																	</span>
																	<span className="block text-[9px] text-text-muted font-medium">
																		{getEnglishMonth(
																			dateObj,
																		)}
																	</span>
																</div>

																{/* Activity Details */}
																<div className="space-y-1">
																	<div className="flex flex-wrap items-center gap-2">
																		<span className="font-bold text-text-primary text-sm group-hover:text-primary transition-colors">
																			{
																				item.title
																			}
																		</span>
																		{item.status ===
																			'NOT_SENT' && (
																			<span className="text-[9px] font-bold bg-primary/20 text-primary-200 px-1.5 py-0.5 rounded-md">
																				Draft
																				/
																				Not
																				sent
																			</span>
																		)}
																	</div>

																	<div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-text-muted font-medium">
																		<span className="flex items-center gap-1">
																			<FiCalendar
																				size={
																					11
																				}
																			/>
																			{
																				item.date
																			}{' '}
																			{item.endDate
																				? `- ${item.endDate}`
																				: ''}
																		</span>
																		<span className="flex items-center gap-1">
																			<FiClock
																				size={
																					11
																				}
																			/>
																			{item.time ||
																				'All Day'}
																		</span>
																		{item.location && (
																			<span className="flex items-center gap-1">
																				<FiMapPin
																					size={
																						11
																					}
																				/>
																				{
																					item.location
																				}
																			</span>
																		)}
																	</div>

																	{/* Attending stats */}
																	<div className="flex items-center gap-2 pt-1 text-[10px] font-bold text-text-muted">
																		<span className="text-success flex items-center gap-0.5">
																			✓{' '}
																			{
																				yesCount
																			}
																		</span>
																		<span className="text-danger flex items-center gap-0.5">
																			✗{' '}
																			{
																				noCount
																			}
																		</span>
																		<span className="text-warning flex items-center gap-0.5">
																			o{' '}
																			{
																				maybeCount
																			}
																		</span>
																	</div>
																</div>
															</div>

															{/* RSVP Toggles & Pricing */}
															<div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 border-border/40 pt-3 sm:pt-0">
																{/* Price Badge */}
																{item.price && (
																	<span className="text-[10px] font-bold bg-primary/20 text-primary-200 px-2 py-0.5 rounded-lg shadow-2xs mb-0.5">
																		{item.price.includes(
																			'p',
																		)
																			? item.price
																			: `$${item.price} p/p`}
																	</span>
																)}

																{/* RSVP button */}
																<div className="flex items-center gap-1">
																	<button
																		onClick={() =>
																			handleRSVP(
																				item.id,
																				isUserGoing
																					? 'RSVP_NO'
																					: 'RSVP_YES',
																			)
																		}
																		className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all cursor-pointer shadow-2xs ${
																			isUserGoing
																				? 'bg-success text-white hover:bg-success/80'
																				: 'border border-border bg-surface text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
																		}`}
																	>
																		<FiCheckCircle
																			size={
																				11
																			}
																		/>
																		<span>
																			{isUserGoing
																				? 'Going'
																				: 'RSVP'}
																		</span>
																	</button>
																</div>
															</div>
														</div>
													);
												})}
											</div>
										</div>
									),
								)
							)}
						</motion.div>
					) : (
						<motion.div
							key="calendar"
							initial={{ opacity: 0, y: 5 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -5 }}
							className="bg-surface border border-border rounded-2xl p-6 shadow-2xs space-y-4"
						>
							{/* Month Switcher */}
							<div className="flex items-center justify-between border-b border-border pb-4">
								<h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
									{getEnglishMonth(currentMonth)}{' '}
									{currentMonth.getFullYear()}
								</h3>
								<div className="flex items-center gap-1.5">
									<button
										onClick={() =>
											setCurrentMonth(
												new Date(
													currentMonth.getFullYear(),
													currentMonth.getMonth() - 1,
												),
											)
										}
										className="p-1.5 rounded-lg border border-border bg-surface text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
									>
										<FiChevronLeft size={14} />
									</button>
									<button
										onClick={() =>
											setCurrentMonth(
												new Date(
													currentMonth.getFullYear(),
													currentMonth.getMonth() + 1,
												),
											)
										}
										className="p-1.5 rounded-lg border border-border bg-surface text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
									>
										<FiChevronRight size={14} />
									</button>
								</div>
							</div>

							{/* Grid */}
							<div className="grid grid-cols-7 gap-1 text-center font-semibold text-[10px] text-text-muted uppercase tracking-wider mb-2">
								<div>Ma</div>
								<div>Di</div>
								<div>Wo</div>
								<div>Do</div>
								<div>Vr</div>
								<div>Za</div>
								<div>Zo</div>
							</div>

							<div className="grid grid-cols-7 gap-1 border-t border-border/40 pt-1">
								{/* Prev Month Cells */}
								{prevMonthDays.map((day, idx) => (
									<div
										key={`prev_${idx}`}
										className="h-16 border border-border/20 rounded-lg p-1 text-left bg-surface-secondary/20 text-text-muted opacity-40 text-[10px]"
									>
										{day}
									</div>
								))}

								{/* Current Month Cells */}
								{currentMonthDays.map((day) => {
									const dateStr = `2026-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
									const dayEvents = timelineItems.filter(
										(item) => {
											if (item.isBirthday) {
												return item.date === dateStr;
											} else {
												return item.date === dateStr;
											}
										},
									);

									return (
										<div
											key={`curr_${day}`}
											className="h-16 border border-border rounded-lg p-1 text-left bg-surface hover:bg-surface-secondary/40 transition-colors text-[10px] flex flex-col justify-between overflow-hidden"
										>
											<span className="font-bold text-text-secondary">
												{day}
											</span>
											<div className="space-y-0.5 mt-1 overflow-y-auto max-h-10">
												{dayEvents.map((ev) => (
													<div
														key={ev.id}
														className={`text-[8px] font-bold px-1 py-0.5 rounded-sm truncate ${
															ev.isBirthday
																? 'bg-pink-500/10 text-pink-500 border border-pink-500/20'
																: 'bg-primary-light text-primary border border-primary/20'
														}`}
														title={ev.title}
													>
														{ev.isBirthday
															? `🎂 ${ev.title}`
															: ev.title}
													</div>
												))}
											</div>
										</div>
									);
								})}

								{/* Next Month Cells */}
								{nextMonthDays.map((day, idx) => (
									<div
										key={`next_${idx}`}
										className="h-16 border border-border/20 rounded-lg p-1 text-left bg-surface-secondary/20 text-text-muted opacity-40 text-[10px]"
									>
										{day}
									</div>
								))}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</main>
			<Footer />
		</div>
	);
}
