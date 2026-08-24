'use client';

import { RefObject, useEffect, useRef } from 'react';

const focusableSelector = [
	'a[href]',
	'button:not([disabled])',
	'textarea:not([disabled])',
	'input:not([disabled])',
	'select:not([disabled])',
	'[tabindex]:not([tabindex="-1"])',
].join(',');

export function useDialogAccessibility(
	isOpen: boolean,
	onClose: () => void,
	dialogRef: RefObject<HTMLElement | null>,
) {
	const returnFocusRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (!isOpen) return;
		returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		const dialog = dialogRef.current;
		const focusable = dialog?.querySelector<HTMLElement>(focusableSelector);
		focusable?.focus();

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				onClose();
				return;
			}
			if (event.key !== 'Tab' || !dialog) return;
			const elements = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));
			if (!elements.length) return;
			const first = elements[0];
			const last = elements[elements.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};

		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('keydown', onKeyDown);
			returnFocusRef.current?.focus();
		};
	}, [dialogRef, isOpen, onClose]);
}
