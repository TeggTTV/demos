'use client';

import React from 'react';
import Image from 'next/image';
import { useAppContext } from '@/components/AppContext';
import { mockStore } from '@/mock/mockStore';
import { MOCK_USERS } from '@/mock/mockData';

interface MemberAvatarStackProps {
	memberIds: string[];
	leaderId?: string;
	maxDisplay?: number;
	size?: 'xs' | 'sm' | 'md';
	className?: string;
}

const BG_GRADIENTS = [
	'from-purple-500 to-indigo-600',
	'from-blue-500 to-cyan-600',
	'from-emerald-500 to-teal-600',
	'from-amber-500 to-orange-600',
	'from-rose-500 to-pink-600',
	'from-violet-500 to-purple-600',
];

function getGradientForString(str: string) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	const index = Math.abs(hash) % BG_GRADIENTS.length;
	return BG_GRADIENTS[index];
}

export default function MemberAvatarStack({
	memberIds = [],
	leaderId,
	maxDisplay = 4,
	size = 'sm',
	className = '',
}: MemberAvatarStackProps) {
	const { users } = useAppContext();

	// Deduplicate member IDs, prioritizing leader first if provided
	const uniqueIds: string[] = [];
	if (leaderId && !uniqueIds.includes(leaderId)) {
		uniqueIds.push(leaderId);
	}
	memberIds.forEach((id) => {
		if (id && !uniqueIds.includes(id)) {
			uniqueIds.push(id);
		}
	});

	if (uniqueIds.length === 0) {
		return (
			<div className={`flex items-center gap-1.5 text-text-muted text-[11px] font-medium ${className}`}>
				<div className="h-6 w-6 rounded-full border-2 border-surface bg-surface-secondary/70 flex items-center justify-center text-[10px] text-text-muted font-bold">
					0
				</div>
				<span>0 members</span>
			</div>
		);
	}

	const displayIds = uniqueIds.slice(0, maxDisplay);
	const remainingCount = uniqueIds.length - maxDisplay;

	const sizeClasses = {
		xs: 'h-5 w-5 text-[9px]',
		sm: 'h-6 w-6 text-[10px]',
		md: 'h-7 w-7 text-xs',
	}[size];

	return (
		<div
			className={`inline-flex items-center -space-x-1.5 hover:space-x-0.5 transition-all duration-200 py-0.5 ${className}`}
			aria-label={`${uniqueIds.length} club members`}
		>
			{displayIds.map((id, index) => {
				const user =
					users.find((u) => u.id === id) ||
					(typeof mockStore !== 'undefined' ? mockStore.getUserById(id) : null) ||
					(typeof MOCK_USERS !== 'undefined' ? MOCK_USERS.find((u) => u.id === id) : null);
				const userName = user?.name || (id === leaderId ? 'Club Leader' : 'Member');
				const initial = userName.trim()[0]?.toUpperCase() || 'M';
				const gradient = getGradientForString(id || userName);

				return (
					<div
						key={id || index}
						title={userName}
						className={`relative rounded-full border-2 border-surface bg-surface-secondary overflow-hidden shrink-0 shadow-2xs transition-transform duration-150 hover:scale-115 hover:z-20 cursor-default ${sizeClasses}`}
						style={{ zIndex: displayIds.length - index }}
					>
						{user?.avatarUrl ? (
							<Image
								src={user.avatarUrl}
								alt={userName}
								fill
								className="object-cover"
								unoptimized
							/>
						) : (
							<div
								className={`w-full h-full bg-linear-to-tr ${gradient} flex items-center justify-center text-white font-bold`}
							>
								{initial}
							</div>
						)}
					</div>
				);
			})}

			{remainingCount > 0 && (
				<div
					title={`${remainingCount} more member${remainingCount > 1 ? 's' : ''}`}
					className={`relative rounded-full border-2 border-surface bg-surface-secondary text-text-muted hover:text-text-primary hover:bg-surface-secondary/80 font-extrabold flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-150 hover:scale-115 hover:z-20 select-none cursor-default ${sizeClasses}`}
					style={{ zIndex: 0 }}
				>
					+{remainingCount}
				</div>
			)}
		</div>
	);
}
