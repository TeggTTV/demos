'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
	FiShield,
	FiDownload,
	FiUpload,
	FiPlus,
	FiSearch,
	FiChevronUp,
	FiChevronDown,
	FiUserCheck,
	FiUserMinus,
	FiEye,
	FiMail,
	FiEdit2,
	FiTrash2,
	FiX,
	FiCheckCircle,
} from 'react-icons/fi';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Group, User } from '@/types/models';
import { exportRosterToCSV } from '@/utils/csvExport';
import { formatLastActive } from '@/utils/dateUtils';
import AddMemberModal from '@/components/group/modals/AddMemberModal';
import ImportRosterModal from '@/components/group/modals/ImportRosterModal';

interface ClubRolesTabProps {
	group: Group;
	users: User[];
	isLeader: boolean;
	updateGroupSettings: (
		groupId: string,
		settings: {
			officerIds?: string[];
			kickUserId?: string;
			addMemberEmails?: string[];
		},
	) => Promise<{ success: boolean; error?: string }>;
	fetchGroups: () => Promise<void>;
}

export default function ClubRolesTab({
	group,
	users,
	isLeader,
	updateGroupSettings,
	fetchGroups,
}: ClubRolesTabProps) {
	const [memberSearchQuery, setMemberSearchQuery] = useState('');
	const [memberRosterFilter, setMemberRosterFilter] = useState<
		'all' | 'active' | 'inactive' | 'officers' | 'leader'
	>('all');
	const [memberSortOrder, setMemberSortOrder] = useState<'asc' | 'desc'>(
		'asc',
	);
	const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);
	const [roleChangeSuccess, setRoleChangeSuccess] = useState<string | null>(
		null,
	);

	const [showAddMemberModal, setShowAddMemberModal] = useState(false);
	const [addMemberSuccessMsg, setAddMemberSuccessMsg] = useState('');
	const [addMemberErrorMsg, setAddMemberErrorMsg] = useState('');
	const [isAddingMember, setIsAddingMember] = useState(false);

	const [showImportModal, setShowImportModal] = useState(false);
	const [importSuccessMsg, setImportSuccessMsg] = useState('');
	const [importErrorMsg, setImportErrorMsg] = useState('');
	const [isImporting, setIsImporting] = useState(false);

	const [viewingProfileUser, setViewingProfileUser] = useState<User | null>(
		null,
	);
	const [editingRoleUser, setEditingRoleUser] = useState<User | null>(null);

	const handlePromoteToOfficer = async (userId: string) => {
		setRoleUpdatingId(userId);
		const currentOfficers = group.officerIds || [];
		if (!currentOfficers.includes(userId)) {
			const res = await updateGroupSettings(group.id, {
				officerIds: [...currentOfficers, userId],
			});
			if (res.success) {
				setRoleChangeSuccess(
					'Promoted member to Officer successfully.',
				);
				setTimeout(() => setRoleChangeSuccess(null), 3000);
			}
		}
		setRoleUpdatingId(null);
	};

	const handleDemoteOfficer = async (userId: string) => {
		setRoleUpdatingId(userId);
		const currentOfficers = group.officerIds || [];
		const res = await updateGroupSettings(group.id, {
			officerIds: currentOfficers.filter((id) => id !== userId),
		});
		if (res.success) {
			setRoleChangeSuccess('Demoted officer to regular Member.');
			setTimeout(() => setRoleChangeSuccess(null), 3000);
		}
		setRoleUpdatingId(null);
	};

	const handleKickMember = async (userId: string, memberName: string) => {
		if (
			!confirm(
				`Are you sure you want to remove ${memberName} from this club?`,
			)
		) {
			return;
		}
		setRoleUpdatingId(userId);
		const res = await updateGroupSettings(group.id, {
			kickUserId: userId,
		});
		if (res.success) {
			setRoleChangeSuccess(`Removed ${memberName} from club roster.`);
			setTimeout(() => setRoleChangeSuccess(null), 3000);
		}
		setRoleUpdatingId(null);
	};

	const handleAddMember = async (email: string) => {
		if (!group || !email.trim()) return;
		setIsAddingMember(true);
		setAddMemberErrorMsg('');
		setAddMemberSuccessMsg('');
		try {
			const res = await updateGroupSettings(group.id, {
				addMemberEmails: [email.trim()],
			});
			if (res.error) {
				setAddMemberErrorMsg(res.error);
			} else {
				setAddMemberSuccessMsg(`Successfully added member: ${email}`);
				await fetchGroups();
			}
		} catch {
			setAddMemberErrorMsg('Failed to add member due to network error.');
		} finally {
			setIsAddingMember(false);
		}
	};

	const handleImportCSV = async (emailsText: string) => {
		if (!group || !emailsText.trim()) return;
		setIsImporting(true);
		setImportErrorMsg('');
		setImportSuccessMsg('');

		const emails = emailsText
			.split(/[\n,;]+/)
			.map((e) => e.trim().replace(/^["']|["']$/g, ''))
			.filter((e) => e && e.includes('@'));

		if (emails.length === 0) {
			setImportErrorMsg('No valid emails found to import.');
			setIsImporting(false);
			return;
		}

		try {
			const res = await updateGroupSettings(group.id, {
				addMemberEmails: emails,
			});
			if (res.error) {
				setImportErrorMsg(res.error);
			} else {
				setImportSuccessMsg(
					`Successfully processed ${emails.length} emails.`,
				);
				await fetchGroups();
			}
		} catch {
			setImportErrorMsg('Failed to import roster.');
		} finally {
			setIsImporting(false);
		}
	};

	const filteredAndSortedMemberIds = group.memberIds
		.filter((mId) => {
			const mem = users.find((u) => u.id === mId);
			const isLeaderMem = group.leaderId === mId;
			const isOfficerMem = Boolean(
				group.officerIds && group.officerIds.includes(mId),
			);

			if (memberRosterFilter === 'officers' && !isOfficerMem)
				return false;
			if (memberRosterFilter === 'leader' && !isLeaderMem) return false;

			const q = memberSearchQuery.toLowerCase().trim();
			if (!q) return true;
			return (
				mem?.name?.toLowerCase().includes(q) ||
				mem?.email?.toLowerCase().includes(q) ||
				mem?.major?.toLowerCase().includes(q)
			);
		})
		.sort((a, b) => {
			const nameA = users.find((u) => u.id === a)?.name || '';
			const nameB = users.find((u) => u.id === b)?.name || '';
			return memberSortOrder === 'asc'
				? nameA.localeCompare(nameB)
				: nameB.localeCompare(nameA);
		});

	return (
		<main className="grow mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
			<div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
				{/* Title Header */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
					<div>
						<h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
							<FiShield className="text-primary" /> Members &amp;
							Roles
						</h2>
						<p className="text-xs text-text-muted mt-0.5">
							View and manage all members, roles, and activity.
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<button
							onClick={() => exportRosterToCSV(group, users)}
							className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-text-secondary hover:text-text-primary px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
						>
							<FiDownload size={12} />
							<span>Export Members</span>
						</button>
						{isLeader && (
							<>
								<button
									onClick={() => setShowImportModal(true)}
									className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-text-secondary hover:text-text-primary px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
								>
									<FiUpload size={12} />
									<span>Import Members</span>
								</button>
								<button
									onClick={() => setShowAddMemberModal(true)}
									className="inline-flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
								>
									<FiPlus size={13} />
									<span>Add Member</span>
								</button>
							</>
						)}
					</div>
				</div>

				{/* Notification Success Toast */}
				{roleChangeSuccess && (
					<div className="text-xs text-success bg-success-bg border border-success/20 p-3 rounded-xl flex items-center gap-2 font-medium">
						<FiCheckCircle className="shrink-0" />
						<span>{roleChangeSuccess}</span>
					</div>
				)}

				{/* Search & Filters */}
				<div className="flex flex-col sm:flex-row gap-3">
					<div className="grow">
						<Input
							icon={FiSearch}
							type="text"
							placeholder="Search members by name, email, or major..."
							value={memberSearchQuery}
							onChange={(e) =>
								setMemberSearchQuery(e.target.value)
							}
						/>
					</div>
					<div className="w-full sm:w-48 shrink-0">
						<Select
							value={memberRosterFilter}
							onChange={(e) =>
								setMemberRosterFilter(
									e.target.value as
										| 'all'
										| 'active'
										| 'inactive'
										| 'officers'
										| 'leader',
								)
							}
						>
							<option value="all">All Members</option>
							<option value="officers">Officers Only</option>
							<option value="leader">Leader Only</option>
						</Select>
					</div>
				</div>

				{/* Member Table */}
				<div className="border border-border rounded-2xl bg-surface overflow-hidden shadow-2xs">
					<div className="overflow-x-auto w-full">
						<table className="w-full text-left border-collapse min-w-[620px]">
							<thead>
								<tr className="bg-surface-secondary/70 border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider select-none">
									<th
										onClick={() =>
											setMemberSortOrder((prev) =>
												prev === 'asc' ? 'desc' : 'asc',
											)
										}
										className="py-3.5 px-4 cursor-pointer hover:text-text-primary transition-colors flex items-center gap-1.5"
									>
										<span>Name</span>
										{memberSortOrder === 'asc' ? (
											<FiChevronUp size={12} />
										) : (
											<FiChevronDown size={12} />
										)}
									</th>
									<th className="py-3.5 px-4">Email</th>
									<th className="py-3.5 px-4">
										Major / Program
									</th>
									<th className="py-3.5 px-4">Phone</th>
									<th className="py-3.5 px-4">Role</th>
									<th className="py-3.5 px-4">Last Active</th>
									<th className="py-3.5 px-4 text-right">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border text-xs">
								{filteredAndSortedMemberIds.length === 0 ? (
									<tr>
										<td
											colSpan={7}
											className="py-8 text-center text-text-muted italic"
										>
											No club members found matching
											filters.
										</td>
									</tr>
								) : (
									filteredAndSortedMemberIds.map((mId) => {
										const mem = users.find(
											(u) => u.id === mId,
										);
										const isMemLeader =
											group.leaderId === mId;
										const isMemOfficer = Boolean(
											group.officerIds &&
											group.officerIds.includes(mId),
										);
										const isUpdating =
											roleUpdatingId === mId;

										return (
											<tr
												key={mId}
												className="hover:bg-surface-secondary/20 transition-colors"
											>
												<td className="py-3 px-4 font-semibold text-text-primary">
													<div className="flex items-center gap-3">
														{mem?.avatarUrl ? (
															<Image
																src={
																	mem.avatarUrl
																}
																alt=""
																width={32}
																height={32}
																className="h-8 w-8 rounded-full object-cover border border-border shrink-0"
																unoptimized
															/>
														) : (
															<div className="h-8 w-8 rounded-full bg-primary-light text-primary flex items-center justify-center text-xs font-bold shrink-0">
																{mem
																	?.name?.[0] ||
																	'M'}
															</div>
														)}
														<span
															className="truncate max-w-[130px] sm:max-w-[170px]"
															title={
																mem?.name ||
																'Club Member'
															}
														>
															{mem?.name ||
																'Club Member'}
														</span>
													</div>
												</td>

												<td className="py-3 px-4 text-text-secondary">
													<a
														href={`mailto:${mem?.email}`}
														title={mem?.email}
														className="text-primary hover:underline font-medium block truncate max-w-[140px] sm:max-w-[180px]"
													>
														{mem?.email}
													</a>
												</td>

												<td className="py-3 px-4 text-text-secondary">
													<span
														className="block truncate max-w-[120px] sm:max-w-[160px]"
														title={
															mem?.major || '-'
														}
													>
														{mem?.major || '-'}
													</span>
												</td>

												<td className="py-3 px-4 text-text-secondary">
													<span
														className="block truncate max-w-[110px]"
														title={
															mem?.phone || '-'
														}
													>
														{mem?.phone || '-'}
													</span>
												</td>

												<td className="py-3 px-4">
													{isMemLeader ? (
														<span className="inline-flex items-center gap-1 text-[9px] font-bold bg-primary text-white px-2 py-0.5 rounded-full shadow-2xs">
															<FiShield
																size={9}
															/>
															Leader
														</span>
													) : isMemOfficer ? (
														<span className="inline-flex items-center gap-1 text-[9px] font-bold bg-primary-light text-primary px-2 py-0.5 rounded-full border border-primary/20">
															<FiUserCheck
																size={9}
															/>
															Officer
														</span>
													) : (
														<span className="text-[10px] text-text-muted font-medium bg-surface-secondary border border-border px-2 py-0.5 rounded-full">
															Member
														</span>
													)}
												</td>

												<td className="py-3 px-4 text-text-secondary whitespace-nowrap">
													{formatLastActive(
														mem?.lastActive,
													)}
												</td>

												<td className="py-3 px-4 text-right whitespace-nowrap">
													<div className="inline-flex items-center gap-1.5">
														<button
															type="button"
															onClick={() =>
																setViewingProfileUser(
																	mem || null,
																)
															}
															className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
															title="View Profile Details"
														>
															<FiEye size={13} />
														</button>
														{mem?.email && (
															<a
																href={`mailto:${mem.email}`}
																className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors inline-block"
																title="Send Email"
															>
																<FiMail
																	size={13}
																/>
															</a>
														)}
														{isLeader &&
															!isMemLeader && (
																<>
																	<button
																		type="button"
																		disabled={
																			isUpdating
																		}
																		onClick={() =>
																			setEditingRoleUser(
																				mem ||
																					null,
																			)
																		}
																		className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary-light transition-colors cursor-pointer disabled:opacity-50"
																		title="Edit Role / Permissions"
																	>
																		<FiEdit2
																			size={
																				13
																			}
																		/>
																	</button>
																	<button
																		type="button"
																		disabled={
																			isUpdating
																		}
																		onClick={() =>
																			handleKickMember(
																				mId,
																				mem?.name ||
																					'Member',
																			)
																		}
																		className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger-bg transition-colors cursor-pointer disabled:opacity-50"
																		title="Remove from Club"
																	>
																		<FiTrash2
																			size={
																				13
																			}
																		/>
																	</button>
																</>
															)}
													</div>
												</td>
											</tr>
										);
									})
								)}
							</tbody>
						</table>
					</div>

					<div className="bg-surface-secondary/70 border-t border-border px-4 py-3 text-[11px] text-text-muted font-medium flex items-center justify-between">
						<span>
							Showing {filteredAndSortedMemberIds.length} members
						</span>
					</div>
				</div>
			</div>

			{/* View Profile Modal */}
			{viewingProfileUser && (
				<div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
					<div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden relative">
						<button
							onClick={() => setViewingProfileUser(null)}
							className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
						>
							<FiX size={16} />
						</button>
						<div className="p-6 space-y-6">
							<div className="flex items-center gap-4">
								{viewingProfileUser.avatarUrl ? (
									<Image
										src={viewingProfileUser.avatarUrl}
										alt=""
										width={64}
										height={64}
										className="h-16 w-16 rounded-full object-cover border border-border shrink-0"
										unoptimized
									/>
								) : (
									<div className="h-16 w-16 rounded-full bg-primary-light text-primary flex items-center justify-center text-xl font-bold shrink-0">
										{viewingProfileUser.name?.[0] || 'U'}
									</div>
								)}
								<div>
									<h3 className="text-lg font-bold text-text-primary">
										{viewingProfileUser.name}
									</h3>
									<p className="text-xs text-text-muted">
										{viewingProfileUser.email}
									</p>
									<div className="mt-1.5">
										{group.leaderId ===
										viewingProfileUser.id ? (
											<span className="inline-flex items-center gap-1 text-[9px] font-bold bg-primary text-white px-2 py-0.5 rounded-full shadow-2xs">
												<FiShield size={9} />
												Leader
											</span>
										) : group.officerIds?.includes(
												viewingProfileUser.id,
										  ) ? (
											<span className="inline-flex items-center gap-1 text-[9px] font-bold bg-primary-light text-primary px-2 py-0.5 rounded-full border border-primary/20">
												<FiUserCheck size={9} />
												Officer
											</span>
										) : (
											<span className="inline-flex text-[9px] text-text-muted font-medium bg-surface-secondary border border-border px-2 py-0.5 rounded-full">
												Member
											</span>
										)}
									</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4 text-xs border-t border-border pt-4">
								<div>
									<span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
										Major / Program
									</span>
									<span className="text-text-primary font-medium">
										{viewingProfileUser.major ||
											'Not specified'}
									</span>
								</div>
								<div>
									<span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
										Class / Year
									</span>
									<span className="text-text-primary font-medium">
										{viewingProfileUser.year ||
											'Not specified'}
									</span>
								</div>
								<div>
									<span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
										Phone Number
									</span>
									<span className="text-text-primary font-medium">
										{viewingProfileUser.phone ||
											'Not specified'}
									</span>
								</div>
								<div>
									<span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
										Last Active
									</span>
									<span className="text-text-primary font-medium">
										{viewingProfileUser.lastActive
											? new Date(
													viewingProfileUser.lastActive,
												).toLocaleString()
											: 'Never'}
									</span>
								</div>
							</div>

							<div className="border-t border-border pt-4 text-xs">
								<span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
									Bio &amp; Interests
								</span>
								<p className="text-text-secondary bg-surface-secondary p-3 rounded-xl border border-border min-h-15 whitespace-pre-line leading-relaxed">
									{viewingProfileUser.bio ||
										'This user has not written a bio yet.'}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Add Member Modal */}
			<AddMemberModal
				isOpen={showAddMemberModal}
				onClose={() => {
					setShowAddMemberModal(false);
					setAddMemberErrorMsg('');
					setAddMemberSuccessMsg('');
				}}
				onAddMember={handleAddMember}
				isAdding={isAddingMember}
				errorMsg={addMemberErrorMsg}
				successMsg={addMemberSuccessMsg}
			/>

			{/* Import Members Modal */}
			<ImportRosterModal
				isOpen={showImportModal}
				onClose={() => {
					setShowImportModal(false);
					setImportErrorMsg('');
					setImportSuccessMsg('');
				}}
				onImport={handleImportCSV}
				isImporting={isImporting}
				errorMsg={importErrorMsg}
				successMsg={importSuccessMsg}
			/>

			{/* Edit Role Modal */}
			{editingRoleUser && (
				<div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
					<div className="bg-surface border border-border w-full max-w-sm rounded-2xl shadow-xl overflow-hidden relative">
						<button
							onClick={() => setEditingRoleUser(null)}
							className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
						>
							<FiX size={16} />
						</button>
						<div className="p-6 space-y-4">
							<div>
								<h3 className="text-sm font-bold text-text-primary">
									Change Member Role
								</h3>
								<p className="text-[11px] text-text-muted mt-0.5">
									Update {editingRoleUser.name}&apos;s
									permissions in {group.name}.
								</p>
							</div>

							<div className="flex items-center gap-3 bg-surface-secondary p-3 rounded-xl border border-border">
								{editingRoleUser.avatarUrl ? (
									<Image
										src={editingRoleUser.avatarUrl}
										alt=""
										width={36}
										height={36}
										className="h-9 w-9 rounded-full object-cover border border-border shrink-0"
										unoptimized
									/>
								) : (
									<div className="h-9 w-9 rounded-full bg-primary-light text-primary flex items-center justify-center text-xs font-bold shrink-0">
										{editingRoleUser.name?.[0] || 'M'}
									</div>
								)}
								<div>
									<span className="block font-bold text-text-primary text-xs">
										{editingRoleUser.name}
									</span>
									<span className="text-[10px] text-text-muted block">
										{editingRoleUser.email}
									</span>
								</div>
							</div>

							<div className="space-y-2 border-t border-border pt-4">
								{group.officerIds?.includes(
									editingRoleUser.id,
								) ? (
									<button
										onClick={async () => {
											await handleDemoteOfficer(
												editingRoleUser.id,
											);
											setEditingRoleUser(null);
										}}
										disabled={
											roleUpdatingId ===
											editingRoleUser.id
										}
										className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface hover:bg-surface-secondary text-text-secondary hover:text-text-primary py-2.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
									>
										<FiUserMinus
											size={13}
											className="text-warning"
										/>
										<span>Demote to Member</span>
									</button>
								) : (
									<button
										onClick={async () => {
											await handlePromoteToOfficer(
												editingRoleUser.id,
											);
											setEditingRoleUser(null);
										}}
										disabled={
											roleUpdatingId ===
											editingRoleUser.id
										}
										className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white py-2.5 text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
									>
										<FiUserCheck size={13} />
										<span>Promote to Officer</span>
									</button>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</main>
	);
}
