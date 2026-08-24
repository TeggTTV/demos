'use client';

import React, { useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckboxProps extends Omit<
	React.InputHTMLAttributes<HTMLInputElement>,
	'type'
> {
	label?: React.ReactNode;
}

export function Checkbox({
	label,
	checked,
	onChange,
	id,
	...props
}: CheckboxProps) {
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const checkboxId = id || useId();

	return (
		<label
			htmlFor={checkboxId}
			className="flex min-h-11 items-center gap-2 text-sm text-text-secondary cursor-pointer select-none transition-colors"
		>
			<div className="relative">
				<input
					type="checkbox"
					id={checkboxId}
					checked={checked}
					onChange={onChange}
					className="peer sr-only"
					{...props}
				/>
				{/* Custom check box */}
				<div
					className={`flex h-5 w-5 items-center justify-center rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${
						checked
							? 'border-primary bg-primary'
							: 'border-border bg-surface-secondary'
					}`}
				>
					<AnimatePresence initial={false}>
						{checked && (
							<motion.svg
								initial={{ scale: 0, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0, opacity: 0 }}
								transition={{ duration: 0.15 }}
								className="h-3 w-3 text-white"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={3}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M5 13l4 4L19 7"
								/>
							</motion.svg>
						)}
					</AnimatePresence>
				</div>
			</div>
			{label && <span className="font-medium leading-snug">{label}</span>}
		</label>
	);
}
