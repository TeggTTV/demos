'use client';

import React, { useId, useState } from 'react';
import { motion } from 'framer-motion';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	value: number;
}

export function Slider({
	label,
	value,
	className = '',
	id,
	...props
}: SliderProps) {
	const [isFocused, setIsFocused] = useState(false);
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const sliderId = id || useId();

	const minVal = Number(props.min) || 1;
	const maxVal = Number(props.max) || 15;
	const steps = maxVal - minVal;

	return (
		<div className="space-y-1.5 w-full">
			{label && (
				<div className="flex justify-between items-center text-[11px] font-semibold text-text-muted uppercase tracking-wider">
					<label htmlFor={sliderId}>{label}</label>
					<span className="text-primary font-bold">{value}</span>
				</div>
			)}
			<motion.div
				animate={{
					scale: isFocused ? 1.015 : 1,
				}}
				transition={{ type: 'spring', stiffness: 450, damping: 20 }}
				className="relative pt-2 pb-2 flex items-center"
			>
				{/* Notched section line background */}
				<div className="absolute left-0 right-0 h-1.5 bg-border rounded-full flex justify-between px-1.75 pointer-events-none">
					{Array.from({ length: steps + 1 }).map((_, index) => (
						<div
							key={index}
							className={`w-0.5 h-1.5 self-center rounded-full transition-colors ${
								index + minVal <= value
									? 'bg-primary/70'
									: 'bg-text-muted/30'
							}`}
						/>
					))}
				</div>

				<input
					type="range"
					id={sliderId}
					value={value}
					onFocus={(e) => {
						setIsFocused(true);
						props.onFocus?.(e);
					}}
					onBlur={(e) => {
						setIsFocused(false);
						props.onBlur?.(e);
					}}
					className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-transparent accent-primary focus:outline-none transition-all relative z-10 ${className}`}
					{...props}
				/>
			</motion.div>
		</div>
	);
}
