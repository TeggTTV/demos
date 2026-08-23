'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiKey, FiCheck } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { useAppContext } from '@/components/AppContext';

interface RedeemInviteModalProps {
	isOpen: boolean;
	onClose: () => void;
	initialCode?: string;
	onSuccess?: (groupId: string) => void;
}

export default function RedeemInviteModal({
	isOpen,
	onClose,
	initialCode = '',
	onSuccess,
}: RedeemInviteModalProps) {
	const { joinViaInviteCode } = useAppContext();
	const router = useRouter();
	const [inviteCodeInput, setInviteCodeInput] = useState(initialCode);
	const [inviteLoading, setInviteLoading] = useState(false);
	const [inviteError, setInviteError] = useState('');
	const [inviteSuccess, setInviteSuccess] = useState('');

	/* eslint-disable react-hooks/set-state-in-effect */
	useEffect(() => {
		if (initialCode) {
			setInviteCodeInput(initialCode);
		}
	}, [initialCode]);
	/* eslint-enable react-hooks/set-state-in-effect */

	if (!isOpen) return null;

	const handleRedeemInvite = async (e: React.FormEvent) => {
		e.preventDefault();
		setInviteError('');
		setInviteSuccess('');
		setInviteLoading(true);

		try {
			let cleanCode = inviteCodeInput.trim();
			if (cleanCode.includes('/join/')) {
				const parts = cleanCode.split('/join/');
				cleanCode = parts[parts.length - 1].split('?')[0].split('#')[0];
			}

			const res = await joinViaInviteCode(cleanCode);
			if (res.success && res.groupId) {
				setInviteSuccess(`Successfully joined ${res.group?.name || 'the club'}!`);
				setTimeout(() => {
					onClose();
					if (onSuccess) {
						onSuccess(res.groupId!);
					} else {
						router.push(`/group/${res.groupId}/feed`);
					}
				}, 1200);
			} else {
				setInviteError(res.error || 'Invalid or expired invite code.');
			}
		} catch (err) {
			console.error('Invite redemption failed:', err);
			setInviteError('Failed to redeem invite code. Please try again.');
		} finally {
			setInviteLoading(false);
		}
	};

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.95 }}
					className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4"
				>
					<div className="flex items-center justify-between border-b border-border pb-3">
						<h3 className="text-base font-bold text-text-primary flex items-center gap-2">
							<FiKey className="text-primary" /> Join with Invite Code
						</h3>
						<button
							onClick={onClose}
							className="text-text-muted hover:text-text-primary cursor-pointer"
						>
							✕
						</button>
					</div>

					<form onSubmit={handleRedeemInvite} className="space-y-3">
						{inviteError && (
							<div className="text-xs text-danger bg-danger-bg p-2.5 rounded-lg text-center font-medium">
								{inviteError}
							</div>
						)}
						{inviteSuccess && (
							<div className="text-xs text-success bg-success-bg p-2.5 rounded-lg text-center font-medium flex items-center justify-center gap-1.5">
								<FiCheck /> {inviteSuccess}
							</div>
						)}

						<Input
							label="Club Invite Code or Direct Link"
							required
							placeholder="e.g. DEMOS-GDSC-2026 or https://.../join/CODE"
							value={inviteCodeInput}
							onChange={(e) => setInviteCodeInput(e.target.value)}
						/>

						<button
							type="submit"
							disabled={inviteLoading}
							className="w-full rounded-xl bg-primary py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm transition-all cursor-pointer disabled:opacity-50"
						>
							{inviteLoading ? 'Verifying Code...' : 'Redeem & Join Club'}
						</button>
					</form>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
