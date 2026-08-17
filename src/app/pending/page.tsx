'use client';

import { useState } from 'react';
import { useAppContext } from '@/components/AppContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import {
	FiClock,
	FiSend,
	FiArchive,
	FiRefreshCw,
} from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';

export default function PendingPage() {
	const {
		currentUser,
		requests,
		groups,
		users,
		approveRequest,
		declineRequest,
		hydrated,
		refreshData,
	} = useAppContext();
	const [activeTab, setActiveTab] = useState<'requests' | 'sent' | 'history'>(
		'requests',
	);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const handleRefresh = async () => {
		setIsRefreshing(true);
		await refreshData();
		setIsRefreshing(false);
	};

	if (!hydrated) return null;

	if (!currentUser) {
		return (
			<div className="flex min-h-screen flex-col bg-background">
				<Nav />
				<main className="grow flex items-center justify-center p-6 text-center">
					<p className="text-text-muted text-sm">
						Please sign in to view club applications and invitations.
					</p>
				</main>
				<Footer />
			</div>
		);
	}

	const sentPending = requests.filter(
		(r) => r.userId === currentUser.id && r.status === 'PENDING',
	);

	const ledGroups = groups.filter(
		(g) =>
			g.leaderId === currentUser.id ||
			(g.officerIds && g.officerIds.includes(currentUser.id)),
	);
	const ledGroupIds = ledGroups.map((g) => g.id);

	const receivedPending = requests.filter(
		(r) => ledGroupIds.includes(r.groupId) && r.status === 'PENDING',
	);

	const historyRequests = requests.filter(
		(r) =>
			(r.userId === currentUser.id || ledGroupIds.includes(r.groupId)) &&
			r.status !== 'PENDING',
	);

	const getGroupName = (id: string) =>
		groups.find((g) => g.id === id)?.name || 'Unknown Club';
	const getUserObj = (id: string) => users.find((u) => u.id === id);

	const statusBadge = (status: string) => {
		const map: Record<string, string> = {
			PENDING: 'bg-warning-bg text-warning border-warning/20',
			APPROVED: 'bg-success-bg text-success border-success/20',
			DECLINED: 'bg-danger-bg text-danger border-danger/20',
		};
		return map[status] || 'bg-surface-secondary text-text-muted border-border';
	};

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Nav />

			<main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
				<div className="flex items-center justify-between mb-1">
					<h1 className="text-2xl font-bold text-text-primary">
						Club Applications &amp; Requests
					</h1>
					<button
						onClick={handleRefresh}
						disabled={isRefreshing}
						className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-all shadow-2xs cursor-pointer disabled:opacity-50"
					>
						<FiRefreshCw
							size={12}
							className={isRefreshing ? 'animate-spin' : ''}
						/>
						{isRefreshing ? 'Refreshing...' : 'Refresh'}
					</button>
				</div>
				<p className="text-xs text-text-muted mb-6">
					Review prospective member applications for clubs you lead and
					track your own join requests.
				</p>

				{/* Tabs */}
				<div className="flex border-b border-border mb-6">
					<button
						onClick={() => setActiveTab('requests')}
						className={`flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
							activeTab === 'requests'
								? 'border-primary text-primary'
								: 'border-transparent text-text-muted hover:text-text-primary'
						}`}
					>
						<FiClock size={14} />
						Received Applications ({receivedPending.length})
					</button>
					<button
						onClick={() => setActiveTab('sent')}
						className={`flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
							activeTab === 'sent'
								? 'border-primary text-primary'
								: 'border-transparent text-text-muted hover:text-text-primary'
						}`}
					>
						<FiSend size={14} />
						Sent by Me ({sentPending.length})
					</button>
					<button
						onClick={() => setActiveTab('history')}
						className={`flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
							activeTab === 'history'
								? 'border-primary text-primary'
								: 'border-transparent text-text-muted hover:text-text-primary'
						}`}
					>
						<FiArchive size={14} />
						History ({historyRequests.length})
					</button>
				</div>

				{/* Received Applications Tab */}
				{activeTab === 'requests' && (
					<div className="space-y-3">
						{receivedPending.length === 0 ? (
							<div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
								<p className="text-xs text-text-muted">
									No pending membership applications for your clubs.
								</p>
							</div>
						) : (
							receivedPending.map((req) => {
								const applicant = getUserObj(req.userId);
								const clubName = getGroupName(req.groupId);

								return (
									<div
										key={req.id}
										className="rounded-2xl border border-border bg-surface p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
									>
										<div className="flex items-start gap-3.5">
											{applicant?.avatarUrl ? (
												<Image
													src={applicant.avatarUrl}
													alt=""
													width={40}
													height={40}
													className="h-10 w-10 rounded-full object-cover border border-border shrink-0 mt-0.5"
												/>
											) : (
												<div className="h-10 w-10 rounded-full bg-primary-light text-primary flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
													{applicant?.name?.[0] || 'U'}
												</div>
											)}
											<div>
												<h3 className="text-sm font-bold text-text-primary">
													{applicant?.name || 'Applicant'}
												</h3>
												<div className="flex flex-wrap items-center gap-2 text-xs text-text-muted mt-0.5">
													<span>{applicant?.email}</span>
													{applicant?.major && (
														<span className="text-[10px] bg-primary-light text-primary px-2 py-0.2 rounded-full font-medium">
															{applicant.major}
														</span>
													)}
												</div>

												<p className="text-xs font-semibold text-primary mt-1.5">
													Applied to join: {clubName}
												</p>

												{req.message && (
													<p className="text-xs text-text-secondary mt-1 bg-surface-secondary p-2 rounded-lg border border-border/50 italic">
														&ldquo;{req.message}&rdquo;
													</p>
												)}
											</div>
										</div>

										<div className="flex items-center gap-2 self-end sm:self-center shrink-0">
											<button
												onClick={() => declineRequest(req.id)}
												className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger-bg transition-colors"
											>
												Decline
											</button>
											<button
												onClick={() => approveRequest(req.id)}
												className="rounded-xl bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover transition-colors shadow-2xs"
											>
												Approve &amp; Add
											</button>
										</div>
									</div>
								);
							})
						)}
					</div>
				)}

				{/* Sent by Me Tab */}
				{activeTab === 'sent' && (
					<div className="space-y-3">
						{sentPending.length === 0 ? (
							<div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
								<p className="text-xs text-text-muted">
									You have no pending club applications.
								</p>
								<Link
									href="/search"
									className="mt-3 inline-block text-xs text-primary font-semibold hover:underline"
								>
									Explore Campus Clubs →
								</Link>
							</div>
						) : (
							sentPending.map((req) => (
								<div
									key={req.id}
									className="rounded-2xl border border-border bg-surface p-4 shadow-xs flex items-center justify-between"
								>
									<div>
										<h4 className="text-sm font-bold text-text-primary">
											{getGroupName(req.groupId)}
										</h4>
										<p className="text-xs text-text-muted mt-0.5">
											Submitted on{' '}
											{new Date(req.createdAt).toLocaleDateString()}
										</p>
										{req.message && (
											<p className="text-xs text-text-secondary mt-1 italic">
												&ldquo;{req.message}&rdquo;
											</p>
										)}
									</div>
									<span className="rounded-full bg-warning-bg text-warning border border-warning/20 px-2.5 py-0.5 text-[10px] font-bold">
										Pending Review
									</span>
								</div>
							))
						)}
					</div>
				)}

				{/* History Tab */}
				{activeTab === 'history' && (
					<div className="space-y-3">
						{historyRequests.length === 0 ? (
							<div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
								<p className="text-xs text-text-muted">
									No application history recorded yet.
								</p>
							</div>
						) : (
							historyRequests.map((req) => {
								const applicant = getUserObj(req.userId);
								return (
									<div
										key={req.id}
										className="rounded-2xl border border-border bg-surface p-4 shadow-xs flex items-center justify-between text-xs"
									>
										<div>
											<span className="font-bold text-text-primary block">
												{getGroupName(req.groupId)}
											</span>
											<span className="text-text-muted text-[11px]">
												Applicant:{' '}
												{applicant?.name || 'Club Member'} •{' '}
												{new Date(
													req.createdAt,
												).toLocaleDateString()}
											</span>
										</div>
										<span
											className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${statusBadge(
												req.status,
											)}`}
										>
											{req.status}
										</span>
									</div>
								);
							})
						)}
					</div>
				)}
			</main>

			<Footer />
		</div>
	);
}
