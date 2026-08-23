'use client';

import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

interface AddMemberModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAddMember: (email: string) => Promise<void>;
	isAdding: boolean;
	errorMsg?: string;
	successMsg?: string;
}

export default function AddMemberModal({
	isOpen,
	onClose,
	onAddMember,
	isAdding,
	errorMsg,
	successMsg,
}: AddMemberModalProps) {
	const [emailInput, setEmailInput] = useState('');

	if (!isOpen) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!emailInput.trim()) return;
		await onAddMember(emailInput.trim());
		if (!errorMsg) {
			setEmailInput('');
		}
	};

	return (
		<div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
			<div className="bg-surface border border-border w-full max-w-sm rounded-2xl shadow-xl overflow-hidden relative">
				<button
					onClick={onClose}
					className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
				>
					<FiX size={16} />
				</button>
				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<div>
						<h3 className="text-sm font-bold text-text-primary">
							Add Member to Club
						</h3>
						<p className="text-[11px] text-text-muted mt-0.5">
							Add an existing student directly by email.
						</p>
					</div>

					<div className="space-y-1.5">
						<label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">
							Email Address
						</label>
						<input
							type="email"
							required
							placeholder="student@example.com"
							value={emailInput}
							onChange={(e) => setEmailInput(e.target.value)}
							className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
						/>
					</div>

					{errorMsg && (
						<p className="text-[11px] font-medium text-danger bg-danger-bg border border-danger/10 p-2.5 rounded-lg">
							{errorMsg}
						</p>
					)}
					{successMsg && (
						<p className="text-[11px] font-medium text-success bg-success-bg border border-success/10 p-2.5 rounded-lg">
							{successMsg}
						</p>
					)}

					<button
						type="submit"
						disabled={isAdding || !emailInput.trim()}
						className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-primary hover:bg-primary-hover text-white py-2 text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
					>
						{isAdding ? 'Adding...' : 'Add Student'}
					</button>
				</form>
			</div>
		</div>
	);
}
