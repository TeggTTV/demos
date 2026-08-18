'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '@/components/AppContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import Link from 'next/link';
import Image from 'next/image';
import { compressImage } from '@/utils/imageCompression';

function RegisterContent() {
	const { registerUser } = useAppContext();
	const searchParams = useSearchParams();
	const redirectUrl = searchParams.get('redirect') || '/groups';

	const [email, setEmail] = useState('');
	const [name, setName] = useState('');
	const [password, setPassword] = useState('');
	const [major, setMajor] = useState('');
	const [year, setYear] = useState('');
	const [avatarUrl, setAvatarUrl] = useState('');

	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [agreed, setAgreed] = useState(false);
	const router = useRouter();

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!agreed) {
			setError('You must agree to the Terms of Service and Privacy Policy to continue.');
			return;
		}
		setLoading(true);
		setError('');

		const res = await registerUser(
			email,
			name,
			password,
			'APPLICANT',
			avatarUrl || undefined,
			undefined,
			major || undefined,
			year || undefined,
		);
		setLoading(false);

		if (res.success) {
			router.push(redirectUrl);
		} else {
			setError(res.error || 'Registration failed');
		}
	};

	return (
		<main className="grow flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-sm space-y-6">
				<div className="text-center">
					<div className="relative mx-auto w-10 h-10 mb-2 overflow-hidden rounded-xl">
						<Image
							src="/icon1.png"
							alt="Demos Logo"
							fill
							className="object-cover dark:invert"
						/>
					</div>
					<h1 className="text-2xl font-bold text-text-primary">
						Join Demos
					</h1>
					<p className="text-xs text-text-muted mt-1">
						Create your account to discover clubs, join rosters, and
						check into meetings.
					</p>
				</div>

				<form onSubmit={handleRegister} className="space-y-3.5 text-xs">
					{error && (
						<div className="text-xs text-danger bg-danger-bg border border-danger/20 p-3 rounded-lg text-center font-medium">
							{error}
						</div>
					)}

					<Input
						autoCorrect="off"
						type="text"
						label="Full Name"
						placeholder="Full name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
					/>

					<Input
						autoCorrect="off"
						type="email"
						label="Campus Email Address"
						placeholder="Campus email address"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>

					<div className="grid grid-cols-2 gap-3">
						<Input
							autoCorrect="off"
							type="text"
							label="Major"
							placeholder="Major / Program"
							value={major}
							onChange={(e) => setMajor(e.target.value)}
						/>
						<Input
							autoCorrect="off"
							type="text"
							label="Graduation Year"
							placeholder="Graduation year"
							value={year}
							onChange={(e) => setYear(e.target.value)}
						/>
					</div>

					<Input
						autoCorrect="off"
						type="password"
						label="Password"
						placeholder="••••••••"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>

					<div className="space-y-1.5">
						<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider">
							Profile Avatar (Optional)
						</label>
						<input
							autoCorrect="off"
							type="file"
							accept="image/*"
							onChange={async (e) => {
								const file = e.target.files?.[0];
								if (file) {
									try {
										const compressedDataUrl =
											await compressImage(file);
										setAvatarUrl(compressedDataUrl);
									} catch (err) {
										console.error(
											'Image compression failed:',
											err,
										);
									}
								}
							}}
							className="block w-full text-xs text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary-light/80 cursor-pointer"
						/>
					</div>

					<div className="py-1">
						<Checkbox
							id="agree-terms"
							checked={agreed}
							onChange={(e) => setAgreed(e.target.checked)}
							required
							label={
								<span className="text-text-secondary leading-tight">
									I agree to the{' '}
									<Link
										href="/terms"
										target="_blank"
										className="text-primary font-semibold hover:underline"
										onClick={(e) => e.stopPropagation()}
									>
										Terms of Service
									</Link>{' '}
									and{' '}
									<Link
										href="/privacy"
										target="_blank"
										className="text-primary font-semibold hover:underline"
										onClick={(e) => e.stopPropagation()}
									>
										Privacy Policy
									</Link>
									.
								</span>
							}
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full rounded-xl bg-primary py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm transition-all disabled:opacity-50 cursor-pointer mt-2"
					>
						{loading ? 'Creating Account...' : 'Create Account'}
					</button>
				</form>

				<p className="text-center text-xs text-text-secondary">
					Already have an account?{' '}
					<Link
						href={
							searchParams.get('redirect')
								? `/auth/login?redirect=${encodeURIComponent(searchParams.get('redirect')!)}`
								: '/auth/login'
						}
						className="text-primary font-semibold hover:underline"
					>
						Sign In
					</Link>
				</p>
			</div>
		</main>
	);
}

export default function RegisterPage() {
	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Nav />
			<Suspense
				fallback={
					<main className="grow flex items-center justify-center py-20">
						<h1 className="text-xs text-text-muted font-normal">
							Loading...
						</h1>
					</main>
				}
			>
				<RegisterContent />
			</Suspense>
			<Footer />
		</div>
	);
}
