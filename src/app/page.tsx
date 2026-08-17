'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/components/AppContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import {
	FiSearch,
	FiChevronDown,
	FiChevronUp,
	FiUsers,
	FiCheckCircle,
	FiMessageSquare,
	FiShare2,
	FiArrowRight,
	FiCalendar,
	FiMapPin,
	FiPlusCircle,
	FiLayers,
} from 'react-icons/fi';
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

export default function Home() {
	const { loginUser, hydrated, groups, currentUser } = useAppContext();
	const [searchQuery, setSearchQuery] = useState('');
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [authError, setAuthError] = useState('');
	const router = useRouter();

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		router.push(
			searchQuery.trim()
				? `/search?q=${encodeURIComponent(searchQuery)}`
				: '/search',
		);
	};

	const handleAuthSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setAuthError('');
		const res = await loginUser(email, password);
		if (res.success) {
			setShowAuthModal(false);
			router.push(
				searchQuery.trim()
					? `/search?q=${encodeURIComponent(searchQuery)}`
					: '/search',
			);
		} else {
			setAuthError(res.error || 'Authentication failed');
		}
	};

	const categories = [
		'Technology & Coding',
		'Arts & Design',
		'Engineering & Robotics',
		'Business & Entrepreneurship',
		'Media & Photography',
		'Science & Research',
	];

	const steps = [
		{
			num: '01',
			title: 'Showcase Your Club',
			desc: 'Set up your club profile with meeting schedules, room locations, social channels, and custom tags so prospective members can find you.',
			icon: FiLayers,
		},
		{
			num: '02',
			title: 'Invite & Onboard',
			desc: 'Generate instant 1-click invite codes or review membership applications with student major and graduation year details.',
			icon: FiUsers,
		},
		{
			num: '03',
			title: 'Track Meeting Attendance',
			desc: 'Generate 4-digit PINs during meetings for instant student self check-in, manage officer rosters, and export logs to CSV.',
			icon: FiCheckCircle,
		},
	];

	const faqItems = [
		{
			q: 'How does attendance tracking work on Demos?',
			a: 'Club leaders and officers can create meeting sessions in their Club Hub. Each session generates an instant 4-digit PIN code (or QR code). Members attending the meeting simply type the PIN on their phones to check in. Officers can also manually check off members (Present, Late, Excused, Absent) and export attendance logs to CSV.',
		},
		{
			q: 'How can clubs promote themselves and recruit new members?',
			a: 'Every club has a public profile showcasing its mission, categories, tags, meeting schedule, room location, leadership roster, and social media handles (Instagram, Discord, Website). Prospective members can discover clubs via the Explore directory and submit join requests with their major and intro notes.',
		},
		{
			q: 'Can we invite members directly with a shareable link?',
			a: 'Yes! Club officers can generate custom shareable invite codes (e.g., DEMOS-GDSC-2026). Anyone with the code can join the club roster with one click.',
		},
		{
			q: 'What communication features are included in the Club Hub?',
			a: 'Club Hubs include a live message feed with announcement badges, pinned notices, file/flyer uploads (meeting slides, agendas, PDFs), and clickable resource repositories.',
		},
		{
			q: 'Is Demos free for student clubs and campus organizations?',
			a: 'Yes, Demos is 100% free and open for student clubs, academic societies, recreational groups, and campus organizations.',
		},
	];

	if (!hydrated) return null;

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Nav />

			{/* ═══════════ Hero Section ═══════════ */}
			<header className="relative overflow-hidden py-16 sm:py-24">
				{/* Decorative gradient blob */}
				<div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-125 w-200 -translate-x-1/2 opacity-30 blur-3xl">
					<div className="absolute inset-0 rounded-full bg-linear-to-br from-primary/40 via-indigo-300/30 to-violet-400/20" />
				</div>

				<div className="mx-auto max-w-4xl px-6 text-center">
					<span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3.5 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20 mb-5">
						🚀 The All-in-One Campus Club Platform
					</span>
					<h1 className="text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl lg:text-6xl leading-tight">
						Promote, Engage, &amp;{' '}
						<span className="text-primary">Track Attendance</span>{' '}
						for Your Club
					</h1>
					<p className="mt-5 text-base leading-7 text-text-secondary max-w-2xl mx-auto">
						Demos empowers student organizations to showcase their
						work, invite new members, communicate via dedicated club
						hubs, and track meeting attendance with effortless
						4-digit PIN check-ins.
					</p>

					{/* Search */}
					<form
						onSubmit={handleSearchSubmit}
						className="mt-8 max-w-xl mx-auto"
					>
						<div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-1.5 shadow-md focus-within:ring-2 focus-within:ring-primary/30 transition-all">
							<FiSearch
								size={18}
								className="ml-3 text-text-muted shrink-0"
							/>
							<input
								type="text"
								placeholder="Search clubs by name, category, or interests..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="grow bg-transparent px-2 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none"
							/>
							<button
								type="submit"
								className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus:outline-none transition-colors shrink-0 cursor-pointer"
							>
								Explore Clubs
							</button>
						</div>
					</form>

					{/* Quick Category Pills */}
					<div className="mt-5 flex flex-wrap justify-center items-center gap-2">
						{categories.slice(0, 5).map((cat) => (
							<button
								key={cat}
								type="button"
								onClick={() =>
									router.push(
										`/search?cat=${encodeURIComponent(cat)}`,
									)
								}
								className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-secondary hover:border-primary hover:text-primary transition-all cursor-pointer shadow-2xs"
							>
								{cat}
							</button>
						))}
					</div>
				</div>
			</header>

			{/* ═══════════ Core Pillars Grid ═══════════ */}
			<section className="py-16 bg-surface-secondary/40 border-y border-border">
				<div className="mx-auto max-w-7xl px-6 lg:px-8">
					<div className="text-center max-w-2xl mx-auto mb-12">
						<h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
							Everything You Need to Run Your Club
						</h2>
						<p className="mt-2 text-sm text-text-muted">
							Designed specifically for campus club presidents,
							officers, and active student members.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{/* Card 1: Promotion */}
						<div className="rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col">
							<div className="h-10 w-10 rounded-xl bg-primary-light flex items-center justify-center text-primary mb-4">
								<FiShare2 size={20} />
							</div>
							<h3 className="text-base font-bold text-text-primary">
								Club Promotion &amp; Showcase
							</h3>
							<p className="mt-2 text-xs text-text-secondary leading-relaxed grow">
								Highlight your club’s mission, meeting times,
								room locations, officer team, and direct social
								links to attract passionate new recruits.
							</p>
							<div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-semibold text-primary">
								Custom Banners &amp; Tags →
							</div>
						</div>

						{/* Card 2: Onboarding */}
						<div className="rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col">
							<div className="h-10 w-10 rounded-xl bg-primary-light flex items-center justify-center text-primary mb-4">
								<FiUsers size={20} />
							</div>
							<h3 className="text-base font-bold text-text-primary">
								Member Invites &amp; Roster
							</h3>
							<p className="mt-2 text-xs text-text-secondary leading-relaxed grow">
								Accept membership applications with student
								major and year notes, or generate instant
								shareable invite codes for rapid onboarding.
							</p>
							<div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-semibold text-primary">
								1-Click Join Codes →
							</div>
						</div>

						{/* Card 3: Communication */}
						<div className="rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col">
							<div className="h-10 w-10 rounded-xl bg-primary-light flex items-center justify-center text-primary mb-4">
								<FiMessageSquare size={20} />
							</div>
							<h3 className="text-base font-bold text-text-primary">
								Club Hub &amp; Announcements
							</h3>
							<p className="mt-2 text-xs text-text-secondary leading-relaxed grow">
								Post pinned announcements, discussions, slide
								decks, flyers, agendas, and resource links in a
								private, focused space.
							</p>
							<div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-semibold text-primary">
								File &amp; Link Repositories →
							</div>
						</div>

						{/* Card 4: Attendance */}
						<div className="rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col">
							<div className="h-10 w-10 rounded-xl bg-primary-light flex items-center justify-center text-primary mb-4">
								<FiCheckCircle size={20} />
							</div>
							<h3 className="text-base font-bold text-text-primary">
								Live Attendance Tracking
							</h3>
							<p className="mt-2 text-xs text-text-secondary leading-relaxed grow">
								Generate 4-digit PIN codes for instant student
								self check-in during meetings, toggle live
								roster checklists, and export CSV logs.
							</p>
							<div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-semibold text-primary">
								PIN &amp; Manual Check-in →
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ═══════════ Featured Clubs Spotlight ═══════════ */}
			<section className="py-16">
				<div className="mx-auto max-w-7xl px-6 lg:px-8">
					<div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
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
								View all {groups.length} clubs{' '}
								<FiArrowRight size={14} />
							</Link>
						)}
					</div>

					{groups.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{groups.slice(0, 3).map((club) => (
								<div
									key={club.id}
									className="group rounded-2xl border border-border bg-surface overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all flex flex-col"
								>
									{/* Banner */}
									<div className="h-32 w-full relative bg-surface-secondary overflow-hidden">
										{club.bannerUrl?.startsWith('data:') ||
										club.bannerUrl?.startsWith('http') ? (
											<Image
												src={club.bannerUrl}
												alt={club.name}
												fill
												className="object-cover group-hover:scale-102 transition-transform duration-300"
											/>
										) : (
											<div
												className="w-full h-full"
												style={{
													background:
														club.bannerUrl ||
														'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
												}}
											/>
										)}
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
										<div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
											<span className="text-[11px] font-medium text-text-muted">
												👥 {club.memberIds.length}{' '}
												Members
											</span>
											<Link
												href={`/group/${club.id}/feed`}
												className="rounded-lg bg-primary-light px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-all"
											>
												View Club
											</Link>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="rounded-2xl border border-dashed border-border bg-surface/50 p-12 text-center max-w-xl mx-auto">
							<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary mb-4">
								<FiPlusCircle size={28} />
							</div>
							<h3 className="text-lg font-bold text-text-primary">
								No clubs registered yet
							</h3>
							<p className="text-xs text-text-muted mt-2 leading-relaxed">
								Be the first to create and showcase your student
								organization on campus. Set up meeting
								schedules, invite members, and track attendance.
							</p>
							<div className="mt-6 flex justify-center gap-3">
								<Link
									href={
										currentUser
											? '/groups'
											: '/auth/register'
									}
									className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm transition-all inline-flex items-center gap-2"
								>
									Create a Club <FiArrowRight size={14} />
								</Link>
							</div>
						</div>
					)}
				</div>
			</section>

			{/* ═══════════ How It Works Workflow ═══════════ */}
			<section className="py-16 bg-surface-secondary/50 border-t border-border">
				<div className="mx-auto max-w-7xl px-6 lg:px-8">
					<div className="text-center mb-12">
						<span className="text-xs font-bold text-primary uppercase tracking-wider">
							Workflow
						</span>
						<h2 className="text-2xl sm:text-3xl font-bold text-text-primary mt-1">
							How Demos Simplifies Club Operations
						</h2>
						<p className="mt-2 text-sm text-text-muted">
							Three seamless steps to run your organization
							effortlessly.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{steps.map((step) => {
							const Icon = step.icon;
							return (
								<div
									key={step.num}
									className="rounded-2xl border border-border bg-surface p-6 shadow-xs relative flex flex-col"
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
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* ═══════════ FAQ ═══════════ */}
			<section className="py-16">
				<div className="mx-auto max-w-2xl px-6">
					<h2 className="text-2xl font-bold text-text-primary text-center mb-8">
						Frequently Asked Questions
					</h2>
					<div className="space-y-3">
						{faqItems.map((item, idx) => (
							<div
								key={idx}
								className="rounded-xl border border-border bg-surface overflow-hidden"
							>
								<button
									onClick={() =>
										setFaqOpenIndex(
											faqOpenIndex === idx ? null : idx,
										)
									}
									className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
								>
									<span>{item.q}</span>
									{faqOpenIndex === idx ? (
										<FiChevronUp
											size={16}
											className="text-text-muted shrink-0"
										/>
									) : (
										<FiChevronDown
											size={16}
											className="text-text-muted shrink-0"
										/>
									)}
								</button>
								{faqOpenIndex === idx && (
									<div className="px-5 pb-4 text-sm text-text-secondary leading-relaxed border-t border-border">
										<p className="pt-3">{item.a}</p>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</section>

			<Footer />

			{/* ═══════════ Auth Gate Modal ═══════════ */}
			{showAuthModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
					<div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
						<div className="flex items-center justify-between border-b border-border pb-4 mb-4">
							<h3 className="text-lg font-bold text-text-primary">
								Sign In Required
							</h3>
							<button
								onClick={() => setShowAuthModal(false)}
								className="rounded-lg p-1 text-text-muted hover:bg-surface-secondary hover:text-text-primary transition-all cursor-pointer"
							>
								✕
							</button>
						</div>
						<p className="text-sm text-text-secondary mb-5">
							Sign in to your Demos account to join clubs,
							participate in discussions, and check in to
							meetings.
						</p>

						<form onSubmit={handleAuthSubmit} className="space-y-3">
							{authError && (
								<div className="text-xs text-danger bg-danger-bg border border-danger/20 p-2.5 rounded-lg text-center">
									{authError}
								</div>
							)}
							<Input
								type="email"
								required
								label="Email Address"
								placeholder="you@campus.edu"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
							<Input
								type="password"
								required
								label="Password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
							<button
								type="submit"
								className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-hover shadow-sm transition-all mt-2 cursor-pointer"
							>
								Sign In
							</button>
						</form>

						<p className="text-center text-xs text-text-secondary mt-5">
							Don&apos;t have an account?{' '}
							<Link
								href="/auth/register"
								onClick={() => setShowAuthModal(false)}
								className="text-primary font-semibold hover:underline"
							>
								Create an account
							</Link>
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
