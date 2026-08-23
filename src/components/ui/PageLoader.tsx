'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface PageLoaderProps {
	message?: string;
	subMessage?: string;
	className?: string;
}

export default function PageLoader({
	message = 'Loading...',
	subMessage,
	className = '',
}: PageLoaderProps) {
	return (
		<div
			className={`flex min-h-[40vh] flex-col items-center justify-center p-8 text-center ${className}`}
		>
			<div className="relative flex flex-col items-center justify-center space-y-3">
				{/* Soft ambient glow */}
				<div className="absolute h-24 w-24 rounded-full bg-primary/15 blur-xl animate-pulse" />

				{/* Animated ring */}
				<div className="relative flex h-12 w-12 items-center justify-center">
					<motion.div
						className="absolute h-12 w-12 rounded-full border-2 border-transparent border-t-primary border-r-primary/40"
						animate={{ rotate: 360 }}
						transition={{
							repeat: Infinity,
							duration: 0.9,
							ease: 'linear',
						}}
					/>
					<div className="h-6 w-6 rounded-full bg-primary-light flex items-center justify-center text-[10px] font-bold text-primary">
						D
					</div>
				</div>

				<div className="space-y-0.5 pt-1">
					<p className="text-xs font-bold text-text-primary tracking-wide">
						{message}
					</p>
					{subMessage && (
						<p className="text-[11px] text-text-muted">
							{subMessage}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
