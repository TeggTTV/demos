'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '@/components/AppContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/Input';
import PageLoader from '@/components/ui/PageLoader';
import Link from 'next/link';
import Image from 'next/image';

import { USE_MOCK_DATA } from '@/mock/mockConfig';
import { MOCK_USERS } from '@/mock/mockData';

function LoginContent() {
	const { loginUser } = useAppContext();
	const searchParams = useSearchParams();
	const redirectUrl = searchParams.get('redirect') || '/groups';

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		const res = await loginUser(email, password || 'password123');
		setLoading(false);

		if (res.success) {
			router.push(redirectUrl);
			router.refresh();
		} else {
			setError(res.error || 'Invalid email or password');
		}
	};

	const handleQuickLogin = async (userEmail: string) => {
		setEmail(userEmail);
		setPassword('password123');
		setLoading(true);
		setError('');
		const res = await loginUser(userEmail, 'password123');
		setLoading(false);
		if (res.success) {
			router.push(redirectUrl);
			router.refresh();
		} else {
			setError(res.error || 'Invalid credentials');
		}
	};

	return (
		<main className="grow flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-sm space-y-6">
				<div className="text-center">
					<div className="relative mx-auto w-16 h-16 mb-2 overflow-hidden rounded-xl">
						<Image
							src="/icon1.png"
							alt="Demos Logo"
							fill
							className="object-cover dark:invert"
						/>
					</div>

					<h1 className="text-2xl font-bold text-text-primary">
						Sign In to Demos
					</h1>
					<p className="text-xs text-text-muted mt-1">
						Access your campus clubs, hubs, and meeting check-ins.
					</p>
				</div>

				{USE_MOCK_DATA && (
					<div className="rounded-xl border border-primary/20 bg-primary-light/40 p-3.5 space-y-2.5">
						<div className="flex items-center justify-between">
							<span className="text-[11px] font-bold text-primary uppercase tracking-wider">
								⚡ Demo Mode: 1-Click Login
							</span>
							<span className="text-[10px] text-text-muted">
								No password needed
							</span>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
							{MOCK_USERS.slice(0, 6).map((u) => (
								<button
									key={u.id}
									type="button"
									onClick={() => handleQuickLogin(u.email)}
									disabled={loading}
									className="text-left px-2.5 py-2 rounded-lg bg-surface border border-border hover:border-primary text-xs transition-all flex items-center gap-2 group cursor-pointer"
								>
									<span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
										{u.name.charAt(0)}
									</span>
									<div className="truncate">
										<p className="font-semibold text-text-primary group-hover:text-primary truncate text-[11px]">
											{u.name}
										</p>
										<p className="text-[9px] text-text-muted truncate">
											{u.role === 'LEADER' ? '👑 Leader' : '👤 Member'} • {u.major}
										</p>
									</div>
								</button>
							))}
						</div>
					</div>
				)}

				<form onSubmit={handleLogin} className="space-y-4">
					{error && (
						<div className="text-xs text-danger bg-danger-bg border border-danger/20 p-3 rounded-xl text-left space-y-1">
							<p className="font-semibold flex items-center gap-1.5">
								<span>⚠️</span> {error}
							</p>
							{error.toLowerCase().includes('invalid') && (
								<p className="text-[11px] text-danger/80">
									Don&apos;t have an account yet?{' '}
									<Link
										href={`/auth/register${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`}
										className="underline font-semibold hover:opacity-80"
									>
										Create an account here →
									</Link>
								</p>
							)}
						</div>
					)}

					<Input
						type="email"
						label="Email Address"
						placeholder="you@campus.edu"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>

					<Input
						type="password"
						label="Password"
						placeholder="••••••••"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required={!USE_MOCK_DATA}
					/>

					<button
						type="submit"
						disabled={loading}
						className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-hover shadow-sm transition-all disabled:opacity-50 cursor-pointer"
					>
						{loading ? 'Signing In...' : 'Sign In'}
					</button>
				</form>

				<p className="text-center text-xs text-text-secondary">
					Don&apos;t have an account?{' '}
					<Link
						href={
							searchParams.get('redirect')
								? `/auth/register?redirect=${encodeURIComponent(searchParams.get('redirect')!)}`
								: '/auth/register'
						}
						className="text-primary font-semibold hover:underline"
					>
						Create an account
					</Link>
				</p>
			</div>
		</main>
	);
}

export default function LoginPage() {
	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Nav />
			<Suspense
				fallback={
					<main className="grow flex items-center justify-center py-20">
						<PageLoader message="Loading..." />
					</main>
				}
			>
				<LoginContent />
			</Suspense>
			<Footer />
		</div>
	);
}
