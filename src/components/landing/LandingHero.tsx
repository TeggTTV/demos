'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiArrowRight, FiChevronDown, FiZap } from 'react-icons/fi';
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
	const [sandboxTab, setSandboxTab] = useState<
		'feed' | 'attendance' | 'roster'
	>('feed');
	const [votedOption, setVotedOption] = useState<number | null>(0);
	const [copiedPin, setCopiedPin] = useState(false);

	const handleScrollDown = () => {
		if (typeof window !== 'undefined') {
			window.scrollTo({
				top: window.innerHeight - 60,
				behavior: 'smooth',
			});
		}
	};

	const quickCategories = [
		'Technology & Coding',
		'Arts & Design',
		'Engineering & Robotics',
		'Business & Venture',
	];

	return (
		<header className="relative flex flex-col justify-center items-center overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24">
			{/* Decorative ambient gradients */}
			<div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-160 w-240 -translate-x-1/2 opacity-35 blur-3xl">
				<div className="absolute inset-0 rounded-full bg-linear-to-tr from-primary/50 via-indigo-400/40 to-violet-500/30" />
			</div>

			<div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center my-auto w-full space-y-8">
				{/* Top Launch Pill */}
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-primary/20 shadow-sm text-xs font-semibold text-text-primary"
				>
					<span className="flex h-2 w-2 relative">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
						<span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
					</span>
					<span className="text-primary font-bold">
						Deimos Campus OS
					</span>
					<span className="text-text-muted">
						· Next-Gen Club Management
					</span>
				</motion.div>

				{/* Hero Heading */}
				<div className="space-y-4 max-w-4xl mx-auto">
					<motion.h1
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl lg:text-6xl leading-[1.15]"
					>
						Promote, Engage, &amp;{' '}
						<span className="bg-linear-to-r from-primary via-indigo-500 to-violet-600 bg-clip-text text-transparent">
							Track Attendance
						</span>{' '}
						for Campus Clubs
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="text-base sm:text-lg leading-relaxed text-text-secondary max-w-2xl mx-auto"
					>
						The all-in-one operating platform for student
						organizations: showcase your mission, recruit new
						members, publish announcements, and log meeting
						attendance seamlessly.
					</motion.p>
				</div>

				{/* Live Search & Quick Categories */}
				<motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
					className="max-w-2xl mx-auto w-full space-y-3"
				>
					<form onSubmit={onSearchSubmit} className="w-full">
						<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-2xl border border-border bg-surface/95 backdrop-blur-md p-2 shadow-lg shadow-primary/5 focus-within:ring-2 focus-within:ring-primary/40 transition-all">
							<div className="flex items-center gap-3 grow px-2 min-w-0">
								<FiSearch
									size={18}
									className="text-primary shrink-0"
								/>
								<input
									type="text"
									placeholder="Search clubs by name, mission, coding, design, robotics..."
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
									className="w-full bg-transparent py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none min-w-0"
								/>
							</div>
							<button
								type="submit"
								className="rounded-xl bg-primary px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-primary-hover focus:outline-none transition-colors shrink-0 cursor-pointer text-center"
							>
								Explore Clubs
							</button>
						</div>
					</form>

					{/* Quick Category Chips */}
					<div className="flex items-center justify-center gap-1.5 flex-wrap pt-1 text-xs">
						<span className="text-[11px] font-semibold text-text-muted mr-1">
							Popular:
						</span>
						{quickCategories.map((cat) => (
							<Link
								key={cat}
								href={`/search?category=${encodeURIComponent(cat)}`}
								className="px-2.5 py-1 rounded-lg bg-surface-secondary/70 border border-border/80 text-text-secondary hover:text-primary hover:border-primary/40 transition-colors text-[11px] font-medium"
							>
								{cat}
							</Link>
						))}
					</div>
				</motion.div>

				{/* Primary Call to Actions */}
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
					className="flex flex-wrap justify-center items-center gap-3"
				>
					<Link
						href="/search"
						className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md shadow-primary/20 hover:bg-primary-hover transition-all inline-flex items-center gap-2 cursor-pointer"
					>
						Explore All Clubs <FiArrowRight size={16} />
					</Link>
					<Link
						href={currentUser ? '/groups' : '/auth/register'}
						className="rounded-xl border border-border bg-surface px-6 py-3 text-sm font-bold text-text-primary hover:bg-surface-secondary hover:border-primary/40 transition-all cursor-pointer shadow-2xs"
					>
						Start a Student Organization
					</Link>
					<Link
						href="/join"
						className="rounded-xl border border-border bg-surface-secondary/50 px-5 py-3 text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all cursor-pointer"
					>
						Join with Code
					</Link>
				</motion.div>

				{/* Campus Telemetry Stats Bar */}
				{/* <motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.45 }}
					className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2"
				>
					<div className="p-3.5 rounded-2xl border border-border bg-surface/80 backdrop-blur-xs text-center space-y-0.5">
						<span className="text-xl font-extrabold text-primary">100%</span>
						<span className="text-[11px] text-text-muted block font-medium">Digital Check-in</span>
					</div>
					<div className="p-3.5 rounded-2xl border border-border bg-surface/80 backdrop-blur-xs text-center space-y-0.5">
						<span className="text-xl font-extrabold text-text-primary">6+</span>
						<span className="text-[11px] text-text-muted block font-medium">Campus Hubs</span>
					</div>
					<div className="p-3.5 rounded-2xl border border-border bg-surface/80 backdrop-blur-xs text-center space-y-0.5">
						<span className="text-xl font-extrabold text-success">Live</span>
						<span className="text-[11px] text-text-muted block font-medium">Meeting Tracking</span>
					</div>
					<div className="p-3.5 rounded-2xl border border-border bg-surface/80 backdrop-blur-xs text-center space-y-0.5">
						<span className="text-xl font-extrabold text-text-primary">0</span>
						<span className="text-[11px] text-text-muted block font-medium">Paper Rosters</span>
					</div>
				</motion.div> */}

				{/* Interactive Live Club Preview Widget */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.5 }}
					className="max-w-3xl mx-auto w-full text-left rounded-3xl border border-primary/30 bg-surface shadow-2xl overflow-hidden"
				>
					{/* Sandbox Header Bar */}
					<div className="bg-surface-secondary/80 border-b border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-xl bg-linear-to-br from-primary to-violet-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
								ACM
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h3 className="text-sm font-bold text-text-primary">
										ACM Student Chapter
									</h3>
									<span className="text-[10px] font-bold bg-success-bg text-success px-2 py-0.2 rounded-full border border-success/30">
										● Live Demo Hub
									</span>
								</div>
								<span className="text-[11px] text-text-muted">
									Try clicking tabs below to test live club
									interactions
								</span>
							</div>
						</div>

						{/* Sandbox Switcher Tabs */}
						<div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border">
							<button
								type="button"
								onClick={() => setSandboxTab('feed')}
								className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
									sandboxTab === 'feed'
										? 'bg-primary text-white shadow-2xs'
										: 'text-text-muted hover:text-text-primary'
								}`}
							>
								💬 Poll &amp; Feed
							</button>
							<button
								type="button"
								onClick={() => setSandboxTab('attendance')}
								className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
									sandboxTab === 'attendance'
										? 'bg-primary text-white shadow-2xs'
										: 'text-text-muted hover:text-text-primary'
								}`}
							>
								⏱️ Attendance
							</button>
							<button
								type="button"
								onClick={() => setSandboxTab('roster')}
								className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
									sandboxTab === 'roster'
										? 'bg-primary text-white shadow-2xs'
										: 'text-text-muted hover:text-text-primary'
								}`}
							>
								👥 Roster
							</button>
						</div>
					</div>

					{/* Sandbox Dynamic Content */}
					<div className="p-6">
						<AnimatePresence mode="wait">
							{sandboxTab === 'feed' && (
								<motion.div
									key="feed"
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -8 }}
									transition={{ duration: 0.2 }}
									className="space-y-4"
								>
									<div className="p-4 rounded-2xl border border-primary/20 bg-primary-light/30 space-y-3">
										<div className="flex items-center justify-between">
											<span className="text-xs font-bold text-primary flex items-center gap-1.5">
												<FiZap /> Interactive Meeting
												Poll
											</span>
											<span className="text-[10px] font-bold bg-surface px-2 py-0.5 rounded-md border border-border text-text-muted">
												Closing Today
											</span>
										</div>
										<p className="text-xs font-semibold text-text-primary">
											🍕 Which tech workshop topic should
											we cover this Wednesday?
										</p>
										<div className="space-y-2">
											{[
												{
													id: 0,
													title: '⚡ High-Performance Next.js 16 & Server Actions',
													votes: '78%',
												},
												{
													id: 1,
													title: '🤖 Autonomous AI Agents & Local LLMs',
													votes: '18%',
												},
												{
													id: 2,
													title: '🛡️ Applied Cybersecurity & CTF Fundamentals',
													votes: '4%',
												},
											].map((opt) => (
												<button
													key={opt.id}
													type="button"
													onClick={() =>
														setVotedOption(opt.id)
													}
													className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
														votedOption === opt.id
															? 'bg-primary text-white border-primary shadow-xs font-bold'
															: 'bg-surface border-border text-text-secondary hover:border-primary/40'
													}`}
												>
													<span>{opt.title}</span>
													<span className="text-[11px] font-bold shrink-0 ml-2">
														{opt.votes}
													</span>
												</button>
											))}
										</div>
									</div>
								</motion.div>
							)}

							{sandboxTab === 'attendance' && (
								<motion.div
									key="attendance"
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -8 }}
									transition={{ duration: 0.2 }}
									className="space-y-4"
								>
									<div className="p-5 rounded-2xl border border-border bg-surface-secondary/40 flex flex-col sm:flex-row items-center justify-between gap-4">
										<div className="space-y-1 text-center sm:text-left">
											<span className="text-[10px] font-bold uppercase tracking-wider text-primary">
												Live Meeting Session PIN
											</span>
											<h4 className="text-base font-bold text-text-primary">
												Full-Stack Next.js Workshop
											</h4>
											<p className="text-xs text-text-muted">
												Turing Hall, Room 302 · Self
												Check-in Active
											</p>
										</div>

										<button
											type="button"
											onClick={() => {
												navigator.clipboard.writeText(
													'492817',
												);
												setCopiedPin(true);
												setTimeout(
													() => setCopiedPin(false),
													2000,
												);
											}}
											className="px-6 py-3 rounded-2xl bg-surface border-2 border-primary/40 text-2xl font-mono font-extrabold text-primary tracking-widest hover:border-primary hover:scale-105 transition-all shadow-md cursor-pointer relative"
										>
											492817
											{copiedPin && (
												<span className="absolute -top-2.5 right-2 bg-success text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
													Copied!
												</span>
											)}
										</button>
									</div>
								</motion.div>
							)}

							{sandboxTab === 'roster' && (
								<motion.div
									key="roster"
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -8 }}
									transition={{ duration: 0.2 }}
									className="grid grid-cols-1 sm:grid-cols-2 gap-3"
								>
									{[
										{
											name: 'Alex Chen',
											role: 'President & Founder',
											major: 'Computer Science & AI',
											badge: 'Lead',
										},
										{
											name: 'Marcus Washington',
											role: 'Executive Officer',
											major: 'Cybersecurity',
											badge: 'Officer',
										},
									].map((m) => (
										<div
											key={m.name}
											className="p-3.5 rounded-2xl border border-border bg-surface flex items-center gap-3"
										>
											<div className="h-10 w-10 rounded-xl bg-primary-light text-primary font-bold flex items-center justify-center text-sm shadow-2xs">
												{m.name[0]}
											</div>
											<div className="min-w-0">
												<div className="flex items-center gap-1.5">
													<span className="text-xs font-bold text-text-primary">
														{m.name}
													</span>
													<span className="text-[9px] font-bold bg-primary text-white px-1.5 py-0.2 rounded shadow-2xs">
														{m.badge}
													</span>
												</div>
												<span className="text-[11px] text-text-muted block truncate">
													{m.major}
												</span>
											</div>
										</div>
									))}
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* Sandbox Footer Link */}
					<div className="p-3.5 bg-surface-secondary/40 border-t border-border flex items-center justify-between text-xs px-6">
						<span className="text-text-muted text-[11px]">
							Real-time synchronized across all members
						</span>
						<Link
							href="/group/club_acm_01/feed"
							className="font-bold text-primary hover:underline inline-flex items-center gap-1"
						>
							<span>Open ACM Club</span>
							<FiArrowRight size={12} />
						</Link>
					</div>
				</motion.div>
			</div>

			{/* Animated Scroll-Down Notification */}
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.8, duration: 0.6 }}
				onClick={handleScrollDown}
				className="mt-12 flex flex-col items-center gap-1 cursor-pointer z-10 select-none group"
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
