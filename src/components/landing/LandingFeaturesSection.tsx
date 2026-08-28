'use client';

import React from 'react';
import Link from 'next/link';
import {
	FiShare2,
	FiUsers,
	FiMessageSquare,
	FiCheckCircle,
	FiArrowRight,
	FiZap,
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
	const features = [
		{
			icon: FiShare2,
			badge: 'Public Discovery',
			title: 'Showcase & Recruitment',
			description:
				'Highlight your organization’s mission, meeting cadence, room locations, leadership team, and social channels to attract new campus talent.',
			link: '/search',
			linkText: 'Explore Public Directory',
			gradient: 'from-blue-500/20 to-indigo-500/20',
			iconColor: 'text-primary',
			tag: 'Directory',
		},
		{
			icon: FiUsers,
			badge: 'Instant Onboarding',
			title: 'Invite Codes & Roster',
			description:
				'Generate secure invite codes for instant joining, manage executive officer permissions, and maintain verified digital member rosters.',
			link: '/join',
			linkText: 'Test Join Codes',
			gradient: 'from-purple-500/20 to-violet-500/20',
			iconColor: 'text-violet-500',
			tag: 'Membership',
		},
		{
			icon: FiMessageSquare,
			badge: 'Team Collaboration',
			title: 'Hub Feeds & Sub-Apps',
			description:
				'Centralized club feeds with pinned announcements, interactive member polls, meeting scheduling, and shared workshop slides.',
			link: currentUser ? '/groups' : '/auth/register',
			linkText: 'Explore Hub Feeds',
			gradient: 'from-emerald-500/20 to-teal-500/20',
			iconColor: 'text-emerald-500',
			tag: 'Communication',
		},
		{
			icon: FiCheckCircle,
			badge: 'Zero Friction',
			title: 'Live Attendance & CSV',
			description:
				'Launch live meeting sessions with projector QR codes or 6-digit PINs. Track verified turnout and export university-compliant CSV reports.',
			link: '/search',
			linkText: 'See Attendance Tracker',
			gradient: 'from-amber-500/20 to-orange-500/20',
			iconColor: 'text-amber-500',
			tag: 'Attendance',
		},
	];

	return (
		<section className="py-20 bg-surface-secondary/30 border-y border-border relative overflow-hidden">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<ScrollReveal direction="up" className="text-center max-w-3xl mx-auto mb-14 space-y-3">
					<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-bold border border-primary/20">
						<FiZap size={12} /> Built For Campus High-Performers
					</div>
					<h2 className="text-2xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
						Engineered for Every University Organization
					</h2>
					<p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-2xl mx-auto">
						Purpose-built for engineering design teams, ACM chapters, student venture incubators, cultural societies, and collegiate performance groups.
					</p>
				</ScrollReveal>

				<ScrollStaggerContainer
					staggerDelay={0.1}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
				>
					{features.map((feat) => {
						const Icon = feat.icon;
						return (
							<ScrollStaggerItem key={feat.title}>
								<Link
									href={feat.link}
									className="h-full rounded-3xl border border-border bg-surface p-6 shadow-xs hover:border-primary/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
								>
									{/* Subtle background glow */}
									<div
										className={`absolute -top-10 -right-10 h-28 w-28 rounded-full bg-linear-to-br ${feat.gradient} opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 pointer-events-none`}
									/>

									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<div className={`h-12 w-12 rounded-2xl bg-surface-secondary border border-border flex items-center justify-center ${feat.iconColor} group-hover:scale-110 group-hover:shadow-sm transition-all duration-300`}>
												<Icon size={22} />
											</div>
											<span className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-surface-secondary px-2.5 py-0.5 rounded-full border border-border/60">
												{feat.tag}
											</span>
										</div>

										<div className="space-y-1.5">
											<span className="text-[11px] font-bold text-primary block">
												{feat.badge}
											</span>
											<h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors">
												{feat.title}
											</h3>
										</div>

										<p className="text-xs text-text-secondary leading-relaxed">
											{feat.description}
										</p>
									</div>

									<div className="mt-6 pt-4 border-t border-border/60 text-xs font-bold text-primary inline-flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform">
										<span>{feat.linkText}</span>
										<FiArrowRight size={13} />
									</div>
								</Link>
							</ScrollStaggerItem>
						);
					})}
				</ScrollStaggerContainer>
			</div>
		</section>
	);
}

