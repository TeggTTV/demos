'use client';

import React from 'react';
import Link from 'next/link';
import {
	FiShare2,
	FiUsers,
	FiMessageSquare,
	FiCheckCircle,
	FiArrowRight,
} from 'react-icons/fi';
import { User } from '@/types/models';
import ScrollReveal, {
	ScrollStaggerContainer,
	ScrollStaggerItem,
} from '@/components/ui/ScrollReveal';

interface LandingFeaturesSectionProps {
	currentUser: User | null;
}

export default function LandingFeaturesSection({
	currentUser,
}: LandingFeaturesSectionProps) {
	return (
		<section className="py-16 bg-surface-secondary/40 border-y border-border">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<ScrollReveal direction="up" className="text-center max-w-3xl mx-auto mb-12">
					<h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
						Everything Student Organizations Need
					</h2>
					<p className="mt-3 text-sm text-text-muted leading-relaxed">
						Built specifically for university clubs, design teams,
						honor societies, Greek life, cultural groups, and
						special interest student organizations.
					</p>
				</ScrollReveal>

				<ScrollStaggerContainer
					staggerDelay={0.1}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
				>
					{/* Card 1: Promotion */}
					<ScrollStaggerItem>
						<Link
							href="/search"
							className="h-full rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col group"
						>
							<div className="h-10 w-10 rounded-xl bg-primary-light flex items-center justify-center text-primary mb-4 group-hover:scale-105 transition-transform">
								<FiShare2 size={20} />
							</div>
							<h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors">
								Club Promotion &amp; Discovery
							</h3>
							<p className="mt-2 text-xs text-text-secondary leading-relaxed grow">
								Highlight your club’s mission, meeting times, room
								locations, team, and social links to attract new
								campus recruits.
							</p>
							<div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-semibold text-primary inline-flex items-center gap-1">
								Browse Public Directory <FiArrowRight size={12} />
							</div>
						</Link>
					</ScrollStaggerItem>

					{/* Card 2: Onboarding */}
					<ScrollStaggerItem>
						<Link
							href="/join"
							className="h-full rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col group"
						>
							<div className="h-10 w-10 rounded-xl bg-primary-light flex items-center justify-center text-primary mb-4 group-hover:scale-105 transition-transform">
								<FiUsers size={20} />
							</div>
							<h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors">
								Member Invites &amp; Roster
							</h3>
							<p className="mt-2 text-xs text-text-secondary leading-relaxed grow">
								Accept membership applications with student major
								and graduation year details, or generate invite
								codes for instant joining.
							</p>
							<div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-semibold text-primary inline-flex items-center gap-1">
								Redeem Invite Codes <FiArrowRight size={12} />
							</div>
						</Link>
					</ScrollStaggerItem>

					{/* Card 3: Communication */}
					<ScrollStaggerItem>
						<Link
							href={currentUser ? '/groups' : '/auth/register'}
							className="h-full rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col group"
						>
							<div className="h-10 w-10 rounded-xl bg-primary-light flex items-center justify-center text-primary mb-4 group-hover:scale-105 transition-transform">
								<FiMessageSquare size={20} />
							</div>
							<h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors">
								Club Hub &amp; Announcements
							</h3>
							<p className="mt-2 text-xs text-text-secondary leading-relaxed grow">
								Post pinned announcements, discussions, and
								resources links in a private, focused team
								workspace.
							</p>
							<div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-semibold text-primary inline-flex items-center gap-1">
								Dedicated Hub Feeds <FiArrowRight size={12} />
							</div>
						</Link>
					</ScrollStaggerItem>

					{/* Card 4: Attendance */}
					<ScrollStaggerItem>
						<Link
							href="/search"
							className="h-full rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col group"
						>
							<div className="h-10 w-10 rounded-xl bg-primary-light flex items-center justify-center text-primary mb-4 group-hover:scale-105 transition-transform">
								<FiCheckCircle size={20} />
							</div>
							<h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors">
								Live Attendance Tracking
							</h3>
							<p className="mt-2 text-xs text-text-secondary leading-relaxed grow">
								Generate links or QR codes for instant student self
								check-in during meetings and export CSV when its
								over.
							</p>
							<div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-semibold text-primary inline-flex items-center gap-1">
								Fast Link Check-In <FiArrowRight size={12} />
							</div>
						</Link>
					</ScrollStaggerItem>
				</ScrollStaggerContainer>
			</div>
		</section>
	);
}
