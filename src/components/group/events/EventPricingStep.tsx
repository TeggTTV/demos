'use client';

import React from 'react';
import { FiDollarSign } from 'react-icons/fi';

interface EventPricingStepProps {
	activityPrice: string;
	setActivityPrice: (val: string) => void;
}

export default function EventPricingStep({
	activityPrice,
	setActivityPrice,
}: EventPricingStepProps) {
	return (
		<div className="space-y-4 animate-in fade-in duration-200">
			<div className="relative">
				<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
					Cost Price (per member)
				</label>
				<div className="relative">
					<span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted font-bold">
						<FiDollarSign size={14} />
					</span>
					<input
						type="number"
						step="0.01"
						placeholder="0.00 (Free)"
						value={activityPrice}
						onChange={(e) => setActivityPrice(e.target.value)}
						className="w-full rounded-xl border border-border bg-surface-secondary py-3 pl-8 pr-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono font-bold"
					/>
				</div>
				<span className="block text-[10px] text-text-muted mt-1.5 leading-relaxed">
					Indicates if members need to pay to participate in this activity or materials.
				</span>
			</div>
		</div>
	);
}
