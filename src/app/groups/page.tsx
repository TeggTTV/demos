'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '@/components/AppContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { FiUsers, FiArrowRight, FiPlus, FiKey } from 'react-icons/fi';
import CreateGroupModal from '@/components/group/CreateGroupModal';
import RedeemInviteModal from '@/components/modals/RedeemInviteModal';
import GroupCard from '@/components/group/GroupCard';
import { ClubCardSkeleton } from '@/components/ui/Skeleton';
import PageLoader from '@/components/ui/PageLoader';
import {
	ScrollStaggerContainer,
	ScrollStaggerItem,
} from '@/components/ui/ScrollReveal';

function GroupsContent() {
	const { currentUser, groups, createGroup, events, hydrated } = useAppContext();
	const router = useRouter();
	const searchParams = useSearchParams();

	const [activeTab, setActiveTab] = useState<'all' | 'leading' | 'joined'>(
		'all',
	);
	const [modalOpen, setModalOpen] = useState(false);
	const [inviteModalOpen, setInviteModalOpen] = useState(false);

	/* eslint-disable react-hooks/set-state-in-effect */
	useEffect(() => {
		const shouldCreate =
			searchParams.get('create') === 'true' ||
			searchParams.get('action') === 'create';
		if (shouldCreate) {
			setModalOpen(true);
		}
	}, [searchParams]);
	/* eslint-enable react-hooks/set-state-in-effect */

	if (!hydrated) {
		return (
			<div className="flex min-h-screen flex-col bg-background">
				<Nav />
				<main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="space-y-1">
							<div className="h-7 w-48 bg-border/40 rounded-lg animate-pulse" />
							<div className="h-4 w-72 bg-border/30 rounded-lg animate-pulse" />
						</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
						{Array.from({ length: 6 }).map((_, i) => (
							<ClubCardSkeleton key={i} />
						))}
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	if (!currentUser) {
		return (
			<div className="flex min-h-screen flex-col bg-background">
				<Nav />
				<main className="grow flex items-center justify-center p-6 text-center">
					<div className="max-w-md space-y-4">
						<div className="mx-auto h-12 w-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center text-xl shadow-xs">
							<FiUsers size={24} />
						</div>
						<h1 className="text-2xl font-bold text-text-primary">
							Sign In to Access Your Clubs
						</h1>
						<p className="text-xs text-text-secondary leading-relaxed">
							Join student organizations, access private
							discussion hubs, and track meeting attendance with
							your campus account.
						</p>
						<div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
							<Link
								href="/auth/login"
								className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm transition-all"
							>
								Sign In
							</Link>
							<Link
								href="/auth/register"
								className="rounded-xl border border-border bg-surface px-5 py-2.5 text-xs font-semibold text-text-primary hover:bg-surface-secondary transition-all"
							>
								Create Account
							</Link>
						</div>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	const leadingClubs = groups.filter((g) => g.leaderId === currentUser.id);
	const joinedClubs = groups.filter(
		(g) =>
			g.memberIds.includes(currentUser.id) &&
			g.leaderId !== currentUser.id,
	);
	const allUserClubs = groups.filter(
		(g) =>
			g.leaderId === currentUser.id ||
			g.memberIds.includes(currentUser.id),
	);

	const displayedClubs =
		activeTab === 'all'
			? allUserClubs
			: activeTab === 'leading'
				? leadingClubs
				: joinedClubs;

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Nav />

			<main className="grow mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
				{/* Top Bar Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
					<div>
						<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
							My Campus Clubs
						</h1>
						<p className="mt-1 text-xs sm:text-sm text-text-muted">
							Manage your executive leadership roles, member
							communications, and meeting sessions.
						</p>
					</div>

					<div className="flex items-center gap-2.5">
						<button
							onClick={() => setInviteModalOpen(true)}
							className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary shadow-2xs transition-all cursor-pointer"
						>
							<FiKey size={14} className="text-primary" />
							<span>Join with Code</span>
						</button>

						<button
							onClick={() => setModalOpen(true)}
							className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm transition-all cursor-pointer"
						>
							<FiPlus size={15} />
							<span>Register Club</span>
						</button>
					</div>
				</div>

				{/* Tab Filters */}
				<div className="flex items-center space-x-2 border-b border-border pb-1">
					<button
						onClick={() => setActiveTab('all')}
						className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
							activeTab === 'all'
								? 'border-primary text-primary'
								: 'border-transparent text-text-muted hover:text-text-primary'
						}`}
					>
						All Clubs ({allUserClubs.length})
					</button>
					<button
						onClick={() => setActiveTab('leading')}
						className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
							activeTab === 'leading'
								? 'border-primary text-primary'
								: 'border-transparent text-text-muted hover:text-text-primary'
						}`}
					>
						Leadership ({leadingClubs.length})
					</button>
					<button
						onClick={() => setActiveTab('joined')}
						className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
							activeTab === 'joined'
								? 'border-primary text-primary'
								: 'border-transparent text-text-muted hover:text-text-primary'
						}`}
					>
						Member ({joinedClubs.length})
					</button>
				</div>

				{/* Clubs Grid / Empty State */}
				{displayedClubs.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center max-w-lg mx-auto space-y-4">
						<div className="mx-auto h-12 w-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center text-xl">
							<FiUsers size={24} />
						</div>
						<h3 className="text-base font-bold text-text-primary">
							No clubs in this section
						</h3>
						<p className="text-xs text-text-muted leading-relaxed">
							{activeTab === 'leading'
								? 'You are not currently leading any student organizations. Start one now!'
								: activeTab === 'joined'
									? 'You have not joined any campus clubs yet. Explore the directory or redeem an invite.'
									: 'You are not affiliated with any campus clubs yet.'}
						</p>
						<div className="pt-2 flex flex-wrap justify-center gap-3">
							<Link
								href="/search"
								className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm inline-flex items-center gap-1.5"
							>
								<span>Explore Clubs</span>
								<FiArrowRight size={13} />
							</Link>
							<button
								onClick={() => setModalOpen(true)}
								className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-primary hover:bg-surface-secondary"
							>
								Register Club
							</button>
						</div>
					</div>
				) : (
					<ScrollStaggerContainer
						staggerDelay={0.07}
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
					>
						{displayedClubs.map((club) => (
							<ScrollStaggerItem key={club.id}>
								<GroupCard
									club={club}
									currentUser={currentUser}
									activeEvents={events}
								/>
							</ScrollStaggerItem>
						))}
					</ScrollStaggerContainer>
				)}
			</main>

			<CreateGroupModal
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				onCreateGroup={createGroup}
				onSuccess={(groupId) => router.push(`/group/${groupId}/feed`)}
			/>

			<RedeemInviteModal
				isOpen={inviteModalOpen}
				onClose={() => setInviteModalOpen(false)}
			/>

			<Footer />
		</div>
	);
}

export default function GroupsPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center bg-background">
					<PageLoader
						message="Loading Your Clubs"
						subMessage="Syncing memberships and leadership roles..."
					/>
				</div>
			}
		>
			<GroupsContent />
		</Suspense>
	);
}
