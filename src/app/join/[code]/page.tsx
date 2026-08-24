'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext, Group } from '@/components/AppContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import PageLoader from '@/components/ui/PageLoader';
import {
	FiCheckCircle,
	FiAlertCircle,
	FiArrowRight,
	FiUsers,
	FiCompass,
} from 'react-icons/fi';
import { USE_MOCK_DATA } from '@/mock/mockConfig';

export default function JoinCodePage({
	params,
}: {
	params: Promise<{ code: string }>;
}) {
	const resolvedParams = use(params);
	const rawCode = resolvedParams.code;
	const code = decodeURIComponent(rawCode || '')
		.trim()
		.toUpperCase();

	const { currentUser, hydrated, joinViaInviteCode, groups } =
		useAppContext();
	const router = useRouter();

	const [status, setStatus] = useState<
		'loading' | 'unauthenticated' | 'joining' | 'success' | 'error'
	>('loading');
	const [clubInfo, setClubInfo] = useState<Group | null>(null);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		let isMounted = true;

		async function processInvite() {
			if (!hydrated) return;

			try {
				// Fetch preview info
				const res = await fetch(`/api/invites?code=${code}`);
				const data = await res.json();

				if (!data.invite || !data.invite.group) {
					if (isMounted) {
						setStatus('error');
						setErrorMessage(
							'This invite code is invalid or has expired.',
						);
					}
					return;
				}

				const targetGroup = data.invite.group;
				if (isMounted) {
					setClubInfo(targetGroup);
				}

				if (!currentUser && !USE_MOCK_DATA) {
					if (isMounted) {
						setStatus('unauthenticated');
					}
					return;
				}

				// If already a member
				const isAlreadyMember =
					currentUser &&
					(targetGroup.members?.some(
						(m: { userId: string }) => m.userId === currentUser.id,
					) ||
						groups
							.find((g) => g.id === targetGroup.id)
							?.memberIds.includes(currentUser.id));

				if (isAlreadyMember) {
					if (isMounted) {
						setStatus('success');
						setTimeout(() => {
							router.push(`/group/${targetGroup.id}/feed`);
						}, 1200);
					}
					return;
				}

				// Join the club automatically
				if (isMounted) setStatus('joining');
				const joinRes = await joinViaInviteCode(code);
				if (joinRes.success) {
					if (isMounted) {
						setStatus('success');
						setTimeout(() => {
							router.push(
								`/group/${joinRes.groupId || targetGroup.id}/feed`,
							);
						}, 1200);
					}
				} else {
					if (isMounted) {
						setStatus('error');
						setErrorMessage(
							joinRes.error ||
								'Failed to join club with this code.',
						);
					}
				}
			} catch (e) {
				console.error('Invite resolution error:', e);
				if (isMounted) {
					setStatus('error');
					setErrorMessage(
						'A network error occurred while resolving this invite.',
					);
				}
			}
		}

		processInvite();

		return () => {
			isMounted = false;
		};
	}, [code, currentUser, hydrated, joinViaInviteCode, router, groups]);

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Nav />

			<main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
				<div className="w-full max-w-lg rounded-3xl border border-border bg-surface shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
					{/* Club Banner Header */}
					{clubInfo && (
						<div className="relative h-36 sm:h-44 w-full bg-surface-secondary">
							{clubInfo.bannerUrl?.startsWith('data:') ||
							clubInfo.bannerUrl?.startsWith('http') ? (
								<Image
									src={clubInfo.bannerUrl}
									alt={clubInfo.name}
									fill
									className="object-cover"
								/>
							) : (
								<div
									className="w-full h-full"
									style={{
										background:
											clubInfo.bannerUrl ||
											'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
									}}
								/>
							)}
							<div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
							<div className="absolute bottom-4 left-5 right-5 text-white">
								<span className="inline-block bg-primary/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1">
									{clubInfo.category}
								</span>
								<h1 className="text-xl sm:text-2xl font-extrabold text-white line-clamp-1 drop-shadow-sm">
									{clubInfo.name}
								</h1>
							</div>
						</div>
					)}

					<div className="p-6 sm:p-8 text-center space-y-5">
						{/* Status: Loading / Joining */}
						{(status === 'loading' || status === 'joining') && (
							<div className="py-2 space-y-2">
								<PageLoader
									message={
										status === 'joining'
											? `Joining ${clubInfo?.name || 'Club'}...`
											: 'Verifying Invite Code...'
									}
									subMessage={`Code: ${code}`}
								/>
							</div>
						)}

						{/* Status: Success */}
						{status === 'success' && (
							<div className="py-4 space-y-4">
								<div className="mx-auto h-14 w-14 rounded-full bg-success-bg border border-success/20 text-success flex items-center justify-center text-2xl shadow-xs">
									<FiCheckCircle size={32} />
								</div>
								<div>
									<h2 className="text-xl font-extrabold text-text-primary">
										You&apos;re in!
									</h2>
									<p className="text-xs text-text-muted mt-1">
										You are now a member of{' '}
										<strong className="text-text-primary">
											{clubInfo?.name}
										</strong>
										. Redirecting you to the Club Hub...
									</p>
								</div>
								{clubInfo && (
									<button
										onClick={() =>
											router.push(
												`/group/${clubInfo.id}/feed`,
											)
										}
										className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-md transition-all cursor-pointer"
									>
										<span>Enter Club Hub</span>
										<FiArrowRight size={14} />
									</button>
								)}
							</div>
						)}

						{/* Status: Unauthenticated */}
						{status === 'unauthenticated' && clubInfo && (
							<div className="py-2 space-y-5 text-left">
								<div className="bg-primary-light/40 border border-primary/20 rounded-2xl p-4 text-center">
									<p className="text-xs font-semibold text-primary">
										🎟️ You&apos;ve been invited to join this
										campus club!
									</p>
									<p className="text-[11px] text-text-muted mt-1">
										Sign in or register an account to
										instantly claim your member spot.
									</p>
								</div>

								{clubInfo.description && (
									<p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
										{clubInfo.description}
									</p>
								)}

								<div className="pt-2 flex flex-col gap-2.5">
									<Link
										href={`/auth/login?redirect=/join/${code}`}
										className="w-full rounded-xl bg-primary py-3 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm transition-all text-center flex items-center justify-center gap-2"
									>
										<span>Sign In to Join Instantly</span>
										<FiArrowRight size={14} />
									</Link>
									<Link
										href={`/auth/register?redirect=/join/${code}`}
										className="w-full rounded-xl border border-border bg-surface py-3 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all text-center"
									>
										Create Student Account
									</Link>
								</div>
							</div>
						)}

						{/* Status: Error */}
						{status === 'error' && (
							<div className="py-6 space-y-4">
								<div className="mx-auto h-14 w-14 rounded-full bg-danger-bg border border-danger/20 text-danger flex items-center justify-center text-2xl shadow-xs">
									<FiAlertCircle size={32} />
								</div>
								<div>
									<h2 className="text-lg font-bold text-text-primary">
										Unable to Join Club
									</h2>
									<p className="text-xs text-text-muted mt-1 max-w-xs mx-auto">
										{errorMessage}
									</p>
								</div>
								<div className="pt-2 flex justify-center gap-3">
									<Link
										href="/search"
										className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm"
									>
										<FiCompass size={14} />
										<span>Explore Campus Clubs</span>
									</Link>
									<Link
										href="/groups"
										className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-5 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
									>
										<FiUsers size={14} />
										<span>My Clubs</span>
									</Link>
								</div>
							</div>
						)}
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
