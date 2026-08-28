'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
	FiCheck,
	FiLock,
	FiLayers,
	FiClock,
	FiPlus,
	FiTrash2,
	FiMoreVertical,
	FiUserCheck,
	FiAward,
	FiChevronDown,
	FiChevronUp,
} from 'react-icons/fi';
import { Poll, User, Group } from '@/types/models';

interface PollCardProps {
	poll: Poll;
	currentUser: User | null;
	users: User[];
	group?: Group;
	canManage: boolean;
	onVote: (pollId: string, optionIds: string[]) => Promise<{ success: boolean; poll?: Poll; error?: string }>;
	onAddOption?: (pollId: string, optionText: string) => Promise<{ success: boolean; poll?: Poll; error?: string }>;
	onToggleClose?: (pollId: string, isClosed?: boolean) => Promise<{ success: boolean; poll?: Poll; error?: string }>;
	onTogglePin?: (pollId: string, pinned?: boolean) => Promise<{ success: boolean; poll?: Poll; error?: string }>;
	onDelete?: (pollId: string) => Promise<{ success: boolean; error?: string }>;
	compact?: boolean;
}

export default function PollCard({
	poll,
	currentUser,
	users,
	canManage,
	onVote,
	onAddOption,
	onToggleClose,
	onTogglePin,
	onDelete,
	compact = false,
}: PollCardProps) {
	const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
	const [isVoting, setIsVoting] = useState(false);
	const [isAddingOption, setIsAddingOption] = useState(false);
	const [newOptionText, setNewOptionText] = useState('');
	const [showAddOptionInput, setShowAddOptionInput] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [expandedVotersOptionId, setExpandedVotersOptionId] = useState<string | null>(null);
	const [isChangingVote, setIsChangingVote] = useState(false);
	const [actionError, setActionError] = useState('');

	const currentUserId = currentUser?.id || '';

	// Compute user's current votes on this poll
	const userVotedOptionIds = poll.options
		.filter((opt) => opt.votes.includes(currentUserId))
		.map((opt) => opt.id);

	const hasUserVoted = userVotedOptionIds.length > 0;
	const isClosed = Boolean(poll.isClosed);

	// Total votes calculation
	const totalVotesCount = poll.options.reduce((acc, curr) => acc + curr.votes.length, 0);

	// Find winning option(s) if closed or has votes
	const maxVotes = Math.max(...poll.options.map((o) => o.votes.length), 0);
	const winningOptions = maxVotes > 0 ? poll.options.filter((o) => o.votes.length === maxVotes) : [];

	// Toggle selection when voting
	const handleOptionSelect = (optionId: string) => {
		if (isClosed) return;
		if (poll.isMultipleChoice) {
			setSelectedOptionIds((prev) =>
				prev.includes(optionId)
					? prev.filter((id) => id !== optionId)
					: [...prev, optionId],
			);
		} else {
			setSelectedOptionIds([optionId]);
		}
	};

	// Submit vote
	const handleVoteSubmit = async () => {
		if (selectedOptionIds.length === 0) return;
		setIsVoting(true);
		setActionError('');
		try {
			const res = await onVote(poll.id, selectedOptionIds);
			if (res.success) {
				setIsChangingVote(false);
				setSelectedOptionIds([]);
			} else {
				setActionError(res.error || 'Failed to submit vote');
			}
		} catch {
			setActionError('Network error while voting');
		} finally {
			setIsVoting(false);
		}
	};

	// Submit new member option
	const handleAddOptionSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newOptionText.trim() || !onAddOption) return;
		setIsAddingOption(true);
		setActionError('');
		try {
			const res = await onAddOption(poll.id, newOptionText.trim());
			if (res.success) {
				setNewOptionText('');
				setShowAddOptionInput(false);
			} else {
				setActionError(res.error || 'Failed to add option');
			}
		} catch {
			setActionError('Network error adding option');
		} finally {
			setIsAddingOption(false);
		}
	};

	// Helper to resolve voter details
	const getVoterDetails = (userId: string) => {
		const found = users.find((u) => u.id === userId);
		if (found) return found;
		if (currentUser && currentUser.id === userId) return currentUser;
		return {
			id: userId,
			name: 'Member',
			avatarUrl: undefined,
		};
	};

	// Colors for option progress bars
	const getBarColor = (index: number, isWinner: boolean) => {
		if (isWinner && isClosed) return 'bg-amber-500';
		const colors = [
			'bg-primary',
			'bg-indigo-500',
			'bg-sky-500',
			'bg-teal-500',
			'bg-emerald-500',
			'bg-violet-500',
		];
		return colors[index % colors.length];
	};

	const showVotingView = (!hasUserVoted || isChangingVote) && !isClosed;

	return (
		<div
			className={`rounded-2xl border transition-all relative overflow-hidden ${
				poll.pinned
					? 'bg-surface border-primary/40 shadow-sm ring-1 ring-primary/20'
					: 'bg-surface border-border shadow-2xs hover:shadow-xs'
			} ${compact ? 'p-3.5 space-y-2.5' : 'p-5 space-y-4'}`}
		>
			{/* Top Bar: Badges, Expiry, Actions */}
			<div className="flex items-start justify-between gap-2">
				<div className="flex flex-wrap items-center gap-1.5">
					{/* Multiple Choice Badge */}
					{poll.isMultipleChoice && (
						<span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface-secondary text-text-secondary border border-border flex items-center gap-1">
							<FiLayers size={11} /> Multi-Choice
						</span>
					)}

					{/* Anonymous Badge */}
					{poll.isAnonymous ? (
						<span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface-secondary text-text-muted border border-border flex items-center gap-1">
							<FiLock size={11} /> Anonymous
						</span>
					) : (
						<span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface-secondary text-text-muted border border-border flex items-center gap-1">
							<FiUserCheck size={11} /> Public Ballots
						</span>
					)}

					{/* Status Tag */}
					{isClosed ? (
						<span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center gap-1">
							<FiCheck size={11} /> Poll Concluded
						</span>
					) : (
						<span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
							<span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Poll
						</span>
					)}

					{/* Pinned Tag */}
					{poll.pinned && (
						<span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary text-white">
							📌 Pinned
						</span>
					)}
				</div>

				{/* Leader / Officer Action Menu */}
				{canManage && (
					<div className="relative">
						<button
							type="button"
							onClick={() => setMenuOpen(!menuOpen)}
							className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface-secondary cursor-pointer transition-colors"
							title="Poll Management Options"
						>
							<FiMoreVertical size={15} />
						</button>

						<AnimatePresence>
							{menuOpen && (
								<motion.div
									initial={{ opacity: 0, scale: 0.9, y: -4 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.9, y: -4 }}
									className="absolute right-0 mt-1 w-44 bg-surface border border-border rounded-xl shadow-xl py-1.5 z-30 text-xs"
								>
									{onTogglePin && (
										<button
											type="button"
											onClick={() => {
												onTogglePin(poll.id, !poll.pinned);
												setMenuOpen(false);
											}}
											className="w-full text-left px-3 py-1.5 hover:bg-surface-secondary text-text-primary flex items-center gap-2 cursor-pointer"
										>
											<span>{poll.pinned ? '📌 Unpin Poll' : '📌 Pin to Top'}</span>
										</button>
									)}

									{onToggleClose && (
										<button
											type="button"
											onClick={() => {
												onToggleClose(poll.id, !poll.isClosed);
												setMenuOpen(false);
											}}
											className="w-full text-left px-3 py-1.5 hover:bg-surface-secondary text-text-primary flex items-center gap-2 cursor-pointer"
										>
											<FiClock size={13} />
											<span>{poll.isClosed ? 'Reopen Poll' : 'Close Poll Early'}</span>
										</button>
									)}

									{onDelete && (
										<button
											type="button"
											onClick={() => {
												if (window.confirm('Delete this poll permanently?')) {
													onDelete(poll.id);
												}
												setMenuOpen(false);
											}}
											className="w-full text-left px-3 py-1.5 hover:bg-danger-bg text-danger flex items-center gap-2 cursor-pointer"
										>
											<FiTrash2 size={13} />
											<span>Delete Poll</span>
										</button>
									)}
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				)}
			</div>

			{/* Title & Description */}
			<div className="space-y-1">
				<h3 className={`font-bold text-text-primary ${compact ? 'text-sm' : 'text-base'}`}>
					{poll.title}
				</h3>
				{poll.description && (
					<p className="text-xs text-text-muted leading-relaxed">
						{poll.description}
					</p>
				)}
			</div>

			{/* Error banner */}
			{actionError && (
				<div className="p-2 rounded-lg bg-danger-bg text-danger text-[11px] font-medium flex items-center gap-1.5">
					<span>⚠️</span> {actionError}
				</div>
			)}

			{/* Options List */}
			<div className="space-y-2.5">
				{showVotingView ? (
					/* ─── Voting Mode: Radio or Checkboxes ─── */
					<div className="space-y-2">
						{poll.options.map((opt) => {
							const isSelected = selectedOptionIds.includes(opt.id);
							return (
								<div
									key={opt.id}
									onClick={() => handleOptionSelect(opt.id)}
									className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
										isSelected
											? 'bg-primary/10 border-primary shadow-2xs'
											: 'bg-surface-secondary/60 hover:bg-surface-secondary border-border'
									}`}
								>
									<div className="flex items-center gap-2.5 min-w-0 grow">
										<div
											className={`h-4 w-4 rounded-${
												poll.isMultipleChoice ? 'md' : 'full'
											} border flex items-center justify-center shrink-0 transition-colors ${
												isSelected
													? 'bg-primary border-primary text-white'
													: 'border-border bg-surface'
											}`}
										>
											{isSelected && <FiCheck size={11} />}
										</div>
										<span className="text-xs font-semibold text-text-primary truncate">
											{opt.text}
										</span>
									</div>
								</div>
							);
						})}

						{/* Vote Actions */}
						<div className="flex items-center justify-between gap-2 pt-1">
							{isChangingVote && (
								<button
									type="button"
									onClick={() => {
										setIsChangingVote(false);
										setSelectedOptionIds([]);
									}}
									className="px-3 py-1.5 text-xs font-semibold text-text-muted hover:text-text-primary cursor-pointer"
								>
									Cancel
								</button>
							)}

							<button
								type="button"
								onClick={handleVoteSubmit}
								disabled={selectedOptionIds.length === 0 || isVoting}
								className="grow sm:grow-0 ml-auto px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
							>
								{isVoting ? (
									<>
										<span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
										<span>Voting...</span>
									</>
								) : (
									<>
										<FiCheck size={14} />
										<span>Submit Vote</span>
									</>
								)}
							</button>
						</div>
					</div>
				) : (
					/* ─── Results Mode: Progress Bars & Breakdown ─── */
					<div className="space-y-2">
						{poll.options.map((opt, idx) => {
							const voteCount = opt.votes.length;
							const percentage =
								totalVotesCount > 0
									? Math.round((voteCount / totalVotesCount) * 100)
									: 0;
							const userVotedThis = opt.votes.includes(currentUserId);
							const isWinner = isClosed && winningOptions.some((w) => w.id === opt.id);
							const isExpanded = expandedVotersOptionId === opt.id;

							return (
								<div key={opt.id} className="space-y-1">
									<div
										onClick={() => {
											if (!poll.isAnonymous && canManage && voteCount > 0) {
												setExpandedVotersOptionId(isExpanded ? null : opt.id);
											}
										}}
										className={`p-3 rounded-xl border relative overflow-hidden transition-all ${
											userVotedThis
												? 'border-primary/40 bg-primary-light/30 shadow-2xs'
												: 'border-border bg-surface-secondary/40'
										} ${
											!poll.isAnonymous && canManage && voteCount > 0
												? 'cursor-pointer hover:border-text-muted'
												: ''
										}`}
									>
										{/* Percentage Fill Bar */}
										<motion.div
											initial={{ width: 0 }}
											animate={{ width: `${percentage}%` }}
											transition={{ duration: 0.5, ease: 'easeOut' }}
											className={`absolute top-0 bottom-0 left-0 opacity-15 ${getBarColor(
												idx,
												isWinner,
											)}`}
										/>

										<div className="relative z-10 flex items-center justify-between gap-3">
											<div className="flex items-center gap-2 min-w-0 grow">
												{isWinner && (
													<FiAward className="text-amber-500 shrink-0" size={14} />
												)}
												<span className="text-xs font-semibold text-text-primary truncate">
													{opt.text}
												</span>
												{userVotedThis && (
													<span className="text-[9px] font-extrabold bg-primary text-white px-1.5 py-0.5 rounded-full shrink-0 shadow-2xs flex items-center gap-0.5">
														<FiCheck size={9} /> Voted
													</span>
												)}
											</div>

											{/* Vote count & percent */}
											<div className="flex items-center gap-2 shrink-0">
												<span className="text-xs font-bold text-text-primary">
													{percentage}%
												</span>
												{canManage && (
													<span className="text-[11px] text-text-muted">
														({voteCount})
													</span>
												)}
												{!poll.isAnonymous && canManage && voteCount > 0 && (
													<span className="text-text-muted text-[10px]">
														{isExpanded ? <FiChevronUp /> : <FiChevronDown />}
													</span>
												)}
											</div>
										</div>
									</div>

									{/* Expanded Public Voter List (if not anonymous and officer) */}
									<AnimatePresence>
										{isExpanded && !poll.isAnonymous && canManage && (
											<motion.div
												initial={{ opacity: 0, height: 0 }}
												animate={{ opacity: 1, height: 'auto' }}
												exit={{ opacity: 0, height: 0 }}
												className="px-3 py-2 rounded-lg bg-surface-secondary border border-border/70 flex flex-wrap items-center gap-1.5"
											>
												<span className="text-[10px] font-bold text-text-muted mr-1">
													Voters:
												</span>
												{opt.votes.map((voterId) => {
													const voter = getVoterDetails(voterId);
													return (
														<div
															key={voterId}
															className="flex items-center gap-1 bg-surface px-2 py-0.5 rounded-full border border-border text-[10px] font-medium text-text-primary"
														>
															{voter.avatarUrl ? (
																<Image
																	src={voter.avatarUrl}
																	alt=""
																	width={14}
																	height={14}
																	className="rounded-full object-cover"
																	unoptimized
																/>
															) : (
																<div className="h-3.5 w-3.5 rounded-full bg-primary-light text-primary text-[8px] font-bold flex items-center justify-center">
																	{voter.name[0]}
																</div>
															)}
															<span>{voter.name}</span>
														</div>
													);
												})}
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							);
						})}

						{/* Retract / Change Vote Action */}
						{!isClosed && hasUserVoted && (
							<div className="flex justify-end pt-1">
								<button
									type="button"
									onClick={() => {
										setSelectedOptionIds(userVotedOptionIds);
										setIsChangingVote(true);
									}}
									className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
								>
									Change your vote →
								</button>
							</div>
						)}
					</div>
				)}

				{/* Member-Added Option Trigger & Input */}
				{poll.allowUserOptions && !isClosed && (
					<div className="pt-1">
						{showAddOptionInput ? (
							<form
								onSubmit={handleAddOptionSubmit}
								className="flex items-center gap-2"
							>
								<input
									type="text"
									value={newOptionText}
									onChange={(e) => setNewOptionText(e.target.value)}
									placeholder="Add your own choice to this poll..."
									className="grow rounded-xl border border-border bg-surface-secondary px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
									autoFocus
								/>
								<button
									type="submit"
									disabled={!newOptionText.trim() || isAddingOption}
									className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover transition-all disabled:opacity-50 cursor-pointer"
								>
									{isAddingOption ? 'Adding...' : 'Add & Vote'}
								</button>
								<button
									type="button"
									onClick={() => {
										setShowAddOptionInput(false);
										setNewOptionText('');
									}}
									className="text-xs text-text-muted hover:text-text-primary px-2 cursor-pointer"
								>
									✕
								</button>
							</form>
						) : (
							<button
								type="button"
								onClick={() => setShowAddOptionInput(true)}
								className="text-[11px] font-semibold text-text-muted hover:text-primary flex items-center gap-1 cursor-pointer transition-colors"
							>
								<FiPlus size={12} /> Suggest / Add an option
							</button>
						)}
					</div>
				)}
			</div>

			{/* Card Footer: Metadata & Voter Avatars Preview */}
			<div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-[10px] text-text-muted">
				<div className="flex items-center gap-3">
					{canManage && (
						<span className="font-semibold text-text-secondary">
							{totalVotesCount} {totalVotesCount === 1 ? 'vote' : 'votes'} total
						</span>
					)}

					{poll.expiresAt && (
						<span className="flex items-center gap-1">
							<FiClock size={11} />
							{isClosed ? 'Ended' : `Closes ${new Date(poll.expiresAt).toLocaleDateString()}`}
						</span>
					)}
				</div>

				{/* Creator Info */}
				<div className="flex items-center gap-1.5">
					<span>Created by</span>
					<span className="font-bold text-text-primary">
						{poll.creator?.name || 'Officer'}
					</span>
				</div>
			</div>
		</div>
	);
}
