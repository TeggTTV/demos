'use client';

import React from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { Input } from '@/components/ui/Input';
import { CLUB_CATEGORIES } from '@/constants/categories';

interface SearchFiltersProps {
	query: string;
	setQuery: (q: string) => void;
	selectedCategory: string;
	setSelectedCategory: (cat: string) => void;
	searchDays: Record<string, boolean>;
	setSearchDays: React.Dispatch<
		React.SetStateAction<Record<string, boolean>>
	>;
	showFilters: boolean;
	setShowFilters: (show: boolean) => void;
	totalResults: number;
}

export default function SearchFilters({
	query,
	setQuery,
	selectedCategory,
	setSelectedCategory,
	searchDays,
	setSearchDays,
	showFilters,
	setShowFilters,
	totalResults,
}: SearchFiltersProps) {
	const hasActiveDayFilter = Object.values(searchDays).some(Boolean);

	return (
		<div className="space-y-4">
			{/* Top Search Bar */}
			<div className="flex flex-col sm:flex-row gap-3">
				<div className="grow">
					<Input
						icon={FiSearch}
						type="text"
						placeholder="Search clubs by name, mission, keywords, or focus tags..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
					/>
				</div>
				<button
					onClick={() => setShowFilters(!showFilters)}
					className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
						showFilters || hasActiveDayFilter || selectedCategory
							? 'border-primary bg-primary-light text-primary'
							: 'border-border bg-surface text-text-secondary hover:text-text-primary'
					}`}
				>
					<FiFilter size={14} />
					<span>Filter by Days</span>
					{hasActiveDayFilter && (
						<span className="h-2 w-2 rounded-full bg-primary" />
					)}
				</button>
			</div>

			{/* Category Filter Chips */}
			<div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
				<button
					onClick={() => setSelectedCategory('')}
					className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
						selectedCategory === ''
							? 'bg-primary text-white shadow-2xs'
							: 'bg-surface border border-border text-text-secondary hover:text-text-primary'
					}`}
				>
					All Categories
				</button>
				{CLUB_CATEGORIES.map((cat) => (
					<button
						key={cat}
						onClick={() =>
							setSelectedCategory(
								selectedCategory === cat ? '' : cat,
							)
						}
						className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
							selectedCategory === cat
								? 'bg-primary text-white shadow-2xs'
								: 'bg-surface border border-border text-text-secondary hover:text-text-primary'
						}`}
					>
						{cat}
					</button>
				))}
			</div>

			{/* Expandable Meeting Days Filter Panel */}
			{showFilters && (
				<div className="rounded-2xl border border-border bg-surface-secondary/40 p-4 space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-xs font-bold text-text-primary uppercase tracking-wider">
							Meeting Days Availability
						</span>
						{hasActiveDayFilter && (
							<button
								onClick={() =>
									setSearchDays({
										Mon: false,
										Tue: false,
										Wed: false,
										Thu: false,
										Fri: false,
										Sat: false,
										Sun: false,
									})
								}
								className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
							>
								<FiX size={12} /> Clear day filters
							</button>
						)}
					</div>
					<div className="flex flex-wrap gap-2">
						{[
							'Mon',
							'Tue',
							'Wed',
							'Thu',
							'Fri',
							'Sat',
							'Sun',
						].map((day) => (
							<button
								key={day}
								type="button"
								onClick={() =>
									setSearchDays((prev) => ({
										...prev,
										[day]: !prev[day],
									}))
								}
								className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
									searchDays[day]
										? 'bg-primary text-white border-primary shadow-2xs'
										: 'bg-surface text-text-secondary border-border hover:text-text-primary'
								}`}
							>
								{day}
							</button>
						))}
					</div>
				</div>
			)}

			<div className="flex items-center justify-between text-xs text-text-muted">
				<span>
					Showing {totalResults} club{totalResults === 1 ? '' : 's'}
				</span>
			</div>
		</div>
	);
}
