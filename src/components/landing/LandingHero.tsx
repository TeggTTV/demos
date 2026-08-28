'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiSearch, FiArrowRight, FiChevronDown } from 'react-icons/fi';
import { User } from '@/types/models';

interface LandingHeroProps {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	onSearchSubmit: (e: React.FormEvent) => void;
	currentUser: User | null;
}

export default function LandingHero({
	searchQuery,
	setSearchQuery,
	onSearchSubmit,
	currentUser,
}: LandingHeroProps) {
	const handleScrollDown = () => {
		if (typeof window !== 'undefined') {
			window.scrollTo({
				top: window.innerHeight - 60,
				behavior: 'smooth',
			});
		}
	};

	return (
		<header className="min-h-[calc(100vh-64px)] relative flex flex-col justify-center items-center overflow-hidden py-12 sm:py-16">
			{/* Decorative gradient blob */}
			<div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-125 w-200 -translate-x-1/2 opacity-30 blur-3xl">
				<div className="absolute inset-0 rounded-full bg-linear-to-br from-primary/40 via-indigo-300/30 to-violet-400/20" />
			</div>

			<div className="mx-auto max-w-4xl px-6 text-center my-auto">
				<motion.h1
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl lg:text-6xl leading-tight"
				>
					Promote, Engage, &amp;{' '}
					<span className="text-primary">Track Attendance</span> for Your Club
				</motion.h1>

				<motion.p
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="mt-5 text-base leading-7 text-text-secondary max-w-2xl mx-auto"
				>
					Demos allows student clubs to showcase their work, invite new members, communicate via club feeds, and track meeting attendance with effortless check-ins.
				</motion.p>

				{/* Search */}
				<motion.form
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
					onSubmit={onSearchSubmit}
					className="mt-8 max-w-xl mx-auto w-full px-2 sm:px-0"
				>
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-2xl sm:rounded-xl border border-border bg-surface p-2 sm:p-1.5 shadow-md focus-within:ring-2 focus-within:ring-primary/30 transition-all">
						<div className="flex items-center gap-2 grow px-1 sm:px-0 min-w-0">
							<FiSearch size={18} className="ml-1 sm:ml-3 text-text-muted shrink-0" />
							<input
								type="text"
								placeholder="Search clubs by name, category..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full bg-transparent px-2 py-2 sm:py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none min-w-0"
							/>
						</div>
						<button
							type="submit"
							className="w-full sm:w-auto rounded-xl sm:rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus:outline-none transition-colors shrink-0 cursor-pointer text-center"
						>
							Explore Clubs
						</button>
					</div>
				</motion.form>

				{/* Action Buttons */}
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
					className="mt-8 flex flex-wrap justify-center items-center gap-3"
				>
					<Link
						href="/search"
						className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-hover transition-all inline-flex items-center gap-2 cursor-pointer"
					>
						Explore All Clubs <FiArrowRight size={16} />
					</Link>
					<Link
						href={currentUser ? '/groups' : '/auth/register'}
						className="rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-text-primary hover:bg-surface-secondary hover:border-primary/40 transition-all cursor-pointer"
					>
						Start a Student Organization
					</Link>
				</motion.div>
			</div>

			{/* Animated Scroll-Down Notification at Bottom Center */}
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.8, duration: 0.6 }}
				onClick={handleScrollDown}
				className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer z-10 select-none group"
			>
				<span className="text-[10px] font-bold uppercase tracking-widest text-text-muted group-hover:text-primary transition-colors">
					Scroll Down
				</span>
				<div className="h-7 w-4.5 rounded-full border-2 border-text-muted/40 group-hover:border-primary flex items-start justify-center p-0.5 transition-colors">
					<motion.div
						animate={{ y: [0, 8, 0], opacity: [1, 0.4, 1] }}
						transition={{
							repeat: Infinity,
							duration: 1.5,
							ease: 'easeInOut',
						}}
						className="h-1.5 w-1.5 rounded-full bg-primary"
					/>
				</div>
				<motion.div
					animate={{ y: [0, 3, 0] }}
					transition={{
						repeat: Infinity,
						duration: 1.5,
						ease: 'easeInOut',
					}}
					className="text-text-muted group-hover:text-primary transition-colors -mt-1"
				>
					<FiChevronDown size={14} />
				</motion.div>
			</motion.div>
		</header>
	);
}
