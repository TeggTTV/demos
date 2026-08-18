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
			className="flex items-center space-x-2 text-xs text-text-secondary cursor-pointer hover:text-text-primary select-none transition-colors"
		>
			<div className="relative">
				<input
					type="checkbox"
					id={checkboxId}
					checked={checked}
					onChange={onChange}
					className="sr-only"
					{...props}
				/>
				{/* Custom check box */}
				<div
					className={`h-4.5 w-4.5 rounded border flex items-center justify-center transition-all ${
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
								transition={{
									type: 'spring',
									stiffness: 500,
									damping: 25,
								}}
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
			{label && <span className="font-medium">{label}</span>}
		</label>
	);
}
