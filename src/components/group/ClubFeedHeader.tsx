'use client';

import React from 'react';
import { Group, MeetingEvent } from '@/types/models';
import ClubBanner from '@/components/ui/ClubBanner';
import {
	FiInstagram,
	FiGlobe,
	FiMessageCircle,
	FiClock,
	FiUsers,
	FiCalendar,
	FiShield,
	FiSettings,
	FiEyeOff,
	FiBarChart2,
} from 'react-icons/fi';
import { FaDiscord } from 'react-icons/fa';

export type FeedTab =
	| 'feed'
	| 'polls'
	| 'attendance'
	| 'roster'
	| 'roles'
	| 'settings'
	| 'activities';

interface ClubFeedHeaderProps {
	group: Group;
	activeTab: FeedTab;
	setActiveTab: (tab: FeedTab) => void;
	canManage: boolean;
	isLeader: boolean;
	clubEvents: MeetingEvent[];
	activePollsCount?: number;
}

export default function ClubFeedHeader({
	group,
	activeTab,
	setActiveTab,
	canManage,
	isLeader,
	clubEvents,
	activePollsCount,
}: ClubFeedHeaderProps) {
	return (
		<div className="border-b border-border bg-surface">
			{/* Banner */}
			<div className="h-40 sm:h-32 w-full relative bg-surface-secondary overflow-hidden">
				<ClubBanner
					bannerUrl={group.bannerUrl}
					alt={group.name}
					category={group.category}
					priority
					className="object-cover"
				/>

				<div className="absolute bottom-4 left-4 sm:left-8 right-4 sm:right-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
					<div>
						<span className="inline-block bg-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1.5 shadow-xs">
							{group.category}
						</span>
						<h1 className="text-xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm">
							{group.name}
						</h1>
						{group.tagline && (
							<p className="text-xs sm:text-sm text-white/90 font-medium drop-shadow-sm mt-0.5">
								{group.tagline}
							</p>
						)}
					</div>

					{/* Quick Social links */}
					<div className="flex items-center gap-2">
						{group.discordUrl && (
							<a
								href={group.discordUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-white hover:bg-white/30 transition-all"
								title="Discord"
							>
								<FaDiscord size={16} />
							</a>
						)}
						{group.instagramUrl && (
							<a
								href={group.instagramUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-white hover:bg-white/30 transition-all"
								title="Instagram"
							>
								<FiInstagram size={16} />
							</a>
						)}
						{group.websiteUrl && (
							<a
								href={group.websiteUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-white hover:bg-white/30 transition-all"
								title="Website"
							>
								<FiGlobe size={16} />
							</a>
						)}
					</div>
				</div>
			</div>

			{/* Leader Notice Banner: Shown when the club is hidden to non-members/guests */}
			{canManage && (group.isPrivate || group.isPublicToGuests === false || group.isPublicToMembers === false) && (
				<div className="bg-amber-500/10 border-b border-amber-500/20 px-4 sm:px-8 py-2.5">
					<div className="mx-auto max-w-7xl flex items-center justify-between gap-3 text-xs">
						<div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-medium">
							<FiEyeOff className="shrink-0 text-amber-600 dark:text-amber-400" size={15} />
							<span>
								<strong className="font-bold">Private / Hidden Organization:</strong> This club is currently hidden from non-members and unauthorized guests. It is only visible to you because of your officer/leader role.
							</span>
						</div>
						<button
							onClick={() => setActiveTab('settings')}
							className="text-amber-900 dark:text-amber-200 underline font-semibold text-[11px] hover:opacity-80 shrink-0 cursor-pointer"
						>
							Manage Privacy Settings
						</button>
					</div>
				</div>
			)}

			{/* Tab Navigation */}
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex items-center space-x-6 overflow-x-auto pt-3 border-t border-border/40 scrollbar-none" role="tablist" aria-label="Club hub sections">
					<button
						onClick={() => setActiveTab('feed')}
						className={`pb-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
							activeTab === 'feed'
								? 'border-primary text-primary'
								: 'border-transparent text-text-muted hover:text-text-primary'
						}`}
						role="tab"
						aria-selected={activeTab === 'feed'}
					>
						<span className="inline-flex items-center gap-1.5"><FiMessageCircle aria-hidden="true" /> Feed</span>
					</button>
					<button
						onClick={() => setActiveTab('polls')}
						className={`pb-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
							activeTab === 'polls'
								? 'border-primary text-primary'
								: 'border-transparent text-text-muted hover:text-text-primary'
						}`}
						role="tab"
						aria-selected={activeTab === 'polls'}
					>
						<FiBarChart2 aria-hidden="true" /> Polls
						{typeof activePollsCount === 'number' && activePollsCount > 0 && (
							<span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-primary text-white text-[9px] font-bold">
								{activePollsCount}
							</span>
						)}
					</button>
					<button
						onClick={() => setActiveTab('attendance')}
						className={`pb-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
							activeTab === 'attendance'
								? 'border-primary text-primary'
								: 'border-transparent text-text-muted hover:text-text-primary'
						}`}
						role="tab"
						aria-selected={activeTab === 'attendance'}
					>
						<FiClock aria-hidden="true" /> Attendance
						{clubEvents.some((e) => e.isActive) && (
							<span className="h-2 w-2 rounded-full bg-success animate-pulse" />
						)}
					</button>
					<button
						onClick={() => setActiveTab('roster')}
						className={`pb-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
							activeTab === 'roster'
								? 'border-primary text-primary'
								: 'border-transparent text-text-muted hover:text-text-primary'
						}`}
						role="tab"
						aria-selected={activeTab === 'roster'}
					>
						<span className="inline-flex items-center gap-1.5"><FiUsers aria-hidden="true" /> Member roster</span>
					</button>
					<button
						onClick={() => setActiveTab('activities')}
						className={`pb-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
							activeTab === 'activities'
								? 'border-primary text-primary'
								: 'border-transparent text-text-muted hover:text-text-primary'
						}`}
						role="tab"
						aria-selected={activeTab === 'activities'}
					>
						<span className="inline-flex items-center gap-1.5"><FiCalendar aria-hidden="true" /> Activities</span>
					</button>
					{canManage && (
						<button
							onClick={() => setActiveTab('roles')}
							className={`pb-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
								activeTab === 'roles'
									? 'border-primary text-primary'
									: 'border-transparent text-text-muted hover:text-text-primary'
							}`}
							role="tab"
							aria-selected={activeTab === 'roles'}
						>
							<span className="inline-flex items-center gap-1.5"><FiShield aria-hidden="true" /> Member roles</span>
						</button>
					)}
					{isLeader && (
						<button
							onClick={() => setActiveTab('settings')}
							className={`pb-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
								activeTab === 'settings'
									? 'border-primary text-primary'
									: 'border-transparent text-text-muted hover:text-text-primary'
							}`}
							role="tab"
							aria-selected={activeTab === 'settings'}
						>
							<span className="inline-flex items-center gap-1.5"><FiSettings aria-hidden="true" /> Club settings</span>
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
