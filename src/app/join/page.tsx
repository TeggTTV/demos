'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/components/AppContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { FiKey, FiArrowRight, FiCompass } from 'react-icons/fi';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { USE_MOCK_DATA } from '@/mock/mockConfig';

function JoinContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { currentUser, joinViaInviteCode } = useAppContext();

	const [code, setCode] = useState(searchParams.get('code') || '');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		const queryCode = searchParams.get('code');
		if (queryCode) {
			const clean = queryCode.trim();
			if (clean) {
				router.replace(`/join/${encodeURIComponent(clean)}`);
			}
		}
	}, [searchParams, router]);

	const handleJoin = async (e: React.FormEvent) => {
		e.preventDefault();
		const clean = code.trim();
		if (!clean) return;

		if (!currentUser && !USE_MOCK_DATA) {
			router.push(
				`/auth/login?redirect=/join/${encodeURIComponent(clean)}`,
			);
			return;
		}

		setLoading(true);
		setError('');

		const res = await joinViaInviteCode(clean);
		setLoading(false);

		if (res.success && res.groupId) {
			router.push(`/group/${res.groupId}/feed`);
		} else {
			setError(res.error || 'Invalid or expired invite code');
		}
	};

	return (
		<main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
			<div className="w-full max-w-md rounded-3xl border border-border bg-surface shadow-xl p-6 sm:p-8 space-y-6">
				<div className="text-center space-y-2">
					<div className="mx-auto h-12 w-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center text-xl shadow-xs">
						<FiKey size={24} />
					</div>
					<h1 className="text-2xl font-extrabold text-text-primary">
						Join a Campus Club
					</h1>
					<p className="text-xs text-text-muted max-w-xs mx-auto">
						Enter an invite code or direct link to instantly join
						any student organization on Demos.
					</p>
				</div>

				<form onSubmit={handleJoin} className="space-y-4">
					{error && (
						<div className="rounded-xl bg-danger-bg border border-danger/20 p-3 text-xs text-danger text-center font-medium">
							{error}
						</div>
					)}

					<Input
						label="Invite Code or Link"
						type="text"
						placeholder="e.g. DEMOS-GDSC-2026 or https://.../join/CODE"
						value={code}
						onChange={(e) => setCode(e.target.value)}
						required
					/>

					<button
						type="submit"
						disabled={loading || !code.trim()}
						className="w-full rounded-xl bg-primary py-3 text-xs font-semibold text-white hover:bg-primary-hover shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
					>
						<span>
							{loading
								? 'Joining Club...'
								: 'Join Club Instantly'}
						</span>
						<FiArrowRight size={14} />
					</button>
				</form>

				<div className="pt-2 border-t border-border text-center">
					<Link
						href="/search"
						className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1.5"
					>
						<FiCompass size={13} />
						<span>Browse all campus organizations</span>
					</Link>
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
							Loading...
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
