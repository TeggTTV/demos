'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
	FiUsers,
	FiSearch,
	FiShield,
	FiMail,
	FiBookOpen,
	FiX,
	FiUserCheck,
} from 'react-icons/fi';
import { Input } from '@/components/ui/Input';
import { Group, User } from '@/types/models';
import { mockStore } from '@/mock/mockStore';
import { MOCK_USERS } from '@/mock/mockData';

interface ClubRosterTabProps {
	group: Group;
	users: User[];
}

export default function ClubRosterTab({ group, users }: ClubRosterTabProps) {
	const [rosterSearchQuery, setRosterSearchQuery] = useState('');
	const [rosterRoleFilter, setRosterRoleFilter] = useState<
		'all' | 'leaders' | 'officers' | 'members'
	>('all');
	const [selectedMajorFilter, setSelectedMajorFilter] = useState<string>('all');

	// Resolve full user object safely with fallbacks
	const resolveMember = useCallback(
		(mId: string): User => {
			const found =
				users.find((u) => u.id === mId) ||
				mockStore.getUserById(mId) ||
				MOCK_USERS.find((u) => u.id === mId);
			if (found) return found;

			// Deterministic fallback generator for custom/ad-hoc member IDs
			const cleanId = mId.replace('user_', '').replace('_', ' ');
			const capitalized = cleanId
				.split(' ')
				.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
				.join(' ');

			return {
				id: mId,
				name: capitalized || 'Campus Member',
				email: `${mId}@campus.edu`,
				role: 'GUEST',
				major: 'Computer Science',
				year: 'Junior (2027)',
				bio: 'Active student organization contributor.',
			};

		},
		[users],
	);


	// Collect unique majors for filter chips
	const availableMajors = useMemo(() => {
		const majors = new Set<string>();
		group.memberIds.forEach((mId) => {
			const m = resolveMember(mId);
			if (m.major) {
				const clean = m.major.split('&')[0].trim();
				majors.add(clean);
			}
		});
		return Array.from(majors);
	}, [group.memberIds, resolveMember]);

	const filteredMembers = useMemo(() => {
		return group.memberIds
			.map((mId) => resolveMember(mId))
			.filter((mem) => {
				const isLeaderMem = group.leaderId === mem.id;
				const isOfficerMem = Boolean(
					group.officerIds && group.officerIds.includes(mem.id),
				);

				if (rosterRoleFilter === 'leaders' && !isLeaderMem) return false;
				if (rosterRoleFilter === 'officers' && !isOfficerMem) return false;
				if (
					rosterRoleFilter === 'members' &&
					(isLeaderMem || isOfficerMem)
				)
					return false;

				if (
					selectedMajorFilter !== 'all' &&
					!mem.major?.toLowerCase().includes(selectedMajorFilter.toLowerCase())
				) {
					return false;
				}

				const q = rosterSearchQuery.toLowerCase().trim();
				if (!q) return true;
				return (
					mem.name?.toLowerCase().includes(q) ||
					mem.email?.toLowerCase().includes(q) ||
					mem.major?.toLowerCase().includes(q) ||
					mem.bio?.toLowerCase().includes(q)
				);
			});
	}, [
		group.memberIds,
		group.leaderId,
		group.officerIds,
		resolveMember,
		rosterRoleFilter,
		selectedMajorFilter,
		rosterSearchQuery,
	]);


	const leadershipCount = 1;
	const officerCount = group.officerIds?.length || 0;
	const regularMemberCount = Math.max(
		0,
		group.memberIds.length - officerCount - leadershipCount,
	);

	return (
		<main className="grow mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
			{/* Roster Header & Telemetry */}
			<div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
					<div>
						<h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
							<FiUsers className="text-primary" /> Active Member Roster
						</h2>
						<p className="text-xs text-text-muted mt-0.5">
							Direct directory of verified organization members, student leaders, and executive officers.
						</p>
					</div>
					<div className="flex items-center gap-2 flex-wrap">
						<span className="text-xs font-bold bg-primary-light text-primary px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1.5 shadow-2xs">
							<FiShield size={12} /> {officerCount + leadershipCount} Leadership &amp; Officers
						</span>
						<span className="text-xs font-semibold bg-surface-secondary border border-border text-text-secondary px-3 py-1 rounded-full flex items-center gap-1.5">
							<FiUserCheck size={12} className="text-success" /> {group.memberIds.length} Verified Members
						</span>
					</div>
				</div>

				{/* Search & Role Filters */}
				<div className="space-y-3">
					<div className="flex flex-col sm:flex-row items-center gap-3">
						<div className="w-full sm:max-w-md">
							<Input
								icon={FiSearch}
								placeholder="Search members by name, email, major, or keywords..."
								value={rosterSearchQuery}
								onChange={(e) => setRosterSearchQuery(e.target.value)}
							/>
						</div>
						<div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
							<button
								type="button"
								onClick={() => setRosterRoleFilter('all')}
								className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
									rosterRoleFilter === 'all'
										? 'bg-primary text-white shadow-xs'
										: 'bg-surface-secondary text-text-muted hover:text-text-primary border border-border/60'
								}`}
							>
								All ({group.memberIds.length})
							</button>
							<button
								type="button"
								onClick={() => setRosterRoleFilter('leaders')}
								className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
									rosterRoleFilter === 'leaders'
										? 'bg-primary text-white shadow-xs'
										: 'bg-surface-secondary text-text-muted hover:text-text-primary border border-border/60'
								}`}
							>
								President (1)
							</button>
							<button
								type="button"
								onClick={() => setRosterRoleFilter('officers')}
								className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
									rosterRoleFilter === 'officers'
										? 'bg-primary text-white shadow-xs'
										: 'bg-surface-secondary text-text-muted hover:text-text-primary border border-border/60'
								}`}
							>
								Officers ({officerCount})
							</button>
							<button
								type="button"
								onClick={() => setRosterRoleFilter('members')}
								className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
									rosterRoleFilter === 'members'
										? 'bg-primary text-white shadow-xs'
										: 'bg-surface-secondary text-text-muted hover:text-text-primary border border-border/60'
								}`}
							>
								Members ({regularMemberCount})
							</button>
						</div>
					</div>

					{/* Major Filter Pills */}
					{availableMajors.length > 1 && (
						<div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 text-xs">
							<span className="text-[11px] font-semibold text-text-muted shrink-0 mr-1 flex items-center gap-1">
								<FiBookOpen size={12} /> Focus:
							</span>
							<button
								type="button"
								onClick={() => setSelectedMajorFilter('all')}
								className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
									selectedMajorFilter === 'all'
										? 'bg-text-primary text-surface font-semibold'
										: 'bg-surface-secondary text-text-muted hover:text-text-primary'
								}`}
							>
								All Disciplines
							</button>
							{availableMajors.map((major) => (
								<button
									key={major}
									type="button"
									onClick={() =>
										setSelectedMajorFilter(
											selectedMajorFilter === major ? 'all' : major,
										)
									}
									className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer shrink-0 ${
										selectedMajorFilter === major
											? 'bg-primary text-white font-semibold shadow-2xs'
											: 'bg-surface-secondary text-text-muted hover:text-text-primary border border-border/50'
									}`}
								>
									{major}
								</button>
							))}
						</div>
					)}
				</div>

				{/* Member Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					<AnimatePresence mode="popLayout">
						{filteredMembers.map((mem) => {
							const isLeaderMem = group.leaderId === mem.id;
							const isOfficerMem = Boolean(
								group.officerIds && group.officerIds.includes(mem.id),
							);

							return (
								<motion.div
									key={mem.id}
									layout
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.95 }}
									transition={{ duration: 0.2 }}
									className="flex flex-col justify-between p-4 rounded-2xl border border-border bg-surface hover:border-primary/40 hover:shadow-md transition-all group relative overflow-hidden"
								>
									{/* Top Bar with Avatar & Badges */}
									<div className="flex items-start gap-3.5">
										{mem.avatarUrl ? (
											<Image
												src={mem.avatarUrl}
												alt={mem.name || 'Member'}
												width={48}
												height={48}
												className="h-12 w-12 rounded-xl object-cover border border-border/80 shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
												unoptimized
											/>
										) : (
											<div className="h-12 w-12 rounded-xl bg-linear-to-br from-primary/20 to-violet-500/20 text-primary flex items-center justify-center text-base font-extrabold shrink-0 border border-primary/30 shadow-2xs">
												{mem.name?.[0] || 'M'}
											</div>
										)}

										<div className="min-w-0 grow">
											<div className="flex items-center justify-between gap-1">
												<h3 className="text-sm font-bold text-text-primary truncate group-hover:text-primary transition-colors">
													{mem.name}
												</h3>
												{isLeaderMem ? (
													<span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-1 shrink-0">
														<FiShield size={10} /> Lead
													</span>
												) : isOfficerMem ? (
													<span className="text-[10px] font-bold bg-primary-light text-primary px-2 py-0.5 rounded-md border border-primary/20 shrink-0">
														Officer
													</span>
												) : (
													<span className="text-[10px] font-medium bg-surface-secondary text-text-muted px-2 py-0.5 rounded-md border border-border shrink-0">
														Member
													</span>
												)}
											</div>

											<div className="flex items-center gap-1 text-[11px] text-text-muted truncate mt-0.5">
												<FiMail size={11} className="shrink-0 text-text-muted/70" />
												<span className="truncate">{mem.email}</span>
											</div>

											{mem.major && (
												<div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
													<span className="text-[10px] font-semibold text-primary bg-primary-light/50 px-2 py-0.5 rounded-md border border-primary/15 inline-block truncate max-w-full">
														{mem.major}
													</span>
													{mem.year && (
														<span className="text-[10px] font-medium text-text-muted bg-surface-secondary px-1.5 py-0.5 rounded border border-border/60">
															{mem.year}
														</span>
													)}
												</div>
											)}
										</div>
									</div>

									{/* Bio / Tagline */}
									{mem.bio && (
										<p className="mt-3 pt-3 border-t border-border/40 text-xs text-text-secondary line-clamp-2 leading-relaxed italic">
											&ldquo;{mem.bio}&rdquo;
										</p>
									)}
								</motion.div>
							);
						})}
					</AnimatePresence>
				</div>

				{/* Zero State */}
				{filteredMembers.length === 0 && (
					<div className="py-12 text-center rounded-2xl border border-dashed border-border bg-surface-secondary/20">
						<div className="h-12 w-12 rounded-2xl bg-surface border border-border flex items-center justify-center text-text-muted mx-auto mb-3 shadow-2xs">
							<FiUsers size={22} />
						</div>
						<h3 className="text-sm font-bold text-text-primary">
							No members match your criteria
						</h3>
						<p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
							Try adjusting your search query or clearing your role and major filters.
						</p>
						<button
							type="button"
							onClick={() => {
								setRosterSearchQuery('');
								setRosterRoleFilter('all');
								setSelectedMajorFilter('all');
							}}
							className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-all cursor-pointer shadow-2xs"
						>
							<FiX size={14} /> Clear Roster Filters
						</button>
					</div>
				)}
			</div>
		</main>
	);
}

