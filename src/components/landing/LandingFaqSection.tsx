'use client';

import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '@/components/ui/ScrollReveal';

const FAQ_ITEMS = [
	{
		q: 'How does meeting attendance check-in work?',
		a: 'Club leaders or officers schedule a meeting session, which creates a link. Members open the link and check-in on their smartphone or computer. Officers can also manually mark members as Present, Late, or Absent from the live checklist roster.',
	},
	{
		q: 'Can I export attendance records for student union reports?',
		a: 'Yes! Officers can export CSV attendance reports containing member names, emails, check-in timestamps, methods, and presence statuses to fulfill campus compliance.',
	},
	{
		q: 'How do students discover and apply to campus clubs?',
		a: 'Students can search the public club directory with category filters, meeting day schedules, and keywords. They can submit membership applications with a note or instantly join using direct invite codes shared by officers.',
	},
	{
		q: 'Is Demos free for university organizations?',
		a: 'Yes! Demos provides a complete suite of showcase tools, private club feeds, meeting scheduling, and attendance reporting designed specifically for student clubs and campus organizations.',
	},
	{
		q: 'What happens to my club data if I graduate?',
		a: 'Before you graduate, you can appoint a new club officer through the Settings panel. They’ll take over full ownership of the club page, meeting schedules, and attendance records. As a bonus, any departing officer will get a verified alumni badge on their profile, showing their leadership role in the organization.',
	},
];

export default function LandingFaqSection() {
	const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

	return (
		<section className="py-16">
			<ScrollReveal direction="up" className="mx-auto max-w-3xl px-6">
				<h2 className="text-2xl font-bold text-text-primary text-center mb-8">
					Frequently Asked Questions
				</h2>
				<div className="space-y-3">
					{FAQ_ITEMS.map((item, idx) => {
						const isOpen = faqOpenIndex === idx;

						return (
							<div
								key={idx}
								className="rounded-xl border border-border bg-surface overflow-hidden transition-colors"
							>
								<button
									onClick={() =>
										setFaqOpenIndex(isOpen ? null : idx)
									}
									className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
								>
									<span>{item.q}</span>
									<motion.div
										animate={{ rotate: isOpen ? 180 : 0 }}
										transition={{ duration: 0.2 }}
										className="text-text-muted shrink-0 ml-3"
									>
										<FiChevronDown size={16} />
									</motion.div>
								</button>
								<AnimatePresence initial={false}>
									{isOpen && (
										<motion.div
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: 'auto', opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											transition={{
												height: { duration: 0.25, ease: 'easeInOut' },
												opacity: { duration: 0.2 },
											}}
											className="overflow-hidden border-t border-border"
										>
											<div className="px-5 py-4 text-sm text-text-secondary leading-relaxed">
												<p>{item.a}</p>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						);
					})}
				</div>
			</ScrollReveal>
		</section>
	);
}
