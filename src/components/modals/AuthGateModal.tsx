'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { useAppContext } from '@/components/AppContext';
import { useDialogAccessibility } from '@/components/ui/useDialogAccessibility';

interface AuthGateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export default function AuthGateModal({
	isOpen,
	onClose,
	onSuccess,
}: AuthGateModalProps) {
	const { loginUser } = useAppContext();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [authError, setAuthError] = useState('');
	const [loading, setLoading] = useState(false);
	const dialogRef = useRef<HTMLDivElement>(null);

	useDialogAccessibility(isOpen, onClose, dialogRef);

	if (!isOpen) return null;

	const handleAuthSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setAuthError('');
		setLoading(true);
		try {
			const res = await loginUser(email, password);
			if (res.success) {
				onClose();
				if (onSuccess) onSuccess();
			} else {
				setAuthError(res.error || 'Invalid email or password');
			}
		} catch (err) {
			console.error('Login error:', err);
			setAuthError('An unexpected error occurred. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onMouseDown={onClose}>
			<div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="auth-gate-title" className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl" onMouseDown={(event) => event.stopPropagation()}>
				<div className="flex items-center justify-between border-b border-border pb-4 mb-4">
					<h3 id="auth-gate-title" className="text-lg font-bold text-text-primary">
						Sign In Required
					</h3>
					<button
						onClick={onClose}
						aria-label="Close sign-in dialog"
						className="rounded-lg p-1 text-text-muted hover:bg-surface-secondary hover:text-text-primary transition-all cursor-pointer"
					>
						✕
					</button>
				</div>
				<p className="text-sm text-text-secondary mb-5">
					Sign in to your Deimos account to join clubs, participate in discussions, and check in to meetings.
				</p>

				<form onSubmit={handleAuthSubmit} className="space-y-3">
					{authError && (
						<div className="text-xs text-danger bg-danger-bg border border-danger/20 p-2.5 rounded-lg text-left space-y-1">
							<p className="font-semibold flex items-center gap-1.5">
								<span>⚠️</span> {authError}
							</p>
							{authError.toLowerCase().includes('invalid') && (
								<p className="text-[11px] text-danger/80">
									Need an account?{' '}
									<Link
										href="/auth/register"
										onClick={onClose}
										className="underline font-semibold hover:opacity-80"
									>
										Register here →
									</Link>
								</p>
							)}
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
						disabled={loading}
						className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-hover shadow-sm transition-all mt-2 cursor-pointer disabled:opacity-50"
					>
						{loading ? 'Signing in...' : 'Sign In'}
					</button>
				</form>

				<p className="text-center text-xs text-text-secondary mt-5">
					Don&apos;t have an account?{' '}
					<Link
						href="/auth/register"
						onClick={onClose}
						className="text-primary font-semibold hover:underline"
					>
						Create an account
					</Link>
				</p>
			</div>
		</div>
	);
}
