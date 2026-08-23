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

		const res = await loginUser(email, password);
		setLoading(false);

		if (res.success) {
			router.push(redirectUrl);
		} else {
			setError(res.error || 'Login failed');
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

				<form onSubmit={handleLogin} className="space-y-4">
					{error && (
						<div className="text-xs text-danger bg-danger-bg border border-danger/20 p-3 rounded-lg text-center">
							{error}
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
						required
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
