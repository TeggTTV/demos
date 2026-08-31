'use client';

import React from 'react';
import ScrollReveal, {
	ScrollStaggerContainer,
	ScrollStaggerItem,
} from '@/components/ui/ScrollReveal';

export default function LandingGuideSection() {
	return (
		<section className="py-16 bg-surface border-t border-border">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<ScrollReveal direction="up" className="text-center max-w-3xl mx-auto mb-12">
					<span className="text-xs font-bold text-primary uppercase tracking-wider">
						Club Leadership Best Practices
					</span>
					<h2 className="text-2xl sm:text-3xl font-bold text-text-primary mt-1">
						Why Student Organizations Choose Deimos
					</h2>
					<p className="mt-3 text-sm text-text-secondary leading-relaxed">
						Running a collegiate organization involves coordinating
						executive boards, promoting campus events, onboarding
						new recruits, maintaining member engagement, and
						reporting verified meeting attendance to university
						student unions and faculty advisors.
					</p>
				</ScrollReveal>

				<ScrollStaggerContainer
					staggerDelay={0.12}
					className="grid grid-cols-1 md:grid-cols-3 gap-8"
				>
					<ScrollStaggerItem className="rounded-2xl border border-border bg-surface-secondary/40 p-6 space-y-3">
						<h3 className="text-base font-bold text-text-primary">
							1. Contactless Attendance
						</h3>
						<p className="text-xs text-text-secondary leading-relaxed">
							Stop using paper sign-in sheets and shared Google
							Forms. Deimos generates dynamic link check-in code.
							Officers can monitor the attendance roster in
							real-time, mark absences, and download CSV reports
							formatted for campus administration.
						</p>
					</ScrollStaggerItem>

					<ScrollStaggerItem className="rounded-2xl border border-border bg-surface-secondary/40 p-6 space-y-3">
						<h3 className="text-base font-bold text-text-primary">
							2. Centralized Communication Hubs
						</h3>
						<p className="text-xs text-text-secondary leading-relaxed">
							Using multiple communication platforms like
							WhatsApp, GroupMe, Discord, and email leads to
							missed announcements. Deimos provides a dedicated
							workspace featuring pinned executive notices, and
							file + link sharing from any smartphone or laptop.
						</p>
					</ScrollStaggerItem>

					<ScrollStaggerItem className="rounded-2xl border border-border bg-surface-secondary/40 p-6 space-y-3">
						<h3 className="text-base font-bold text-text-primary">
							3. Modern Progressive Web App (PWA)
						</h3>
						<p className="text-xs text-text-secondary leading-relaxed">
							Deimos is a website but it is also installable to
							your homescreen as an app. Students receive push
							notifications for important club announcements and
							meeting check-in reminders directly on their iOS and
							Android phones without having to touch the app
							store.
						</p>
					</ScrollStaggerItem>
				</ScrollStaggerContainer>
			</div>
		</section>
	);
}
