'use client';

import React from 'react';
import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';

export interface ScrollRevealProps extends HTMLMotionProps<'div'> {
	children: React.ReactNode;
	direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'zoom';
	delay?: number;
	duration?: number;
	distance?: number;
	className?: string;
	once?: boolean;
}

export default function ScrollReveal({
	children,
	direction = 'up',
	delay = 0,
	duration = 0.45,
	distance = 24,
	className = '',
	once = true,
	...props
}: ScrollRevealProps) {
	const getInitialTransform = () => {
		switch (direction) {
			case 'up':
				return { opacity: 0, y: distance };
			case 'down':
				return { opacity: 0, y: -distance };
			case 'left':
				return { opacity: 0, x: distance };
			case 'right':
				return { opacity: 0, x: -distance };
			case 'zoom':
				return { opacity: 0, scale: 0.95 };
			case 'fade':
			default:
				return { opacity: 0 };
		}
	};

	const getAnimateTransform = () => {
		switch (direction) {
			case 'up':
			case 'down':
				return { opacity: 1, y: 0 };
			case 'left':
			case 'right':
				return { opacity: 1, x: 0 };
			case 'zoom':
				return { opacity: 1, scale: 1 };
			case 'fade':
			default:
				return { opacity: 1 };
		}
	};

	return (
		<motion.div
			initial={getInitialTransform()}
			whileInView={getAnimateTransform()}
			viewport={{ once, margin: '0px', amount: 0.05 }}
			transition={{
				duration,
				delay,
				ease: [0.21, 0.47, 0.32, 0.98],
			}}
			className={className}
			{...props}
		>
			{children}
		</motion.div>
	);
}

export interface ScrollStaggerContainerProps extends HTMLMotionProps<'div'> {
	children: React.ReactNode;
	staggerDelay?: number;
	className?: string;
	once?: boolean;
}

const containerVariants: Variants = {
	hidden: { opacity: 0 },
	show: (staggerDelay = 0.08) => ({
		opacity: 1,
		transition: {
			staggerChildren: staggerDelay,
		},
	}),
};

export function ScrollStaggerContainer({
	children,
	staggerDelay = 0.08,
	className = '',
	once = true,
	...props
}: ScrollStaggerContainerProps) {
	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			whileInView="show"
			animate="show"
			custom={staggerDelay}
			viewport={{ once, margin: '0px', amount: 0.05 }}
			className={className}
			{...props}
		>
			{children}
		</motion.div>
	);
}

const itemVariants: Variants = {
	hidden: { opacity: 0, y: 16 },
	show: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.35,
			ease: [0.21, 0.47, 0.32, 0.98],
		},
	},
};

export function ScrollStaggerItem({
	children,
	className = '',
	...props
}: HTMLMotionProps<'div'>) {
	return (
		<motion.div
			variants={itemVariants}
			initial="hidden"
			animate="show"
			className={className}
			{...props}
		>
			{children}
		</motion.div>
	);
}
