'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Loading() {
	return (
		<div className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-background/90 backdrop-blur-md">
			<div className="relative flex flex-col items-center justify-center space-y-4">
				{/* Glowing background halo */}
				<div className="absolute h-32 w-32 rounded-full bg-primary/20 blur-2xl animate-pulse" />

				{/* Animated Logo / Spinner Ring */}
				<div className="relative flex h-16 w-16 items-center justify-center">
					{/* Outer spinning gradient ring */}
					<motion.div
						className="absolute h-16 w-16 rounded-full border-3 border-transparent border-t-primary border-r-primary/50"
						animate={{ rotate: 360 }}
						transition={{
							repeat: Infinity,
							duration: 1,
							ease: 'linear',
						}}
					/>
					{/* Inner reverse spinning ring */}
					<motion.div
						className="absolute h-10 w-10 rounded-full border-2 border-transparent border-b-primary border-l-primary/30"
						animate={{ rotate: -360 }}
						transition={{
							repeat: Infinity,
							duration: 1.4,
							ease: 'linear',
						}}
					/>
					{/* Center icon / brand initial */}
					<span className="text-base font-extrabold text-primary">
						D
					</span>
				</div>

				{/* Loading Text */}
				<div className="flex flex-col items-center space-y-1">
					<span className="text-xs font-bold uppercase tracking-widest text-text-primary">
						Loading Deimos
					</span>
					<span className="text-[11px] text-text-muted">
						Connecting to campus hub...
					</span>
				</div>
			</div>
		</div>
	);
}
