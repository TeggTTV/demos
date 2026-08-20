'use client';

import React, { useId, useState } from 'react';
import { motion } from 'framer-motion';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string;
}

export function Textarea({
	label,
	className = '',
	id,
	...props
}: TextareaProps) {
	const [isFocused, setIsFocused] = useState(false);
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const textareaId = id || useId();

	return (
		<div className="space-y-1.5 w-full">
			{label && (
				<label
					htmlFor={textareaId}
					className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider"
				>
					{label}
				</label>
			)}
			<motion.div
				animate={{
					scale: isFocused ? 1.01 : 1,
					boxShadow: isFocused
						? '0 4px 12px rgba(79, 70, 229, 0.08)'
						: '0 0px 0px rgba(0,0,0,0)',
				}}
				transition={{ type: 'spring', stiffness: 400, damping: 25 }}
				className={`rounded-lg border bg-surface-secondary transition-colors ${
					isFocused
						? 'border-primary/50 ring-2 ring-primary/10'
						: 'border-border'
				}`}
			>
				<textarea
					id={textareaId}
					onFocus={(e) => {
						setIsFocused(true);
						props.onFocus?.(e);
					}}
					onBlur={(e) => {
						setIsFocused(false);
						props.onBlur?.(e);
					}}
					className={`w-full bg-transparent px-3 py-2.5 text-xs text-text-primary placeholder-text-muted focus:outline-none resize-none ${className}`}
					{...props}
				/>
			</motion.div>
		</div>
	);
}
