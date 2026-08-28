'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
	FiTrash2,
	FiFile,
	FiPaperclip,
	FiSend,
	FiCalendar,
	FiMapPin,
	FiPlus,
} from 'react-icons/fi';
import { FeedMessageSkeleton } from '@/components/ui/Skeleton';
import { Group, User, FeedMessage, MeetingEvent, Poll } from '@/types/models';
import { FeedTab } from '@/components/group/ClubFeedHeader';
import FeedSubAppsPopover from '@/components/group/FeedSubAppsPopover';
import PollCard from '@/components/group/PollCard';

interface ClubFeedTabProps {
	group: Group;
	currentUser: User | null;
	users: User[];
	feedMessages: FeedMessage[];
	clubActivities: MeetingEvent[];
	polls: Poll[];
	canManage: boolean;
	isLoading: boolean;
	postMessage: (
		groupId: string,
		content: string,
		fileName?: string,
		fileUrl?: string,
		isAnnouncement?: boolean,
		pinned?: boolean,
		subAppType?: 'poll' | 'announcement' | 'resource' | 'general',
		pollId?: string,
	) => Promise<FeedMessage | undefined>;
	deleteMessage: (messageId: string) => Promise<void>;
	setActiveTab: (tab: FeedTab) => void;
	createPoll: (
		groupId: string,
		pollData: {
			title: string;
			description?: string;
			category?: string;
			options: string[];
			isMultipleChoice?: boolean;
			isAnonymous?: boolean;
			allowUserOptions?: boolean;
			expiresAt?: string;
			pinned?: boolean;
			postToFeed?: boolean;
		},
	) => Promise<{ success: boolean; poll?: Poll; error?: string }>;
	votePoll: (
		pollId: string,
		optionIds: string[],
	) => Promise<{ success: boolean; poll?: Poll; error?: string }>;
	addPollOption: (
		pollId: string,
		optionText: string,
	) => Promise<{ success: boolean; poll?: Poll; error?: string }>;
	togglePollClose: (
		pollId: string,
		isClosed?: boolean,
	) => Promise<{ success: boolean; poll?: Poll; error?: string }>;
	togglePollPin: (
		pollId: string,
		pinned?: boolean,
	) => Promise<{ success: boolean; poll?: Poll; error?: string }>;
	deletePoll: (
		pollId: string,
	) => Promise<{ success: boolean; error?: string }>;
}

