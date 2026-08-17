'use client';

import React, { useId, useState } from 'react';
import { IconType } from 'react-icons';
import { motion } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	icon?: IconType;
}

export function Input({
	label,
	icon: Icon,
	className = '',
	id,
	...props
}: InputProps) {
	const [isFocused, setIsFocused] = useState(false);
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const inputId = id || useId();

	return (
		<div className="space-y-1.5 w-full">
			{label && (
				<label
					htmlFor={inputId}
					className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider"
				>
					{label}
				</label>
			)}
			<motion.div
				animate={{
					scale: isFocused ? 1.02 : 1,
					boxShadow: isFocused
						? '0 4px 12px rgba(79, 70, 229, 0.12)'
						: '0 0px 0px rgba(0,0,0,0)',
				}}
				transition={{ type: 'spring', stiffness: 400, damping: 25 }}
				className={`flex items-center gap-2 rounded-lg border bg-surface-secondary px-3 py-2.5 transition-colors ${
					isFocused
						? 'border-primary/50 ring-2 ring-primary/10'
						: 'border-border'
				}`}
			>
				{Icon && (
					<Icon className="text-text-muted shrink-0" size={16} />
				)}
				<input
					id={inputId}
					onFocus={(e) => {
						setIsFocused(true);
						props.onFocus?.(e);
					}}
					onBlur={(e) => {
						setIsFocused(false);
						props.onBlur?.(e);
					}}
					className={`grow bg-transparent text-xs text-text-primary placeholder-text-muted focus:outline-none w-full ${className}`}
					{...props}
				/>
			</motion.div>
		</div>
	);
}
