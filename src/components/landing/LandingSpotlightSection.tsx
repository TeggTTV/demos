'use client';

import React from 'react';
import Link from 'next/link';
import { FiCalendar, FiMapPin, FiArrowRight, FiPlusCircle } from 'react-icons/fi';
import { Group, User } from '@/types/models';
import MemberAvatarStack from '@/components/group/MemberAvatarStack';
import ClubBanner from '@/components/ui/ClubBanner';
import ScrollReveal, {
	ScrollStaggerContainer,
	ScrollStaggerItem,
} from '@/components/ui/ScrollReveal';

interface LandingSpotlightSectionProps {
	groups: Group[];
	currentUser: User | null;
}

export default function LandingSpotlightSection({
	groups,
	currentUser,
}: LandingSpotlightSectionProps) {
	if (groups.length <= 5) {
		return null;
	}

	return (
		<section className="py-16">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<ScrollReveal direction="up" className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
					<div>
						<span className="text-xs font-bold text-primary uppercase tracking-wider">
							Spotlight
						</span>
						<h2 className="text-2xl font-bold text-text-primary mt-1">
							Featured Campus Clubs
						</h2>
					</div>
					{groups.length > 0 && (
						<Link
							href="/search"
							className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
						>
							View all {groups.length} clubs <FiArrowRight size={14} />
						</Link>
					)}
				</ScrollReveal>

				{groups.length > 0 ? (
					<ScrollStaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{groups.slice(0, 3).map((club) => (
							<ScrollStaggerItem
								key={club.id}
								className="group rounded-2xl border border-border bg-surface overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all flex flex-col"
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
								</div>

								{/* Content */}
								<div className="p-5 flex flex-col grow">
									<h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
										{club.name}
									</h3>
									<p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
										{club.tagline || club.description}
									</p>

									{/* Meeting info */}
									<div className="mt-4 pt-3 border-t border-border space-y-1.5 text-xs text-text-muted">
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

									{/* Footer stats & Action */}
									<div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
										<MemberAvatarStack
											memberIds={club.memberIds}
											leaderId={club.leaderId}
											maxDisplay={4}
											size="sm"
										/>
										<Link
											href={`/group/${club.id}/feed`}
											className="rounded-lg bg-primary-light px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-all shrink-0"
										>
											View Club
										</Link>
									</div>
								</div>
							</ScrollStaggerItem>
						))}
					</ScrollStaggerContainer>
				) : (
					<div className="rounded-2xl border border-dashed border-border bg-surface/50 p-12 text-center max-w-xl mx-auto">
						<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary mb-4">
							<FiPlusCircle size={28} />
						</div>
						<h3 className="text-lg font-bold text-text-primary">
							No clubs registered yet
						</h3>
						<p className="text-xs text-text-muted mt-2 leading-relaxed">
							Be the first to create and showcase your student organization on campus. Set up meeting schedules, invite members, and track attendance.
						</p>
						<div className="mt-6 flex justify-center gap-3">
							<Link
								href={currentUser ? '/groups' : '/auth/register'}
								className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm transition-all inline-flex items-center gap-2"
							>
								Create a Club <FiArrowRight size={14} />
							</Link>
						</div>
					</div>
				)}
			</div>
		</section>
	);
}