export default function ClubFeedTab({
	group,
	currentUser,
	users,
	feedMessages,
	clubActivities,
	polls,
	canManage,
	isLoading,
	postMessage,
	deleteMessage,
	setActiveTab,
	createPoll,
	votePoll,
	addPollOption,
	togglePollClose,
	togglePollPin,
	deletePoll,
}: ClubFeedTabProps) {
	const router = useRouter();
	const [feedFilter, setFeedFilter] = useState<
		'all' | 'announcements' | 'files' | 'links'
	>('all');
	const [messageText, setMessageText] = useState('');
	const [isAnnouncement, setIsAnnouncement] = useState(false);
	const [subAppsOpen, setSubAppsOpen] = useState(false);
	const [fileInput, setFileInput] = useState<File | null>(null);
	const [fileSizeErrorFeed, setFileSizeErrorFeed] = useState('');
	const messagesContainerRef = useRef<HTMLDivElement>(null);

	const groupMessages = feedMessages
		.filter((m) => m.groupId === group.id)
		.sort(
			(a, b) =>
				new Date(a.createdAt).getTime() -
				new Date(b.createdAt).getTime(),
		);

	const filteredMessages = groupMessages.filter((m) => {
		if (feedFilter === 'announcements') return m.isAnnouncement;
		if (feedFilter === 'files') return Boolean(m.fileName);
		if (feedFilter === 'links')
			return m.content.startsWith('🔗 Resource shared:');
		return true;
	});

	const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
		if (messagesContainerRef.current) {
			messagesContainerRef.current.scrollTo({
				top: messagesContainerRef.current.scrollHeight,
				behavior,
			});
		}
	};

	// Auto-scroll on initial load and when message count or filtered messages change
	useEffect(() => {
		// Use auto on initial load, smooth on subsequent updates
		scrollToBottom(isLoading ? 'auto' : 'smooth');
	}, [groupMessages.length, filteredMessages.length, isLoading, feedFilter]);

	const getUserName = (msg: FeedMessage) => {
		if (msg.user?.name) return msg.user.name;
		const found = users.find((u) => u.id === msg.userId);
		if (found?.name) return found.name;
		if (currentUser && currentUser.id === msg.userId)
			return currentUser.name;
		return 'Club Member';
	};

	const getUserAvatar = (msg: FeedMessage) => {
		if (msg.user?.avatarUrl) return msg.user.avatarUrl;
		const found = users.find((u) => u.id === msg.userId);
		if (found?.avatarUrl) return found.avatarUrl;
		if (currentUser && currentUser.id === msg.userId)
			return currentUser.avatarUrl;
		return undefined;
	};

	const handlePost = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!messageText.trim() && !fileInput) return;

		let fileUrl = undefined;
		let fileName = undefined;

		if (fileInput) {
			fileName = fileInput.name;
			fileUrl = await new Promise<string>((resolve) => {
				const reader = new FileReader();
				reader.onload = (event) =>
					resolve(event.target?.result as string);
				reader.readAsDataURL(fileInput);
			});
		}

		await postMessage(
			group.id,
			messageText.trim(),
			fileName,
			fileUrl,
			isAnnouncement,
			false,
		);

		setMessageText('');
		setFileInput(null);
		setIsAnnouncement(false);
		setTimeout(() => scrollToBottom('smooth'), 50);
	};

	return (
		<main className="grow mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
			{/* Left: Message Feed */}
			<div className="lg:col-span-3 bg-surface border border-border rounded-2xl flex flex-col shadow-xs overflow-visible relative">
				{/* Sub-filters */}
				<div className="border-b border-border px-5 py-3 flex items-center justify-between gap-3 bg-surface-secondary/40">
					<div className="flex items-center gap-2">
						<button
							onClick={() => setFeedFilter('all')}
							className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
								feedFilter === 'all'
									? 'bg-primary text-white shadow-xs'
									: 'text-text-muted hover:text-text-primary'
							}`}
						>
							All Messages
						</button>
						<button
							onClick={() => setFeedFilter('announcements')}
							className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
								feedFilter === 'announcements'
									? 'bg-primary text-white shadow-xs'
									: 'text-text-muted hover:text-text-primary'
							}`}
						>
							📢 Announcements
						</button>
						<button
							onClick={() => setFeedFilter('files')}
							className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
								feedFilter === 'files'
									? 'bg-primary text-white shadow-xs'
									: 'text-text-muted hover:text-text-primary'
							}`}
						>
							📁 Files &amp; Slides
						</button>
					</div>

					<span className="text-[11px] text-text-muted hidden sm:inline">
						{groupMessages.length} posts
					</span>
				</div>

				{/* Messages Container */}
				<div
					className="grow p-5 space-y-4 h-[55vh] lg:h-[65vh] overflow-y-auto"
					ref={messagesContainerRef}
				>
					{isLoading ? (
						<div className="space-y-4 py-2">
							{Array.from({ length: 4 }).map((_, i) => (
								<FeedMessageSkeleton key={i} />
							))}
						</div>
					) : filteredMessages.length === 0 ? (
						<div className="text-center py-16 text-text-muted text-xs">
							No messages found in this category. Be the first to
							post!
						</div>
					) : (
						filteredMessages.map((msg) => {
							const isMe = currentUser
								? msg.userId === currentUser.id
								: false;
							const authorName = getUserName(msg);
							const avatar = getUserAvatar(msg);
							const authorIsLeader =
								group.leaderId === msg.userId;
							const authorIsOfficer = Boolean(
								group.officerIds &&
								group.officerIds.includes(msg.userId),
							);
							const pollObj = msg.pollId
								? polls.find((p) => p.id === msg.pollId) || msg.poll
								: undefined;

							return (
								<div
									key={msg.id}
									className={`flex items-start space-x-3 ${
										isMe
											? 'flex-row-reverse space-x-reverse'
											: ''
									}`}
								>
									{avatar ? (
										<Image
											src={avatar}
											alt=""
											width={32}
											height={32}
											className="h-8 w-8 rounded-full object-cover border border-border shrink-0 mt-0.5"
											unoptimized
										/>
									) : (
										<div className="h-8 w-8 rounded-full bg-primary-light text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
											{authorName[0]}
										</div>
									)}

									<div
										className={`flex flex-col max-w-[90%] sm:max-w-[80%] ${
											isMe ? 'items-end' : 'items-start'
										}`}
									>
										<div className="flex items-center space-x-1.5 mb-1 px-1">
											<span className="text-[11px] font-bold text-text-primary">
												{authorName}
											</span>
											{authorIsLeader ? (
												<span className="text-[9px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full shadow-2xs">
													Leader
												</span>
											) : authorIsOfficer ? (
												<span className="text-[9px] font-bold bg-primary-light text-primary px-1.5 py-0.5 rounded-full border border-primary/20">
													Officer
												</span>
											) : null}
											<span className="text-[10px] text-text-muted">
												{new Date(
													msg.createdAt,
												).toLocaleTimeString([], {
													hour: '2-digit',
													minute: '2-digit',
												})}
											</span>
											{(isMe || canManage) && (
												<button
													onClick={() =>
														deleteMessage(msg.id)
													}
													className="text-text-muted hover:text-danger p-0.5 cursor-pointer"
													title="Delete message"
												>
													<FiTrash2 size={11} />
												</button>
											)}
										</div>

										{/* In-Feed Poll Card Embedding */}
										{pollObj ? (
											<div className="w-full min-w-[280px] sm:min-w-[360px] max-w-lg mt-1">
												<PollCard
													poll={pollObj}
													currentUser={currentUser}
													users={users}
													group={group}
													canManage={canManage}
													onVote={votePoll}
													onAddOption={addPollOption}
													onToggleClose={togglePollClose}
													onTogglePin={togglePollPin}
													onDelete={deletePoll}
													compact
												/>
											</div>
										) : (
											/* Standard Message Bubble */
											<div
												className={`rounded-2xl p-3 text-xs leading-relaxed ${
													msg.isAnnouncement
														? 'bg-primary-light border border-primary/30 text-text-primary font-medium shadow-xs'
														: isMe
															? 'bg-primary text-white rounded-tr-xs'
															: 'bg-surface-secondary border border-border text-text-primary rounded-tl-xs'
												}`}
											>
												{msg.isAnnouncement && (
													<div className="text-[10px] font-bold text-primary flex items-center gap-1 uppercase tracking-wider mb-1">
														📢 Announcement
													</div>
												)}

												<p className="whitespace-pre-wrap">
													{msg.content || (
														<span className="italic text-text-muted">
															(Attached file with no
															message)
														</span>
													)}
												</p>

												{/* File attachment preview */}
												{msg.fileName && msg.fileUrl && (
													<div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between gap-3">
														<span className="flex items-center gap-1.5 text-[11px] font-semibold truncate">
															<FiFile className="shrink-0" />{' '}
															{msg.fileName}
														</span>
														<a
															href={msg.fileUrl}
															download={msg.fileName}
															className="rounded-lg bg-surface px-2 py-1 text-[10px] font-bold text-primary hover:underline border border-border shadow-2xs shrink-0"
														>
															Download
														</a>
													</div>
												)}
											</div>
										)}
									</div>
								</div>
							);
						})
					)}
				</div>

				<form
					onSubmit={handlePost}
					data-tour="feed-composer"
					className="border-t border-border p-3 bg-surface space-y-2 relative z-30 rounded-b-2xl"
				>
					{fileInput && (
						<div className="flex items-center justify-between p-2 rounded-lg bg-primary-light text-xs text-primary">
							<span className="flex items-center gap-1.5 truncate font-medium">
								<FiPaperclip /> {fileInput.name}
							</span>
							<button
								type="button"
								onClick={() => setFileInput(null)}
								className="text-danger hover:underline text-xs cursor-pointer"
							>
								Remove
							</button>
						</div>
					)}

					<div className="flex items-center gap-2">
						<input
							type="text"
							placeholder={
								isAnnouncement
									? 'Type an announcement for all club members...'
									: 'Share an update, question, or discussion point...'
							}
							value={messageText}
							onChange={(e) => setMessageText(e.target.value)}
							className="grow rounded-xl border border-border bg-surface-secondary px-3.5 py-2.5 text-xs text-text-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
						/>

						{fileSizeErrorFeed && (
							<div className="absolute bottom-full mb-2 left-0 right-0 z-10 flex items-start gap-2 rounded-lg border border-danger/20 bg-danger-bg px-3 py-2 text-[11px] text-danger font-medium shadow-md">
								<span className="shrink-0 mt-0.5">⚠️</span>
								<span className="grow">
									{fileSizeErrorFeed}
								</span>
								<button
									type="button"
									onClick={() => setFileSizeErrorFeed('')}
									className="text-danger hover:text-danger-hover font-bold px-1 cursor-pointer"
								>
									✕
								</button>
							</div>
						)}

						{/* Sub-Apps + Launcher Button (Leader & Officer Only) */}
						{canManage && (
							<div className="relative" data-tour="feed-subapps">
								<button
									type="button"
									onClick={() => setSubAppsOpen(!subAppsOpen)}
									className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
										subAppsOpen
											? 'bg-primary text-white shadow-xs'
											: 'text-text-muted hover:text-text-primary hover:bg-surface-secondary'
									}`}
									title="Sub-Apps: Polls & Tools"
								>
									<FiPlus size={18} />
								</button>

								<FeedSubAppsPopover
									isOpen={subAppsOpen}
									onClose={() => setSubAppsOpen(false)}
									onCreatePoll={(pollData) =>
										createPoll(group.id, pollData)
									}
								/>
							</div>
						)}

						{/* Attach File Button */}
						<label
							className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-secondary cursor-pointer transition-colors"
							title="Attach File, Document, Image, or Spreadsheet"
						>
							<FiPaperclip size={18} />
							<input
								type="file"
								accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.doc,.docx,.txt,.xls,.xlsx,.csv"
								className="hidden"
								onChange={(e) => {
									if (e.target.files?.[0]) {
										const file = e.target.files[0];
										const ext =
											file.name
												.split('.')
												.pop()
												?.toLowerCase() || '';
										const allowedExts = [
											'png',
											'jpg',
											'jpeg',
											'gif',
											'webp',
											'pdf',
											'doc',
											'docx',
											'txt',
											'xls',
											'xlsx',
											'csv',
										];

										if (!allowedExts.includes(ext)) {
											setFileSizeErrorFeed(
												'Disallowed file type. Supported formats: Images, PDFs, Docs, and Spreadsheets (.xlsx, .xls, .csv).',
											);
											e.target.value = '';
											return;
										}

										if (file.size > 2000000) {
											setFileSizeErrorFeed(
												'File is too large (max 2 MB).',
											);
											e.target.value = '';
											return;
										}
										setFileSizeErrorFeed('');
										setFileInput(file);
									}
								}}
							/>
						</label>

						{canManage && (
							<button
								type="button"
								onClick={() =>
									setIsAnnouncement(!isAnnouncement)
								}
								className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
									isAnnouncement
										? 'bg-primary text-white'
										: 'text-text-muted hover:text-text-primary hover:bg-surface-secondary'
								}`}
								title="Toggle Announcement Badge"
							>
								📢
							</button>
						)}

						<button
							type="submit"
							className="rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm transition-all cursor-pointer"
						>
							<FiSend size={15} />
						</button>
					</div>
				</form>
			</div>

			{/* Right Sidebar: Club Meeting Times & Resource Links */}
			<div className="space-y-6">
				{/* Active Meeting Info Card */}
				<div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-3">
					<span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
						Meeting Schedule
					</span>
					<div className="space-y-2 text-xs">
						<div className="flex items-start gap-2 text-text-secondary">
							<FiCalendar className="text-primary mt-0.5 shrink-0" />
							<span className="font-semibold text-text-primary">
								{group.meetingFrequency}
							</span>
						</div>
						<div className="flex items-start gap-2 text-text-secondary">
							<FiMapPin className="text-primary mt-0.5 shrink-0" />
							<span>
								{group.meetingLocation || 'Campus Center'}
							</span>
						</div>
					</div>

					<button
						onClick={() => setActiveTab('attendance')}
						className="w-full mt-2 rounded-xl bg-primary-light py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-all text-center block cursor-pointer"
					>
						Open Attendance Check-In →
					</button>
				</div>

				{/* Upcoming Activities Side Card (Next 3) */}
				<div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-3">
					<span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
						Upcoming Activities
					</span>
					<div className="space-y-3">
						{(() => {
							const sortedFutureEvents = clubActivities
								.map((e) => ({
									...e,
									dateObj: new Date(
										`${e.date}T${e.time || '00:00'}`,
									),
								}))
								.filter(
									(e) =>
										e.dateObj >=
										new Date(
											new Date().setHours(0, 0, 0, 0),
										),
								)
								.sort(
									(a, b) =>
										a.dateObj.getTime() -
										b.dateObj.getTime(),
								)
								.slice(0, 3);

							if (sortedFutureEvents.length === 0) {
								return (
									<p className="text-[11px] text-text-muted italic">
										No upcoming activities.
									</p>
								);
							}

							return sortedFutureEvents.map((ev) => (
								<div
									key={ev.id}
									className="text-xs border-b border-border/40 pb-2 last:border-0 last:pb-0"
								>
									<span className="font-bold text-text-primary block truncate">
										{ev.title}
									</span>
									<span className="text-[10px] text-text-muted block mt-0.5">
										📅 {ev.date} at {ev.time || 'All Day'}
									</span>
									{ev.location && (
										<span className="text-[9px] text-text-muted block mt-0.5 truncate">
											📍 {ev.location}
										</span>
									)}
								</div>
							));
						})()}
					</div>

					<button
						onClick={() =>
							router.push(`/group/${group.id}/activities`)
						}
						className="w-full mt-2 rounded-xl bg-surface border border-border py-1.5 text-[10px] font-bold text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-all text-center block cursor-pointer"
					>
						View Calendar Schedule →
					</button>
				</div>
			</div>
		</main>
	);
}
