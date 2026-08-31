'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FiShield, FiCalendar, FiMapPin, FiArrowRight, FiEyeOff } from 'react-icons/fi';
import { Group, MeetingEvent, User } from '@/types/models';
import MemberAvatarStack from '@/components/group/MemberAvatarStack';
import ClubBanner from '@/components/ui/ClubBanner';

interface GroupCardProps {
	club: Group;
	currentUser: User | null;
	activeEvents?: MeetingEvent[];
	onClick?: (club: Group) => void;
}

export default function GroupCard({
	club,
	currentUser,
	activeEvents = [],
	onClick,
}: GroupCardProps) {
	const router = useRouter();
	const isLeader = currentUser && club.leaderId === currentUser.id;
	const isOfficer =
		currentUser &&
		club.officerIds &&
		club.officerIds.includes(currentUser.id);
	const isMember =
		currentUser &&
		(club.leaderId === currentUser.id ||
			club.memberIds.includes(currentUser.id) ||
			isOfficer);
	const clubActiveEvents = activeEvents.filter(
		(e) => e.groupId === club.id && e.isActive,
	);

	const handleCardClick = () => {
		if (onClick) {
			onClick(club);
		} else {
			router.push(`/group/${club.id}/feed`);
		}
	};

	const tags = club.tags || [];

	return (
		<button
			type="button"
			onClick={handleCardClick}
			className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-border bg-surface text-left transition-all duration-300 hover:border-primary/50 hover:shadow-xl relative"
			aria-label={`${isMember ? 'Enter' : 'View'} ${club.name}`}
		>
			{/* Banner */}
			<div className="h-36 w-full relative bg-surface-secondary overflow-hidden">
				<ClubBanner
					bannerUrl={club.bannerUrl}
					alt={club.name}
					category={club.category}
					className="object-cover group-hover:scale-105 transition-transform duration-500"
				/>
				<div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20" />

				<div className="absolute top-3 right-3 bg-surface/95 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-primary border border-border shadow-xs">
					{club.category}
				</div>

				<div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap max-w-[75%]">
					{isLeader ? (
						<span className="bg-primary text-white px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 shadow-md">
							<FiShield size={11} /> Leader
						</span>
					) : isOfficer ? (
						<span className="bg-primary-light/90 backdrop-blur-xs text-primary px-2.5 py-1 rounded-lg text-[10px] font-extrabold border border-primary/30 shadow-xs">
							Officer
						</span>
					) : null}

					{(isLeader || isOfficer) &&
						(club.isPrivate ||
							club.isPublicToGuests === false ||
							club.isPublicToMembers === false) && (
							<span
								title="This club is currently hidden from non-members"
								className="bg-warning/95 backdrop-blur-xs text-black px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-xs border border-warning/30"
							>
								<FiEyeOff size={10} /> Hidden
							</span>
						)}
				</div>

				{/* Active Meeting Session Overlay */}
				{clubActiveEvents.length > 0 && (
					<div className="absolute bottom-3 left-3 right-3 rounded-xl bg-surface/95 backdrop-blur-md border border-primary/30 p-2 flex items-center justify-between text-xs shadow-md">
						<div className="flex items-center gap-2 text-primary font-bold text-[11px]">
							<span className="flex h-2 w-2 relative">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
								<span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
							</span>
							<span>Live Meeting Active</span>
						</div>
						{isLeader || isOfficer ? (
							<span className="text-[10px] font-mono bg-primary text-white px-2 py-0.5 rounded-md font-extrabold shadow-2xs">
								PIN: {clubActiveEvents[0].checkInCode}
							</span>
						) : (
							<span className="text-[10px] font-bold bg-success-bg text-success px-2 py-0.5 rounded-md border border-success/30">
								Check In Open
							</span>
						)}
					</div>
				)}
			</div>

			{/* Content Body */}
			<div className="p-5 flex flex-col grow justify-between space-y-4">
				<div className="space-y-2">
					<h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
						{club.name}
					</h3>
					{club.tagline && (
						<p className="text-xs text-text-muted line-clamp-1 font-medium">
							{club.tagline}
						</p>
					)}

					<p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
						{club.description}
					</p>

					{/* Tag Badges */}
					{tags.length > 0 && (
						<div className="flex items-center gap-1.5 flex-wrap pt-1">
							{tags.slice(0, 3).map((tag) => (
								<span
									key={tag}
									className="text-[10px] font-medium bg-surface-secondary text-text-muted px-2 py-0.5 rounded-md border border-border/60"
								>
									#{tag}
								</span>
							))}
							{tags.length > 3 && (
								<span className="text-[10px] text-text-muted font-medium">
									+{tags.length - 3} more
								</span>
							)}
						</div>
					)}
				</div>

				{/* Meeting Info & Metadata */}
				<div className="space-y-3 pt-2">
					<div className="pt-3 border-t border-border space-y-1.5 text-xs text-text-muted">
						{club.meetingFrequency && (
							<div className="flex items-center gap-2">
								<FiCalendar size={12} className="text-primary shrink-0" />
								<span className="truncate">{club.meetingFrequency}</span>
							</div>
						)}
						{club.meetingLocation && (
							<div className="flex items-center gap-2">
								<FiMapPin size={12} className="text-primary shrink-0" />
								<span className="truncate">{club.meetingLocation}</span>
							</div>
						)}
					</div>

					{/* Footer with Member Stacks & Action */}
					<div className="pt-3 border-t border-border/70 flex items-center justify-between gap-2">
						<div className="flex items-center gap-2 min-w-0">
							<MemberAvatarStack
								memberIds={club.memberIds}
								leaderId={club.leaderId}
								maxDisplay={4}
								size="sm"
							/>
							<span className="text-[11px] text-text-muted font-semibold shrink-0">
								{club.memberIds?.length || 0} members
							</span>
						</div>

						<div className="rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white group-hover:bg-primary-hover transition-all shadow-xs inline-flex items-center gap-1 shrink-0">
							<span>{isMember ? 'Enter Hub' : 'Explore'}</span>
							<FiArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
						</div>
					</div>
				</div>
			</div>
		</button>
	);
}

