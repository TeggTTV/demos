'use client';

import React, { useId, useState } from 'react';
import { IconType } from 'react-icons';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	icon?: IconType;
	hint?: React.ReactNode;
	error?: React.ReactNode;
}

export function Input({
	label,
	icon: Icon,
	hint,
	error,
	className = '',
	id,
	...props
}: InputProps) {
	const [isFocused, setIsFocused] = useState(false);
	const generatedId = useId();
	const inputId = id || generatedId;
	const descriptionId = error
		? `${inputId}-error`
		: hint
			? `${inputId}-hint`
			: undefined;

	return (
		<div className="w-full space-y-1.5">
			{label && (
				<label
					htmlFor={inputId}
					className="block text-xs font-semibold text-text-secondary"
				>
					{label}
				</label>
			)}
			<div
				className={`flex min-h-11 items-center gap-2 rounded-lg border bg-surface-secondary px-3 py-2 transition-colors ${error ? 'border-danger' : isFocused ? 'border-primary/60 ring-2 ring-primary/15' : 'border-border'}`}
			>
				{Icon && (
					<Icon
						className="shrink-0 text-text-muted"
						size={16}
						aria-hidden="true"
					/>
				)}
				<input
					id={inputId}
					onFocus={(event) => {
						setIsFocused(true);
						props.onFocus?.(event);
					}}
					onBlur={(event) => {
						setIsFocused(false);
						props.onBlur?.(event);
					}}
					className={`w-full grow bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none ${className}`}
					aria-invalid={Boolean(error) || undefined}
					aria-describedby={descriptionId}
					{...props}
				/>
			</div>
			{error ? (
				<p
					id={`${inputId}-error`}
					className="text-sm text-danger"
					role="alert"
				>
					{error}
				</p>
			) : hint ? (
				<p id={`${inputId}-hint`} className="text-sm text-text-muted">
					{hint}
				</p>
			) : null}
		</div>
	);
}
