'use client';

import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
	className?: string;
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
	return (
		<div
			className={`animate-pulse rounded-lg bg-surface-secondary/70 dark:bg-surface-secondary/40 ${className}`}
			{...props}
		/>
	);
}

export function ClubCardSkeleton() {
	return (
		<div className="rounded-2xl border border-border bg-surface overflow-hidden flex flex-col shadow-2xs">
			{/* Banner Skeleton */}
			<div className="h-32 w-full bg-surface-secondary/80 animate-pulse relative">
				<div className="absolute top-3 right-3 h-5 w-20 rounded-full bg-surface/60 animate-pulse" />
			</div>

			{/* Content Skeleton */}
			<div className="p-5 flex flex-col grow space-y-3">
				<div className="h-5 w-3/4 bg-surface-secondary/80 rounded-md animate-pulse" />
				<div className="space-y-1.5 pt-1">
					<div className="h-3.5 w-full bg-surface-secondary/60 rounded-md animate-pulse" />
					<div className="h-3.5 w-4/5 bg-surface-secondary/60 rounded-md animate-pulse" />
				</div>

				{/* Meeting info skeleton */}
				<div className="mt-4 pt-3 border-t border-border space-y-2">
					<div className="h-3 w-1/2 bg-surface-secondary/60 rounded-md animate-pulse" />
					<div className="h-3 w-2/5 bg-surface-secondary/60 rounded-md animate-pulse" />
				</div>

				{/* Footer skeleton */}
				<div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
					<div className="h-3.5 w-20 bg-surface-secondary/60 rounded-md animate-pulse" />
					<div className="h-8 w-24 bg-surface-secondary/80 rounded-xl animate-pulse" />
				</div>
			</div>
		</div>
	);
}

export function EventCardSkeleton() {
	return (
		<div className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-2xs flex flex-col justify-between">
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<div className="h-5 w-24 rounded-full bg-surface-secondary/80 animate-pulse" />
					<div className="h-5 w-20 rounded-full bg-surface-secondary/60 animate-pulse" />
				</div>

				<div className="h-5 w-3/4 bg-surface-secondary/80 rounded-md animate-pulse" />
				<div className="h-3.5 w-1/3 bg-surface-secondary/60 rounded-md animate-pulse" />

				<div className="space-y-1.5 pt-1">
					<div className="h-3.5 w-full bg-surface-secondary/60 rounded-md animate-pulse" />
					<div className="h-3.5 w-2/3 bg-surface-secondary/60 rounded-md animate-pulse" />
				</div>
			</div>

			<div className="pt-3 border-t border-border flex items-center justify-between">
				<div className="h-3.5 w-24 bg-surface-secondary/60 rounded-md animate-pulse" />
				<div className="h-8 w-28 bg-surface-secondary/80 rounded-xl animate-pulse" />
			</div>
		</div>
	);
}

export function FeedMessageSkeleton() {
	return (
		<div className="p-4 rounded-2xl border border-border bg-surface space-y-3">
			<div className="flex items-center gap-3">
				<div className="h-9 w-9 rounded-full bg-surface-secondary/80 animate-pulse shrink-0" />
				<div className="space-y-1.5 grow">
					<div className="h-3.5 w-32 bg-surface-secondary/80 rounded-md animate-pulse" />
					<div className="h-2.5 w-20 bg-surface-secondary/60 rounded-md animate-pulse" />
				</div>
			</div>
			<div className="space-y-2 pl-12">
				<div className="h-3.5 w-full bg-surface-secondary/60 rounded-md animate-pulse" />
				<div className="h-3.5 w-5/6 bg-surface-secondary/60 rounded-md animate-pulse" />
				<div className="h-3.5 w-2/3 bg-surface-secondary/60 rounded-md animate-pulse" />
			</div>
		</div>
	);
}

export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
	return (
		<tr className="border-b border-border">
			{Array.from({ length: cols }).map((_, idx) => (
				<td key={idx} className="py-3 px-4">
					<div
						className="h-3.5 bg-surface-secondary/70 rounded-md animate-pulse"
						style={{ width: `${Math.floor(40 + ((idx * 23) % 50))}%` }}
					/>
				</td>
			))}
		</tr>
	);
}

export function ClubHubSkeleton() {
	return (
		<div className="flex min-h-screen flex-col bg-background">
			{/* Banner skeleton */}
			<div className="h-44 sm:h-56 w-full bg-surface-secondary/70 animate-pulse relative">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-4">
					<div className="flex items-center gap-4">
						<div className="h-16 w-16 rounded-2xl bg-surface/80 animate-pulse" />
						<div className="space-y-2">
							<div className="h-6 w-48 bg-surface/80 rounded-lg animate-pulse" />
							<div className="h-3.5 w-32 bg-surface/60 rounded-md animate-pulse" />
						</div>
					</div>
				</div>
			</div>

			{/* Tab bar skeleton */}
			<div className="border-b border-border bg-surface">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex gap-4 py-3">
					<div className="h-6 w-16 bg-surface-secondary/80 rounded-lg animate-pulse" />
					<div className="h-6 w-24 bg-surface-secondary/60 rounded-lg animate-pulse" />
					<div className="h-6 w-20 bg-surface-secondary/60 rounded-lg animate-pulse" />
				</div>
			</div>

			{/* Content skeleton */}
			<main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-4">
				{Array.from({ length: 3 }).map((_, i) => (
					<FeedMessageSkeleton key={i} />
				))}
			</main>
		</div>
	);
}

