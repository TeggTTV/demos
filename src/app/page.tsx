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
	const { loginUser, groups, currentUser } = useAppContext();
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
			desc: 'Generate links during meetings for instant student self check-in, manage officer rosters, and export logs to CSV.',
			icon: FiCheckCircle,
		},
	];

	const faqItems = [
		{
			q: 'How does attendance tracking work on Demos?',
			a: 'Club leaders and officers can create meeting sessions in their Club Hub. Each session generates an instant link. Members attending the meeting simply type the PIN on their phones to check in. Officers can also manually check off members (Present, Late, Excused, Absent) and export attendance logs to CSV.',
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
						Demos allows student clubs to showcase their work,
						invite new members, communicate via club feeds, and
						track meeting attendance with effortless check-ins.
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

					{/* Quick Category Links for Crawlers & Visitors */}
					<div className="mt-6 flex flex-wrap justify-center items-center gap-2">
						{categories.map((cat) => (
							<Link
								key={cat}
								href={`/search?cat=${encodeURIComponent(cat)}`}
								className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-text-secondary hover:border-primary hover:text-primary transition-all shadow-2xs"
							>
								{cat}
							</Link>
						))}
					</div>

					{/* Action Buttons */}
					<div className="mt-8 flex flex-wrap justify-center items-center gap-3">
						<Link
							href="/search"
							className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary-hover transition-all inline-flex items-center gap-2"
						>
							Explore All Clubs <FiArrowRight size={16} />
						</Link>
						<Link
							href="/events"
							className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-purple-700 transition-all inline-flex items-center gap-2"
						>
							View All Events <FiCalendar size={16} />
						</Link>
						<Link
							href={currentUser ? '/groups' : '/auth/register'}
							className="rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-text-primary hover:bg-surface-secondary hover:border-primary/40 transition-all"
						>
							Start a Student Organization
						</Link>
					</div>
				</div>
			</header>

			{/* ═══════════ Core Pillars Grid ═══════════ */}
			<section className="py-16 bg-surface-secondary/40 border-y border-border">
				<div className="mx-auto max-w-7xl px-6 lg:px-8">
					<div className="text-center max-w-3xl mx-auto mb-12">
						<h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
							Everything Student Leaders Need to Run Campus
							Organizations
						</h2>
						<p className="mt-3 text-sm text-text-muted leading-relaxed">
							Built specifically for university clubs, engineering
							design teams, academic honor societies, Greek life,
							cultural groups, and special interest student
							organizations.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{/* Card 1: Promotion */}
						<Link
							href="/search"
							className="rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col group"
						>
							<div className="h-10 w-10 rounded-xl bg-primary-light flex items-center justify-center text-primary mb-4 group-hover:scale-105 transition-transform">
								<FiShare2 size={20} />
							</div>
							<h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors">
								Club Promotion &amp; Discovery
							</h3>
							<p className="mt-2 text-xs text-text-secondary leading-relaxed grow">
								Highlight your club’s mission, meeting times,
								room locations, officer team, and direct social
								links to attract passionate new campus recruits.
							</p>
							<div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-semibold text-primary inline-flex items-center gap-1">
								Browse Public Directory{' '}
								<FiArrowRight size={12} />
							</div>
						</Link>

						{/* Card 2: Onboarding */}
						<Link
							href="/join"
							className="rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col group"
						>
							<div className="h-10 w-10 rounded-xl bg-primary-light flex items-center justify-center text-primary mb-4 group-hover:scale-105 transition-transform">
								<FiUsers size={20} />
							</div>
							<h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors">
								Member Invites &amp; Roster
							</h3>
							<p className="mt-2 text-xs text-text-secondary leading-relaxed grow">
								Accept membership applications with student
								major and graduation year details, or generate
								instant shareable invite codes for frictionless
								onboarding.
							</p>
							<div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-semibold text-primary inline-flex items-center gap-1">
								Redeem Invite Codes <FiArrowRight size={12} />
							</div>
						</Link>

						{/* Card 3: Communication */}
						<Link
							href={currentUser ? '/groups' : '/auth/register'}
							className="rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col group"
						>
							<div className="h-10 w-10 rounded-xl bg-primary-light flex items-center justify-center text-primary mb-4 group-hover:scale-105 transition-transform">
								<FiMessageSquare size={20} />
							</div>
							<h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors">
								Club Hub &amp; Announcements
							</h3>
							<p className="mt-2 text-xs text-text-secondary leading-relaxed grow">
								Post pinned announcements, discussions, slide
								decks, flyers, agendas, and resource links in a
								private, focused team workspace.
							</p>
							<div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-semibold text-primary inline-flex items-center gap-1">
								Dedicated Hub Feeds <FiArrowRight size={12} />
							</div>
						</Link>

						{/* Card 4: Attendance */}
						<Link
							href="/search"
							className="rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col group"
						>
							<div className="h-10 w-10 rounded-xl bg-primary-light flex items-center justify-center text-primary mb-4 group-hover:scale-105 transition-transform">
								<FiCheckCircle size={20} />
							</div>
							<h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors">
								Live Attendance Tracking
							</h3>
							<p className="mt-2 text-xs text-text-secondary leading-relaxed grow">
								Generate links for instant student self check-in
								during meetings and export CSV when its over.
							</p>
							<div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-semibold text-primary inline-flex items-center gap-1">
								Fast Link Check-In <FiArrowRight size={12} />
							</div>
						</Link>
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

			{/* ═══════════ In-Depth Guide & Campus Resources Section (High SEO Word Count & Outgoing Links) ═══════════ */}
			<section className="py-16 bg-surface border-t border-border">
				<div className="mx-auto max-w-7xl px-6 lg:px-8">
					<div className="text-center max-w-3xl mx-auto mb-12">
						<span className="text-xs font-bold text-primary uppercase tracking-wider">
							Club Leadership Best Practices
						</span>
						<h2 className="text-2xl sm:text-3xl font-bold text-text-primary mt-1">
							Why Student Organizations Choose Demos
						</h2>
						<p className="mt-3 text-sm text-text-secondary leading-relaxed">
							Running a collegiate organization involves
							coordinating executive boards, promoting campus
							events, onboarding new recruits, maintaining member
							engagement, and reporting verified meeting
							attendance to university student unions and faculty
							advisors.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="rounded-2xl border border-border bg-surface-secondary/40 p-6 space-y-3">
							<h3 className="text-base font-bold text-text-primary">
								1. Frictionless Attendance &amp; Officer Audits
							</h3>
							<p className="text-xs text-text-secondary leading-relaxed">
								Eliminate paper sign-in sheets and shared Google
								Forms that get passed around. Demos generates
								dynamic link check-in with session time limits.
								Officers can monitor the live attendance roster
								in real-time, mark excused absences, and
								download clean CSV reports formatted for campus
								administration compliance.
							</p>
							<p className="text-xs text-text-muted">
								Learn more about open source web standards at{' '}
								<a
									href="https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline font-medium"
								>
									MDN Web Docs (PWA)
								</a>
								.
							</p>
						</div>

						<div className="rounded-2xl border border-border bg-surface-secondary/40 p-6 space-y-3">
							<h3 className="text-base font-bold text-text-primary">
								2. Centralized Communication Hubs
							</h3>
							<p className="text-xs text-text-secondary leading-relaxed">
								Fragmented communication across WhatsApp,
								GroupMe, Discord, and email leads to missed
								announcements. Demos provides a dedicated,
								ad-free club workspace featuring pinned
								executive notices, slide deck flyer sharing, and
								clickable link repositories accessible from any
								smartphone or laptop.
							</p>
							<p className="text-xs text-text-muted">
								Discover best practices for student
								organizations at{' '}
								<a
									href="https://www.acui.org/"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline font-medium"
								>
									ACUI Student Activities
								</a>
								.
							</p>
						</div>

						<div className="rounded-2xl border border-border bg-surface-secondary/40 p-6 space-y-3">
							<h3 className="text-base font-bold text-text-primary">
								3. Modern Progressive Web App (PWA)
							</h3>
							<p className="text-xs text-text-secondary leading-relaxed">
								Demos is engineered as an installable
								Progressive Web Application (PWA). Students
								receive instant push notifications for important
								club announcements and meeting check-in
								reminders directly on their iOS and Android home
								screens without requiring heavy native app store
								downloads.
							</p>
							<p className="text-xs text-text-muted">
								Explore web app guidelines at{' '}
								<a
									href="https://web.dev/explore/progressive-web-apps"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline font-medium"
								>
									Google Web.dev
								</a>
								.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* ═══════════ FAQ ═══════════ */}
			<section className="py-16">
				<div className="mx-auto max-w-3xl px-6">
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
