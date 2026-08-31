'use client';

import React from 'react';
import { FiPlusCircle, FiUsers, FiCheckCircle } from 'react-icons/fi';
import ScrollReveal, {
	ScrollStaggerContainer,
	ScrollStaggerItem,
} from '@/components/ui/ScrollReveal';

const STEPS = [
	{
		num: '01',
		icon: FiPlusCircle,
		title: 'Create or Claim Your Club Hub',
		desc: 'Set up your club profile in under 2 minutes. Customize tags, banners, meeting schedule, and social links.',
	},
	{
		num: '02',
		icon: FiUsers,
		title: 'Onboard Members & Share Feeds',
		desc: 'Send shareable invite codes or accept applications. Post announcements, agendas, and files in your dedicated hub.',
	},
	{
		num: '03',
		icon: FiCheckCircle,
		title: 'Track Attendance & Export Reports',
		desc: 'Open self check-in links during meetings. Officers see live checklist updates and export CSV attendance sheets.',
	},
];

export default function LandingWorkflowSection() {
	return (
		<section className="py-16 bg-surface-secondary/50 border-t border-border">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<ScrollReveal direction="up" className="text-center mb-12">
					<span className="text-xs font-bold text-primary uppercase tracking-wider">
						Workflow
					</span>
					<h2 className="text-2xl sm:text-3xl font-bold text-text-primary mt-1">
						How Deimos Simplifies Club Operations
					</h2>
					<p className="mt-2 text-sm text-text-muted">
						Three seamless steps to run your organization effortlessly.
					</p>
				</ScrollReveal>

				<ScrollStaggerContainer
					staggerDelay={0.12}
					className="grid grid-cols-1 md:grid-cols-3 gap-6"
				>
					{STEPS.map((step) => {
						const Icon = step.icon;
						return (
							<ScrollStaggerItem
								key={step.num}
								className="h-full rounded-2xl border border-border bg-surface p-6 shadow-xs relative flex flex-col"
							>
								<div className="flex items-center justify-between mb-4">
									<div className="h-10 w-10 rounded-xl bg-primary-light flex items-center justify-center text-primary">
										<Icon size={20} />
									</div>
									<span className="text-2xl font-extrabold text-text-muted/30">
										{step.num}
									</span>
								</div>
								<h3 className="text-base font-bold text-text-primary">
									{step.title}
								</h3>
								<p className="mt-2 text-xs text-text-secondary leading-relaxed">
									{step.desc}
								</p>
							</ScrollStaggerItem>
						);
					})}
				</ScrollStaggerContainer>
			</div>
		</section>
	);
}
