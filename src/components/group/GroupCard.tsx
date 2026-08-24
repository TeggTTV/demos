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

	return (
		<button
			type="button"
			onClick={handleCardClick}
			className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-surface text-left transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-lg"
			aria-label={`${isMember ? 'Enter' : 'View'} ${club.name} club hub`}
		>
			{/* Banner */}
			<div className="h-32 w-full relative bg-surface-secondary overflow-hidden">
				<ClubBanner
					bannerUrl={club.bannerUrl}
					alt={club.name}
					category={club.category}
					className="object-cover group-hover:scale-102 transition-transform duration-300"
				/>
				<div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-bold text-primary border border-border">
					{club.category}
				</div>

				<div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap max-w-[80%]">
					{isLeader ? (
						<span className="bg-primary text-white px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-xs">
							<FiShield size={10} /> Lead
						</span>
					) : isOfficer ? (
						<span className="bg-primary-light text-primary px-2 py-0.5 rounded-md text-[10px] font-bold border border-primary/20">
							Officer
						</span>
					) : null}

					{(isLeader || isOfficer) && (club.isPrivate || club.isPublicToGuests === false || club.isPublicToMembers === false) && (
						<span
							title="This club is currently hidden from non-members / guest visitors and only visible to you"
							className="bg-warning/95 backdrop-blur-xs text-black px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-xs border border-warning/30"
						>
							<FiEyeOff size={10} /> Hidden to Non-Members
						</span>
					)}
				</div>
			</div>

			{/* Content */}
			<div className="p-5 flex flex-col grow">
				<h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
					{club.name}
				</h3>
				{club.tagline && (
					<p className="text-xs text-text-muted mt-0.5 line-clamp-1">
						{club.tagline}
					</p>
				)}

				<p className="text-xs text-text-secondary mt-2 line-clamp-2 leading-relaxed">
					{club.description}
				</p>

				{/* Active Event Banner */}
				{clubActiveEvents.length > 0 && (
					<div className="mt-3 rounded-lg bg-primary-light/60 border border-primary/20 p-2.5 flex items-center justify-between text-xs">
						<div className="flex items-center gap-1.5 text-primary font-semibold">
							<span className="flex h-2 w-2 relative">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
								<span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
							</span>
							Live Meeting Session Active
						</div>
						{isLeader || isOfficer ? (
							<span className="text-[10px] font-mono bg-surface px-1.5 py-0.5 rounded border border-border text-primary font-bold">
								{clubActiveEvents[0].checkInCode}
							</span>
						) : (
							<span className="text-[10px] font-semibold bg-success-bg text-success px-2 py-0.5 rounded-full border border-success/20">
								Active
							</span>
						)}
					</div>
				)}

				{/* Meeting schedule & location */}
				<div className="mt-4 pt-3 border-t border-border space-y-1 text-xs text-text-muted">
					<div className="flex items-center gap-2">
						<FiCalendar
							size={13}
							className="text-primary shrink-0"
						/>
						<span className="truncate">
							{club.meetingFrequency}
						</span>
					</div>
					{club.meetingLocation && (
						<div className="flex items-center gap-2">
							<FiMapPin
								size={13}
								className="text-primary shrink-0"
							/>
							<span className="truncate">
								{club.meetingLocation}
							</span>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
					<MemberAvatarStack
						memberIds={club.memberIds}
						leaderId={club.leaderId}
						maxDisplay={4}
						size="sm"
					/>
					<div className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover transition-all shadow-2xs inline-flex items-center gap-1 shrink-0">
						{isMember ? 'Enter Hub' : 'View Details'} <FiArrowRight size={12} />
					</div>
				</div>
			</div>
		</button>
	);
}
