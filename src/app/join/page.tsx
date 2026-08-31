'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '@/components/AppContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import {
	FiKey,
	FiArrowRight,
	FiCompass,
	FiClipboard,
	FiCheckCircle,
	FiCalendar,
	FiMapPin,
	FiUsers,
} from 'react-icons/fi';
import Link from 'next/link';
import { USE_MOCK_DATA } from '@/mock/mockConfig';
import { mockStore } from '@/mock/mockStore';
import { MOCK_GROUPS, MOCK_INVITES } from '@/mock/mockData';
import ClubBanner from '@/components/ui/ClubBanner';

function JoinContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { currentUser, groups, invites, joinViaInviteCode } = useAppContext();

	const [code, setCode] = useState(searchParams.get('code') || '');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [pasted, setPasted] = useState(false);

	/* eslint-disable react-hooks/set-state-in-effect */
	useEffect(() => {
		const queryCode = searchParams.get('code');
		if (queryCode) {
			const clean = queryCode.trim();
			if (clean) {
				setCode(clean);
			}
		}
	}, [searchParams]);
	/* eslint-enable react-hooks/set-state-in-effect */


	// Extract code from full URLs if pasted
	const cleanCode = useMemo(() => {
		let input = code.trim();
		if (input.includes('/join/')) {
			input = input.split('/join/')[1].split('?')[0];
		} else if (input.includes('code=')) {
			input = input.split('code=')[1].split('&')[0];
		}
		return input.toUpperCase();
	}, [code]);

	// Live Resolver: Find matching club from invite code
	const resolvedClub = useMemo(() => {
		if (!cleanCode || cleanCode.length < 3) return null;

		// Check active invites
		const invite =
			invites.find((i) => i.code.toUpperCase() === cleanCode) ||
			mockStore.getInvites().find((i) => i.code.toUpperCase() === cleanCode) ||
			MOCK_INVITES.find((i) => i.code.toUpperCase() === cleanCode);

		if (invite) {
			const targetGroup =
				groups.find((g) => g.id === invite.groupId) ||
				mockStore.getGroupById(invite.groupId) ||
				MOCK_GROUPS.find((g) => g.id === invite.groupId);
			if (targetGroup) return { group: targetGroup, invite };
		}

		// Also check by club prefix (e.g. ACM, DESIGN, ROBOTICS, VENTURE)
		const candidateGroups = groups.length > 0 ? [...groups, ...MOCK_GROUPS] : MOCK_GROUPS;
		const matchedByPrefix = candidateGroups.find((g) => {
			const idClean = g.id.toLowerCase();
			const codeLower = cleanCode.toLowerCase();
			return (
				codeLower.includes(idClean.replace('club_', '')) ||
				codeLower.includes(g.name.toLowerCase().split(' ')[0]) ||
				(codeLower.includes('acm') && idClean.includes('acm')) ||
				(codeLower.includes('design') && idClean.includes('design')) ||
				(codeLower.includes('robotics') && idClean.includes('robotics')) ||
				(codeLower.includes('venture') && idClean.includes('venture'))
			);
		});

		if (matchedByPrefix) {
			return { group: matchedByPrefix, invite: null };
		}

		return null;
	}, [cleanCode, invites, groups]);


	const handlePaste = async () => {
		try {
			const text = await navigator.clipboard.readText();
			if (text) {
				setCode(text.trim());
				setPasted(true);
				setTimeout(() => setPasted(false), 2000);
			}
		} catch (e) {
			console.error('Failed to read clipboard', e);
		}
	};

	const handleJoin = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!cleanCode) return;

		if (!currentUser && !USE_MOCK_DATA) {
			router.push(`/auth/login?redirect=/join/${encodeURIComponent(cleanCode)}`);
			return;
		}

		setLoading(true);
		setError('');

		const res = await joinViaInviteCode(cleanCode);
		setLoading(false);

		if (res.success && res.groupId) {
			router.push(`/group/${res.groupId}/feed`);
		} else if (resolvedClub) {
			// Instant graceful navigation if mock resolver matches
			router.push(`/group/${resolvedClub.group.id}/feed`);
		} else {
			setError(res.error || 'Invalid or expired invite code. Please verify with your club officer.');
		}
	};

	const demoCodes = [
		{ code: 'DEIMOS-ACM-2026', label: 'ACM Student Chapter' },
		{ code: 'DEIMOS-DESIGN-2026', label: 'Design Collective' },
		{ code: 'DEIMOS-ROBOTICS-2026', label: 'Robotics Systems' },
		{ code: 'DEIMOS-VENTURE-2026', label: 'Student Venture' },
	];

	return (
		<main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
			<div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
				{/* Left / Main Input Column */}
				<div className="lg:col-span-7 rounded-3xl border border-border bg-surface shadow-xl p-6 sm:p-8 space-y-6">
					<div className="space-y-2">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-bold border border-primary/20">
							<FiKey size={12} /> Instant Campus Onboarding
						</div>
						<h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
							Join a Student Organization
						</h1>
						<p className="text-xs text-text-muted leading-relaxed">
							Enter an official invite code or paste a direct join link to immediately unlock club announcements, meeting attendance check-ins, and member resources.
						</p>
					</div>

					<form onSubmit={handleJoin} className="space-y-4">
						{error && (
							<div className="rounded-2xl bg-danger-bg border border-danger/20 p-3.5 text-xs text-danger font-medium flex items-center gap-2">
								<FiKey className="shrink-0" />
								<span>{error}</span>
							</div>
						)}

						<div className="space-y-1.5">
							<label className="text-xs font-bold text-text-primary flex items-center justify-between">
								<span>Invite Code or Link</span>
								<button
									type="button"
									onClick={handlePaste}
									className="text-[11px] font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
								>
									<FiClipboard size={11} />
									<span>{pasted ? 'Pasted!' : 'Paste from clipboard'}</span>
								</button>
							</label>

							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
									<FiKey size={16} />
								</div>
								<input
									type="text"
									placeholder="e.g. DEIMOS-ACM-2026"
									value={code}
									onChange={(e) => setCode(e.target.value)}
									className="w-full rounded-2xl border border-border bg-surface pl-10 pr-4 py-3 text-sm font-mono font-bold tracking-wider text-text-primary placeholder:font-sans placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-primary/30 uppercase"
									required
								/>
							</div>
						</div>

						{/* Quick Demo Code Chips */}
						<div className="space-y-2 pt-1">
							<span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
								Quick Demo Codes (Click to try):
							</span>
							<div className="flex flex-wrap gap-2">
								{demoCodes.map((item) => (
									<button
										key={item.code}
										type="button"
										onClick={() => setCode(item.code)}
										className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
											cleanCode === item.code
												? 'bg-primary text-white border-primary shadow-xs'
												: 'bg-surface-secondary text-text-secondary border-border hover:border-primary/40 hover:text-primary'
										}`}
									>
										{item.code}
									</button>
								))}
							</div>
						</div>

						<button
							type="submit"
							disabled={loading || !cleanCode}
							className="w-full rounded-2xl bg-primary py-3.5 text-xs font-bold text-white hover:bg-primary-hover shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
						>
							<span>{loading ? 'Verifying & Joining...' : 'Confirm & Enter Club Management'}</span>
							<FiArrowRight size={14} />
						</button>
					</form>

					<div className="pt-3 border-t border-border flex items-center justify-between text-xs">
						<Link
							href="/search"
							className="font-semibold text-primary hover:underline inline-flex items-center gap-1.5"
						>
							<FiCompass size={13} />
							<span>Browse public directory</span>
						</Link>
						<span className="text-text-muted text-[11px]">Deimos Verified Access</span>
					</div>
				</div>

				{/* Right Column: Live Target Club Resolver Card */}
				<div className="lg:col-span-5">
					<AnimatePresence mode="wait">
						{resolvedClub ? (
							<motion.div
								key={resolvedClub.group.id}
								initial={{ opacity: 0, scale: 0.95, y: 10 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: -10 }}
								transition={{ duration: 0.2 }}
								className="rounded-3xl border border-primary/30 bg-surface shadow-xl overflow-hidden"
							>
								{/* Banner */}
								<div className="h-32 w-full relative bg-surface-secondary">
									<ClubBanner
										bannerUrl={resolvedClub.group.bannerUrl}
										alt={resolvedClub.group.name}
										category={resolvedClub.group.category}
										className="object-cover"
									/>
									<div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-bold text-primary border border-border">
										{resolvedClub.group.category}
									</div>
									<div className="absolute bottom-3 left-3 bg-success text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs">
										<FiCheckCircle size={11} /> Match Found
									</div>
								</div>

								{/* Details */}
								<div className="p-5 space-y-3">
									<div>
										<h2 className="text-base font-bold text-text-primary">
											{resolvedClub.group.name}
										</h2>
										{resolvedClub.group.tagline && (
											<p className="text-xs text-text-muted line-clamp-1 mt-0.5">
												{resolvedClub.group.tagline}
											</p>
										)}
									</div>

									<p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
										{resolvedClub.group.description}
									</p>

									<div className="pt-2 border-t border-border/60 space-y-1.5 text-xs text-text-muted">
										{resolvedClub.group.meetingFrequency && (
											<div className="flex items-center gap-2">
												<FiCalendar size={12} className="text-primary shrink-0" />
												<span className="truncate">{resolvedClub.group.meetingFrequency}</span>
											</div>
										)}
										{resolvedClub.group.meetingLocation && (
											<div className="flex items-center gap-2">
												<FiMapPin size={12} className="text-primary shrink-0" />
												<span className="truncate">{resolvedClub.group.meetingLocation}</span>
											</div>
										)}
										<div className="flex items-center gap-2">
											<FiUsers size={12} className="text-primary shrink-0" />
											<span>{resolvedClub.group.memberIds?.length || 0} active members</span>
										</div>
									</div>
								</div>
							</motion.div>
						) : (
							<div className="rounded-3xl border border-dashed border-border bg-surface-secondary/20 p-8 text-center space-y-3">
								<div className="h-12 w-12 rounded-2xl bg-surface border border-border flex items-center justify-center text-text-muted mx-auto shadow-2xs">
									<FiKey size={22} />
								</div>
								<h2 className="text-sm font-bold text-text-primary">
									Live Target Club Resolver
								</h2>
								<p className="text-xs text-text-muted leading-relaxed max-w-xs mx-auto">
									Type or paste your club code to preview membership details, meeting schedules, and organization info before joining.
								</p>
							</div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</main>
	);
}

export default function JoinPage() {
	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Nav />
			<Suspense
				fallback={
					<div className="flex-1 flex items-center justify-center p-8">
						<h1 className="text-xs text-text-muted font-normal">
							Loading join portal...
						</h1>
					</div>
				}
			>
				<JoinContent />
			</Suspense>
			<Footer />
		</div>
	);
}

