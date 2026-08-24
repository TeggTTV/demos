'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

interface ConfirmModalProps {
	isOpen: boolean;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	isDestructive?: boolean;
	onConfirm: () => void;
	onClose: () => void;
}

export default function ConfirmModal({
	isOpen,
	title,
	message,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	isDestructive = false,
	onConfirm,
	onClose,
}: ConfirmModalProps) {
	if (!isOpen) return null;

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 10 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 10 }}
					transition={{ duration: 0.15 }}
					className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4"
				>
					<div className="flex items-start justify-between gap-3">
						<div className="flex items-center gap-3">
							<div
								className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
									isDestructive
										? 'bg-danger/10 text-danger'
										: 'bg-primary-light text-primary'
								}`}
							>
								<FiAlertTriangle size={20} />
							</div>
							<div>
								<h3 className="text-base font-bold text-text-primary">
									{title}
								</h3>
							</div>
						</div>
						<button
							onClick={onClose}
							className="text-text-muted hover:text-text-primary p-1 rounded-lg transition-colors cursor-pointer"
						>
							<FiX size={16} />
						</button>
					</div>

					<p className="text-xs text-text-secondary leading-relaxed">
						{message}
					</p>

					<div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
						<button
							type="button"
							onClick={onClose}
							className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
						>
							{cancelText}
						</button>
						<button
							type="button"
							onClick={() => {
								onConfirm();
								onClose();
							}}
							className={`rounded-xl px-5 py-2 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer ${
								isDestructive
									? 'bg-danger hover:bg-danger/90'
									: 'bg-primary hover:bg-primary-hover'
							}`}
						>
							{confirmText}
						</button>
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
