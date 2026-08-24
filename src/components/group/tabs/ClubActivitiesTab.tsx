'use client';

import {
	FiPlus,
	FiGift,
	FiChevronRight,
	FiCalendar,
	FiClock,
	FiMapPin,
	FiCheckCircle,
} from 'react-icons/fi';
import { Group, User, MeetingEvent, AttendanceRecord } from '@/types/models';
import { getEnglishWeekday, getEnglishMonth } from '@/utils/dateUtils';

interface ClubActivitiesTabProps {
	group: Group;
	currentUser: User | null;
	users: User[];
	clubActivities: MeetingEvent[];
	attendances: AttendanceRecord[];
	canManage: boolean;
	showBirthdaysTab: boolean;
	setShowBirthdaysTab: (val: boolean) => void;
	onOpenCreateModal: () => void;
	onEditActivity: (activity: MeetingEvent) => void;
	onDeleteActivity: (activityId: string) => Promise<void>;
	onRSVP: (eventId: string, status: string) => Promise<void>;
}

export default function ClubActivitiesTab({
	group,
	currentUser,
	users,
	clubActivities,
	attendances,
	canManage,
	showBirthdaysTab,
	onOpenCreateModal,
	onEditActivity,
	onDeleteActivity,
	onRSVP,
}: ClubActivitiesTabProps) {
	// Gather and sort items
	const clubEvts = clubActivities.map((e) => ({
		...e,
		isBirthday: false as const,
		dateTime: new Date(`${e.date}T${e.time || '00:00'}`),
	}));

	interface BirthdayEvent {
		id: string;
		isBirthday: true;
		title: string;
		date: string;
		dateTime: Date;
		age: number;
	}

	const bdayEvts: BirthdayEvent[] = [];
	if (showBirthdaysTab) {
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

					const bDate = new Date(2026, birthMonth, birthDay);
					const age = 2026 - birthYear;

					bdayEvts.push({
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

	type TimelineItem =
		| (MeetingEvent & { isBirthday: false; dateTime: Date })
		| BirthdayEvent;

	const items: TimelineItem[] = [...clubEvts, ...bdayEvts].sort(
		(a, b) => a.dateTime.getTime() - b.dateTime.getTime(),
	);

	const grouped: { [key: string]: TimelineItem[] } = {};
	items.forEach((item) => {
		const mStr = `${getEnglishMonth(item.dateTime)} ${item.dateTime.getFullYear()}`;
		if (!grouped[mStr]) grouped[mStr] = [];
		grouped[mStr].push(item);
	});

	return (
		<main className="grow mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
				<div>
					<h2 className="text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2">
						📅 Activities &amp; Schedule
					</h2>
					<p className="text-xs text-text-muted mt-0.5">
						{canManage
							? 'Manage activities, schedule sessions, and track RSVPs.'
							: 'View club activity schedule and RSVP to upcoming events.'}
					</p>
				</div>

				<div className="flex items-center gap-3">
					{/* <Checkbox
						checked={showBirthdaysTab}
						onChange={(e) => setShowBirthdaysTab(e.target.checked)}
						label={
							<span className="font-semibold text-xs text-text-secondary">
								Show birthdays
							</span>
						}
					/> */}

					{canManage && (
						<button
							onClick={onOpenCreateModal}
							className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm cursor-pointer"
						>
							<FiPlus size={14} /> Add Activity
						</button>
					)}
				</div>
			</div>

			{items.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-text-muted italic text-xs">
					No activities scheduled yet.
				</div>
			) : (
				Object.keys(grouped).map((monthHeader) => (
					<div key={monthHeader} className="space-y-4">
						<h3 className="text-xs font-bold text-primary tracking-wide uppercase px-1 border-l-2 border-primary pl-2">
							{monthHeader}
						</h3>

						<div className="divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden shadow-2xs">
							{grouped[monthHeader].map((item) => {
								const dateObj = item.dateTime;

								if (item.isBirthday) {
									return (
										<div
											key={item.id}
											className="flex items-center justify-between p-4 hover:bg-pink-500/5 transition-colors group"
										>
											<div className="flex items-center gap-4">
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
												<div>
													<div className="flex items-center gap-1.5 font-bold text-text-primary text-sm">
														<FiGift
															className="text-pink-500"
															size={14}
														/>
														<span>
															{item.title}
														</span>
													</div>
													<span className="text-xs text-text-muted mt-0.5 block font-medium">
														Turns {item.age} years
														old
													</span>
												</div>
											</div>
											<FiChevronRight className="text-text-muted/40" />
										</div>
									);
								}

								const isUserGoing = attendances.some(
									(a) =>
										a.eventId === item.id &&
										a.userId === currentUser?.id &&
										(a.status === 'RSVP_YES' ||
											a.status === 'PRESENT'),
								);
								const evAtts = attendances.filter(
									(a) => a.eventId === item.id,
								);
								const yesCount = evAtts.filter(
									(a) =>
										a.status === 'RSVP_YES' ||
										a.status === 'PRESENT',
								).length;
								const noCount = evAtts.filter(
									(a) =>
										a.status === 'RSVP_NO' ||
										a.status === 'ABSENT',
								).length;
								const maybeCount = evAtts.filter(
									(a) =>
										a.status === 'RSVP_MAYBE' ||
										a.status === 'EXCUSED',
								).length;

								return (
									<div
										key={item.id}
										className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 hover:bg-surface-secondary/20 transition-colors group"
									>
										<div className="flex items-start gap-4">
											<div className="text-center w-16 shrink-0 border-r border-border/60 pr-4 mt-1">
												<span className="block text-[10px] font-bold text-primary uppercase">
													{getEnglishWeekday(dateObj)}
												</span>
												<span className="block text-2xl font-extrabold text-text-primary leading-tight">
													{dateObj.getDate()}
												</span>
												<span className="block text-[9px] text-text-muted font-medium">
													{getEnglishMonth(dateObj)}
												</span>
											</div>

											<div className="space-y-1">
												<div className="flex flex-wrap items-center gap-2">
													<span className="font-bold text-text-primary text-sm group-hover:text-primary transition-colors">
														{item.title}
													</span>
													{item.status ===
														'NOT_SENT' && (
														<span className="text-[9px] font-bold bg-primary-light text-primary px-1.5 py-0.5 rounded-md border border-primary/20">
															Draft / Not sent
														</span>
													)}
												</div>

												<div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-text-muted font-medium">
													<span className="flex items-center gap-1">
														<FiCalendar size={11} />
														{item.date}{' '}
														{item.endDate
															? `- ${item.endDate}`
															: ''}
													</span>
													<span className="flex items-center gap-1">
														<FiClock size={11} />
														{item.time || 'All Day'}
													</span>
													{item.location && (
														<span className="flex items-center gap-1">
															<FiMapPin
																size={11}
															/>
															{item.location}
														</span>
													)}
												</div>

												<div className="flex items-center gap-2 pt-1 text-[10px] font-bold text-text-muted">
													<span className="text-success flex items-center gap-0.5">
														✓ {yesCount}
													</span>
													<span className="text-danger flex items-center gap-0.5">
														✗ {noCount}
													</span>
													<span className="text-warning flex items-center gap-0.5">
														o {maybeCount}
													</span>
												</div>
											</div>
										</div>

										<div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 border-border/40 pt-3 sm:pt-0">
											{item.price && (
												<span className="text-[10px] font-bold bg-primary-light text-primary px-2 py-0.5 rounded-lg border border-primary/20 shadow-2xs">
													{item.price.includes('p')
														? item.price
														: `$${item.price} p/p`}
												</span>
											)}

											<div className="flex items-center gap-1.5">
												{canManage ? (
													<>
														<button
															onClick={() =>
																onEditActivity(
																	item,
																)
															}
															className="p-1.5 rounded-lg border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all cursor-pointer"
															title="Edit Activity"
														>
															✏️
														</button>
														<button
															onClick={() =>
																onDeleteActivity(
																	item.id,
																)
															}
															className="p-1.5 rounded-lg border border-border bg-surface text-danger hover:bg-danger-bg transition-all cursor-pointer"
															title="Delete Activity"
														>
															🗑️
														</button>
													</>
												) : (
													<button
														onClick={() =>
															onRSVP(
																item.id,
																isUserGoing
																	? 'RSVP_NO'
																	: 'RSVP_YES',
															)
														}
														className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all cursor-pointer shadow-2xs ${
															isUserGoing
																? 'bg-success text-white hover:bg-success/90'
																: 'border border-border bg-surface text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
														}`}
													>
														<FiCheckCircle
															size={11}
														/>
														<span>
															{isUserGoing
																? 'Going'
																: 'RSVP'}
														</span>
													</button>
												)}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				))
			)}
		</main>
	);
}
