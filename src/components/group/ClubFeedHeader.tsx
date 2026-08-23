'use client';

import React from 'react';
import Image from 'next/image';
import { Group, MeetingEvent } from '@/types/models';
import { DEFAULT_CLUB_BANNER } from '@/constants/bannerPresets';
import { FiInstagram, FiGlobe } from 'react-icons/fi';
import { FaDiscord } from 'react-icons/fa';

export type FeedTab =
	| 'feed'
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
}

export default function ClubFeedHeader({
	group,
	activeTab,
	setActiveTab,
	canManage,
	isLeader,
	clubEvents,
}: ClubFeedHeaderProps) {
	return (
		<div className="border-b border-border bg-surface">
			{/* Banner */}
			<div className="h-40 sm:h-32 w-full relative bg-surface-secondary overflow-hidden">
				{group.bannerUrl?.startsWith('data:') ||
				group.bannerUrl?.startsWith('http') ? (
					<Image
						src={group.bannerUrl}
						alt={group.name}
						fill
						priority
						className="object-cover"
					/>
				) : (
					<div
						className="w-full h-full"
						style={{
							background: group.bannerUrl || DEFAULT_CLUB_BANNER,
						}}
					/>
				)}

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

			{/* Tab Navigation */}
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex items-center space-x-6 overflow-x-auto pt-3 border-t border-border/40 scrollbar-none">
					<button
						onClick={() => setActiveTab('feed')}
						className={`pb-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
							activeTab === 'feed'
								? 'border-primary text-primary'
								: 'border-transparent text-text-muted hover:text-text-primary'
						}`}
					>
						💬 Feed
					</button>
					<button
						onClick={() => setActiveTab('attendance')}
						className={`pb-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
							activeTab === 'attendance'
								? 'border-primary text-primary'
								: 'border-transparent text-text-muted hover:text-text-primary'
						}`}
					>
						⏱️ Attendance
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
					>
						👥 Member Roster
					</button>
					<button
						onClick={() => setActiveTab('activities')}
						className={`pb-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
							activeTab === 'activities'
								? 'border-primary text-primary'
								: 'border-transparent text-text-muted hover:text-text-primary'
						}`}
					>
						📅 Activities
					</button>
					{canManage && (
						<button
							onClick={() => setActiveTab('roles')}
							className={`pb-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
								activeTab === 'roles'
									? 'border-primary text-primary'
									: 'border-transparent text-text-muted hover:text-text-primary'
							}`}
						>
							🛡️ Member Roles
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
						>
							⚙️ Club Settings
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
