'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FiUsers, FiSearch, FiShield } from 'react-icons/fi';
import { Group, User } from '@/types/models';

interface ClubRosterTabProps {
	group: Group;
	users: User[];
}

export default function ClubRosterTab({ group, users }: ClubRosterTabProps) {
	const [rosterSearchQuery, setRosterSearchQuery] = useState('');
	const [rosterRoleFilter, setRosterRoleFilter] = useState<
		'all' | 'leaders' | 'officers' | 'members'
	>('all');

	return (
		<main className="grow mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
			<div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
					<div>
						<h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
							<FiUsers className="text-primary" /> Member Roster
						</h2>
						<p className="text-xs text-text-muted mt-0.5">
							Explore active club members, leaders, and officers.
						</p>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-xs font-semibold bg-primary-light text-primary px-3 py-1 rounded-full border border-primary/20">
							{group.officerIds?.length || 0} Officers
						</span>
						<span className="text-xs font-semibold bg-surface-secondary border border-border text-text-secondary px-3 py-1 rounded-full">
							{group.memberIds.length} Total Members
						</span>
					</div>
				</div>

				{/* Search & Role Filters */}
				<div className="flex flex-col sm:flex-row items-center gap-3">
					<div className="relative w-full sm:max-w-md">
						<FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
						<input
							type="text"
							placeholder="Search members by name, email, or major..."
							value={rosterSearchQuery}
							onChange={(e) => setRosterSearchQuery(e.target.value)}
							className="w-full rounded-xl border border-border bg-surface-secondary pl-8 pr-3.5 py-2 text-xs text-text-primary focus:ring-2 focus:ring-primary/30 focus:outline-none placeholder:text-text-muted"
						/>
					</div>
					<div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
						<button
							onClick={() => setRosterRoleFilter('all')}
							className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
								rosterRoleFilter === 'all'
									? 'bg-primary text-white shadow-2xs'
									: 'bg-surface-secondary text-text-muted hover:text-text-primary'
							}`}
						>
							All ({group.memberIds.length})
						</button>
						<button
							onClick={() => setRosterRoleFilter('leaders')}
							className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
								rosterRoleFilter === 'leaders'
									? 'bg-primary-500 text-white shadow-2xs'
									: 'bg-surface-secondary text-text-muted hover:text-text-primary'
							}`}
						>
							Leadership (1)
						</button>
						<button
							onClick={() => setRosterRoleFilter('officers')}
							className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
								rosterRoleFilter === 'officers'
									? 'bg-primary text-white shadow-2xs'
									: 'bg-surface-secondary text-text-muted hover:text-text-primary'
							}`}
						>
							Officers ({group.officerIds?.length || 0})
						</button>
						<button
							onClick={() => setRosterRoleFilter('members')}
							className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
								rosterRoleFilter === 'members'
									? 'bg-primary text-white shadow-2xs'
									: 'bg-surface-secondary text-text-muted hover:text-text-primary'
							}`}
						>
							Members (
							{Math.max(
								0,
								group.memberIds.length -
									(group.officerIds?.length || 0) -
									1,
							)}
							)
						</button>
					</div>
				</div>

				{/* Member Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
					{group.memberIds
						.filter((mId) => {
							const mem = users.find((u) => u.id === mId);
							const isLeaderMem = group.leaderId === mId;
							const isOfficerMem = Boolean(
								group.officerIds &&
									group.officerIds.includes(mId),
							);
							if (rosterRoleFilter === 'leaders' && !isLeaderMem)
								return false;
							if (rosterRoleFilter === 'officers' && !isOfficerMem)
								return false;
							if (
								rosterRoleFilter === 'members' &&
								(isLeaderMem || isOfficerMem)
							)
								return false;
							const q = rosterSearchQuery.toLowerCase().trim();
							if (!q) return true;
							return (
								mem?.name?.toLowerCase().includes(q) ||
								mem?.email?.toLowerCase().includes(q) ||
								mem?.major?.toLowerCase().includes(q)
							);
						})
						.map((mId) => {
							const mem = users.find((u) => u.id === mId);
							const isLeaderMem = group.leaderId === mId;
							const isOfficerMem = Boolean(
								group.officerIds &&
									group.officerIds.includes(mId),
							);

							return (
								<div
									key={mId}
									className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-surface-secondary/30 hover:border-primary/30 transition-all"
								>
									{mem?.avatarUrl ? (
										<Image
											src={mem.avatarUrl}
											alt=""
											width={40}
											height={40}
											className="h-10 w-10 rounded-full object-cover border border-border shrink-0"
											unoptimized
										/>
									) : (
										<div className="h-10 w-10 rounded-full bg-primary-light text-primary flex items-center justify-center text-xs font-bold shrink-0">
											{mem?.name?.[0] || 'M'}
										</div>
									)}
									<div className="min-w-0">
										<div className="flex items-center gap-1.5">
											<span className="text-xs font-bold text-text-primary truncate">
												{mem?.name || 'Club Member'}
											</span>
											{isLeaderMem ? (
												<span className="text-[9px] font-bold bg-primary-500 text-white px-1.5 py-0.5 rounded-full shadow-2xs flex items-center gap-0.5">
													<FiShield size={9} /> Leader
												</span>
											) : isOfficerMem ? (
												<span className="text-[9px] font-bold bg-primary-light text-primary px-1.5 py-0.5 rounded-full border border-primary/20">
													Officer
												</span>
											) : (
												<span className="text-[9px] font-medium bg-surface text-text-muted px-1.5 py-0.5 rounded-full border border-border">
													Member
												</span>
											)}
										</div>
										<span className="text-[11px] text-text-muted block truncate mt-0.5">
											{mem?.email}
										</span>
										{mem?.major && (
											<span className="text-[10px] text-primary/80 font-medium block truncate">
												{mem.major}{' '}
												{mem.year ? `• Year ${mem.year}` : ''}
											</span>
										)}
									</div>
								</div>
							);
						})}
				</div>
			</div>
		</main>
	);
}
