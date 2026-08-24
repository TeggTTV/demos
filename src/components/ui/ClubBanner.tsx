'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ClubBannerProps {
	bannerUrl?: string | null;
	alt?: string;
	className?: string;
	category?: string;
	priority?: boolean;
}

const DEFAULT_FALLBACK_GRADIENT =
	'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)';

const CATEGORY_GRADIENTS: Record<string, string> = {
	'Technology & Coding': 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #6366f1 100%)',
	'Arts & Design': 'linear-gradient(135deg, #4c0519 0%, #be123c 50%, #f43f5e 100%)',
	'Engineering & Science': 'linear-gradient(135deg, #082f49 0%, #0369a1 50%, #38bdf8 100%)',
	'Business & Entrepreneurship': 'linear-gradient(135deg, #022c22 0%, #047857 50%, #10b981 100%)',
	'Music & Performance': 'linear-gradient(135deg, #3b0764 0%, #7e22ce 50%, #c084fc 100%)',
	'Environmental & Sustainability': 'linear-gradient(135deg, #042f2e 0%, #0f766e 50%, #14b8a6 100%)',
	'Gaming & Esports': 'linear-gradient(135deg, #09090b 0%, #1e1b4b 50%, #4f46e5 100%)',
};

export default function ClubBanner({
	bannerUrl,
	alt = 'Club Banner',
	className = 'object-cover',
	category,
	priority = false,
}: ClubBannerProps) {
	const [hasError, setHasError] = useState(false);

	const fallbackGradient =
		(category && CATEGORY_GRADIENTS[category]) || DEFAULT_FALLBACK_GRADIENT;

	const trimmed = bannerUrl?.trim();
	const isImageUrl =
		trimmed &&
		!hasError &&
		(trimmed.startsWith('http://') ||
			trimmed.startsWith('https://') ||
			trimmed.startsWith('data:image/') ||
			trimmed.startsWith('/'));

	const isGradientOrColor =
		trimmed &&
		(trimmed.startsWith('linear-gradient') ||
			trimmed.startsWith('radial-gradient') ||
			trimmed.startsWith('#') ||
			trimmed.startsWith('rgb'));

	if (isImageUrl) {
		return (
			<Image
				src={trimmed}
				alt={alt}
				fill
				unoptimized
				priority={priority}
				className={className}
				onError={() => setHasError(true)}
			/>
		);
	}

	if (isGradientOrColor) {
		return (
			<div
				className="w-full h-full"
				style={{ background: trimmed }}
			/>
		);
	}

	// Fallback when bannerUrl is missing, invalid, or failed to load
	return (
		<div
			className="w-full h-full"
			style={{ background: fallbackGradient }}
		/>
	);
}
