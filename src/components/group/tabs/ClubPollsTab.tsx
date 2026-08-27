'use client';

import React, { useState } from 'react';
import {
	FiBarChart2,
	FiPlus,
	FiSearch,
	FiCheckCircle,
	FiClock,
	FiTrendingUp,
} from 'react-icons/fi';
import { Group, User, Poll } from '@/types/models';
import PollCard from '@/components/group/PollCard';

interface ClubPollsTabProps {
	group: Group;
	currentUser: User | null;
	users: User[];
	polls: Poll[];
	canManage: boolean;
	isLoading: boolean;
	onOpenCreateModal?: () => void;
	onVote: (pollId: string, optionIds: string[]) => Promise<{ success: boolean; poll?: Poll; error?: string }>;
	onAddOption: (pollId: string, optionText: string) => Promise<{ success: boolean; poll?: Poll; error?: string }>;
	onToggleClose: (pollId: string, isClosed?: boolean) => Promise<{ success: boolean; poll?: Poll; error?: string }>;
	onTogglePin: (pollId: string, pinned?: boolean) => Promise<{ success: boolean; poll?: Poll; error?: string }>;
	onDelete: (pollId: string) => Promise<{ success: boolean; error?: string }>;
}

export default function ClubPollsTab({
	group,
	currentUser,
	users,
	polls,
	canManage,
	isLoading,
	onOpenCreateModal,
	onVote,
	onAddOption,
	onToggleClose,
	onTogglePin,
	onDelete,
}: ClubPollsTabProps) {
	const [filter, setFilter] = useState<'all' | 'active' | 'closed' | 'pinned' | 'my_votes'>('all');
	const [searchQuery, setSearchQuery] = useState('');

	const currentUserId = currentUser?.id || '';

	// Group-specific polls
	const clubPolls = polls.filter((p) => p.groupId === group.id);

	// Filtering logic
	const filteredPolls = clubPolls.filter((poll) => {
		const isClosed = Boolean(poll.isClosed);

		if (filter === 'active' && isClosed) return false;
		if (filter === 'closed' && !isClosed) return false;
		if (filter === 'pinned' && !poll.pinned) return false;
		if (filter === 'my_votes') {
			const hasVoted = poll.options.some((opt) => opt.votes.includes(currentUserId));
			if (!hasVoted) return false;
		}

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			const matchTitle = poll.title.toLowerCase().includes(q);
			const matchDesc = poll.description?.toLowerCase().includes(q);
			const matchCat = poll.category?.toLowerCase().includes(q);
			const matchOpt = poll.options.some((o) => o.text.toLowerCase().includes(q));
			if (!matchTitle && !matchDesc && !matchCat && !matchOpt) return false;
		}

		return true;
	});

	// Metrics calculations
	const activePollsCount = clubPolls.filter((p) => !p.isClosed).length;
	const totalVotesCast = clubPolls.reduce(
		(sum, p) => sum + p.options.reduce((acc, opt) => acc + opt.votes.length, 0),
		0,
	);
	const memberCount = Math.max(group.memberIds.length, 1);
	const uniqueVoters = new Set<string>();
	clubPolls.forEach((p) =>
		p.options.forEach((opt) => opt.votes.forEach((uid) => uniqueVoters.add(uid))),
	);
	const participationRate = Math.min(
		Math.round((uniqueVoters.size / memberCount) * 100),
		100,
	);

	return (
		<main className="grow mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
			{/* Hub Header with Summary Metrics */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="p-4 rounded-2xl border border-border bg-surface shadow-2xs space-y-1">
					<div className="flex items-center justify-between text-text-muted">
						<span className="text-[11px] font-bold uppercase tracking-wider">
							Total Polls
						</span>
						<FiBarChart2 className="text-primary" size={16} />
					</div>
					<div className="text-2xl font-extrabold text-text-primary">
						{clubPolls.length}
					</div>
					<span className="text-[10px] text-text-muted">
						{clubPolls.length === 1 ? '1 club poll launched' : `${clubPolls.length} club polls launched`}
					</span>
				</div>

				<div className="p-4 rounded-2xl border border-border bg-surface shadow-2xs space-y-1">
					<div className="flex items-center justify-between text-text-muted">
						<span className="text-[11px] font-bold uppercase tracking-wider">
							Active Voting
						</span>
						<FiClock className="text-emerald-500" size={16} />
					</div>
					<div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
						{activePollsCount}
					</div>
					<span className="text-[10px] text-text-muted">
						Open for member votes
					</span>
				</div>

				<div className="p-4 rounded-2xl border border-border bg-surface shadow-2xs space-y-1">
					<div className="flex items-center justify-between text-text-muted">
						<span className="text-[11px] font-bold uppercase tracking-wider">
							Total Ballots
						</span>
						<FiCheckCircle className="text-indigo-500" size={16} />
					</div>
					<div className="text-2xl font-extrabold text-text-primary">
						{totalVotesCast}
					</div>
					<span className="text-[10px] text-text-muted">
						Cumulative votes cast
					</span>
				</div>

				<div className="p-4 rounded-2xl border border-border bg-surface shadow-2xs space-y-1">
					<div className="flex items-center justify-between text-text-muted">
						<span className="text-[11px] font-bold uppercase tracking-wider">
							Turnout Rate
						</span>
						<FiTrendingUp className="text-primary" size={16} />
					</div>
					<div className="text-2xl font-extrabold text-text-primary">
						{participationRate}%
					</div>
					<span className="text-[10px] text-text-muted">
						{uniqueVoters.size} of {memberCount} members active
					</span>
				</div>
			</div>

			{/* Filter & Search Bar */}
			<div className="p-4 rounded-2xl border border-border bg-surface shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				{/* Filter Pills */}
				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={() => setFilter('all')}
						className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
							filter === 'all'
								? 'bg-primary text-white shadow-2xs'
								: 'bg-surface-secondary text-text-muted hover:text-text-primary border border-border'
						}`}
					>
						All ({clubPolls.length})
					</button>
					<button
						type="button"
						onClick={() => setFilter('active')}
						className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
							filter === 'active'
								? 'bg-primary text-white shadow-2xs'
								: 'bg-surface-secondary text-text-muted hover:text-text-primary border border-border'
						}`}
					>
						🟢 Active ({activePollsCount})
					</button>
					<button
						type="button"
						onClick={() => setFilter('closed')}
						className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
							filter === 'closed'
								? 'bg-primary text-white shadow-2xs'
								: 'bg-surface-secondary text-text-muted hover:text-text-primary border border-border'
						}`}
					>
						🏁 Concluded ({clubPolls.length - activePollsCount})
					</button>
					<button
						type="button"
						onClick={() => setFilter('pinned')}
						className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
							filter === 'pinned'
								? 'bg-primary text-white shadow-2xs'
								: 'bg-surface-secondary text-text-muted hover:text-text-primary border border-border'
						}`}
					>
						📌 Pinned
					</button>
					<button
						type="button"
						onClick={() => setFilter('my_votes')}
						className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
							filter === 'my_votes'
								? 'bg-primary text-white shadow-2xs'
								: 'bg-surface-secondary text-text-muted hover:text-text-primary border border-border'
						}`}
					>
						🗳️ My Votes
					</button>
				</div>

				{/* Search & Create Button */}
				<div className="flex items-center gap-2.5">
					<div className="relative grow sm:w-64">
						<FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search polls..."
							className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-surface-secondary text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
						/>
					</div>

					{canManage && onOpenCreateModal && (
						<button
							type="button"
							onClick={onOpenCreateModal}
							className="px-3.5 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-hover transition-all flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
						>
							<FiPlus size={14} />
							<span>Create Poll</span>
						</button>
					)}
				</div>
			</div>

			{/* Polls Grid */}
			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{Array.from({ length: 4 }).map((_, i) => (
						<div
							key={i}
							className="h-64 rounded-2xl border border-border bg-surface animate-pulse"
						/>
					))}
				</div>
			) : filteredPolls.length === 0 ? (
				<div className="rounded-2xl border border-border bg-surface p-12 text-center space-y-3">
					<div className="mx-auto h-12 w-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center text-xl">
						<FiBarChart2 />
					</div>
					<h3 className="text-sm font-bold text-text-primary">
						No Polls Found
					</h3>
					<p className="text-xs text-text-muted max-w-sm mx-auto">
						{searchQuery
							? `No polls matched your search "${searchQuery}".`
							: filter !== 'all'
								? `No polls currently in the "${filter}" filter.`
								: 'No polls have been created yet. Launch a poll to start gathering member votes!'}
					</p>
					{canManage && onOpenCreateModal && (
						<button
							type="button"
							onClick={onOpenCreateModal}
							className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-all cursor-pointer shadow-sm"
						>
							<FiPlus size={14} /> Create First Poll
						</button>
					)}
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
					{filteredPolls.map((poll) => (
						<PollCard
							key={poll.id}
							poll={poll}
							currentUser={currentUser}
							users={users}
							group={group}
							canManage={canManage}
							onVote={onVote}
							onAddOption={onAddOption}
							onToggleClose={onToggleClose}
							onTogglePin={onTogglePin}
							onDelete={onDelete}
						/>
					))}
				</div>
			)}
		</main>
	);
}
